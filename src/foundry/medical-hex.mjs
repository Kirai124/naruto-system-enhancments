import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature} from '../casting/medical-context.mjs';
import {ninjutsuEffect,activeNinjutsuEffect,ninjutsuEffectData,upsertNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export const medicalWorldActors=game=>[...new Set([...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(x=>x.actor??x))];
export function hexCasterIncapacitated(actor){return !actor||actor.system.attributes.hp.value<=0||[...(CONFIG.DND5E.conditionEffects.incapacitated??[]),'dead','unconscious','incapacitated'].some(id=>actor.statuses.has(id));}
export function medicalHexActive(game,effect){
 const marker=ninjutsuEffect(effect);if(!marker?.metadata?.genjutsu?.hex)return true;
 const source=fromUuidSync(marker.sourceActorUuid);
 return !!medicalFeature(source,"Shaman's Hex",'Shaman')&&!hexCasterIncapacitated(source)&&!(source.getFlag(MODULE_ID,'medicalEndedHexes')??[]).includes(marker.id);
}
export const activeMedicalHexes=(game,source)=>medicalWorldActors(game).flatMap(actor=>actor.effects.filter(e=>ninjutsuEffect(e)?.metadata?.genjutsu?.hex&&ninjutsuEffect(e).sourceActorUuid===source.uuid&&activeNinjutsuEffect(game,e)&&medicalHexActive(game,e)));
export function validateHexTransition(game,source,entry){
 if(hexCasterIncapacitated(source))throw Error('Shaman ist nicht handlungsfähig.');
 const active=activeMedicalHexes(game,source);
 if(entry.hexTransfer){
  const old=fromUuidSync(entry.hexTransfer.effectUuid);
  if(active.length!==1||active[0]!==old||JSON.stringify(ninjutsuEffect(old).lifetime)!==JSON.stringify(entry.hexTransfer.lifetime))throw Error('Bisherige Hex oder Restdauer verändert; Anfrage vom GM prüfen lassen.');
  return old;
 }
 if(active.length)throw Error('Inzwischen ist bereits eine Hex aktiv.');
 return null;
}
export async function applyMedicalHex(game,source,target,entry,feature){
 return withCastingActorLock(source,async()=>{
  const old=validateHexTransition(game,source,entry);if(old&&!old.parent.isOwner)throw Error('Vorherige Hex muss der GM übertragen.');
  const lifetime=entry.hexTransfer?.lifetime??{expiresAt:entry.at+60};
  if(lifetime.expiresAt<=game.time.worldTime)throw Error('Die ursprüngliche Hex-Minute ist abgelaufen.');
  // One application journal surrounds both mutations. A partial transfer is never replayed automatically.
  if(old)await old.delete();
  const effect=await upsertNinjutsuEffect(target,ninjutsuEffectData({name:"Shaman's Hex",id:entry.id,sourceActorUuid:source.uuid,sourceItemUuid:feature.uuid,lifetime,setting:'medicalClassAutomation',metadata:{genjutsu:{medical:true,ruleId:'medical.shaman-hex',hex:true,conditions:[]}}}));
  return {effectId:effect.id,transferred:!!old,expiresAt:lifetime.expiresAt};
 });
}
export function installMedicalHexLifecycle(game){
 const close=async actor=>{
  if(!medicalEnabled(game)||!actor?.isOwner||!hexCasterIncapacitated(actor))return;
  const ids=medicalWorldActors(game).flatMap(a=>a.effects.filter(e=>ninjutsuEffect(e)?.metadata?.genjutsu?.hex&&ninjutsuEffect(e).sourceActorUuid===actor.uuid).map(e=>ninjutsuEffect(e).id));
  const before=actor.getFlag(MODULE_ID,'medicalEndedHexes')??[],next=[...new Set([...before,...ids])];if(next.length!==before.length)await actor.setFlag(MODULE_ID,'medicalEndedHexes',next);
 };
 Hooks.on('updateActor',(actor,change,_options,userId)=>{if(userId===game.user.id&&(change.system||Object.keys(change).some(k=>k.startsWith('system.'))))close(actor).catch(console.error);});
 for(const actor of medicalWorldActors(game))close(actor).catch(console.error);
 for(const hook of ['createActiveEffect','updateActiveEffect','deleteActiveEffect'])Hooks.on(hook,(effect,...args)=>{if(args.at(-1)===game.user.id&&effect.parent?.documentName==='Actor')close(effect.parent).catch(console.error);});
}
