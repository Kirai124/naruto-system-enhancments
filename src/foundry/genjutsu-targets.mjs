import {managedGenjutsuConditionData} from '../effects/genjutsu-effects.mjs';
import {requireInfusionTarget} from './genjutsu-weapon-casting.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {nativeChakraCost} from './cost-adapter.mjs';
import {nextActorTurnDeadline,moldingLifetimeExpired} from '../casting/molding-lifetimes.mjs';
import {subclassCastExpiry} from '../casting/subclass-cast-lifetime.mjs';
import {ninjutsuEffectData} from '../effects/ninjutsu-effects.mjs';
import {readPendingCastingCosts} from '../casting/pending-costs.mjs';
import {chooseChakraDice,commitFeaturePayment} from './ninjutsu-resource-utils.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

const managers=new WeakMap();
function getContext(game,actor,messageId){
 const message=game.messages.get(messageId),record=message?.getFlag(MODULE_ID,'genjutsuCast');
 if(!genjutsuEnabled(game)||!actor?.isOwner||!record||message.getAssociatedActor()?.uuid!==actor.uuid||message.system.deltas===null)throw Error('Eigener bezahlter Genjutsu-Cast fehlt oder wurde erstattet.');
 requireInfusionTarget(game,message);return {message,record};
}
export function genjutsuTargetWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{
  storage:'genjutsuTargetRequests',id:()=>foundry.utils.randomID(),resolve:uuid=>fromUuid(uuid),message:async id=>game.messages.get(id),
  owner(actor){if(!actor?.isOwner||!genjutsuEnabled(game))throw Error('Genjutsu-Automation und Quellenberechtigung erforderlich.');},
  async context(actor,messageId,ruleId){
   const ctx=getContext(game,actor,messageId);if(ctx.record.psionic&&ruleId!=='actualization-damage')throw Error('Psionic Scrivener gewährt keine weiteren allgemeinen Genjutsu-Klassenfunktionen.');
   if(ruleId==='actualization-damage'){
    const feature=ownedGenjutsuFeature(actor,'Actualization');if(!feature||!ctx.record.choice.damageDice)throw Error('Actualization-Schaden wurde bei diesem Cast nicht bezahlt.');
    return {...ctx,record:{...ctx.record,castId:ctx.record.id},rule:{id:ruleId,source:feature.uuid}};
   }
   if(ruleId.startsWith('actualized-power:')){const feature=ownedGenjutsuFeature(actor,'Actualized Power','Real World Conversions'),effectId=ruleId.slice('actualized-power:'.length),activity=ctx.message.getAssociatedActivity(),ref=[...activity.effects].find(e=>e._id===effectId),effect=ref&&(ref.effect??activity.item.effects.get(effectId));if(!feature||!ctx.record.choice.power||!effect||!effect._source.statuses?.length)throw Error('Bezahlte native Actualized-Power-Wirkung fehlt.');return {...ctx,effect,record:{...ctx.record,castId:ctx.record.id},rule:{id:ruleId,source:feature.uuid}};}
   const match=ruleId.match(/^disruption:(.+)$/),payment=match&&(actor.getFlag(MODULE_ID,'genjutsuDisruptionPayments')??[]).find(p=>p.id===match[1]),feature=ownedGenjutsuFeature(actor,'Chakra Disruption');
   if(!feature||payment?.status!=='paid'||payment.messageId!==messageId||payment.castId!==ctx.record.id)throw Error('Bezahlter Disruption-Auslöser fehlt.');
   if(payment.mode==='seal'&&genjutsuLevel(actor)<5)throw Error('Disruption-Sperre benötigt Klassenstufe 5.');
   return {...ctx,payment,record:{...ctx.record,castId:ctx.record.id+':'+payment.id},rule:{id:ruleId,source:feature.uuid}};
  },
  async prepare(ctx,request,targets){
   for(const target of targets)requireInfusionTarget(game,ctx.message,target.uuid);
   const source=ctx.message.getAssociatedActor(),activity=ctx.message.getAssociatedActivity();
   if(ctx.rule.id==='actualization-damage'){
    const confirmed=ctx.record.damageTargets??[];if(targets.some(t=>!confirmed.includes(t.uuid)))throw Error('Nur beim Cast bestätigte tatsächlich betroffene feindliche Ziele zulässig.');
    let rollData=ctx.message.getFlag(MODULE_ID,'actualizationDamageRoll');
    if(!rollData){const roll=await new Roll(ctx.record.choice.damageDice+'d'+ctx.record.die).evaluate();rollData={total:roll.total*3,roll:roll.toJSON()};await ctx.message.setFlag(MODULE_ID,'actualizationDamageRoll',rollData);await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:source}),flavor:'Actualization: Psychic-Zusatzschaden ×3 = '+rollData.total});}
    const damaging=[...ctx.message.getAssociatedItem().system.activities].some(a=>a.damage?.parts?.length),hasSave=activity.save?.ability?.size;
    return targets.map(target=>{
     const receipt=[...(target.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[])].findLast(r=>r.messageId===ctx.message.id);
     let multiplier=1;if(damaging&&hasSave){if(!receipt)throw Error('Bei ursprünglichem Jutsu-Schaden zuerst den tatsächlichen Save zuordnen.');if(['success','critical-success'].includes(receipt.outcome)){if(activity.damage.onSave==='half')multiplier=0.5;else if(activity.damage.onSave==='none')multiplier=0;else if(activity.damage.onSave!=='full')throw Error('Unbekannte Save-Schadensregel; mit GM klären.');}}
     return {targetUuid:target.uuid,kind:'psychic',amount:Math.floor(rollData.total*multiplier),multiplier,saveReceipt:damaging&&hasSave?{id:receipt.id,total:receipt.total,outcome:receipt.outcome}:null};
    });
   }
   if(ctx.rule.id.startsWith('actualized-power:')){if(targets.length!==1||targets[0].uuid!==ctx.record.powerTarget.uuid)throw Error('Nur das bestätigte Power-Einzelziel verwenden.');const data=ctx.effect.toObject();delete data._id;data.disabled=false;data.transfer=false;const concentration=source.effects.get(ctx.message.system.concentration);data.origin=concentration?.uuid??ctx.effect.uuid;data.flags??={};data.flags.n5eb={...data.flags.n5eb,dependentOn:data.origin,scaling:ctx.message.system.scaling,spellLevel:ctx.message.system.spellLevel};data.flags[MODULE_ID]={...data.flags[MODULE_ID],genjutsuPower:{requestId:request.id,castId:ctx.record.id,sourceActorUuid:source.uuid,effectId:ctx.effect.id}};let expiresAt=Number.isFinite(ctx.record.createdAt)?subclassCastExpiry(activity.duration,ctx.record.createdAt):undefined;if(data.duration?.seconds>0&&Number.isFinite(ctx.record.createdAt))expiresAt=ctx.record.createdAt+data.duration.seconds;if(Number.isFinite(expiresAt)){data.duration={...data.duration,seconds:Math.max(0,expiresAt-game.time.worldTime),startTime:game.time.worldTime};}return [{targetUuid:targets[0].uuid,kind:'power-effect',data,lifetime:{expiresAt}}];}
   if(targets.length!==1||targets[0].uuid!==ctx.payment.targetUuid)throw Error('Genau das bezahlte betroffene Disruption-Ziel bestätigen.');
   const target=targets[0];if(ctx.payment.mode==='cost')return [{targetUuid:target.uuid,kind:'cost',amount:nativeChakraCost(ctx.message.getAssociatedItem().system,{rank:ctx.record.rank}),lifetime:ctx.payment.lifetime}];
   const receipt=[...(target.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[])].findLast(r=>r.messageId===ctx.message.id);
   if(receipt&&!['failure','critical-failure'].includes(receipt.outcome))throw Error('Disruption-Sperre benötigt einen tatsächlich fehlgeschlagenen ursprünglichen Save.');
   if(!receipt&&!ctx.payment.failedSaveConfirmed)throw Error('Fehlgeschlagenen ursprünglichen Save bestätigen.');
   const expiresAt=Number.isFinite(ctx.record.createdAt)?subclassCastExpiry(activity.duration,ctx.record.createdAt):undefined,concentrationId=ctx.message.system.concentration;
   return [{targetUuid:target.uuid,kind:'seal',rank:ctx.record.effectRank??ctx.record.rank,lifetime:{expiresAt},concentrationId}];
  },
  async confirm(ctx,_request,prepared){
   const div=document.createElement('div');for(const p of prepared){const line=document.createElement('p');line.textContent=p.targetUuid+': '+(p.kind==='psychic'?p.amount+' Psychic nach bestätigter Save-Schadensregel':p.kind==='power-effect'?'Native Condition-Wirkung '+p.data.name+' ohne Condition-Resistenz/-Immunität':p.kind==='cost'?'Nächstes Jutsu +'+p.amount+' Chakra bis Ende des nächsten Zielzugs':'CM-Jutsu unter Rang '+p.rank.toUpperCase()+' für die verbleibende ursprüngliche Genjutsu-Dauer sperren');div.append(line);}
   const note=document.createElement('p');note.textContent='GM bestätigt: Ziele sind tatsächlich vom ursprünglichen Genjutsu betroffen. Für eine Sperre ist dessen Save fehlgeschlagen. Vorzeitiges Ende des ursprünglichen Genjutsu am Ziel ebenfalls berücksichtigen; ohne auslesbare Dauer bzw. außerhalb des Kampfes manuell beenden.';div.append(note);
   return foundry.applications.api.DialogV2.confirm({window:{title:'Genjutsu-Zielwirkung anwenden'},content:div.innerHTML,rejectClose:false});
  },
  async apply(target,plan,ctx,request){
   const source=ctx.message.getAssociatedActor();
   if(plan.saveReceipt){const current=(target.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]).find(r=>r.id===plan.saveReceipt.id);if(!current||current.total!==plan.saveReceipt.total||current.outcome!==plan.saveReceipt.outcome)throw Error('Ursprünglicher Save nach Vorbereitung geändert; Schadensanwendung manuell prüfen.');}
   if(plan.lifetime&&moldingLifetimeExpired(plan.lifetime,{combat:game.combat,worldTime:game.time.worldTime}))throw Error('Ursprüngliche Wirkungsdauer bereits abgelaufen.');
   if(plan.kind==='psychic'){if(plan.amount)await target.applyDamage([{type:'psychic',value:plan.amount}],{n5eseGenjutsuRequest:request.id,originatingMessage:ctx.message});return {damage:plan.amount};}
   if(plan.kind==='power-effect'){if(ctx.message.system.concentration&&!source.effects.has(ctx.message.system.concentration))throw Error('Ursprüngliche Genjutsu-Konzentration bereits beendet.');const data=structuredClone(plan.data);if(Number.isFinite(plan.lifetime?.expiresAt))data.duration={...data.duration,seconds:plan.lifetime.expiresAt-game.time.worldTime,startTime:game.time.worldTime};const feature=ownedGenjutsuFeature(source,'Actualized Power','Real World Conversions'),managed=managedGenjutsuConditionData(game,{native:data,target,actor:source,feature,id:request.id,lifetime:plan.lifetime,payload:{ruleId:'actualized-power:'+ctx.record.id,messageId:ctx.message.id,concentrationId:ctx.message.system.concentration},ignoreDefense:true});managed.flags[MODULE_ID].genjutsuPower=data.flags[MODULE_ID].genjutsuPower;const [effect]=await target.createEmbeddedDocuments('ActiveEffect',[managed]);if(!effect)throw Error('Condition-Wirkung wurde nicht angelegt.');return {effectId:effect.id};}
   if(plan.kind==='cost'){const entries=readPendingCastingCosts(target);await target.setFlag(MODULE_ID,'pendingCastingCosts',[...entries,{id:request.id,kind:'chakra-disruption',amount:plan.amount,sourceActorUuid:source.uuid,sourceItemUuid:ctx.rule.source,sourceMessageId:ctx.message.id,lifetime:plan.lifetime}]);return {surcharge:plan.amount};}
   if(plan.concentrationId&&!source.effects.has(plan.concentrationId))throw Error('Ursprüngliche Genjutsu-Konzentration bereits beendet.');
   await target.createEmbeddedDocuments('ActiveEffect',[ninjutsuEffectData({name:'Chakra Disruption · niedrigere CM-Ränge gesperrt',id:request.id,sourceActorUuid:source.uuid,sourceItemUuid:ctx.rule.source,setting:'genjutsuClassAutomation',lifetime:plan.lifetime,metadata:{genjutsuMoldingRank:plan.rank,sourceMessageId:ctx.message.id,sourceConcentrationId:plan.concentrationId}})]);return {rank:plan.rank};
  }
 });managers.set(game,manager);return manager;
}

