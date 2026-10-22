import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {activeMoldingEffect,moldingMarker} from '../effects/molding-effects.mjs';
import {vortexCondition} from '../casting/subclass-molding-effects.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export function moldingRestriction(activity,effects){
 const components=new Set(activity.item?.system.jutsu?.components??[]),type=activity.item?.system.jutsu?.type;
 if(activity.item?.type!=='spell')return null;
 for(const effect of effects){
  const id=moldingMarker(effect)?.metadata?.id;
  if(id==='no-chakra-molding'&&components.has('cm')&&!(taijutsuEnabled(game)&&taijutsuFeature(activity.actor,'Mystic Awakening','Ultimate Battle')))return 'Chakra Molding (CM) ist durch einen verwalteten Molding-Effekt gesperrt.';
  if(id==='no-mobile-tai-buki'&&['taijutsu','bukijutsu'].includes(type)&&components.has('m'))return 'Taijutsu/Bukijutsu mit Mobility-Komponente (M) ist durch Tsunami gesperrt.';
 }
 return null;
}
export function installMoldingRestrictions(game){
 Hooks.on('dnd5e.preUseActivity',activity=>{
  const effects=activity.actor?.effects?.filter(e=>activeMoldingEffect(game,e))??[],reason=moldingRestriction(activity,effects);
  if(reason){ui.notifications.warn(reason);return false;}
 });
}
/** A failed subsequent save is explicitly confirmed; no chat-text inference. */
export async function triggerRainingVortex(game,target,effect){
 return withCastingActorLock(target,async()=>{
  const marker=moldingMarker(effect);
  if(!target.isOwner||!activeMoldingEffect(game,effect)||marker?.metadata?.id!=='raining-vortex')throw Error('Aktiver eigener Raining-Vortex-Zieleffekt fehlt.');
  if(['applying','review'].includes(marker.metadata.application))throw Error('Die vorige Raining-Vortex-Anwendung benötigt eine GM-Prüfung.');
  const combat=game.combat,key=combat?.started&&marker.lifetime?.deadline?.combatId===combat.id?`${combat.id}:${combat.round}`:null;
  if(key&&marker.metadata.usedRound===key)throw Error('Raining Vortex wurde in dieser Runde bereits für dieses Ziel ausgelöst.');
  const keywords=['earth','wind','fire','water','lightning'];
  const nature=await foundry.applications.api.DialogV2.wait({window:{title:'Raining Vortex auslösen'},content:'<p>Bestätige: Diese Kreatur hat einen Rettungswurf gegen ein nachfolgendes Nature-Release-Jutsu nicht bestanden. Außerhalb des Kampfes gilt die Rundenbegrenzung manuell.</p><label>Nature Release <select name="nature">'+keywords.map(k=>`<option value="${k}">${k}</option>`).join('')+'</select></label>',buttons:[{action:'confirm',label:'Fehlgeschlagenen Save bestätigen',callback:(_e,b)=>b.form.elements.nature.value}],rejectClose:false});
  if(!nature)return null;
  if(!activeMoldingEffect(game,effect))throw Error('Raining Vortex ist während der Auswahl abgelaufen.');
  const state={...marker,metadata:{...marker.metadata,usedRound:key,application:'applying'}};
  await effect.setFlag(MODULE_ID,'moldingEffect',state);
  try{
   const condition=vortexCondition(nature);await target.applyCondition(condition.id,{delta:condition.delta,origin:marker.sourceItemUuid});
   await effect.setFlag(MODULE_ID,'moldingEffect',{...state,metadata:{...state.metadata,application:'applied'}});
  }catch(error){await effect.setFlag(MODULE_ID,'moldingEffect',{...state,metadata:{...state.metadata,application:'review'}});throw error;}
 });
}
