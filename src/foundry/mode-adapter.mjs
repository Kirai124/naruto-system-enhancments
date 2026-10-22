import {MODULE_ID} from "../settings/register.mjs";
import {availableCastingModes,modeUpkeep} from "../casting/casting-modes.mjs";
import {nativeMaintainCost} from "./maintain-adapter.mjs";
import {recoveryFeature,spendRecovery} from '../casting/ninjutsu-resources.mjs';
const active=new WeakMap(),wrapped=new WeakSet();
export const castingActorBusy=actor=>active.has(actor);
export async function withCastingActorLock(actor,operation){
  if(active.has(actor))throw Error('Ein anderer Casting- oder Molding-Vorgang ist noch offen.');
  const transaction={itemId:null};active.set(actor,transaction);
  try{return await operation();}finally{if(active.get(actor)===transaction){active.delete(actor);globalThis.Hooks?.callAll('n5ese.castingActorUnlocked',actor);}}
}

export function bindCastingUsage(activity,config){const transaction=active.get(activity.actor);if(transaction && transaction.itemId===activity.item.id)transaction.config=config;}
export function activeCastingMode(item){const transaction=active.get(item?.actor);return item&&transaction?.itemId===item.id&&transaction.mode?{...transaction.mode}:null;}
export function castingUsage(item){const transaction=active.get(item.actor);return transaction && transaction.itemId===item.id?transaction.config:null;}
export function mergeCastingMode(activity,patch){const transaction=active.get(activity.actor);if(!transaction||transaction.itemId!==activity.item.id)throw Error('Kein aktiver Castingvorgang.');transaction.mode={...transaction.mode,...patch};return transaction.mode;}

export function attachCastingMode(effect) {
  const transaction=active.get(effect.parent);
  if(!transaction?.mode || effect.flags?.n5eb?.item?.id!==transaction.itemId || !effect.flags?.n5eb?.concentration) return;
  const data=effect.flags.n5eb.concentration,item=transaction.item??effect.parent.items.get(transaction.itemId);
  const cost=transaction.mode.upkeepChakraCost??data.chakraCost;
  const baseline=nativeMaintainCost(item.system,{rank:data.rank,cost});
  effect.updateSource({"flags.n5eb.concentration.maintainCost":baseline,[`flags.${MODULE_ID}.castingMode`]:transaction.mode});
}

