import {MODULE_ID} from '../settings/register.mjs';
import {DojutsuRegistry,registerBuiltinDojutsu,activationPlan,liveState,eyeAssignments} from './registry.mjs';
import {stateFor,markerFor,managedEffects,effectData} from '../effects/dojutsu-effects.mjs';
import {tomoeFor} from './tomoe.mjs';
const clone=value=>value?JSON.parse(JSON.stringify(value)):value;
const statePath=itemId=>`flags.${MODULE_ID}.dojutsu.instances.${itemId}`;
const nowFor=game=>Math.floor(game.time.worldTime);
const levelFor=actor=>Number(actor.system.details?.level??0);

export function createDojutsuManager(game) {
 const registry=new DojutsuRegistry();registerBuiltinDojutsu(registry);
 const queues=new WeakMap();
 const enabled=()=>game.settings.get(MODULE_ID,'dojutsuControls');
 const serialize=(actor,operation)=>{
  const result=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(operation);
  queues.set(actor,result);result.finally(()=>{if(queues.get(actor)===result)queues.delete(actor)}).catch(()=>{});return result;
 };
 const requireOwner=actor=>{if(!actor?.isOwner||actor.type!=='character')throw Error('N5ESE.Dojutsu.NotOwner');};
 const resolve=(actor,itemId)=>{
  const item=actor.items.get(itemId),definition=registry.forItem(item);
  if(!definition)throw Error('N5ESE.Dojutsu.Unavailable');
  if(levelFor(actor)<definition.minimumLevel)throw Error('N5ESE.Dojutsu.Level');
  return {item,definition};
 };
 const inCombat=actor=>!!(game.combat?.started && [...game.combat.combatants].some(c=>c.actor?.uuid===actor.uuid));
 const foreignEffect=(actor,item)=>[...(actor.allApplicableEffects?.()??actor.effects??[])].some(e=>!markerFor(e)
  && e.active && [item.uuid,registry.forItem(item)?.source].includes(e.origin));
 const ensureEffect=async(actor,item,definition,state)=>{
  const effects=managedEffects(actor,item.id),valid=effects.filter(e=>markerFor(e).transactionId===state.transactionId);
  if(valid[0]?.update && !valid[0].system?.changes?.some(c=>c.key==='system.skills.prc.passive'))
   await valid[0].update({'system.changes':effectData(actor,item,definition,state.transactionId).system.changes});
  if(!valid.length)await actor.createEmbeddedDocuments('ActiveEffect',[effectData(actor,item,definition,state.transactionId)]);
  const keep=valid[0]?.id;
  const remove=effects.filter(e=>e.id!==keep).map(e=>e.id);
  if(remove.length)await actor.deleteEmbeddedDocuments('ActiveEffect',remove);
 };
 const manager={
  registry,
  list(actor){
   if(actor?.type!=='character')return [];
   return [...actor.items].flatMap(item=>{
    const definition=registry.forItem(item);if(!definition)return [];
    const state=stateFor(actor,item.id),active=liveState(state,definition,nowFor(game),levelFor(actor));
    const validWindow=state?.paid && state.definitionId===definition.id && state.expiresAt>nowFor(game);
    return [{instanceId:item.id,sourceItem:item.uuid,definitionId:definition.id,label:definition.label,
      image:item.img,durationSeconds:definition.durationSeconds,tomoe:tomoeFor(actor,item,definition),
      active:!!active,eye:eyeAssignments.includes(state?.eye)?state.eye:'unassigned',
      remainingSeconds:validWindow?state.expiresAt-nowFor(game):0,
      nextCost:active || (validWindow&&definition.freeReactivation)?0:definition.activationCost,
      eligible:levelFor(actor)>=definition.minimumLevel,externalActive:foreignEffect(actor,item),minimumLevel:definition.minimumLevel}];
   });
  },
  effectSight(actor,effect){
   if(!enabled())return null;
   const marker=markerFor(effect),item=actor.items.get(marker?.instanceId),definition=registry.forItem(item),state=stateFor(actor,item?.id);
   if(marker?.sourceActor!==actor.uuid || marker.sourceItem!==item?.id || effect.origin!==item?.uuid
     || marker.definitionId!==definition?.id || marker.transactionId!==state?.transactionId
     || !definition || !liveState(state,definition,nowFor(game),levelFor(actor)))return null;
   const feet=inCombat(actor)?definition.sight.inCombat:definition.sight.outOfCombat;
   const units=actor.system.attributes.senses?.units??'ft',conversion=globalThis.CONFIG?.DND5E?.movementUnits?.[units]?.conversion??(units==='ft'?1:NaN);
   return Number.isFinite(conversion)&&conversion>0?Math.floor(feet/conversion):null;
  },
  effectPassiveBonus(actor,effect){
   if(manager.effectSight(actor,effect)===null)return null;
   const eligible=manager.list(actor).filter(i=>i.active&&i.tomoe?.effective===3&&!i.externalActive).sort((a,b)=>a.instanceId.localeCompare(b.instanceId));
   return eligible[0]?.instanceId===markerFor(effect)?.instanceId?5:null;
  },
  setTomoeUnlock(actor,itemId,maxTomoe){return serialize(actor,async()=>{
   requireOwner(actor);if(!game.user?.isGM)throw Error('N5ESE.Dojutsu.GMOnly');
   const {item,definition}=resolve(actor,itemId);
   if(!tomoeFor(actor,item,definition)||!Number.isInteger(maxTomoe)||maxTomoe<1||maxTomoe>3)throw Error('Invalid Tomoe unlock');
   await actor.update({[`flags.${MODULE_ID}.dojutsu.unlocks.${itemId}`]:{maxTomoe}});
   const state=stateFor(actor,itemId);if(state?.active)await ensureEffect(actor,item,definition,state);
   actor.prepareData?.();return tomoeFor(actor,item,definition);
  });},
  activate(actor,itemId){return serialize(actor,async()=>{
   requireOwner(actor);if(!enabled())throw Error('N5ESE.Dojutsu.Disabled');
   const {item,definition}=resolve(actor,itemId);
   if(foreignEffect(actor,item))throw Error('N5ESE.Dojutsu.External');
   const previous=clone(stateFor(actor,itemId)),plan=activationPlan(definition,previous,nowFor(game),previous?.eye??'unassigned');
   if(plan.alreadyActive){await ensureEffect(actor,item,definition,previous);return {active:true,cost:0,alreadyActive:true};}
   if(typeof actor.getChakraAvailable!=='function'||actor.getChakraAvailable()<plan.cost)throw Error('N5ESE.Dojutsu.Insufficient');
   const before={temp:actor.system.attributes.chakra.temp,value:actor.system.attributes.chakra.value};
   const spend=actor.getChakraSpendUpdates(plan.cost),transactionId=foundry.utils.randomID(),state={...plan.state,transactionId};
   const after={temp:spend['system.attributes.chakra.temp']??before.temp,value:spend['system.attributes.chakra.value']??before.value};
   await actor.update({...spend,[statePath(itemId)]:state});
   try{await ensureEffect(actor,item,definition,state);}
   catch(error){
    // Compensate only when the exact resource values and transaction still match.
    const current=stateFor(actor,itemId),chakra=actor.system.attributes.chakra;
    if(current?.transactionId===transactionId && chakra.temp===after.temp && chakra.value===after.value){
     const restore=previous?{[statePath(itemId)]:previous}:{[`flags.${MODULE_ID}.dojutsu.instances.-=${itemId}`]:null};
     try{await actor.update({'system.attributes.chakra.temp':before.temp,'system.attributes.chakra.value':before.value,...restore});}
     catch(rollback){console.error(`[${MODULE_ID}] Dojutsu compensation failed`,rollback);}
    }
    throw error;
   }
   return {active:true,cost:plan.cost,expiresAt:state.expiresAt};
  });},
  deactivate(actor,itemId){return serialize(actor,async()=>{
   requireOwner(actor);
   const previous=stateFor(actor,itemId);
   if(previous?.active)await actor.update({[statePath(itemId)]:{...clone(previous),active:false}});
   const effects=managedEffects(actor,itemId);if(effects.length)await actor.deleteEmbeddedDocuments('ActiveEffect',effects.map(e=>e.id));
   return {active:false};
  });},
  assignEye(actor,itemId,eye){return serialize(actor,async()=>{
   requireOwner(actor);if(!enabled())throw Error('N5ESE.Dojutsu.Disabled');
   if(!eyeAssignments.includes(eye))throw Error('Invalid eye assignment');
   const {definition}=resolve(actor,itemId),previous=stateFor(actor,itemId);
   await actor.update({[statePath(itemId)]:{schemaVersion:1,definitionId:definition.id,active:false,...clone(previous),eye}});
   return {eye};
  });},
  reconcile(actor){return serialize(actor,async()=>{
   requireOwner(actor);
   const states=actor.flags?.[MODULE_ID]?.dojutsu?.instances??{};
   for(const [itemId,state] of Object.entries(states)){
    const item=actor.items.get(itemId),definition=registry.forItem(item);
    if(enabled() && definition && liveState(state,definition,nowFor(game),levelFor(actor)) && !foreignEffect(actor,item)){
     await ensureEffect(actor,item,definition,state);continue;
    }
    const expired=!definition||!liveState(state,definition,nowFor(game),levelFor(actor));
    if(expired && state?.active)await actor.update({[statePath(itemId)]:{...clone(state),active:false}});
    const effects=managedEffects(actor,itemId);if(effects.length)await actor.deleteEmbeddedDocuments('ActiveEffect',effects.map(e=>e.id));
   }
   const orphans=managedEffects(actor).filter(e=>!states[markerFor(e).instanceId]);
   if(orphans.length)await actor.deleteEmbeddedDocuments('ActiveEffect',orphans.map(e=>e.id));
  });}
 };
 return Object.freeze(manager);
}

