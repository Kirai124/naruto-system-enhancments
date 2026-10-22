import {fractureState} from '../casting/genjutsu-fractures.mjs';
import {mirageCastingGrant} from './genjutsu-mirage-casts.mjs';
import { MODULE_ID } from "../settings/register.mjs";
import {modeUpkeep} from "../casting/casting-modes.mjs";
import {castingUsage} from './mode-adapter.mjs';
import {pendingCastingSurcharge} from '../casting/pending-costs.mjs';
import {voidSurcharge} from '../trackers/pool-targets.mjs';

const originals = new WeakMap(), effectsInstalled = new WeakSet();
export function nativeMaintainCost(system,options) {
  let prototype=Object.getPrototypeOf(system);
  while(prototype) {
    const original=originals.get(prototype);
    if(original) return original.call(system,options);
    prototype=Object.getPrototypeOf(prototype);
  }
  return system.getMaintainCost(options);
}

export function installMaintainAdapter(game,prototype,effectPrototype,api) {
  if (!originals.has(prototype)) {
    const original=prototype.getMaintainCost;
    if(typeof original!=="function") throw new TypeError("Native maintain method missing");
    originals.set(prototype,original);
    prototype.getMaintainCost=function(options={}) {
      const usage=castingUsage(this.parent),mirage=mirageCastingGrant(this.parent,usage);if(mirage?.rule.noUpkeep)return 0;
      if(game.settings.get(MODULE_ID,'dynamicChakraCosts')&&(mirage||(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&usage?.n5ese?.moldings)||(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&usage?.n5ese?.chakraRecovery)||(game.settings.get(MODULE_ID,'ninjutsuTrackers')&&voidSurcharge(this.parent?.actor))||pendingCastingSurcharge(game,this.parent?.actor)||fractureState(game,this.parent?.actor).costMultiplier>1)) {
        const cost=api.previewJutsuCost(this.parent,{rank:options.rank,ignoreFractureCosts:true,classFeatures:usage?.n5ese?.classFeatures,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,ignoreMoldingFollowup:true,ignoreMirageGrant:true,pools:usage?.n5ese?.pools,martialTechnique:usage?.n5ese?.martialTechnique}).finalCost;
        options={...options,cost:cost*(usage?.n5eb?.shockedCostMultiplier??1)};
      }
      const baseCost=original.call(this,options);
      if(!game.settings.get(MODULE_ID,"dynamicChakraCosts") || !this.parent?.actor) return baseCost;
      try { return api.previewMaintainCost(this.parent,{...options,baseCost}).finalCost; }
      catch(error) { console.error(`[${MODULE_ID}] Maintain preview failed`,error); return baseCost; }
    };
  }
  if (!effectPrototype || effectsInstalled.has(effectPrototype)) return;
  const originalFlag=effectPrototype.getFlag;
  effectsInstalled.add(effectPrototype);
  effectPrototype.getFlag=function(scope,key) {
    const data=originalFlag.call(this,scope,key);
    if(scope!=="n5eb" || key!=="concentration" || !data || !game.settings.get(MODULE_ID,"dynamicChakraCosts")) return data;
    const reference=originalFlag.call(this,"n5eb","item");
    const delayed=reference?.data?.flags?.[MODULE_ID]?.genjutsuDelayedCast;
    const item=delayed?new CONFIG.Item.documentClass(reference.data,{parent:this.parent}):this.parent?.items?.get(reference?.id)??(reference?.data?new CONFIG.Item.documentClass(reference.data,{parent:this.parent}):null);
    if(item?.type!=="spell") return data;
    try {
      let mode=originalFlag.call(this,MODULE_ID,"castingMode");if(mode?.noUpkeep&&(mode.noUpkeepSetting&&!game.settings.get(MODULE_ID,mode.noUpkeepSetting)||mode.noUpkeepFeatureUuid&&!fromUuidSync(mode.noUpkeepFeatureUuid)))mode={...mode,noUpkeep:false};
      const cost=api.previewMaintainCost(item,{rank:data.rank??item.system.effectiveRank,cost:mode?.upkeepChakraCost??data.chakraCost,baseCost:data.maintainCost??0}).finalCost;
      return {...data,maintainCost:mode?modeUpkeep(data.maintainCost??0,cost,mode):cost};
    } catch(error) { console.error(`[${MODULE_ID}] Maintain payment cost failed`,error); return data; }
  };
}

/** Persist the unmodified upkeep baseline; effective costs are read dynamically. */
export function preserveMaintainBaseline(game,effect,api) {
  if(!game.settings.get(MODULE_ID,"dynamicChakraCosts")) return;
  const itemId=effect.flags?.n5eb?.item?.id;
  const item=effect.parent?.items?.get(itemId);
  const data=effect.flags?.n5eb?.concentration;
  if(item?.type!=="spell" || !data || data.chakraCost===undefined) return;
  const rank=data.rank??item.system.effectiveRank;
  const cost=effect.flags?.[MODULE_ID]?.castingMode?.upkeepChakraCost??data.chakraCost;
  const baseline=nativeMaintainCost(item.system,{rank,cost});
  const preview=api.previewMaintainCost(item,{rank,cost,baseCost:baseline});
  if(data.maintainCost!==preview.finalCost) return; // Preserve costs supplied by other integrations.
  effect.updateSource({"flags.n5eb.concentration.maintainCost":baseline});
}
