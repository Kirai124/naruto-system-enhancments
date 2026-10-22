import {genjutsuEffects,genjutsuPayload} from '../effects/genjutsu-effects.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {actualizationPool,genjutsuEnabled,genjutsuLevel,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {appendActualizationSpend} from '../casting/genjutsu-resources.mjs';
import {classifyGenjutsuSave} from '../casting/genjutsu-rules.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {genjutsuSaveReceipts} from './genjutsu-receipts.mjs';

const storage='genjutsuOutcomeRequests';
const read=actor=>structuredClone(actor.getFlag(MODULE_ID,storage)??[]);
function context(game,message,ruleId){
 const actor=message?.getAssociatedActor(),record=message?.getFlag(MODULE_ID,'genjutsuCast'),feature=ownedGenjutsuFeature(actor,ruleId,ruleId==='Actualized Perception'?'Real World Conversions':ruleId==='Critical Confusion'?'Malleable Mirages':ruleId==='Chakra Distortion'?'Sensory Type':'Base');
 if(!genjutsuEnabled(game)||!actor?.isOwner||!record||!feature||message.system.deltas===null)throw Error('Eigener gültiger Genjutsu-Cast und Feature erforderlich.');
 return {actor,record,feature};
}
export async function requestGenjutsuOutcome(game,message,ruleId){
 if(!['Actualized Perception','The Turn','Critical Confusion','Chakra Distortion'].includes(ruleId))throw Error('Unbekannte Genjutsu-Nachwirkung.');
 const {actor,record,feature}=context(game,message,ruleId);
 return withCastingActorLock(actor,async()=>{
  const entries=read(actor);if(entries.some(e=>e.status==='applying'||e.status==='review'))throw Error('Unterbrochene Genjutsu-Nachwirkung zuerst vom GM prüfen lassen.');
  const expected=ruleId==='Actualized Perception'?'failure':ruleId==='Critical Confusion'?'critical-success':'success',candidates=genjutsuSaveReceipts(game,message.id).filter(r=>(ruleId==='Chakra Distortion'?['success','critical-success'].includes(r.outcome)&&genjutsuEffects(game,r.actor).some(e=>genjutsuPayload(e).sensing&&ninjutsuEffect(e).sourceActorUuid===actor.uuid):r.outcome===expected)&&!entries.some(e=>e.ruleId===ruleId&&e.receiptId===r.id&&e.status!=='cancelled'));
  if(!candidates.length)throw Error('Kein sichtbarer passender Save-Beleg. Geheime gegnerische Saves bearbeitet der GM.');
  const content=document.createElement('div'),select=document.createElement('select');select.name='receipt';
  for(const r of candidates){const o=document.createElement('option');o.value=r.id;o.textContent=r.name+' · '+r.total+' gegen '+r.dc;select.append(o);}content.append(select);
  if(ruleId==='Actualized Perception'){
   const count=document.createElement('select');count.name='count';for(let n=1;n<=Math.min(2,actualizationPool(actor)?.remaining??0);n++){const o=document.createElement('option');o.value=String(n);o.textContent=n+' Actualization '+(n===1?'Die':'Dice');count.append(o);}content.append(count);
  }else if(ruleId==='The Turn'&&genjutsuLevel(actor)>=20){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='criticalEffect';label.append(input,document.createTextNode('Das konkrete Jutsu enthält eine Wirkung bei kritischem Fehlschlag'));content.append(label);}
  const hint=document.createElement('p');hint.textContent='Die Nutzung wird nach dieser Bestätigung bezahlt. Der GM wendet die gespeicherte Ergebnisänderung an; ursprüngliche Jutsu-Effekte passend zum neuen Ergebnis anwenden. Nach einem Teilfehler nicht erneut ausführen.';content.append(hint);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:ruleId},content:content.innerHTML,buttons:[{action:'request',label:'Auslöser bestätigen und bezahlen',callback:(_e,b)=>({receiptId:b.form.elements.receipt.value,count:ruleId==='Actualized Perception'?Number(b.form.elements.count.value):0,criticalEffect:!!b.form.elements.criticalEffect?.checked})},{action:'cancel',label:'Abbrechen',callback:()=>null}],rejectClose:false});if(!choice)return;
  const receipt=candidates.find(r=>r.id===choice.receiptId);if(!receipt)throw Error('Save-Beleg nicht mehr verfügbar.');
  const updates={actor:{},item:[]};if(ruleId==='Actualized Perception'){if(!Number.isSafeInteger(choice.count)||choice.count<1||choice.count>2)throw Error('Ein oder zwei Actualization Dice erforderlich.');appendActualizationSpend(actor,choice.count,updates);}else{if(feature.system.uses.value<1)throw Error('Keine Feature-Nutzung verfügbar.');updates.item.push({_id:feature.id,'system.uses.spent':feature.system.uses.spent+1});}
  const entry={id:foundry.utils.randomID(),messageId:message.id,castId:record.id,ruleId,receiptId:receipt.id,targetUuid:receipt.targetUuid,originalTotal:receipt.total,originalOutcome:receipt.outcome,status:'applying',payment:'unpaid',count:choice.count,criticalEffect:choice.criticalEffect,createdAt:game.time.worldTime};if(game.user.isGM){const privateRecord=await ChatMessage.create({content:'<p>Genjutsu · gespeicherter ursprünglicher Rettungswurf</p>',whisper:game.users.filter(u=>u.isGM).map(u=>u.id),flags:{[MODULE_ID]:{genjutsuOutcomeOriginal:{requestId:entry.id,total:entry.originalTotal,outcome:entry.originalOutcome}}}});entry.originalPrivateMessageId=privateRecord.id;delete entry.originalTotal;}entries.push(entry);await actor.setFlag(MODULE_ID,storage,entries);
  try{
   await actor.updateEmbeddedDocuments('Item',updates.item);entry.payment='paid';await actor.setFlag(MODULE_ID,storage,entries);
   if(ruleId==='Actualized Perception'){const roll=await new Roll(choice.count+'d'+record.die).evaluate();entry.adjustment=Math.max(1,Math.ceil(roll.total/2));entry.roll=roll.toJSON();await actor.setFlag(MODULE_ID,storage,entries);await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'Actualized Perception: Save −'+entry.adjustment});}
   entry.status='pending';await actor.setFlag(MODULE_ID,storage,entries);return entry;
  }catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,storage,entries);throw error;}
 });
}

