import {fractureState} from '../casting/genjutsu-fractures.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {activePendingCastingCosts,persistentCastingCosts,pendingCastingSurcharge,pendingCostPath,readPendingCastingCosts,postCostSurcharge} from '../casting/pending-costs.mjs';
import {mergeCastingMode} from './mode-adapter.mjs';
import {nativeMaintainCost} from './maintain-adapter.mjs';
import {modeUpkeep} from '../casting/casting-modes.mjs';

const wrapped=new WeakSet(),pending=new WeakMap();
export function installPendingCastingCosts(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const prepare=p._prepareUsageUpdates;
  p._prepareUsageUpdates=async function(config,options){
   if(!this.isSpell||!game.settings.get(MODULE_ID,'dynamicChakraCosts')||config.cause||!(config.consume===true||config.consume?.chakra===true)||this.item.getFlag(MODULE_ID,'moldingCast')?.echo)return prepare.call(this,config,options);
   const rank=config.jutsu?.rank??this.item.system.effectiveRank,entries=activePendingCastingCosts(game,this.actor),persistent=persistentCastingCosts(game,this.actor,rank);const fractures=fractureState(game,this.actor);if(!entries.length&&!persistent.length&&fractures.costMultiplier===1)return prepare.call(this,config,options);
   const api=game.modules.get(MODULE_ID).api,preview=api.previewJutsuCost(this.item,{rank,classFeatures:config.n5ese?.classFeatures,pools:config.n5ese?.pools,chakraRecovery:config.n5ese?.chakraRecovery,martialTechnique:config.n5ese?.martialTechnique}),late=postCostSurcharge(preview),total=(preview.finalCost-late)*(config.n5eb?.shockedCostMultiplier??1)+late;
   if(preview.nativeCostOverride&&!preview.ignoresImposedCostIncreases&&(entries.length||persistent.length))throw Error('Disruption-Zuschlag bei festem NPC-Jutsu-Preis mit dem GM manuell abrechnen.');
   if(this.actor.getChakraAvailable()<total)throw Error('Nicht genügend Chakra einschließlich gespeicherter Zuschläge.');
   const updates=await prepare.call(this,config,options);if(!updates||Array.isArray(updates))return updates;
   if(JSON.stringify(fractureState(game,this.actor))!==JSON.stringify(fractures))throw Error('Fracture-Wirkung während des Casts verändert; erneut konfigurieren.');
   if(JSON.stringify(activePendingCastingCosts(game,this.actor))!==JSON.stringify(entries)||JSON.stringify(persistentCastingCosts(game,this.actor,rank))!==JSON.stringify(persistent))throw Error('Casting-Zuschläge während des Dialogs verändert; erneut wirken.');
   if(updates.actor[pendingCostPath]!==undefined||updates.actor.flags?.[MODULE_ID]?.pendingCastingCosts!==undefined)throw Error('Konkurrierende Zuschlagsabrechnung.');
   const ids=new Set(entries.map(e=>e.id));updates.actor[pendingCostPath]=readPendingCastingCosts(this.actor).filter(e=>!ids.has(e.id));
   const cost=api.previewJutsuCost(this.item,{rank,ignoreFractureCosts:true,classFeatures:config.n5ese?.classFeatures,pools:config.n5ese?.pools,martialTechnique:config.n5ese?.martialTechnique,ignorePostCostSurcharge:true,ignoreVoidSurcharge:true,ignoreMoldingCost:true,ignoreMirageGrant:true}).finalCost*(config.n5eb?.shockedCostMultiplier??1),mode=mergeCastingMode(this,{upkeepChakraCost:cost});
   config.chakra??={};config.chakra.maintain=modeUpkeep(nativeMaintainCost(this.item.system,{rank,cost}),api.previewMaintainCost(this.item,{rank,cost}).finalCost,mode);
   if(config.n5eb?.shockedCostMultiplier){const amount=preview.pendingCastingSurcharge;config.chakra.cost-=amount;pending.set(config,amount);}
   return updates;
  };
 }
 Hooks.on('dnd5e.activityConsumption',(_activity,config,message)=>{const amount=pending.get(config);if(amount===undefined)return;pending.delete(config);config.chakra.cost+=amount;foundry.utils.setProperty(message,'data.system.chakraCost',config.chakra.cost);foundry.utils.setProperty(message,'data.system.maintainCost',config.chakra.maintain);});
}
