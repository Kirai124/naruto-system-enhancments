import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {activeFeatureAction,featureActions} from './taijutsu-feature-actions.mjs';
import {withCastingActorLock,castingActorBusy} from './mode-adapter.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
const blocked=actor=>actor.statuses.has('stunned')||actor.statuses.has('incapacitated')||[...(CONFIG.DND5E.conditionEffects.incapacitated??[])].some(id=>actor.statuses.has(id));
export async function shortCircuitCatalyst(game,actor,manual=false){
 if(!taijutsuEnabled(game)||!actor?.isOwner||taijutsuFeature(actor,'Unbreakable Catalyst','Ruin')||!activeFeatureAction(game,actor,'ruin-overdrive')||!manual&&!blocked(actor))return;
 if(manual&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Catalyst · tatsächlichen Kurzschluss bestätigen'},content:'<p>Tatsächlich während Overdrive Incapacitated/Stunned geworden? Nur für einen nicht strukturiert gespeicherten Zustand bestätigen. Overdrive endet; für 10 Minuten Weltzeit gesperrt.</p>',rejectClose:false}))return;
 return withCastingActorLock(actor,async()=>{const current=activeFeatureAction(game,actor,'ruin-overdrive');if(!current||taijutsuFeature(actor,'Unbreakable Catalyst','Ruin'))return;
  const all=featureActions(actor);for(const entry of all)if(entry.id===current.id||entry.ruleId==='ruin-extra'&&entry.data.overdrive===current.id){entry.status='ended';entry.reason='catalyst-short-circuit';}
  await actor.update({['flags.'+MODULE_ID+'.taijutsuFeatureActions']:all,['flags.'+MODULE_ID+'.taijutsuCatalystBlockedUntil']:game.time.worldTime+600});
  const ids=actor.effects.filter(e=>all.some(a=>a.status==='ended'&&a.reason==='catalyst-short-circuit'&&a.id===ninjutsuEffect(e)?.metadata?.taijutsuActionId)).map(e=>e.id);if(ids.length)await actor.deleteEmbeddedDocuments('ActiveEffect',ids);actor.reset();
 });
}
export function installCatalystShortCircuit(game){
 const pending=new WeakSet(),deferred=new WeakSet();const check=(actor,userId)=>{if(userId!==game.user.id||!actor?.isOwner||pending.has(actor)||!blocked(actor)||!activeFeatureAction(game,actor,'ruin-overdrive')||taijutsuFeature(actor,'Unbreakable Catalyst','Ruin'))return;if(castingActorBusy(actor)){deferred.add(actor);return;}pending.add(actor);Promise.resolve().then(()=>shortCircuitCatalyst(game,actor)).catch(error=>ui.notifications.warn(error.message)).finally(()=>pending.delete(actor));};
 Hooks.on('n5ese.castingActorUnlocked',actor=>{if(deferred.has(actor)){deferred.delete(actor);setTimeout(()=>check(actor,game.user.id),0);}});
 Hooks.on('updateActor',(actor,_data,_options,userId)=>check(actor,userId));
 for(const hook of ['createActiveEffect','updateActiveEffect','deleteActiveEffect'])Hooks.on(hook,(effect,...args)=>{if(effect.parent?.documentName==='Actor')check(effect.parent,args.at(-1));});
}
