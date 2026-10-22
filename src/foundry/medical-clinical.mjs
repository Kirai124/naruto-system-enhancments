import {elementalJutsu} from './medical-elemental.mjs';
import {medicalFeatureOrigin} from './medical-companions.mjs';
import {notAllowedFields,validateNotAllowed,applyNotAllowed,ascensionFields,validateAscension} from './medical-survival.mjs';
import {companionActionFields,validateCompanionAction,applyCompanionAction,restorationCollisionFormula} from './medical-companion-actions.mjs';
import {constructiveFields,validateConstructive,applyConstructive} from './medical-constructive.mjs';
import {medicalMentalCondition,validateCounselorTarget,setCounselorLock} from './medical-counselor.mjs';
import {grantMedicalTempHP} from './medical-temp-hp.mjs';
import {deadMedicalHex,validateHexDeath,addShamanActionFields,applyHexDeath,applyDrainingCounter,validateHexCritical,applyHexCritical} from './medical-shaman-actions.mjs';
import {medicalHexActive,activeMedicalHexes,validateHexTransition,applyMedicalHex} from './medical-hex.mjs';
import {alterationFields,validateAlteration,applyAlteration} from './medical-alteration.mjs';
import {traceChoices,traceRank,applyMedicalTrace,dominantMedicalTrace} from './medical-traces.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {MEDICAL_CLINICAL_RULES,medicalClinicalRule} from '../casting/medical-actions.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,medicalModifier,ninjutsuModifier,isMedical,scalpelState,medicalTurn,medicalRankValue} from '../casting/medical-context.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {appendFeatureSpend,chooseChakraDice,applyChakraDieSpend} from './ninjutsu-resource-utils.mjs';
import {applyMedicalHealing} from './medical-healing.mjs';
import {applyMedicalDamage} from './medical-receipts.mjs';
import {ninjutsuEffectData,ninjutsuEffect,upsertNinjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {prepareGenjutsuConditions} from '../effects/genjutsu-effects.mjs';
import {nextActorTurnDeadline,currentTurnEndDeadline} from '../casting/molding-lifetimes.mjs';

export const MEDICAL_CLINICAL='medicalClinicalActions';
const managers=new WeakMap(),read=actor=>structuredClone(actor.getFlag(MODULE_ID,MEDICAL_CLINICAL)??[]);
export const medicalEffects=(game,actor)=>actor.effects.filter(e=>ninjutsuEffect(e)?.metadata?.genjutsu?.medical&&activeNinjutsuEffect(game,e)&&dominantMedicalTrace(game,e)&&medicalHexActive(game,e));
export const medicalPayload=effect=>effect?ninjutsuEffect(effect)?.metadata?.genjutsu:undefined;
export const ownedMedicalClinicalRules=actor=>MEDICAL_CLINICAL_RULES.filter(r=>medicalFeature(actor,r.name,r.category)&&(!r.minLevel||medicalLevel(actor)>=r.minLevel));
function owner(game,actor){if(!medicalEnabled(game)||!actor?.isOwner||!medicalLevel(actor))throw Error('Eigener Medical-Nin und aktivierte Automation erforderlich.');}
function context(game,actor,id){
 owner(game,actor);const entry=read(actor).find(e=>e.id===id),rule=entry&&medicalClinicalRule(entry.ruleId),feature=rule&&medicalFeature(actor,rule.name,rule.category);
 if(entry?.parentActionId&&!(actor.getFlag(MODULE_ID,'medicalActions')??[]).some(e=>e.id===entry.parentActionId&&e.kind==='preserve'&&e.status==='applied'))throw Error('Bestätigte ursprüngliche Preserve-Life-Anwendung fehlt.');
 if(entry?.status!=='paid'||!feature)throw Error('Bestätigter klinischer Vorgang oder Feature fehlt.');
 const message=entry.messageId&&game.messages.get(entry.messageId);if(entry.messageId&&(!message||message.getAssociatedActor()?.uuid!==actor.uuid||message.system?.deltas===null))throw Error('Ursprüngliche Castkarte fehlt oder wurde erstattet.');
 return {entry,rule,feature,message,record:{castId:entry.id}};
}
function formula(text,actor){return String(text).replaceAll('@prof',String(actor.system.attributes.prof)).replaceAll('@level',String(medicalLevel(actor))).replaceAll('@wis',String(actor.system.abilities.wis.mod)).replaceAll('@nin',String(ninjutsuModifier(actor))).replace(/(\d+)\s+d(\d+)/g,'$1d$2');}
export const medicalDC=actor=>actor.system.attributes.jutsu.ninjutsu.dc-actor.system.attributes.jutsu.ninjutsu.mod+medicalModifier(actor);
function maxCleanseRank(actor){return medicalLevel(actor)>=20?'s':medicalLevel(actor)>=15?'a':medicalLevel(actor)>=11?'b':medicalLevel(actor)>=7?'c':'d';}
const rankOrder=['e','d','c','b','a','s'];
function selectedConditions(target,entry,rule){
 return (entry.conditions?.[target.uuid]??[]).map(ref=>{
  const effect=target.effects.get(ref.id);if(!effect||effect.disabled||effect.transfer||!effect.statuses.size)throw Error('Bestätigte Condition nicht mehr vorhanden.');
  if(rule.conditionCategories&&![...effect.statuses].some(id=>rule.conditionCategories.includes(game.n5eb.conditions.getConditionConfig(id)?.category)))throw Error('Keine passende mentale/sensorische Condition.');
  if(!medicalPayload(effect)?.conditions&&!effect.getFlag('n5eb','condition')&&(effect.system?.changes?.length??0)>0)throw Error('Dieser kombinierte Effekt enthält weitere Änderungen. Seine Condition muss der GM getrennt behandeln.');
  const maximum=rule.maxRank??(rule.rankLimit?maxCleanseRank(fromUuidSync(entry.sourceActorUuid)):undefined);
  if(rule.surgeryCleanse&&medicalLevel(fromUuidSync(entry.sourceActorUuid))<18&&ref.rank!=='non-jutsu')throw Error('Vor Stufe 18 sind nur tatsächlich bestätigte Nicht-Jutsu-Conditions erlaubt.');
  if(maximum&&(!rankOrder.includes(ref.rank)||rankOrder.indexOf(ref.rank)>rankOrder.indexOf(maximum)))throw Error('Bestätigter Jutsu-Rang liegt oberhalb der erlaubten Grenze.');
  return effect;
 });
}
export function medicalClinicalWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{
  storage:'medicalClinicalRequests',id:()=>foundry.utils.randomID(),resolve:async uuid=>{const document=await fromUuid(uuid);return document?.documentName==='Actor'?{actor:document}:document;},owner:actor=>owner(game,actor),context:(actor,_messageId,id)=>context(game,actor,id),allowOwnerApply:(ctx,targets)=>targets.every(a=>a.isOwner)&&(!ctx.rule.guardian||fromUuidSync((ctx.feature.actor.getFlag(MODULE_ID,'medicalCompanions')??[]).find(e=>e.id===ctx.entry.companion)?.target.uuid)?.isOwner)&&(!ctx.entry.criticalAttack||game.messages.get(ctx.entry.criticalAttack)?.isOwner)&&(!ctx.entry.hexDeath||fromUuidSync(ctx.entry.hexDeath.effectUuid)?.parent?.isOwner)&&(!ctx.entry.hexTransfer||fromUuidSync(ctx.entry.hexTransfer.effectUuid)?.parent?.isOwner)&&(!ctx.entry.altered?.replace||fromUuidSync(ctx.entry.altered.replace)?.parent?.isOwner),
  async prepare(ctx,_request,targets){
   const list=read(ctx.feature.actor),entry=list.find(e=>e.id===ctx.entry.id);entry.results??={};
   if(ctx.rule.mindful||ctx.rule.psyche)for(const t of targets)validateCounselorTarget(game,ctx.feature.actor,t,ctx.rule);
   if(ctx.rule.notAllowed)validateNotAllowed(game,ctx.feature.actor,entry);
   if(ctx.rule.companionAction)await validateCompanionAction(game,ctx.feature.actor,targets,entry,ctx.rule);
   if(ctx.rule.constructive)validateConstructive(ctx.feature.actor,targets[0],entry.constructiveReceipt);
   if(ctx.rule.altered)validateAlteration(game,ctx.feature.actor,targets[0],entry.altered);
   if(ctx.rule.hexDeath)validateHexDeath(game,ctx.feature.actor,entry.hexDeath);
   if(ctx.rule.hex)validateHexTransition(game,ctx.feature.actor,entry);
   if(ctx.rule.criticalGuard)validateHexCritical(game,ctx.feature.actor,targets[0],entry);
   const plans=[];
   for(const target of targets){
    if(ctx.rule.surgery&&(target.getFlag(MODULE_ID,'medicalRecipientUses')?.surgery??0)>=2)throw Error('Dieses Ziel hat bereits zwei Operationen seit seinem letzten Full Rest erhalten.');
    if(ctx.rule.removeCondition&&!selectedConditions(target,entry,ctx.rule).length)throw Error('Mindestens eine tatsächliche Condition bestätigen.');
    if(entry.results[target.uuid]?.status==='rolling')throw Error('Unterbrochenen klinischen Wurf zuerst vom GM prüfen lassen.');
    let plan=entry.results[target.uuid];
    if(!plan){
     entry.results[target.uuid]={status:'rolling'};await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);
     try{
      if(ctx.rule.study){
       if(!entry.studyRoll){entry.studyRoll={status:'rolling'};await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);const rolls=await ctx.feature.actor.rollSkill({skill:'med',ability:'int',n5eseMedicalFixedMedicine:true},{configure:true});if(!rolls?.length){delete entry.studyRoll;delete entry.results[target.uuid];await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);return null;}entry.studyRoll={status:'ready',total:rolls[0].total,roll:rolls[0].toJSON()};await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);}
       if(entry.studyRoll.status==='rolling')throw Error('Unterbrochenen Medicine-Wurf zuerst vom GM prüfen lassen.');
       const rolls=await target.rollSkill({skill:'dec',ability:'cha'},{configure:true});if(!rolls?.length){delete entry.results[target.uuid];await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);return null;}
       plan={status:'ready',targetUuid:target.uuid,study:true,sourceRoll:entry.studyRoll,opposedRoll:{total:rolls[0].total,roll:rolls[0].toJSON()},success:entry.studyRoll.total>rolls[0].total,amount:0};entry.results[target.uuid]=plan;await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);plans.push(plan);continue;
      }
      const previous=ctx.rule.poisonousTouch?medicalEffects(game,target).find(e=>medicalPayload(e).ruleId===ctx.rule.id&&ninjutsuEffect(e).sourceActorUuid===ctx.feature.actor.uuid):null;
      const hits=medicalPayload(previous)?.hits??0,dc=entry.dc+(ctx.rule.poisonousTouch?hits:0)+(ctx.rule.mindful&&medicalMentalCondition(game,target)?ctx.feature.actor.system.abilities.wis.mod:0);
      let save=null;if(ctx.rule.save){const rolls=await target.rollSavingThrow({ability:ctx.rule.save,target:dc,rolls:[{options:{...(ctx.rule.id==='medical.transfigured'&&medicalFeature(ctx.feature.actor,'Transmuted Self','Transmuter')?{disadvantage:true}:{})}}]},{configure:true});if(!rolls?.length){delete entry.results[target.uuid];await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);return null;}save={total:rolls[0].total,roll:rolls[0].toJSON()};}
      let amount=0,roll;if(ctx.rule.beginning)amount=medicalRankValue(entry.rank);
      if(ctx.rule.collision){const object=await fromUuid(entry.restorationObject);roll=await new Roll(restorationCollisionFormula(object.system.traits.size)).evaluate();amount=roll.total;}
      if(!ctx.rule.beginning&&(ctx.rule.damage||ctx.rule.healing||ctx.rule.temporaryHP)){roll=await new Roll(formula(ctx.rule.damage??ctx.rule.healing??ctx.rule.temporaryHP,ctx.feature.actor)).evaluate();amount=Math.max(0,roll.total);}
      const success=save!==null&&save.total>=dc;plan={status:'ready',targetUuid:target.uuid,save,success,dc,previousPoisonId:previous?.id,previousHits:hits,amount:success?(ctx.rule.halfOnSuccess?Math.floor(amount/2):0):amount,roll:roll?.toJSON()};
      entry.results[target.uuid]=plan;await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);
     }catch(error){entry.results[target.uuid]={status:'rolling',error:error.message};await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);throw error;}
    }
    plans.push(plan);
   }
   return plans;
  },
  confirm(ctx,_request,plans){const div=document.createElement('div'),p=document.createElement('p');p.textContent=ctx.rule.name+': '+plans.map(p=>p.save?'Save '+p.save.total+' gegen SG '+(p.dc??ctx.entry.dc)+(p.success?' erfolgreich':' fehlgeschlagen')+(p.amount?'; '+p.amount+' vor Verteidigungen':''):p.amount?p.amount+' Heilung/Schaden':'bestätigte Wirkung').join(' · ')+'. Nur diese bestätigten Wirkungen jetzt anwenden?';div.append(p);return foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Wirkung anwenden'},content:div.innerHTML,rejectClose:false});},
  async apply(target,plan,ctx,request){
   const rule=ctx.rule,source=ctx.feature.actor,entry=ctx.entry;
   if(rule.criticalGuard)return applyHexCritical(game,source,target,entry);
   if(rule.temporaryHP)return {grantId:await grantMedicalTempHP(target,{sourceActorUuid:source.uuid,rule:rule.id,amount:plan.amount})};
   if(rule.hexDeath)return applyHexDeath(game,source,target,entry,rule,plan);
   if(rule.counterAttack){const rolls=await applyDrainingCounter(game,source,entry);return {counterAttackRolled:!!rolls?.length};}
   if(rule.hex)return applyMedicalHex(game,source,target,entry,ctx.feature);
   if(rule.potency){if(source.getFlag(MODULE_ID,'medicalPoisonPotency')?.status==='active')throw Error('Bereits eine aktive Giftpotenz vorhanden.');await source.setFlag(MODULE_ID,'medicalPoisonPotency',{id:entry.id,status:'active',at:game.time.worldTime});return {potencyReady:true};}
   if(rule.notAllowed)return applyNotAllowed(game,source,entry);
   if(rule.companionAction)return applyCompanionAction(game,source,target,entry,rule,ctx.feature,plan);
   if(rule.constructive)return applyConstructive(game,source,target,entry,ctx.feature);
   if(rule.altered)return applyAlteration(game,source,target,entry,ctx.feature);
   if(rule.elementalTraces)return applyMedicalTrace(game,target,source,entry,ctx.feature);
   if(rule.study){if(!plan.success)return {studied:false};const studies=source.getFlag(MODULE_ID,'medicalStudies')??{};await source.setFlag(MODULE_ID,'medicalStudies',{...studies,[target.uuid]:{at:game.time.worldTime,sourceFeatureId:ctx.feature.id,name:target.name}});const facts=['di','dr','dv'].map(k=>k+': '+[...target.system.traits[k].value].join(', ')).join(' · ');const text=document.createElement('p');text.textContent='Biological Knowledge · '+target.name+' · '+facts;await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:source}),content:text.outerHTML,whisper:game.users.filter(u=>u.isGM||source.testUserPermission(u,'OWNER')).map(u=>u.id)});return {studied:true};}
   if(rule.deathFailure){await target.update({'system.attributes.death.failure':Math.max(0,(target.system.attributes.death.failure??0)-1)});return {deathFailureRemoved:1};}
   if(rule.removeCondition){
    for(const effect of selectedConditions(target,entry,rule)){
     const id=game.n5eb.conditions.getEffectConditionId(effect);if(!id)throw Error('Condition-Rang nicht auslesbar.');const marker=ninjutsuEffect(effect),payload=marker?.metadata?.genjutsu;
     if(payload?.conditions){const copy=structuredClone(marker),c=copy.metadata.genjutsu.conditions.find(c=>c.id===id);if(!c)throw Error('Keine eindeutige verwaltete Condition.');if(rule.removeAll)copy.metadata.genjutsu.conditions=[];else c.rank=Math.max(0,c.rank-(rule.removeRank??1));copy.metadata.genjutsu.conditions=copy.metadata.genjutsu.conditions.filter(c=>c.rank>0);await effect.setFlag(MODULE_ID,'ninjutsuEffect',copy);}
     else{const rank=game.n5eb.conditions.getEffectConditionRank(effect),remaining=rule.removeAll?0:Math.max(0,rank-(rule.removeRank??1));if(!remaining)await effect.delete();else await effect.setFlag('n5eb','condition',{...effect.getFlag('n5eb','condition'),id,rank:remaining});}
    }return {conditionsRemoved:true};
   }
   if(plan.amount&&rule.healing){await applyMedicalHealing(target,plan.amount,{n5eseMedicalRequest:request.id,n5eseMedicalSource:source.uuid});if(rule.surgery){const uses=target.getFlag(MODULE_ID,'medicalRecipientUses')??{};await target.setFlag(MODULE_ID,'medicalRecipientUses',{...uses,surgery:(uses.surgery??0)+1});}}
   if(plan.amount&&rule.damage)await applyMedicalDamage(target,[{type:rule.damageType,value:plan.amount,properties:new Set()}],{n5eseMedicalRequest:request.id});
   if(plan.success&&!rule.poisonousTouch){if(rule.psyche)await setCounselorLock(game,target,source,rule.id);return {save:plan.save,total:plan.amount};}
   const previousPoison=rule.poisonousTouch?medicalEffects(game,target).find(e=>medicalPayload(e).ruleId===rule.id&&ninjutsuEffect(e).sourceActorUuid===source.uuid):null;
   if(rule.poisonousTouch&&((previousPoison?.id??null)!==(plan.previousPoisonId??null)||(medicalPayload(previousPoison)?.hits??0)!==plan.previousHits))throw Error('Poisonous-Touch-Gruppe seit dem gespeicherten Save verändert; GM-Prüfung erforderlich.');
   let conditions=structuredClone(rule.conditions??[]);
   if(rule.id==='medical.scalpel-hit'&&medicalLevel(source)>=18)conditions.push({id:'lacerated',rank:1});
   if(rule.conditionChoice)conditions=[{id:entry.condition,rank:1}];
   if(rule.poisonousTouch&&plan.success)conditions=[];
   if(medicalFeature(source,'Venomous Sting','Black Medicine'))conditions=conditions.map(c=>['envenomed','corroded'].includes(c.id)?{...c,rank:c.rank+1}:c);
   const immune=medicalFeature(source,'Mental Master','Counselor-Nin')&&ctx.message&&isMedical(ctx.message.getAssociatedItem());
   conditions=prepareGenjutsuConditions(game,target,conditions,{ignoreImmunity:immune?conditions.filter(c=>game.n5eb.conditions.getConditionConfig(c.id)?.category==='mental').map(c=>c.id):[]});
   if(rule.poisonousTouch){const old=medicalPayload(previousPoison)?.conditions??[];for(const prior of old){const current=conditions.find(c=>c.id===prior.id);if(current)current.rank=Math.min(game.n5eb.conditions.getConditionConfig(prior.id)?.maxRank??Infinity,current.rank+prior.rank);else conditions.push({...prior});}}
   const payload={medical:true,ruleId:rule.id,dc:entry.dc,conditions,medicalRepeat:rule.repeat,creatureType:rule.creatureType,healOnDamage:rule.healOnDamage?formula(rule.healOnDamage,source):undefined,triggerLimit:rule.triggerLimit,turnTempCon:rule.turnTempCon,chakraSealed:rule.chakraSealed,disruption:rule.disruption,failures:rule.disruption?1:0,hex:rule.hex,note:rule.context};
   if(rule.poisonousTouch){payload.hits=plan.previousHits+1;payload.dc=plan.dc;if(!conditions.length)delete payload.medicalRepeat;}
   if(medicalFeature(source,'Venomous Sting','Black Medicine'))payload.venomousSaves=true;
   if(rule.masterDice)payload.medicalNextAttackDice=medicalRankValue(entry.rank);
   if(rule.poisonSave)payload.rolls=[{kind:'save',mode:'disadvantage',medicalPoisonSave:true,once:true,endsEffect:true}];
   if(rule.endConditionRoll)payload.rolls=[{kind:'save',mode:'advantage',confirmedOnly:true,once:true,endsEffect:true},{kind:'ability',mode:'advantage',confirmedOnly:true,once:true,endsEffect:true}];
   if(rule.mindful){payload.medicalNoAttacks=true;payload.speed={zero:true};}
   if(rule.psyche)payload.medicalNonHostile=true;
   if(rule.litany){payload.rolls=[entry.litany.startsWith('attack:')?{kind:'attack',mode:'advantage',medicalAttackClass:entry.litany.slice(7),ownTurn:true,oncePerTurn:true}:{kind:'save',mode:'advantage',abilitiesAny:entry.litany==='physical'?['str','dex','con']:['int','wis','cha'],oncePerTurn:true}];}
   if(rule.combatCritical)payload.rolls=[{kind:'attack',criticalBonus:medicalLevel(source)>=13?2:1,medicalCombatCritical:true}];
   if(rule.saveAdv)payload.rolls=rule.saveAdv.map(ability=>({kind:'save',mode:'advantage',ability}));
   let changes=structuredClone(rule.changes??[]);
   if(rule.conditionImmunity)changes.push({key:'system.traits.ci.value',type:'add',value:entry.condition,priority:20});
   const lifetime={...(rule.until==='source-next-start'?{deadline:nextActorTurnDeadline(game.combat,source.uuid,'start')}:{}),...(rule.until==='current-turn-end'?{deadline:currentTurnEndDeadline(game.combat)}:{}),...(rule.seconds?{expiresAt:entry.at+rule.seconds}:{}),...(rule.until==='target-next-end'?{deadline:nextActorTurnDeadline(game.combat,target.uuid,'end')}:{})};
   if(rule.hex){for(const actor of [...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(x=>x.actor??x).filter((a,i,list)=>list.indexOf(a)===i))for(const effect of medicalEffects(game,actor).filter(e=>medicalPayload(e).hex&&ninjutsuEffect(e).sourceActorUuid===source.uuid)){if(!actor.isOwner)throw Error('Vorherige Hex muss der GM übertragen.');await effect.delete();}}
   if(conditions.length||changes.length||rule.seconds||rule.until||rule.hex||rule.masterDice){
    const data=ninjutsuEffectData({name:rule.name,id:rule.poisonousTouch?'medical-poisonous-touch':entry.id,sourceActorUuid:source.uuid,sourceItemUuid:ctx.feature.uuid,lifetime,setting:'medicalClassAutomation',changes,metadata:{genjutsu:payload}});
    const effect=await upsertNinjutsuEffect(target,data);if(rule.mindful){const pending=target.getFlag(MODULE_ID,'medicalMindfulPending')??[];await target.setFlag(MODULE_ID,'medicalMindfulPending',[...pending,{id:entry.id,effectId:effect.id,marker:data.flags[MODULE_ID].ninjutsuEffect}]);}
   }
   return {save:plan.save,total:plan.amount,conditions};
  },
  async finalize(ctx){if(ctx.rule.guardian){const {companion}=await validateCompanionAction(game,ctx.feature.actor,[],ctx.entry,ctx.rule);await companion.setFlag(MODULE_ID,'medicalGuardianUses',(companion.getFlag(MODULE_ID,'medicalGuardianUses')??0)+1);}const list=read(ctx.feature.actor),entry=list.find(e=>e.id===ctx.entry.id);entry.status='applied';await ctx.feature.actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);}
 });managers.set(game,manager);return manager;
}
export async function requestMedicalClinical(game,actor,id,{messageId,actionId,self=false}={}){
 owner(game,actor);return withCastingActorLock(actor,async()=>{
  const rule=ownedMedicalClinicalRules(actor).find(r=>r.id===id),feature=rule&&medicalFeature(actor,rule.name,rule.category);if(!rule||!feature)throw Error('Klinische Fähigkeit nicht freigeschaltet.');
  if(rule.preserveTrigger&&!(actor.getFlag(MODULE_ID,'medicalActions')??[]).some(e=>e.id===actionId&&e.kind==='preserve'&&e.status==='applied'))throw Error('Tatsächlich ausgeführte Preserve-Life-Anwendung erforderlich.');
  const message=messageId&&game.messages.get(messageId);if(rule.cast&&(!message||message.getAssociatedActor()?.uuid!==actor.uuid||!rule.anyCast&&!rule.elementalCast&&!isMedical(message.getAssociatedItem())||message.system?.deltas===null))throw Error('Eigene passende Medical-Castkarte erforderlich.');
  if(rule.scalpel&&!scalpelState(game,actor))throw Error('Aktives Chakra Scalpel erforderlich.');
  if(rule.surgeryCleanse&&game.combat?.started)throw Error('Chirurgische Condition-Entfernung nur außerhalb des Kampfes.');
  const deadHex=rule.hexDeath?deadMedicalHex(game,actor):null;if(rule.hexDeath&&!deadHex)throw Error('Gerade gestorbene eigene Hex-Kreatur erforderlich.');const hexDeath=deadHex?{effectUuid:deadHex.uuid,targetUuid:deadHex.parent.uuid}:undefined;
  const protectedHex=rule.criticalGuard?activeMedicalHexes(game,actor).find(e=>e.parent.system.attributes.hp.value>0):null;if(rule.criticalGuard&&!protectedHex)throw Error('Aktive eigene Hex-Kreatur erforderlich.');
  if(rule.potency&&actor.getFlag(MODULE_ID,'medicalPoisonPotency')?.status==='active')throw Error('Bereits eine aktive Giftpotenz vorhanden.');
  if(rule.potencyTarget&&!message?.getAssociatedItem()?.getFlag(MODULE_ID,'medicalCast')?.blackPotency)throw Error('Tatsächlich gespeicherter potenzierter Einsatz erforderlich.');
  if(rule.elementalCast&&(!elementalJutsu(message?.getAssociatedItem())||rule.beginning&&medicalLevel(actor)<9&&!isMedical(message.getAssociatedItem())||rule.masterDice&&message.getAssociatedItem().system.jutsu.type!=='ninjutsu'))throw Error('Passender eigener Nature-Cast erforderlich; vor Stufe 9 Medical, für Elemental Master Ninjutsu.');
  const targets=rule.beginning&&self?[{uuid:actor.uuid,tokenUuid:actor.uuid,name:actor.name}]:rule.criticalGuard?[{uuid:protectedHex.parent.uuid,tokenUuid:protectedHex.parent.uuid,name:protectedHex.parent.name}]:rule.battleDeath?[{uuid:deadHex.parent.uuid,tokenUuid:deadHex.parent.uuid,name:deadHex.parent.name}]:rule.self?[{uuid:actor.uuid,tokenUuid:actor.uuid,name:actor.name}]:[...new Map([...game.user.targets].filter(t=>t.actor).map(t=>[t.actor.uuid,{uuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}])).values()];
  if(!targets.length||targets.length>rule.maxTargets||rule.excludeSelf&&targets.some(t=>t.uuid===actor.uuid))throw Error('Ungültige Zahl tatsächlich betroffener Ziele.');
  const list=read(actor);if(rule.self&&(medicalEffects(game,actor).some(e=>medicalPayload(e).ruleId===id)||list.some(e=>e.ruleId===id&&!['applied','cancelled','resolved'].includes(e.status))))throw Error('Eigene Wirkung oder ihre Anfrage bereits vorhanden.');if(list.some(e=>['paying','review'].includes(e.status)))throw Error('Unterbrochene klinische Zahlung zuerst vom GM prüfen lassen.');
  if(rule.preserveTrigger&&list.some(e=>e.ruleId===id&&e.parentActionId===actionId&&!['cancelled','resolved'].includes(e.status)))throw Error('Für diesen Preserve-Life-Vorgang wurde der Vorteil bereits bestätigt.');
  if(rule.potencyTarget&&list.some(e=>e.ruleId===id&&e.castId===(message?.getAssociatedItem()?.getFlag(MODULE_ID,'medicalCast')?.id??messageId)&&!['cancelled','resolved'].includes(e.status)))throw Error('Giftpotenz dieses ursprünglichen Vorgangs bereits bestätigt.');
  if(rule.beginning&&list.some(e=>e.ruleId===id&&e.castId===(message?.getAssociatedItem()?.getFlag(MODULE_ID,'medicalCast')?.id??message?.getOriginatingMessage?.()?.id??messageId)&&!['cancelled','resolved'].includes(e.status)))throw Error('Elemental Beginning dieses Casts bereits bestätigt.');
  if(rule.rankLimit&&list.some(e=>e.ruleId===id&&e.messageId===messageId&&!['cancelled','resolved'].includes(e.status)))throw Error('Diese Condition-Entfernung wurde für diesen Cast bereits bestätigt.');
  if(rule.once&&medicalTurn(game)&&list.some(e=>e.ruleId===id&&e.turn===medicalTurn(game)&&!['cancelled','resolved'].includes(e.status)))throw Error('Zuggrenze erreicht; GM-Korrektur erforderlich.');
  if(rule.trackedUses==='one'&&(actor.getFlag(MODULE_ID,'medicalClinicalUses')?.[id]??0)>=1)throw Error('Nutzung bis zur nächsten langen Rast erschöpft.');
  if(rule.trackedUses==='prof'&&(actor.getFlag(MODULE_ID,'medicalClinicalUses')?.[id]??0)>=actor.system.attributes.prof)throw Error('Nutzungen bis zur nächsten langen Rast erschöpft.');
  const activeHexes=rule.hex?activeMedicalHexes(game,actor):[];if(activeHexes.length>1)throw Error('Mehrere alte eigene Hex-Instanzen zuerst vom GM bereinigen lassen.');if(rule.hex&&list.some(e=>e.ruleId===id&&!['applied','cancelled','resolved'].includes(e.status)))throw Error('Offene Hex-Anfrage zuerst abschließen.');const hexTransfer=activeHexes[0]?{effectUuid:activeHexes[0].uuid,lifetime:structuredClone(ninjutsuEffect(activeHexes[0]).lifetime)}:undefined;
  const natures=rule.elementalTraces?traceChoices(actor,message?.getAssociatedItem()):[];if(rule.elementalTraces&&(!natures.length||!['d','c','b','a','s'].includes(traceRank(message.getAssociatedItem()))))throw Error('Kein passendes freigeschaltetes Nature Release oder Rang.');
  const div=document.createElement('div'),p=document.createElement('p');if(rule.elementalTraces){const select=document.createElement('select');select.name='nature';for(const nature of natures){const option=document.createElement('option');option.value=nature;option.textContent=nature;select.append(option);}div.append(select);}
  p.textContent=(hexTransfer?'Bestehende Hex ohne weitere Nutzung übertragen; ursprüngliche Restdauer bleibt erhalten. Tatsächlich eigener Zug und sichtbares Ziel innerhalb 30 Fuß bestätigen.':rule.context)+' Ziele: '+targets.map(t=>t.name).join(', ')+'. Nach Bestätigung werden Ressourcen bezahlt; fremde Zielanwendung übernimmt der GM.';div.append(p);
  if(rule.litany){if(!message?.getAssociatedItem()?.system.jutsu?.keywords?.has('fuinjutsu'))throw Error('Medical-Fuinjutsu-Heilung erforderlich.');const select=document.createElement('select');select.name='litany';for(const value of ['attack:unarmed','attack:weapon','attack:ninjutsu','attack:genjutsu','attack:taijutsu','physical','mental']){const o=document.createElement('option');o.value=value;o.textContent=value;select.append(o);}div.append(select);}
  if(rule.battleDeath||rule.counterAttack||rule.criticalGuard)addShamanActionFields(game,actor,rule,hexDeath,div);
  if(rule.notAllowed)notAllowedFields(game,actor,div);
  if(rule.ascension)ascensionFields(actor,div);
  if(rule.companionAction)companionActionFields(game,actor,rule,div);
  if(rule.constructive)constructiveFields(actor,await fromUuid(targets[0].uuid),div);
  if(rule.altered)alterationFields(game,actor,(await fromUuid(targets[0].tokenUuid))?.actor??await fromUuid(targets[0].uuid),div);
  if(rule.conditionChoice||rule.conditionImmunity){const select=document.createElement('select');select.name='condition';for(const [key]of Object.entries(CONFIG.DND5E.conditionTypes??{}))if(game.n5eb.conditions.getConditionConfig(key)?.category===rule.categoryChoice){const o=document.createElement('option');o.value=key;o.textContent=key;select.append(o);}div.append(select);}
  if(rule.removeCondition)for(const ref of targets){const target=(await fromUuid(ref.tokenUuid))?.actor;if(!target)throw Error('Ziel fehlt.');const label=document.createElement('p');label.textContent=ref.name+': tatsächliche Condition und ihren ursprünglichen Jutsu-Rang bestätigen. Nicht-Jutsu-Ursprung ausdrücklich kennzeichnen.';div.append(label);for(const effect of target.effects.filter(e=>!e.disabled&&!e.transfer&&e.statuses.size)){const l=document.createElement('label'),check=document.createElement('input'),select=document.createElement('select');check.type='checkbox';check.name='effect';check.value=ref.uuid+'|'+effect.id;select.name='rank-'+effect.id;for(const rank of ['unknown','non-jutsu',...rankOrder]){const o=document.createElement('option');o.value=rank;o.textContent=rank==='unknown'?'Ursprung bestätigen':rank==='non-jutsu'?'Nicht-Jutsu-Ursprung':rank.toUpperCase();select.append(o);}l.append(check,document.createTextNode(effect.name),select);div.append(l,document.createElement('br'));}}
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:rule.name},content:div.innerHTML,buttons:[{action:'pay',label:'Voraussetzungen bestätigen und bezahlen',callback:(_e,b)=>({restoreMode:b.form.elements.restoreMode?.value,instantDeath:!!b.form.elements.instantDeath?.checked,survivingAlly:b.form.elements.survivingAlly?.value,healingTrigger:b.form.elements.healingTrigger?.value,companion:b.form.elements.companion?.value,restorationObject:b.form.elements.object?.value,constructiveReceipt:b.form.elements.constructiveReceipt?.value,litany:b.form.elements.litany?.value,criticalAttack:b.form.elements.criticalAttack?.value,shamanWeapon:b.form.elements.shamanWeapon?.value,altered:{benefits:[...b.form.querySelectorAll('[name="alteredBenefit"]:checked')].map(c=>c.value),save:b.form.elements.alteredSave?.value,resistance:b.form.elements.alteredResistance?.value,upgrade:b.form.elements.alteredUpgrade?.value,replace:b.form.elements.alteredReplace?.value},elementalNature:b.form.elements.nature?.value,condition:b.form.elements.condition?.value,conditions:[...b.form.querySelectorAll('[name="effect"]:checked')].map(input=>{const [uuid,id]=input.value.split('|');return {uuid,id,rank:b.form.elements['rank-'+id].value};})})}],rejectClose:false});if(!choice)return;
  const castId=message?.getAssociatedItem()?.getFlag(MODULE_ID,'medicalCast')?.id??message?.getOriginatingMessage?.()?.id??messageId;if(rule.elementalTraces&&(!natures.includes(choice.elementalNature)||list.some(e=>e.ruleId===id&&e.castId===castId&&e.elementalNature===choice.elementalNature&&!['cancelled','resolved'].includes(e.status))))throw Error('Dieser Nature-Vorteil wurde für diesen Cast bereits bestätigt.');
  const conditions={};for(const ref of choice.conditions){conditions[ref.uuid]??=[];conditions[ref.uuid].push(ref);}
  if(rule.removeCondition&&(!choice.conditions.length||(!rule.removeAll||rule.oneCondition)&&choice.conditions.length!==1||choice.conditions.some(c=>c.rank==='unknown')))throw Error('Genau die erlaubte Zahl tatsächlicher Conditions und ihren Ursprung bestätigen.');
  let chakraDie;if(rule.altered){const target=await fromUuid(targets[0].uuid);if(validateAlteration(game,actor,target,choice.altered).needsDie){chakraDie=await chooseChakraDice(actor);if(!chakraDie)return;}}
  if(rule.chakra&&actor.getChakraAvailable()<rule.chakra)throw Error('Nicht genügend Chakra für den bestätigten Ablauf.');if(rule.counterAttack&&actor.system.attributes.hp.value>0)throw Error('Gegenangriff nur beim bestätigten Fall auf 0 HP.');
  const spends=[...(rule.hex&&hexTransfer?[]:[rule.spend]),rule.extraSpend].filter(Boolean).map(name=>{const f=medicalFeature(actor,name);if(!f||f.system.uses.value<1)throw Error(name+': keine Nutzung verfügbar.');return f;});
  const entry={origin:medicalFeatureOrigin(actor),id:foundry.utils.randomID(),ruleId:id,sourceActorUuid:actor.uuid,restoreMode:choice.restoreMode,instantDeath:choice.instantDeath,survivingAlly:choice.survivingAlly,healingTrigger:choice.healingTrigger,companion:choice.companion,restorationObject:choice.restorationObject,constructiveReceipt:choice.constructiveReceipt,litany:choice.litany,parentActionId:rule.preserveTrigger?actionId:undefined,hexTransfer,hexDeath,criticalAttack:choice.criticalAttack,shamanWeapon:choice.shamanWeapon,altered:rule.altered?choice.altered:undefined,chakraDie,messageId,castId,elementalNature:choice.elementalNature,rank:rule.elementalTraces||rule.elementalRank?traceRank(message.getAssociatedItem()):undefined,targets,conditions,condition:choice.condition,dc:message?.getAssociatedActivity?.()?.save?.dc?.value??medicalDC(actor),at:game.time.worldTime,turn:medicalTurn(game),status:'paying'};
  for(const ref of targets)if(rule.removeCondition)selectedConditions((await fromUuid(ref.tokenUuid)).actor,entry,rule);
  if(rule.conditionChoice||rule.conditionImmunity)if(game.n5eb.conditions.getConditionConfig(choice.condition)?.category!==rule.categoryChoice)throw Error('Ungültige Condition-Auswahl.');
  if(rule.notAllowed)validateNotAllowed(game,actor,entry);if(rule.ascension)validateAscension(actor,entry.healingTrigger);
  list.push(entry);await actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);
  try{
   const updates={item:[]};if(rule.ascension){validateAscension(actor,entry.healingTrigger);await actor.setFlag(MODULE_ID,'medicalHealingTriggers',(actor.getFlag(MODULE_ID,'medicalHealingTriggers')??[]).map(e=>e.id===entry.healingTrigger?{...e,used:true}:e));}if(rule.chakra)await actor.update(actor.getChakraSpendUpdates(rule.chakra));if(chakraDie)applyChakraDieSpend(actor,chakraDie,updates);for(const f of spends)appendFeatureSpend(updates,f);if(updates.item.length)await actor.updateEmbeddedDocuments('Item',updates.item);
   if(rule.trackedUses){const uses=actor.getFlag(MODULE_ID,'medicalClinicalUses')??{};await actor.setFlag(MODULE_ID,'medicalClinicalUses',{...uses,[id]:(uses[id]??0)+1});}
   entry.status='paid';await actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);return medicalClinicalWorkflow(game).request(actor,messageId??'',entry.id,targets);
  }catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,list);throw error;}
 });
}
export function installMedicalClinical(game,CharacterModel,ActorClass,NPCModel){
 for(const Model of [CharacterModel,NPCModel].filter(Boolean)){const derived=Model.prototype.prepareDerivedData;
 Model.prototype.prepareDerivedData=function(...args){const result=derived.apply(this,args);if(medicalEnabled(game)){const effects=medicalEffects(game,this.parent).filter(e=>medicalPayload(e).creatureType);if(effects.length)this.details.type.value=medicalPayload(effects.at(-1)).creatureType;}return result;};}
 Hooks.on('dnd5e.preUseActivity',activity=>{if(!medicalEnabled(game)||!activity.isSpell)return;if(activity.item.system.jutsu?.components?.has?.('cm')&&medicalEffects(game,activity.actor).some(e=>medicalPayload(e).chakraSealed)){ui.notifications.warn('Chakra Sever verhindert gerade Chakra Molding.');return false;}});
 Hooks.on('dnd5e.restCompleted',async(actor,_result,config)=>{if(!medicalEnabled(game)||!actor.isOwner)return;if(['long','full'].includes(config.type)){const uses=actor.getFlag(MODULE_ID,'medicalRecipientUses');if(uses?.alteredStrength)await actor.setFlag(MODULE_ID,'medicalRecipientUses',{...uses,alteredStrength:0});}if(['long','full'].includes(config.type)&&actor.getFlag(MODULE_ID,'medicalClinicalUses'))await actor.setFlag(MODULE_ID,'medicalClinicalUses',{});if(config.type==='full'){const uses=actor.getFlag(MODULE_ID,'medicalRecipientUses');if(uses)await actor.setFlag(MODULE_ID,'medicalRecipientUses',{...uses,surgery:0});}});
}
export async function resumeMedicalClinical(game,actor,id){const ctx=context(game,actor,id);return medicalClinicalWorkflow(game).request(actor,ctx.entry.messageId??'',id,ctx.entry.targets);}
export async function resolveMedicalClinical(game,actor,id){
 owner(game,actor);if(!game.user.isGM)throw Error('GM-Prüfung erforderlich.');
 if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Klinischen Vorgang prüfen'},content:'<p>Ressourcen, angefangene Saves/Würfe und bereits angewendete Zielschritte manuell geprüft und nötigenfalls korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))return;
 const entries=read(actor),entry=entries.find(e=>e.id===id);if(!entry)throw Error('Vorgang fehlt.');entry.status='resolved';await actor.setFlag(MODULE_ID,MEDICAL_CLINICAL,entries);
}
