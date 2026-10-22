import {activeNinjutsuEffect,ninjutsuEffect} from './ninjutsu-effects.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {moldingLifetimeExpired} from '../casting/molding-lifetimes.mjs';
import {refreshActorPreparation} from '../foundry/actor-preparation.mjs';
const installed=new WeakSet();
export const moldingMarker=effect=>effect.flags?.[MODULE_ID]?.moldingEffect;
export function activeMoldingEffect(game,effect){const m=moldingMarker(effect);if(m?.metadata?.adaptive&&effect.parent?.effects?.some(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata?.adaptive?.includes(m.metadata.adaptive)))return false;return !!m&&m.schemaVersion===1&&!effect.disabled&&game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&!moldingLifetimeExpired(m.lifetime,{combat:game.combat,worldTime:game.time.worldTime});}
/** Actual values/statuses exist only in prepared memory: disabling the module leaves neutral source data. */
export function moldingEffectData({name,sourceActorUuid,sourceItemUuid,transactionId,lifetime,changes=[],condition,metadata={}}){
 return {name:`${name} · N5ESE`,type:'base',transfer:false,origin:sourceItemUuid,statuses:[],system:{changes:changes.map(c=>({...c,value:'0'}))},flags:{[MODULE_ID]:{moldingEffect:{schemaVersion:1,sourceActorUuid,sourceItemUuid,transactionId,lifetime,changes,condition,metadata}}}};
}
export function installMoldingEffects(game,EffectClass){
 if(!EffectClass||installed.has(EffectClass))return;installed.add(EffectClass);
 const apply=EffectClass.applyChange;
 EffectClass.applyChange=function(model,change,options){
  const marker=moldingMarker(change.effect);if(marker){
   if(!activeMoldingEffect(game,change.effect)||change.effect.parent!==model)return {};
   const actual=marker.changes?.find(c=>c.key===change.key&&c.type===change.type);if(!actual)return {};
   return apply.call(this,model,{...change,value:String(actual.value)},options);
  }
  return apply.call(this,model,change,options);
 };
 const base=EffectClass.prototype.prepareBaseData;
 if(typeof base==='function')EffectClass.prototype.prepareBaseData=function(...args){
  if(moldingMarker(this)){this.statuses=new Set(this._source.statuses??[]);this.flags={...this._source.flags};}
  const result=base.apply(this,args),m=moldingMarker(this);
  if(m?.condition&&activeMoldingEffect(game,this)){
   this.statuses=new Set([...this.statuses,m.condition.id]);
   this.flags={...this.flags,n5eb:{...this.flags.n5eb,condition:{id:m.condition.id,rank:m.condition.rank??1}}};
  }
  return result;
 };
}
export function refreshMoldingEffects(game){
 const actors=[...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(a=>a.actor??a).filter((a,i,list)=>list.indexOf(a)===i&&[...(a.effects??[])].some(e=>moldingMarker(e)));
 for(const actor of actors){
  refreshActorPreparation(actor);actor.sheet?.render(false);
  if(actor.isOwner&&(!game.users?.activeGM||game.users.activeGM.id===game.user.id)){
   const expired=actor.effects.filter(e=>moldingMarker(e)&&moldingLifetimeExpired(moldingMarker(e).lifetime,{combat:game.combat,worldTime:game.time.worldTime}));
   if(expired.length)actor.deleteEmbeddedDocuments('ActiveEffect',expired.map(e=>e.id)).catch(error=>console.error(`[${MODULE_ID}] Molding expiration`,error));
  }
 }
}
