import {MODULE_ID} from '../settings/register.mjs';
export const stateFor=(actor,itemId)=>actor.flags?.[MODULE_ID]?.dojutsu?.instances?.[itemId];
export const markerFor=effect=>effect.flags?.[MODULE_ID]?.dojutsu;
export const managedEffects=(actor,itemId)=>[...(actor.effects??[])].filter(effect=>{
 const m=markerFor(effect);return m?.schemaVersion===1 && m.sourceActor===actor.uuid && m.sourceItem===m.instanceId
  && effect.origin===`${actor.uuid}.Item.${m.instanceId}` && (!itemId || m.instanceId===itemId);
});
/** Persistent changes are harmless placeholders: module disable cannot leave a sight bonus behind. */
export function effectData(actor,item,definition,transactionId) {
 return {name:`${definition.label} · N5ESE`,img:item.img,origin:item.uuid,type:'base',transfer:false,disabled:false,
  duration:{value:null,units:'seconds',expiry:null},
  system:{changes:[{key:'system.attributes.senses.ranges.chakrasight',type:'add',value:'0',priority:20},
   {key:'system.skills.prc.passive',type:'add',value:'0',priority:20,phase:'final'}]},
  flags:{[MODULE_ID]:{dojutsu:{schemaVersion:1,sourceActor:actor.uuid,sourceItem:item.id,instanceId:item.id,definitionId:definition.id,transactionId}}}};
}

const installed=new WeakSet();
/** Version-guarded extension of Foundry 14's public effect change pipeline. */
export function installDojutsuEffects(game,EffectClass,manager) {
 if(installed.has(EffectClass))return;
 const original=EffectClass.applyChange;
 if(typeof original!=='function')throw Error('Unsupported Active Effect change pipeline');
 EffectClass.applyChange=function(model,change,options){
  const marker=markerFor(change.effect);
  if(marker?.schemaVersion===1){
   const actor=change.effect.parent;
   if(marker.sourceActor!==actor?.uuid || model!==actor)return {};
   const passive=change.key==='system.skills.prc.passive';
   if(!passive && change.key!=='system.attributes.senses.ranges.chakrasight')return {};
   const value=passive?manager.effectPassiveBonus(actor,change.effect):manager.effectSight(actor,change.effect);
   if(value===null)return {};
   return original.call(this,model,{...change,type:passive?'add':'upgrade',value:String(value)},options);
  }
  return original.call(this,model,change,options);
 };
 installed.add(EffectClass);
}