export function installModeAdapter(game,types) {
  for(const {documentClass} of Object.values(types)) {
    let prototype=documentClass?.prototype;
    while(prototype && !Object.hasOwn(prototype,"_prepareUsageUpdates")) prototype=Object.getPrototypeOf(prototype);
    if(!prototype || wrapped.has(prototype)) continue;
    wrapped.add(prototype);
    const originalUse=prototype.use,originalUpdates=prototype._prepareUsageUpdates;
    prototype.use=async function(...args) {
      if(!(game.settings.get(MODULE_ID,"dynamicChakraCosts")||game.settings.get(MODULE_ID,'ninjutsuTrackers')||game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||game.settings.get(MODULE_ID,'genjutsuClassAutomation')||game.settings.get(MODULE_ID,'medicalClassAutomation')||game.settings.get(MODULE_ID,'taijutsuClassAutomation')) || !this.isSpell || !this.actor) return originalUse.apply(this,args);
      if(active.has(this.actor)) {ui.notifications.warn(game.i18n.localize("N5ESE.Mode.Busy"));return;}
      active.set(this.actor,{itemId:this.item.id,item:this.item});
      try{return await originalUse.apply(this,args);}finally{active.delete(this.actor);globalThis.Hooks?.callAll('n5ese.castingActorUnlocked',this.actor);}
    };
    prototype._prepareUsageUpdates=async function(config,options) {
      bindCastingUsage(this,config);
      const selected=config.n5ese??{},enabled=game.settings.get(MODULE_ID,"dynamicChakraCosts");
      const ids=[selected.technical?"technical":null,selected.frenzy?"frenzy":null].filter(Boolean);
      const recovery=enabled&&selected.chakraRecovery;
      let feature;
      if(recovery) {
        feature=recoveryFeature(this.item);
        if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!feature||config.cause||!(config.consume===true||config.consume?.chakra===true)||!active.has(this.actor)||feature.system.uses.value<1) {
          ui.notifications.warn('Chakra Recovery ist für diesen Vorgang nicht verfügbar.');return false;
        }
      }
      const finish=updates=>{
        if(!recovery||!updates||Array.isArray(updates))return updates;
        try {
          spendRecovery(updates,feature);
          const api=game.modules.get(MODULE_ID).api;
          const rank=config.jutsu?.rank??this.item.system.effectiveRank;
          const cost=api.previewJutsuCost(this.item,{rank,classFeatures:selected.classFeatures,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,pools:selected.pools,martialTechnique:selected.martialTechnique}).finalCost*(config.n5eb?.shockedCostMultiplier??1);
          const transaction=active.get(this.actor);
          transaction.mode={...transaction.mode,upkeepChakraCost:cost};
          config.chakra??={};config.chakra.maintain=modeUpkeep(nativeMaintainCost(this.item.system,{rank,cost}),this.item.system.getMaintainCost({rank,cost}),transaction.mode);
          return updates;
        }catch(error){ui.notifications.warn(error.message);return false;}
      };
      if(!enabled || !ids.length) return finish(await originalUpdates.call(this,config,options));
      const modes=availableCastingModes(this.item,config.jutsu?.rank??this.item.system.effectiveRank);
      if(ids.some(id=>!modes.some(m=>m.id===id)) || config.consume===false || !active.has(this.actor)) {
        ui.notifications.warn(game.i18n.localize("N5ESE.Mode.Invalid"));return false;
      }
      const chosen=modes.filter(m=>ids.includes(m.id)),required=chosen.reduce((sum,m)=>sum+m.dice,0);
      const resource=this.actor.items.get(chosen[0].resourceId);
      if(!Number.isInteger(resource?.system.uses?.spent) || resource.system.uses.value<required) {
        ui.notifications.warn(game.i18n.localize("N5ESE.Mode.Insufficient"));return false;
      }
      // Action economy stays with the native workflow and manual table management.
      const frenzy=ids.includes("frenzy");
      const updates=await originalUpdates.call(this,config,options);
      if(!updates || Array.isArray(updates)) return updates;
      const resourceUpdate=updates.item.find(update=>update._id===resource.id)??{_id:resource.id};
      const spent=resourceUpdate["system.uses.spent"]??resource.system.uses.spent;
      if(resource.system.uses.max-spent<required){ui.notifications.warn(game.i18n.localize("N5ESE.Mode.Insufficient"));return false;}
      resourceUpdate["system.uses.spent"]=spent+required;
      if(!updates.item.includes(resourceUpdate)) updates.item.push(resourceUpdate);
      const mode={frenzy};if(frenzy&&game.settings.get(MODULE_ID,'taijutsuClassAutomation')){updates.actor??={};updates.actor['flags.'+MODULE_ID+'.taijutsuFrenzy.forceAvailable']=false;}
      if(ids.includes("technical")) {
        const roll=await new Roll(`1d${chosen.find(m=>m.id==="technical").die}`).evaluate();
        mode.technicalResult=roll.total;
        updates.rolls??=[];updates.rolls.push(roll);
      }
      const rank=config.jutsu?.rank??this.item.system.effectiveRank,cost=config.chakra?.cost??this.item.system.getChakraCost({rank});
      const baseline=nativeMaintainCost(this.item.system,{rank,cost});
      config.chakra??={};config.chakra.maintain=modeUpkeep(baseline,config.chakra.maintain??this.item.system.getMaintainCost({rank,cost}),mode);
      active.get(this.actor).mode=mode;
      return finish(updates);
    };
  }
}