export async function requestActualizationDamage(game,message){
 const actor=message.getAssociatedActor(),{record}=getContext(game,actor,message.id),tokens=[...game.user.targets].filter(t=>t.actor);
 if(!record.choice.damageDice||!tokens.length)throw Error('Bezahlter Actualization-Schaden und tatsächlich betroffene feindliche Ziele erforderlich.');
 const targets=tokens.map(t=>({uuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}));
 if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Actualization-Ziele'},content:'<p>Nur tatsächlich betroffene feindliche Ziele anwenden. Bei ursprünglichem Jutsu-Schaden dessen Save-Schadensregel, sonst voller Zusatzschaden; Zielverteidigungen folgen danach.</p>',rejectClose:false}))return;
 return genjutsuTargetWorkflow(game).request(actor,message.id,'actualization-damage',targets);
}

export async function requestChakraDisruption(game,message){
 const actor=message.getAssociatedActor(),{record}=getContext(game,actor,message.id),feature=ownedGenjutsuFeature(actor,'Chakra Disruption');if(!feature||!game.settings.get(MODULE_ID,'dynamicChakraCosts'))throw Error('Chakra Disruption und dynamische Chakra-Kosten erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const tokens=[...game.user.targets].filter(t=>t.actor);if(tokens.length!==1)throw Error('Genau eine tatsächlich betroffene Kreatur markieren.');const target=tokens[0].actor;
  const content=document.createElement('div'),hint=document.createElement('p'),select=document.createElement('select');select.name='mode';hint.textContent='Tatsächlich betroffenes Ziel: '+target.name+'. Eine Feature-Nutzung bezahlen; bei erschöpften Nutzungen stattdessen einen tatsächlichen Chakra Die. Die Sperre setzt einen fehlgeschlagenen ursprünglichen Save voraus.';content.append(hint,select);
  for(const [value,label] of [['cost','Nächstes Jutsu: Zuschlag des ungekürzten Genjutsu-Rangpreises'],...(genjutsuLevel(actor)>=5?[['seal','Niedrigere CM-Jutsu für die Genjutsu-Dauer sperren']]:[])]){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);}
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='failed';label.append(input,document.createTextNode('Ursprünglicher Genjutsu-Save ist tatsächlich fehlgeschlagen'));content.append(label);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Chakra Disruption'},content:content.innerHTML,buttons:[{action:'pay',label:'Auslöser bestätigen und bezahlen',callback:(_e,b)=>({mode:b.form.elements.mode.value,failedSaveConfirmed:b.form.elements.failed.checked})}],rejectClose:false});if(!choice)return;
  if(!['cost','seal'].includes(choice.mode)||choice.mode==='seal'&&(genjutsuLevel(actor)<5||!choice.failedSaveConfirmed))throw Error('Ungültiger Disruption-Auslöser.');
  const die=feature.system.uses.value<1?await chooseChakraDice(actor,1):null;if(feature.system.uses.value<1&&!die)return;
  const entries=structuredClone(actor.getFlag(MODULE_ID,'genjutsuDisruptionPayments')??[]);if(entries.some(p=>['applying','review'].includes(p.status)))throw Error('Vorherige Disruption-Zahlung zuerst vom GM prüfen lassen.');
  const payment={id:foundry.utils.randomID(),messageId:message.id,castId:record.id,targetUuid:target.uuid,targetTokenUuid:tokens[0].document.uuid,mode:choice.mode,lifetime:{deadline:nextActorTurnDeadline(game.combat,target.uuid,'end')},failedSaveConfirmed:choice.failedSaveConfirmed,status:'applying'};entries.push(payment);await actor.setFlag(MODULE_ID,'genjutsuDisruptionPayments',entries);
  try{await commitFeaturePayment(actor,die?{die}:{feature});payment.status='paid';await actor.setFlag(MODULE_ID,'genjutsuDisruptionPayments',entries);return await genjutsuTargetWorkflow(game).request(actor,message.id,'disruption:'+payment.id,[{uuid:target.uuid,tokenUuid:tokens[0].document.uuid,name:target.name}]);}catch(error){payment.status='review';payment.error=error.message;await actor.setFlag(MODULE_ID,'genjutsuDisruptionPayments',entries);throw error;}
 });
}

