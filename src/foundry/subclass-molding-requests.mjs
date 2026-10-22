import {requireUninterrupted} from './jutsu-interruption.mjs';
import {evasionExcludesTarget} from './taijutsu-saves.mjs';
import {medicalSharedSaveTarget} from './medical-shared-saves.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {ownedSubclassMoldings} from '../casting/subclass-moldings.mjs';
const path=`flags.${MODULE_ID}.subclassMoldingRequests`;
/** Persistent target journal: no automatic retry after a potentially partial target mutation. */
export function createSubclassMoldingRequests(game,runtime){
 const storage=runtime.storage??'subclassMoldingRequests',requestPath='flags.'+MODULE_ID+'.'+storage;
 const queues=new WeakMap(),read=actor=>structuredClone(actor.getFlag(MODULE_ID,storage)??[]);
 const lock=(actor,work)=>{const next=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(work);queues.set(actor,next);next.finally(()=>{if(queues.get(actor)===next)queues.delete(actor);}).catch(()=>{});return next;};
 function owner(actor){if(runtime.owner){runtime.owner(actor);return;}if((!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!game.settings.get(MODULE_ID,'subclassMoldingAutomation'))||!actor?.isOwner)throw Error('Molding-Automation oder Quellenberechtigung fehlt.');}
 async function context(actor,messageId,ruleId){
  if(runtime.context)return runtime.context(actor,messageId,ruleId);
  const message=await runtime.message(messageId),record=message?.getFlag(MODULE_ID,'moldingCast');
  if(message?.getAssociatedActor()?.uuid!==actor.uuid||!record?.ids?.includes(ruleId)||record.refunded||record.echo)throw Error('Eigener bezahlter Molding-Cast fehlt oder wurde erstattet.');
  const rule=ownedSubclassMoldings(actor).find(r=>r.id===ruleId);if(!rule)throw Error('Ursprüngliches Molding-Feature nicht mehr vorhanden.');
  return {message,record,rule};
 }
 return Object.freeze({
  list:read,
  request:(actor,messageId,ruleId,targets,options={})=>lock(actor,async()=>{
   owner(actor);const ctx=await context(actor,messageId,ruleId),entries=read(actor);
   const repeatable=['sanguine-master','talent-voider'].includes(ruleId);
   if(entries.some(r=>r.castId===ctx.record.castId&&r.ruleId===ruleId&&r.status!=='cancelled'&&(!repeatable||r.status!=='applied')))throw Error('Diese Molding-Zielwirkung wurde bereits angefragt.');
   if(!Array.isArray(targets)||!targets.length||targets.some(t=>!t.uuid||!t.tokenUuid)||new Set(targets.map(t=>t.uuid)).size!==targets.length)throw Error('Eindeutige betroffene Zieltokens bestätigen.');
   const request={id:runtime.id(),messageId,castId:ctx.record.castId,ruleId,sourceItemUuid:ctx.rule.source,targets:structuredClone(targets),options:structuredClone(options),status:'pending',createdAt:game.time.worldTime,requestedBy:game.user.id,steps:[]};
   entries.push(request);await actor.update({[requestPath]:entries});return request;
  }),
  cancel:(actor,id)=>lock(actor,async()=>{owner(actor);const entries=read(actor),r=entries.find(r=>r.id===id);if(r?.status!=='pending')throw Error('Nur offene Anfragen können verworfen werden.');if(runtime.journalPreparation&&(r.prepared||Object.keys(r.preparation??{}).length)){r.status='review';r.error='Abbruch nach gespeicherten Würfelschritten; keine automatische Wiederholung. GM entscheidet über den Abschluss.';}else r.status='cancelled';await actor.update({[requestPath]:entries});return r;}),
  apply:(actor,id)=>lock(actor,async()=>{
   owner(actor);if(!game.user.isGM&&!runtime.allowOwnerApply||game.user.isGM&&game.users?.activeGM&&game.users.activeGM.id!==game.user.id)throw Error('Zielwirkungen werden vom aktiven GM angewendet.');
   const entries=read(actor),request=entries.find(r=>r.id===id);if(request?.status!=='pending')throw Error('Anfrage bereits bearbeitet oder zur Prüfung gesperrt.');
   const ctx=await context(actor,request.messageId,request.ruleId),targets=[];requireUninterrupted(game,ctx.message);
   for(const ref of request.targets){const token=await runtime.resolve(ref.tokenUuid);if(!token?.actor?.isOwner||token.actor.uuid!==ref.uuid)throw Error('Zieltoken fehlt oder wurde neu zugeordnet.');targets.push(token.actor);}
   if(!game.user.isGM&&!runtime.allowOwnerApply(ctx,targets))throw Error('Diese Zielwirkung benötigt den GM.');
   let prepared=request.prepared;if(!prepared&&runtime.journalPreparation){request.status='preparing';await actor.update({[requestPath]:entries});try{prepared=await runtime.prepare(ctx,request,targets,()=>actor.update({[requestPath]:entries}));request.status='pending';if(prepared)request.prepared=prepared;await actor.update({[requestPath]:entries});}catch(error){request.status='review';request.error=String(error.message);await actor.update({[requestPath]:entries});throw error;}}else if(!prepared)prepared=await runtime.prepare(ctx,request,targets);if(!prepared)return null;
   // Keep rolled results while pending: declining final application must not reroll saves or bonus dice.
   if(!request.prepared){request.prepared=prepared;await actor.update({[requestPath]:entries});}
   if(!await runtime.confirm(ctx,request,prepared))return null;
   // Re-read the source after all dialogs; a refund must not apply new target effects.
   await context(actor,request.messageId,request.ruleId);requireUninterrupted(game,ctx.message);
   request.prepared=prepared;request.status='applying';await actor.update({[requestPath]:entries});
   try{
    for(let i=0;i<targets.length;i++){
     const shared=!runtime.independentTargetSave&&medicalSharedSaveTarget(game,targets[i],ctx.message);const receipt=!runtime.independentTargetSave&&evasionExcludesTarget(game,targets[i],ctx.message)?{skippedEvasion:true}:shared&&!shared.applies?{skippedSharedSave:true,recipientUuid:shared.recipientUuid}:await runtime.apply(targets[i],prepared[i],ctx,request,()=>actor.update({[requestPath]:entries}));
     request.steps.push({target:targets[i].uuid,receipt});await actor.update({[requestPath]:entries});
    }
    if(runtime.finalize)await runtime.finalize(ctx,request,prepared,targets);
    request.status='applied';request.appliedAt=game.time.worldTime;await actor.update({[requestPath]:entries});return request;
   }catch(error){request.status='review';request.error=String(error.message);await actor.update({[requestPath]:entries});throw Error(`Molding zur GM-Prüfung gesperrt: ${error.message}`);}
  }),
  resolve:(actor,id)=>lock(actor,async()=>{owner(actor);if(!game.user.isGM)throw Error('GM-Prüfung erforderlich.');const entries=read(actor),r=entries.find(r=>r.id===id);if(!['review','applying','preparing'].includes(r?.status))throw Error('Keine unterbrochene Anfrage.');r.status='resolved';r.resolvedBy=game.user.id;await actor.update({[requestPath]:entries});return r;})
 });
}