export async function applyGenjutsuOutcome(game,actor,id){
 if(!game.user.isGM||!actor.isOwner||game.users.activeGM&&game.users.activeGM.id!==game.user.id)throw Error('Aktiver GM erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const entries=read(actor),entry=entries.find(e=>e.id===id);if(entry?.status!=='pending'||entry.payment!=='paid')throw Error('Keine offene bezahlte Genjutsu-Nachwirkung.');
  const originalTotal=entry.originalPrivateMessageId?game.messages.get(entry.originalPrivateMessageId)?.getFlag(MODULE_ID,'genjutsuOutcomeOriginal')?.total:entry.originalTotal;if(!Number.isFinite(originalTotal))throw Error('Ursprünglicher privater Save-Beleg fehlt; GM-Prüfung erforderlich.');
  const message=game.messages.get(entry.messageId),{record}=context(game,message,entry.ruleId),target=await fromUuid(entry.targetUuid);
  if(!target?.isOwner)throw Error('Ziel nicht mehr verfügbar.');
  let receipts=structuredClone(target.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]);let receipt=receipts.find(r=>r.id===entry.receiptId);
  if(!receipt||receipt.castId!==record.id||receipt.total!==originalTotal||receipt.outcome!==entry.originalOutcome){entry.status='review';entry.error='Save-Beleg inzwischen verändert.';await actor.setFlag(MODULE_ID,storage,entries);throw Error(entry.error);}
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:entry.ruleId+' anwenden'},content:'<p>Gespeichertes Save-Ergebnis für '+target.name+' ändern und die konkrete Jutsu-Wirkung danach entsprechend anwenden?</p>',rejectClose:false}))return;
  context(game,message,entry.ruleId);
  receipts=structuredClone(target.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]);receipt=receipts.find(r=>r.id===entry.receiptId);if(!receipt||receipt.castId!==record.id||receipt.total!==originalTotal||receipt.outcome!==entry.originalOutcome)throw Error('Save-Beleg während der Bestätigung verändert; erneut öffnen.');
  entry.status='applying';await actor.setFlag(MODULE_ID,storage,entries);
  try{
   if(['Critical Confusion','Chakra Distortion'].includes(entry.ruleId)){if(entry.ruleId==='Chakra Distortion'&&!genjutsuEffects(game,target).some(e=>genjutsuPayload(e).sensing&&ninjutsuEffect(e).sourceActorUuid===actor.uuid))throw Error('Sensing-Erfassung inzwischen beendet.');const before=new Set(receipts.map(r=>r.id)),activity=message.getAssociatedActivity(),rolls=await target.rollSavingThrow({n5eseGenjutsuOutcomeReroll:entry.id,n5eseGenjutsuAdjustedDC:true,...(entry.ruleId==='Chakra Distortion'?{disadvantage:true}:{}),ability:receipt.ability??[...activity.save.ability][0],target:receipt.dc,rolls:[{options:{n5eseGenjutsuNoCriticalSuccess:entry.ruleId==='Critical Confusion'}}]},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});if(!rolls?.length){entry.status='pending';await actor.setFlag(MODULE_ID,storage,entries);return;}receipts=structuredClone(target.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]);const replacement=receipts.findLast(r=>!before.has(r.id)&&r.messageId===message.id&&r.total===rolls[0].total);if(!replacement)throw Error('Neuer Save-Beleg fehlt; keinen weiteren Wurf ausführen.');receipt=receipts.find(r=>r.id===entry.receiptId);receipt.supersededBy=replacement.id;entry.rerollReceiptId=replacement.id;}else if(entry.ruleId==='Actualized Perception'){receipt.total-=entry.adjustment;receipt.outcome=classifyGenjutsuSave(receipt.total,receipt.dc,record.mastery);}else receipt.outcome=genjutsuLevel(actor)>=20&&entry.criticalEffect?'critical-failure':'failure';
   receipt.overrides??=[];receipt.overrides.push({requestId:entry.id,ruleId:entry.ruleId,originalTotal,originalOutcome:entry.originalOutcome});
   await target.setFlag(MODULE_ID,'genjutsuSaveReceipts',receipts);entry.status='applied';await actor.setFlag(MODULE_ID,storage,entries);return entry;
  }catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,storage,entries);throw error;}
 });
}

export async function resolveGenjutsuOutcome(game,actor,id){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');
 return withCastingActorLock(actor,async()=>{const entries=read(actor),entry=entries.find(e=>e.id===id);if(!entry||!['applying','review'].includes(entry.status))throw Error('Keine unterbrochene Anfrage.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Genjutsu-Nachwirkung prüfen'},content:'<p>Save-Ergebnis, Ressourcen und Jutsu-Effekte manuell geprüft/korrigiert? Ohne erneute Ausführung abschließen.</p>',rejectClose:false})){entry.status='resolved';await actor.setFlag(MODULE_ID,storage,entries);}});
}