export function genjutsuRestrictionActive(game,effect){
 const marker=effect.getFlag(MODULE_ID,'ninjutsuEffect');if(!genjutsuEnabled(game)||effect.disabled||!marker?.metadata.genjutsuMoldingRank||moldingLifetimeExpired(marker.lifetime,{combat:game.combat,worldTime:game.time.worldTime}))return false;
 const source=fromUuidSync(marker.sourceActorUuid),concentration=source?.effects.get(marker.metadata.sourceConcentrationId);return !marker.metadata.sourceConcentrationId||!!concentration&&!concentration.disabled;
}

export async function resumeDisruptionRequest(game,message,id){
 const actor=message.getAssociatedActor();getContext(game,actor,message.id);
 return withCastingActorLock(actor,async()=>{
  const payment=(actor.getFlag(MODULE_ID,'genjutsuDisruptionPayments')??[]).find(p=>p.id===id);if(payment?.status!=='paid')throw Error('Bestätigte Zahlung fehlt.');
  const token=await fromUuid(payment.targetTokenUuid);if(token?.actor?.uuid!==payment.targetUuid)throw Error('Ursprüngliches Zieltoken fehlt.');
  return genjutsuTargetWorkflow(game).request(actor,message.id,'disruption:'+id,[{uuid:payment.targetUuid,tokenUuid:payment.targetTokenUuid,name:token.name}]);
 });
}
export async function resolveDisruptionPayment(game,actor,id){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const entries=structuredClone(actor.getFlag(MODULE_ID,'genjutsuDisruptionPayments')??[]),entry=entries.find(p=>p.id===id);if(!entry||!['applying','review'].includes(entry.status))throw Error('Keine unterbrochene Zahlung.');
  const result=await foundry.applications.api.DialogV2.wait({window:{title:'Disruption-Zahlung prüfen'},content:'<p>Feature-Nutzung/Chakra Die sowie vorhandene Zielanfragen manuell prüfen und korrigieren. Hier werden keine Ressourcen erneut verbraucht und keine Zielwirkungen wiederholt.</p>',buttons:[{action:'paid',label:'Bezahlung bestätigt; Zielanfrage freigeben',callback:()=>'paid'},{action:'resolved',label:'Manuell abgeschlossen',callback:()=>'resolved'}],rejectClose:false});if(!result)return;
  entry.status=result;entry.reviewedBy=game.user.id;await actor.setFlag(MODULE_ID,'genjutsuDisruptionPayments',entries);
 });
}
