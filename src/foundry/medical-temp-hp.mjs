import {assistedCopingChoice,assistedCopingUpdates} from './medical-assisted-coping.mjs';
import {rememberMedicalGrant} from './medical-constructive.mjs';
import {MODULE_ID} from '../settings/register.mjs';
const KEY='medicalTemporaryHP',PATH='flags.'+MODULE_ID+'.'+KEY,HP='system.attributes.hp.temp';
const queues=new WeakMap();
const serialize=(actor,work)=>{const next=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(work);queues.set(actor,next);next.finally(()=>{if(queues.get(actor)===next)queues.delete(actor);}).catch(()=>{});return next;};
const read=actor=>structuredClone(actor.getFlag(MODULE_ID,KEY)??[]);
/** Attribute only our own grants. Ordinary temporary HP still use the native higher-value rule. */
export async function grantMedicalTempHP(target,{sourceActorUuid,rule,amount,mode='normal',lifetime,itemUuid,medicalFeatures=true}){
 return serialize(target,async()=>{
 amount=Math.max(0,Math.floor(amount));if(!amount)return null;
 const before=Number(target.system.attributes.hp.temp??0),entries=read(target),same=entries.filter(e=>e.sourceActorUuid===sourceActorUuid),sameTotal=same.reduce((n,e)=>n+e.remaining,0);
 if(medicalFeatures&&mode==='normal'&&await assistedCopingChoice(game,target,fromUuidSync(sourceActorUuid),itemUuid&&fromUuidSync(itemUuid),rule)){const result=assistedCopingUpdates(target,{sourceActorUuid,itemUuid,amount,rule});await target.update(result.updates,{n5eseTemporaryHPKeepOthers:true});await rememberMedicalGrant(target,{sourceActorUuid,itemUuid,temp:amount,tempGrantId:result.id});return result.id;}
 let next=amount,retained=[];
 if(mode==='same-source'){
  const nin=target.getFlag(MODULE_ID,'ninjutsuTemporaryHP')??{},ownNin=target.uuid===sourceActorUuid&&(nin.gems>0||nin.tenacity>0);
  const ownGen=(target.getFlag(MODULE_ID,'genjutsuTemporaryHP')??[]).some(g=>g.remaining>0&&target.effects.some(e=>{const m=e.getFlag(MODULE_ID,'ninjutsuEffect');return m?.sourceActorUuid===sourceActorUuid&&(e.id===g.id||m.metadata?.genjutsu?.tempGrantId===g.id);}));
  let own=sameTotal>0||ownNin||ownGen;
  if(!own&&before>0)own=await foundry.applications.api.DialogV2.confirm({window:{title:'Over Heal · tatsächliche eigene HP-Quelle'},content:'<p>Stammt mindestens ein noch vorhandener Anteil der temporären HP tatsächlich von diesem Wirker? Nur dann darf Over Heal dazu addiert werden. Andere ausdrücklich addierte Quellen bleiben erhalten.</p>',rejectClose:false});
  if(own)mode='add';
 }
 if(mode==='add'){next=before+amount;retained=entries;}
 if(next<before)return null;
 const entry={id:foundry.utils.randomID(),sourceActorUuid,itemUuid,rule,remaining:amount,at:globalThis.game?.time.worldTime,lifetime};
 const updates={[HP]:next,[PATH]:[...retained,entry]};
 // An expressly additive grant must not erase attribution of unrelated tracked HP.
 if(mode==='add')for(const key of ['genjutsuTemporaryHP','ninjutsuTemporaryHP']){const state=target.getFlag(MODULE_ID,key);if(state!==undefined)updates['flags.'+MODULE_ID+'.'+key]=structuredClone(state);}
 await target.update(updates,{n5eseTemporaryHPKeepOthers:mode==='add'});if(medicalFeatures)await rememberMedicalGrant(target,{sourceActorUuid,itemUuid,temp:amount,tempGrantId:entry.id});return entry.id;
 });
}
export async function expireMedicalTempHP(target,id){return serialize(target,async()=>{const entries=read(target),entry=entries.find(e=>e.id===id);if(!entry)return;await target.update({[HP]:Math.max(0,(target.system.attributes.hp.temp??0)-entry.remaining),[PATH]:entries.filter(e=>e.id!==id)},{n5eseTemporaryHPKeepOthers:true});});}
export function hasMedicalTempHP(target,rule){return read(target).some(e=>e.rule===rule&&e.remaining>0);}
export function installMedicalTempHP(game){
 Hooks.on('deleteActiveEffect',async(effect,_options,userId)=>{const id=effect.flags?.[MODULE_ID]?.ninjutsuEffect?.metadata?.genjutsu?.medicalTempGrantId;if(id&&effect.parent?.isOwner&&userId===game.user.id)await expireMedicalTempHP(effect.parent,id);});
 Hooks.on('preUpdateActor',(actor,update)=>{
  const next=update[HP]??update.system?.attributes?.hp?.temp;if(next===undefined||update[PATH]!==undefined||update.flags?.[MODULE_ID]?.[KEY]!==undefined)return;
  const all=read(actor);if(!all.length)return;const before=Number(actor.system.attributes.hp.temp??0);
  if(next>before){update[PATH]=[];return;}
  let loss=before-next;for(const entry of all){const take=Math.min(entry.remaining,loss);entry.remaining-=take;loss-=take;}update[PATH]=all.filter(e=>e.remaining>0);
  if(next===0){const state=actor.getFlag(MODULE_ID,'medicalRecipientUses');if(state?.assistedCoping)update['flags.'+MODULE_ID+'.medicalRecipientUses']={...state,assistedCoping:false};}
 });
}
