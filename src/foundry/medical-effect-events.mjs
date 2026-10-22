import {dominantMedicalTrace} from './medical-traces.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,ninjutsuModifier,medicalTurn} from '../casting/medical-context.mjs';
import {medicalEffects,medicalPayload} from './medical-clinical.mjs';
import {ninjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {prepareGenjutsuConditions} from '../effects/genjutsu-effects.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {grantMedicalTempHP} from './medical-temp-hp.mjs';
import {applyMedicalHealing} from './medical-healing.mjs';
import {applyMedicalDamage} from './medical-receipts.mjs';
export const MEDICAL_EVENTS='medicalEffectEvents';
const read=actor=>structuredClone(actor.getFlag(MODULE_ID,MEDICAL_EVENTS)??[]),queues=new WeakMap();
const authority=(game,actor)=>actor?.isOwner&&(game.users.activeGM?game.users.activeGM.id===game.user.id:true);
function serialize(actor,work){const next=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(work);queues.set(actor,next);next.finally(()=>{if(queues.get(actor)===next)queues.delete(actor);}).catch(()=>{});return next;}
export async function queueMedicalEvent(game,effect,timing,{key}={}){
 const target=effect.parent,payload=medicalPayload(effect);if(!medicalEnabled(game)||!target?.isOwner||!activeNinjutsuEffect(game,effect)||!payload?.medical)throw Error('Aktive eigene Medical-Wirkung erforderlich.');
 if(!(payload.medicalRepeat?.timing===timing||timing==='damaged'&&payload.healOnDamage||timing==='target-start'&&(payload.turnTempCon||payload.alteredTemporaryHP||payload.traceWaterRemaining>0)||timing==='trace-fire'&&payload.traceFireAvailable))throw Error('Kein verfügbarer passender Medical-Auslöser.');
 return serialize(target,async()=>{
  const entries=read(target),eventKey=key??(medicalTurn(game)?medicalTurn(game)+':'+timing:'manual:'+foundry.utils.randomID());
  if(entries.some(e=>e.effectId===effect.id&&(e.key===eventKey||timing!=='damaged'&&['pending','rolling','ready'].includes(e.status))))return;
  const entry={id:foundry.utils.randomID(),effectId:effect.id,key:eventKey,timing,status:'pending',at:game.time.worldTime};entries.push(entry);await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);return entry;
 });
}
export async function applyMedicalEvent(game,target,id){
 if(!medicalEnabled(game)||!target.isOwner)throw Error('Medical-Automation und Zielberechtigung erforderlich.');
 return withCastingActorLock(target,async()=>{
  const entries=read(target),entry=entries.find(e=>e.id===id),effect=entry&&target.effects.get(entry.effectId),payload=effect&&medicalPayload(effect);
  if(!['pending','ready'].includes(entry?.status)||!effect||!activeNinjutsuEffect(game,effect)||!dominantMedicalTrace(game,effect))throw Error('Ereignis beendet, bereits angewendet oder zur Prüfung gesperrt.');
  if(!entry.prepared){
   entry.status='rolling';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);
   try{
    let save=null,amount=0,chakra=0,roll=null,chakraRoll=null;
    if(payload.medicalRepeat?.timing===entry.timing){const rolls=await target.rollSavingThrow({ability:payload.medicalRepeat.save,target:payload.dc,rolls:[{options:{...(payload.venomousSaves?{disadvantage:true}:{})}}]},{configure:true});if(!rolls?.length){entry.status='pending';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);return;}save={total:rolls[0].total,roll:rolls[0].toJSON(),success:rolls[0].total>=payload.dc};}
    if(payload.disruption&&save&&!save.success){roll=await new Roll('2d8').evaluate();chakraRoll=await new Roll('2d8').evaluate();amount=roll.total;chakra=chakraRoll.total;}
    if(payload.healOnDamage&&entry.timing==='damaged'){roll=await new Roll(payload.healOnDamage).evaluate();amount=roll.total;}
    if(payload.traceWaterRemaining>0&&entry.timing==='target-start'){roll=await new Roll('1d8').evaluate();amount=roll.total;}
    if(payload.traceFireAvailable&&entry.timing==='trace-fire'){
     const denominations=target.system.isNPC?['d'+target.system.attributes.hd.denomination]:[...new Set(target.system.attributes.hd.classes.filter(c=>c.system.hd.value>0).map(c=>c.system.hd.denomination))];if(!denominations.length)throw Error('Kein Hit Die verfügbar.');
     const select=document.createElement('select');select.name='denomination';for(const value of denominations){const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);}
     const denomination=await foundry.applications.api.DialogV2.wait({window:{title:'Fire Traces · einen Hit Die verbrauchen'},content:select.outerHTML,buttons:[{action:'spend',label:'Würfel wählen und verbrauchen',callback:(_event,button)=>button.form.elements.denomination.value}],rejectClose:false});if(!denomination){entry.status='pending';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);return;}if(!denominations.includes(denomination))throw Error('Ungültiger Hit Die.');
     const rolls=await target.rollHitDie({denomination,modifyHitPoints:false},{configure:false});if(!rolls?.length){entry.status='pending';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);return;}roll=rolls[0];amount=2*roll.dice.reduce((sum,die)=>sum+die.results.filter(r=>r.active!==false&&!r.discarded).reduce((n,r)=>n+r.result,0),0);
    }
    if(payload.alteredTemporaryHP&&entry.timing==='target-start')amount=10;
    if(payload.turnTempCon&&entry.timing==='target-start')amount=Math.max(1,target.system.abilities.con.mod);
    entry.prepared={save,amount,chakra,roll:roll?.toJSON(),chakraRoll:chakraRoll?.toJSON()};entry.status='ready';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);
   }catch(error){entry.status='review';entry.error=error.message;await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);throw error;}
  }
  const plan=entry.prepared,p=document.createElement('p');p.textContent=effect.name+': '+(plan.save?'Save '+plan.save.total+' gegen '+payload.dc+(plan.save.success?' erfolgreich – Wirkung beenden.':' fehlgeschlagen. '):'')+(plan.amount?' '+plan.amount+(payload.healOnDamage||payload.traceWaterRemaining||payload.traceFireAvailable?' HP Heilung':payload.turnTempCon||payload.alteredTemporaryHP?' temporäre HP':' Force-Schaden vor Verteidigungen'):'')+(plan.chakra?' und '+plan.chakra+' Chakra-Schaden.':'')+' Tatsächlichen Auslöser und Anwendung bestätigen?';
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Folgewirkung'},content:p.outerHTML,rejectClose:false}))return;
  if(!activeNinjutsuEffect(game,effect)||!dominantMedicalTrace(game,effect))throw Error('Wirkung inzwischen beendet oder stärkere Traces aktiv.');
  entry.status='applying';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);
  try{
   if(plan.save?.success){if(payload.ruleId==='medical.poisonous-touch'){const marker=structuredClone(ninjutsuEffect(effect));marker.metadata.genjutsu.conditions=[];delete marker.metadata.genjutsu.medicalRepeat;await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}else await effect.delete();}
   else{
    if(payload.disruption){await applyMedicalDamage(target,[{type:'force',value:plan.amount,properties:new Set()},{type:'chakra',value:plan.chakra,properties:new Set()}],{n5eseMedicalRequest:id,n5eseMedicalBypassTemp:true});const marker=structuredClone(ninjutsuEffect(effect)),current=marker.metadata.genjutsu;current.failures=(current.failures??1)+1;current.conditions=prepareGenjutsuConditions(game,target,[...(current.failures>=2?[{id:'dazed',rank:1}]:[]),...(current.failures>=4?[{id:'weakened',rank:1}]:[]),...(current.failures>=6?[{id:'incapacitated',rank:1}]:[])]);await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}
    if(payload.healOnDamage&&entry.timing==='damaged'){await applyMedicalHealing(target,plan.amount,{n5eseMedicalRequest:id});const marker=structuredClone(ninjutsuEffect(effect));marker.metadata.genjutsu.triggers=(payload.triggers??0)+1;if(marker.metadata.genjutsu.triggers>=(payload.triggerLimit??Infinity))await effect.delete();else await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}
    if(payload.traceWaterRemaining>0&&entry.timing==='target-start'){await applyMedicalHealing(target,plan.amount,{n5eseMedicalRequest:id});const marker=structuredClone(ninjutsuEffect(effect));marker.metadata.genjutsu.traceWaterRemaining--;if(marker.metadata.genjutsu.traceWaterRemaining<=0)await effect.delete();else await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}
    if(payload.traceFireAvailable&&entry.timing==='trace-fire'){await applyMedicalHealing(target,plan.amount,{n5eseMedicalRequest:id});const marker=structuredClone(ninjutsuEffect(effect));marker.metadata.genjutsu.traceFireAvailable=false;await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}
    if(payload.alteredTemporaryHP&&entry.timing==='target-start'){const grant=await grantMedicalTempHP(target,{sourceActorUuid:ninjutsuEffect(effect).sourceActorUuid,rule:'altered-strength:'+effect.id,amount:10,lifetime:ninjutsuEffect(effect).lifetime});if(grant){const marker=structuredClone(ninjutsuEffect(effect));marker.metadata.genjutsu.medicalTempGrantId=grant;await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}}
    if(payload.turnTempCon&&entry.timing==='target-start')await grantMedicalTempHP(target,{sourceActorUuid:ninjutsuEffect(effect).sourceActorUuid,rule:'transmuted-plant',amount:plan.amount});
   }
   entry.status='applied';await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);
  }catch(error){entry.status='review';entry.error=error.message;await target.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);throw error;}
 });
}
export async function resolveMedicalEvent(game,actor,id){
 if(!actor.isOwner||!game.user.isGM)throw Error('GM-Prüfung erforderlich.');
 if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Ereignis prüfen'},content:'<p>Würfe und Zielwerte manuell geprüft und korrigiert? Ohne Wiederholung abschließen.</p>',rejectClose:false}))return;
 const entries=read(actor),entry=entries.find(e=>e.id===id);if(!entry)throw Error('Ereignis fehlt.');entry.status='resolved';await actor.setFlag(MODULE_ID,MEDICAL_EVENTS,entries);
}
export function installMedicalEffectEvents(game,ActorClass){
 const before=new WeakMap();Hooks.on('preUpdateCombat',combat=>before.set(combat,{round:combat.round,turn:combat.turn,actorUuid:combat.combatant?.actor?.uuid}));
 Hooks.on('updateCombat',async(combat,change)=>{
  if(!medicalEnabled(game)||!combat.started||!['round','turn'].some(k=>Object.hasOwn(change,k)))return;
  const previous=before.get(combat);if(previous?.round===combat.round&&previous?.turn===combat.turn)return;
  const actors=[...new Set([...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(x=>x.actor??x))];
  for(const actor of actors.filter(a=>authority(game,a)))for(const effect of medicalEffects(game,actor)){
   const payload=medicalPayload(effect),next=combat.combatant?.actor?.uuid===actor.uuid,old=previous?.actorUuid===actor.uuid;
   if(next&&(payload.medicalRepeat?.timing==='target-start'||payload.turnTempCon||payload.alteredTemporaryHP||payload.traceWaterRemaining>0))await queueMedicalEvent(game,effect,'target-start',{key:combat.id+':'+combat.round+':'+combat.turn+':start'});
   if(old&&payload.medicalRepeat?.timing==='target-end')await queueMedicalEvent(game,effect,'target-end',{key:combat.id+':'+previous.round+':'+previous.turn+':end'});
  }
 });
 Hooks.on('dnd5e.applyDamage',(actor,amount,options)=>{
  if(!medicalEnabled(game)||!authority(game,actor)||amount<=0)return;
  for(const effect of medicalEffects(game,actor))if(medicalPayload(effect).healOnDamage)queueMedicalEvent(game,effect,'damaged',{key:'damage:'+foundry.utils.randomID()}).catch(console.error);
 });
 Hooks.on('dnd5e.preApplyDamage',(actor,amount,updates,options)=>{if(options.n5eseMedicalBypassTemp&&amount>0){updates['system.attributes.hp.temp']=actor.system.attributes.hp.temp;updates['system.attributes.hp.value']=Math.max(0,actor.system.attributes.hp.value-amount);}});
 const apply=ActorClass.prototype.applyDamage;
 ActorClass.prototype.applyDamage=async function(damage,options={}){
  const formBefore=this.getFlag(MODULE_ID,'medicalForm'),before=this.system.attributes.hp.value,result=await apply.call(this,damage,options),formAfter=this.getFlag(MODULE_ID,'medicalForm'),lost=Math.max(0,before-(formBefore?.status==='active'&&!formBefore.avatar&&formBefore.id===formAfter?.id?formAfter.hpValue:this.system.attributes.hp.value)),source=options.originatingMessage?.getAssociatedActor?.(),item=options.originatingMessage?.getAssociatedItem?.();
  if(!medicalEnabled(game)||!lost||!source?.isOwner||!item?.getFlag(MODULE_ID,'medicalScalpelWeapon')||!medicalFeature(source,'Natural Healing','Natural Medicine')||medicalLevel(source)<5)return result;
  await withCastingActorLock(source,async()=>{
   const turn=medicalTurn(game),journal=source.getFlag(MODULE_ID,'medicalNaturalRecovery');if(turn&&journal?.turn===turn)return;
   if(['applying','review'].includes(journal?.status))throw Error('Vorherige Natural-Healing-Rückheilung vom GM prüfen lassen.');
   const amount=Math.max(0,lost+ninjutsuModifier(source));if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Natural Healing · Scalpel-Rückheilung'},content:'<p>'+lost+' tatsächlich verursachter HP-Schaden + Ninjutsu-Modifikator = '+amount+' HP selbst heilen? Einmal pro Zug; außerhalb des Kampfes Zuggrenze bestätigen.</p>',rejectClose:false}))return;
   const state={id:foundry.utils.randomID(),turn,amount,status:'applying'};await source.setFlag(MODULE_ID,'medicalNaturalRecovery',state);try{await applyMedicalHealing(source,amount,{n5eseMedicalRequest:state.id});state.status='applied';await source.setFlag(MODULE_ID,'medicalNaturalRecovery',state);}catch(error){state.status='review';state.error=error.message;await source.setFlag(MODULE_ID,'medicalNaturalRecovery',state);throw error;}
  });return result;
 };
}
