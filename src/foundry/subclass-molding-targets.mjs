import {MODULE_ID} from '../settings/register.mjs';
import {subclassEffectPlan} from '../casting/subclass-molding-effects.mjs';
import {nativeChakraCost} from './cost-adapter.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {moldingEffectData} from '../effects/molding-effects.mjs';
import {nextActorTurnDeadline,currentTurnEndDeadline} from '../casting/molding-lifetimes.mjs';
import {ninjutsuLevel} from '../casting/ninjutsu-resources.mjs';
import {NATURE_DAMAGE} from '../casting/professor-releases.mjs';
import {availableDamageReceipts} from './molding-damage-receipts.mjs';
import {prepareImbuementTarget} from './imbuement-master.mjs';
import {applyMoldingDamage} from './molding-native-damage.mjs';
import {claimInfusionDamage} from './infusion-damage.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const SIMPLE_SUBCLASS_TARGETS=Object.freeze(['swirling','storm-terror','crimson','gigawatt','tectonic-plates','seal-break','tsunami','void-break','raining-vortex','painter','chakra-infusion','sanguine-master','talent-voider','stone-crusher','imbuement-master','solar-interflow']);
const workflows=new WeakMap();
export function subclassTargetWorkflow(game){let manager=workflows.get(game);if(!manager){manager=createSubclassTargetWorkflow(game);workflows.set(game,manager);}return manager;}
/** Native saves and Conditions with explicit original-save outcomes; no guessed chat parsing. */
export function createSubclassTargetWorkflow(game){
 return createSubclassMoldingRequests(game,{
  id:()=>foundry.utils.randomID(),message:async id=>game.messages.get(id),resolve:uuid=>fromUuid(uuid),
  async prepare({message,record,rule},request,targets){
   if(!SIMPLE_SUBCLASS_TARGETS.includes(rule.id))throw Error('Dieses Molding benötigt seinen eigenen bestätigten Ablauf.');
   const activity=message.getAssociatedActivity(),source=message.getAssociatedActor(),original=source.items.get(record.itemId),prepared=[];
   if(!activity||!original)throw Error('Ursprüngliches Jutsu fehlt.');
   if(rule.id==='solar-interflow'){
    const opts=request.options,dc=source.system.attributes.jutsu.ninjutsu.dc,level=ninjutsuLevel(source);
    if(!activity.item.system.jutsu.keywords.has('combo')||!opts.finalHitConfirmed||!request.targets.some(t=>t.uuid===opts.originalTarget)||!CONFIG.DND5E.damageTypes[opts.unarmedType]||!Number.isFinite(dc)||!level)throw Error('Solar: Combo, letzter Treffer, ursprüngliches Ziel und tatsächliche unbewaffnete Schadensart bestätigen.');
    const type=['bludgeoning','piercing','slashing'].includes(opts.unarmedType)?'force':opts.unarmedType;
    for(const target of targets){
     if(target.uuid===source.uuid)throw Error('Solar-Schockwelle schließt den Wirker aus.');
     if(!opts.shockwaveTargets?.includes(target.uuid)||record.targets?.careful?.some(t=>t.uuid===target.uuid)){prepared.push({target:target.uuid,effects:[],success:true});continue;}
     const rolls=await target.rollSavingThrow({ability:'dex',target:dc},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});if(!rolls?.length)return null;
     const success=rolls[0].total>=dc;
     prepared.push({target:target.uuid,success,rolls:rolls.map(r=>r.toJSON()),effects:success?[]:[{kind:'damage',type,amount:level},{kind:'temporary-condition',id:'dazed',until:'current-turn-end'}]});
    }
    return prepared;
   }
   if(rule.id==='imbuement-master'){
    if(targets.length!==1)throw Error('Imbuement Master benötigt genau eine betroffene Kreatur.');
    if(record.targets?.careful?.some(t=>t.uuid===targets[0].uuid))return [{target:targets[0].uuid,effects:[],protected:true}];
    const prepared=await prepareImbuementTarget(game,message,record,targets[0]);return prepared?[prepared]:null;
   }
   let infusion;
   if(rule.id==='chakra-infusion'){
    if(activity.damage?.parts?.length)throw Error('Infusion-Zusatzschaden wird beim ersten nativen Schadenswurf gemeinsam mit dem Jutsu angewendet.');
    if(!record.infusionReleases?.length||record.infusionReleases.some(k=>!NATURE_DAMAGE[k]))throw Error('Gespeicherte Release-Zuordnung fehlt.');
    infusion=(await claimInfusionDamage(game,message,record)).map(b=>({kind:'damage',type:b.type,amount:b.value}));
   }
   for(const target of targets){
    if(record.targets?.careful?.some(t=>t.uuid===target.uuid)){prepared.push({target:target.uuid,effects:[],protected:true});continue;}
    if(infusion){prepared.push({target:target.uuid,effects:infusion});continue;}
    if(rule.id==='stone-crusher'){
     const casters=[...new Set([source.uuid,...request.options.casters??[]])];
     for(const uuid of casters){const caster=await fromUuid(uuid);if(!caster?.isOwner||!['character','npc'].includes(caster.type))throw Error('Bestätigter Mitwirker nicht verfügbar.');}
     prepared.push({target:target.uuid,effects:casters.map(caster=>({kind:'caster-resistance',from:target.uuid,caster}))});continue;
    }
    if(['sanguine-master','talent-voider'].includes(rule.id)){
     const receipts=availableDamageReceipts(target,record.castId,rule.id);
     const saveDone=(target.getFlag(MODULE_ID,'talentVoiderSaves')??[]).includes(record.castId);
     if(!receipts.length&&(rule.id==='sanguine-master'||saveDone))throw Error(`${target.name}: noch kein unbenutzter nativer Schadensbeleg vorhanden.`);
     const effects=rule.id==='sanguine-master'
      ?receipts.filter(r=>r.at+60>game.time.worldTime).map(r=>({kind:'max-hp',amount:r.amount,expiresAt:r.at+60}))
      :[{kind:'damage',type:'chakra',amount:receipts.reduce((n,r)=>n+r.amount,0)}];
     let talentSave;
     if(rule.id==='talent-voider'&&!saveDone){
      const dc=activity.save?.dc?.value??source.system.attributes.jutsu.ninjutsu.dc,rolls=await target.rollSavingThrow({ability:'con',target:dc},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});
      if(!rolls?.length)return null;
      talentSave={success:rolls[0].total>=dc,rolls:rolls.map(r=>r.toJSON())};
      if(!talentSave.success){const duration=await new Roll('1d4+1').evaluate();await duration.toMessage({speaker:ChatMessage.getSpeaker({actor:source}),flavor:'Talent Voider · Zielzüge'});effects.push({kind:'restriction',id:'no-chakra-molding',until:'target-next-turn-end',turns:duration.total});}
     }
     prepared.push({target:target.uuid,effects,receiptIds:receipts.map(r=>r.id),talentSave});continue;
    }
    const types=CONFIG.DND5E.conditionTypes,ranks=Object.fromEntries(Object.keys(types).map(id=>[id,target.getConditionRank(id)]));
    const plan=subclassEffectPlan(rule.id,{nativeCost:nativeChakraCost(original.system,{rank:record.rank}),hasSave:!!activity.save?.ability?.size,types,ranks,targetType:target.system.details?.type?.value,organic:request.options.organicTargets?.includes(target.uuid)});
    let success=false,rolls;
    if(plan.save==='original'){
     const selected=await foundry.applications.api.DialogV2.wait({window:{title:`${rule.name}: ursprünglicher Rettungswurf`},content:`<p>${escape(target.name)}: Ergebnis des bereits fälligen Jutsu-Rettungswurfs bestätigen. ${plan.saveDisadvantage?'Für dieses Ziel gilt Nachteil.':''}</p>`,buttons:[{action:'failed',label:'Fehlgeschlagen',callback:()=>false},{action:'passed',label:'Bestanden',callback:()=>true}],rejectClose:false});
     if(selected===null||selected===undefined)return null;success=selected;
    }else if(plan.save){
     const dc=activity.save?.dc?.value??source.system.attributes.jutsu?.ninjutsu?.dc;
     if(!Number.isFinite(dc))throw Error('Verifizierter Ninjutsu-SG fehlt.');
     rolls=await target.rollSavingThrow({ability:plan.save,target:dc,rolls:[{options:{disadvantage:!!plan.saveDisadvantage}}]},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});
     if(!rolls?.length)return null;success=rolls[0].total>=dc;
    }
    const effects=[...(plan.onAll??(success?plan.onSuccess:plan.onFailure))];
    if(rule.id==='gigawatt'&&plan.specialTarget){
     effects.push({kind:'notice',text:'Keine Reaktion auf dieses Jutsu, seinen Schaden oder seine Conditions; Aktionsökonomie manuell.'});
     effects.push({kind:'notice',text:'Gigawatt-Zusatzwürfel wird beim tatsächlichen nativen Jutsu-Schaden vor Verteidigungen berücksichtigt; nicht zusätzlich anwenden.'});
    }
    prepared.push({target:target.uuid,success,ignoreConditionDefense:!!plan.ignoreConditionDefense,effects,rolls:rolls?.map(r=>r.toJSON())});
   }
   return prepared;
  },
  confirm:async({rule},request,prepared)=>foundry.applications.api.DialogV2.confirm({window:{title:`${rule.name}: Zielwirkungen anwenden`},content:`<p>Bestätigte betroffene Kreaturen und ihre Ergebnisse:</p><pre>${escape(JSON.stringify(prepared.map(p=>({target:request.targets.find(t=>t.uuid===p.target)?.name,save:p.success,effects:p.effects,protected:p.protected})),null,2))}</pre>`,rejectClose:false}),
  async apply(target,prepared,{rule,message},request){
   const applied=[];
   if(prepared.receiptIds){
    const available=new Set(availableDamageReceipts(target,request.castId,rule.id).map(r=>r.id));
    if(prepared.receiptIds.some(id=>!available.has(id)))throw Error('Ein Schadensbeleg wurde inzwischen verwendet.');
   }
   const damageEffects=prepared.effects.filter(e=>e.kind==='damage'),damage=damageEffects.map(e=>({type:e.type,value:e.amount,properties:new Set(e.properties??[])})),multipliers=new Set(damageEffects.map(e=>e.multiplier??1));
   if(multipliers.size>1)throw Error('Unterschiedliche Schadensmultiplikatoren benötigen getrennte bestätigte Vorgänge.');
   if(damage.length){await applyMoldingDamage(target,damage,{multiplier:[...multipliers][0],originatingMessage:message,n5eseSecondaryMolding:rule.id!=='imbuement-master',n5eseImbuementDamage:rule.id==='imbuement-master'});applied.push({damage});}
   for(const effect of prepared.effects){
    if(effect.kind==='damage')continue;
    if(effect.kind==='notice'){applied.push({notice:effect.text});continue;}
    if(effect.kind==='caster-resistance'){
     const source=message.getAssociatedActor(),caster=await fromUuid(effect.caster),data=moldingEffectData({name:rule.name,sourceActorUuid:source.uuid,sourceItemUuid:rule.source,transactionId:request.id,lifetime:{deadline:nextActorTurnDeadline(game.combat,source.uuid)},metadata:{ruleId:rule.id,resistanceFrom:effect.from}});
     if(!caster?.isOwner)throw Error('Bestätigter Mitwirker nicht mehr verfügbar.');
     const [created]=await caster.createEmbeddedDocuments('ActiveEffect',[data]);applied.push({caster:caster.uuid,effectId:created.id});continue;
    }
    if(effect.kind==='max-hp'){
     if(effect.expiresAt<=game.time.worldTime)continue;
     const data=moldingEffectData({name:rule.name,sourceActorUuid:message.getAssociatedActor().uuid,sourceItemUuid:rule.source,transactionId:request.id,lifetime:{expiresAt:effect.expiresAt},changes:[{key:'system.attributes.hp.tempmax',type:'add',value:String(-effect.amount)}],metadata:{ruleId:rule.id}});
     const [created]=await target.createEmbeddedDocuments('ActiveEffect',[data]);
     // Like native maximum-HP damage, persist a reduced current-HP ceiling; expiration must not heal.
     const stored=target.toObject().system.attributes.hp.value,ceiling=target.system.attributes.hp.effectiveMax;
     if(stored>ceiling)await target.update({'system.attributes.hp.value':ceiling});
     applied.push({effectId:created.id,maxHpLoss:effect.amount});continue;
    }
    if(['restriction','trigger','protection','temporary-condition'].includes(effect.kind)){
     const source=message.getAssociatedActor(),who=effect.until==='target-next-turn-end'?target:source;
     const data=moldingEffectData({name:rule.name,sourceActorUuid:source.uuid,sourceItemUuid:rule.source,transactionId:request.id,
      lifetime:{deadline:effect.until==='current-turn-end'?currentTurnEndDeadline(game.combat):nextActorTurnDeadline(game.combat,who.uuid,'end',effect.turns??1)},
      condition:effect.kind==='temporary-condition'?{id:effect.id}:undefined,
      metadata:{ruleId:rule.id,kind:effect.kind,id:effect.id,messageId:message.id,perRound:effect.perRound}});
     const [created]=await target.createEmbeddedDocuments('ActiveEffect',[data]);applied.push({effectId:created.id,id:effect.id});continue;
    }
    if(effect.kind!=='condition')throw Error('Nicht unterstützte Zielwirkung.');
    const result=prepared.ignoreConditionDefense
     ?await target.updateConditionRank(effect.id,target.getConditionRank(effect.id)+effect.delta,{origin:rule.source})
     :await target.applyCondition(effect.id,{delta:effect.delta,origin:rule.source});
    applied.push({condition:effect.id,rank:target.getConditionRank(effect.id),accepted:!!result});
   }
   if(prepared.receiptIds){
    const ids=new Set(prepared.receiptIds),receipts=target.getFlag(MODULE_ID,'moldingDamageReceipts')??[];
    const update={[`flags.${MODULE_ID}.moldingDamageReceipts`]:receipts.map(r=>ids.has(r.id)?{...r,usedBy:[...new Set([...(r.usedBy??[]),rule.id])]}:r)};
    if(prepared.talentSave)update[`flags.${MODULE_ID}.talentVoiderSaves`]=[...new Set([...(target.getFlag(MODULE_ID,'talentVoiderSaves')??[]),request.castId])];
    await target.update(update);
   }
   return applied;
  },
  async finalize({message,rule},request,prepared){
   if(rule.id!=='solar-interflow')return;
   const actor=message.getAssociatedActor(),entries=actor.getFlag(MODULE_ID,'solarFinishers')??[];
   if(entries.some(e=>e.requestId===request.id))return;
   const allowed=new Set([request.options.originalTarget,...prepared.filter(p=>p.success===false).map(p=>p.target)]);
   await actor.setFlag(MODULE_ID,'solarFinishers',[...entries,{id:foundry.utils.randomID(),requestId:request.id,messageId:message.id,status:'pending',targets:request.targets.filter(t=>allowed.has(t.uuid))}]);
  }
 });
}
export async function requestSubclassTargets(game,manager,message,ruleId){
 const references=[...new Map([...game.user.targets].filter(t=>t.actor).map(t=>[t.actor.uuid,{uuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}])).values()];
 if(!references.length)throw Error('Betroffene Kreaturen zunächst als Ziele auswählen.');
 const solar=ruleId==='solar-interflow';
 const casterChoices=ruleId==='stone-crusher'?[...game.actors].filter(a=>['character','npc'].includes(a.type)&&a.uuid!==message.getAssociatedActor().uuid):[];
 const casterFields=casterChoices.length?`<fieldset><legend>Weitere tatsächlich beteiligte Wirker bestätigen</legend>${casterChoices.map((a,i)=>`<label><input type="checkbox" name="caster" value="${i}"> ${escape(a.name)}</label>`).join('')}</fieldset>`:'';
 const solarFields=solar?`<label>Ursprüngliches getroffenes Ziel <select name="original">${references.map((t,i)=>`<option value="${i}">${escape(t.name)}</option>`).join('')}</select></label><label>Unbewaffnete Schadensart <select name="unarmed">${Object.keys(CONFIG.DND5E.damageTypes).map(k=>`<option value="${k}">${escape(k)}</option>`).join('')}</select></label><label><input type="checkbox" name="lastHit"> Combo: letzten Treffer gelandet; markierte Schockwellen-Ziele liegen innerhalb von 10 Fuß, Wirker ausgenommen</label>`:'';
 const selected=await foundry.applications.api.DialogV2.wait({window:{title:'Molding: betroffene Kreaturen'},content:`<p>Reichweite und tatsächliche Betroffenheit bestätigen. Geschützte Careful-Ziele werden übersprungen.${solar?' Checkboxen wählen die Schockwellen-Ziele. Das ursprüngliche Ziel bleibt zusätzlich für den Finisher gespeichert.':''}</p>${solarFields}${casterFields}${references.map((t,i)=>`<label style="display:block"><input type="checkbox" name="target" value="${i}"> ${escape(t.name)}</label>${ruleId==='crimson'?`<label><input type="checkbox" name="organic" value="${i}"> Konstrukt aus organischem Material</label>`:''}`).join('')}`,buttons:[{action:'confirm',label:'GM-Anfrage speichern',callback:(_e,b)=>{
  const chosen=[...b.form.querySelectorAll('[name="target"]:checked')].map(e=>references[Number(e.value)]),original=solar?references[Number(b.form.elements.original.value)]:null;
  return {targets:[...new Map([...chosen,...original?[original]:[]].map(t=>[t.uuid,t])).values()],casters:[...b.form.querySelectorAll('[name="caster"]:checked')].map(e=>casterChoices[Number(e.value)].uuid),organicTargets:[...b.form.querySelectorAll('[name="organic"]:checked')].map(e=>references[Number(e.value)].uuid),...(solar?{originalTarget:original.uuid,shockwaveTargets:chosen.map(t=>t.uuid),unarmedType:b.form.elements.unarmed.value,finalHitConfirmed:b.form.elements.lastHit.checked}:{})};
 }}],rejectClose:false});
 if(!selected)return null;
 const {targets,...options}=selected;return manager.request(message.getAssociatedActor(),message.id,ruleId,targets,options);
}
