import {dragonSoulItem,prepareDragonSoulClone} from '../foundry/taijutsu-dragon-soul.mjs';
import {specialCastGrant} from '../foundry/taijutsu-special-casts.mjs';
import {stancerCostProtection} from '../foundry/taijutsu-stancer.mjs';
import {createTaijutsuAPI} from './taijutsu-api.mjs';
import {createMedicalAPI} from './medical-api.mjs';
import {fractureState} from '../casting/genjutsu-fractures.mjs';
import {sensoryDefinition} from '../casting/genjutsu-sensory.mjs';
import {castingUsage} from '../foundry/mode-adapter.mjs';
import {innateGenjutsuFreeCast} from '../casting/genjutsu-innate-casts.mjs';
import {mirageCastingGrant} from '../foundry/genjutsu-mirage-casts.mjs';
import {pendingCastingSurcharge} from '../casting/pending-costs.mjs';
import {classOptions} from '../casting/ninjutsu-class-options.mjs';
import {classTargetWorkflow} from '../foundry/ninjutsu-class-targets.mjs';
import {selectionIds} from '../casting/ninjutsu-selections.mjs';
import {configureNinjutsuSelection} from '../foundry/ninjutsu-selections.mjs';
import {classCastingGrant} from '../foundry/ninjutsu-followups.mjs';
import {classCostChanges} from '../casting/ninjutsu-class-options.mjs';
import { ModifierRegistry } from "../domain/registry.mjs";
import {MODULE_ID} from '../settings/register.mjs';
import { calculateCost } from "../domain/cost-engine.mjs";
import { registerAmplifiedFlames } from "../casting/amplified-flames.mjs";
import { buildCastingContext } from "../foundry/context.mjs";
import { nativeChakraCost } from "../foundry/cost-adapter.mjs";
import { registerChoiceModifiers } from "../casting/feature-rules.mjs";
import {registerMedicalCosts} from '../casting/medical-costs.mjs';
import { registerMaintainRules, calculateMaintainCost } from "../casting/maintain-rules.mjs";
import { nativeMaintainCost } from "../foundry/maintain-adapter.mjs";
import { configureFeatureChoice } from "../foundry/feature-choice.mjs";
import {availableCastingModes} from "../casting/casting-modes.mjs";

import {applyMartialTechnique,hasMartialTechnique} from "../casting/martial-technique.mjs";

import {createDojutsuManager} from "../dojutsu/manager.mjs";
import {createNinjutsuTracker} from '../trackers/manager.mjs';
import {recoveryFeature,recoveryCost} from '../casting/ninjutsu-resources.mjs';
import {refinedSelection,refinedLimit,refinedBonus} from '../casting/refined-ninjutsu.mjs';
import {configureRefined} from '../foundry/refined-ninjutsu.mjs';
import {poolCost} from '../casting/ninjutsu-pools.mjs';
import {readVoidSurcharges,voidSurcharge} from '../trackers/pool-targets.mjs';
import {configuredMoldings,availableMoldings} from '../casting/efficient-molding.mjs';
import {sharedMoldingGrant} from '../foundry/shared-molding-casts.mjs';
import {runMoldingAction} from '../foundry/molding-actions.mjs';
import {runMoldingEcho} from '../foundry/molding-echo.mjs';
import {subclassTargetWorkflow} from '../foundry/subclass-molding-targets.mjs';
import {generationalProtection} from '../casting/generational-protection.mjs';
import {useAdaptiveMolding} from '../foundry/adaptive-moldings.mjs';
import {solarFinishers,runSolarFinisher} from '../foundry/solar-interflow.mjs';

export function createAPI(environment = globalThis.game, dojutsu = createDojutsuManager(environment), ninjutsu = createNinjutsuTracker(environment)) {
  const registry = new ModifierRegistry();
  registerAmplifiedFlames(registry);
  registerChoiceModifiers(registry);
  const maintainRegistry = new ModifierRegistry();
  registerMaintainRules(maintainRegistry);
  registerMedicalCosts(registry,maintainRegistry);
  const api = Object.freeze({ version: "0.17.0", medical:createMedicalAPI(environment), taijutsu:createTaijutsuAPI(environment), capabilities: Object.freeze({ costPreview: true, nativeCastingCosts: true, nativeMaintainCosts: true, featureChoices:true, builtinCastingModes:true, castingCommit: false, castingModes: false, dojutsu: true, ninjutsuTrackerPersistence:true, markTriggers:true,refinedNinjutsu:true,efficientMoldings:true,subclassMoldings:true,ninjutsuClassOptions:true,medicalClassAutomation:true,taijutsuClassAutomation:true }),
    getNinjutsuClassOptions:activity=>classOptions(activity).map(({name,limited,multiple,choices})=>({name,limited,multiple,choices:choices.map(c=>({...c}))})),
    getNinjutsuSelection:(actor,key)=>selectionIds(actor,key),
    configureNinjutsuSelection:(actor,key)=>configureNinjutsuSelection(environment,actor,key),
    getNinjutsuClassRequests:actor=>classTargetWorkflow(environment).list(actor),
    applyNinjutsuClassRequest:(actor,id)=>classTargetWorkflow(environment).apply(actor,id),
    cancelNinjutsuClassRequest:(actor,id)=>classTargetWorkflow(environment).cancel(actor,id),
    resolveNinjutsuClassReview:(actor,id)=>classTargetWorkflow(environment).resolve(actor,id),
    getSubclassMoldingRequests:actor=>subclassTargetWorkflow(environment).list(actor),
    requestSubclassMoldingTargets:(actor,messageId,ruleId,targets,options={})=>subclassTargetWorkflow(environment).request(actor,messageId,ruleId,targets,options),
    cancelSubclassMoldingRequest:(actor,id)=>subclassTargetWorkflow(environment).cancel(actor,id),
    resolveSubclassMoldingReview:(actor,id)=>subclassTargetWorkflow(environment).resolve(actor,id),
    applySubclassMoldingRequest:(actor,id)=>subclassTargetWorkflow(environment).apply(actor,id),
    useAdaptiveMolding:(actor,id)=>useAdaptiveMolding(environment,actor,id),
    getSolarFinishers:actor=>structuredClone(solarFinishers(actor)),
    castSolarFinisher:(actor,id,options={})=>runSolarFinisher(environment,actor,id,options),
    getMoldingProtection:message=>environment?.settings?.get(MODULE_ID,'efficientMoldingAutomation')&&environment.settings.get(MODULE_ID,'subclassMoldingAutomation')?generationalProtection(message.getFlag(MODULE_ID,'moldingCast'),environment):null,
    getAvailableMoldings:(activity,options={})=>availableMoldings(activity,options).filter(m=>!m.subclass||environment?.settings?.get(MODULE_ID,'subclassMoldingAutomation')).map(({id,name,phase,additive,source})=>Object.freeze({id,name,phase,additive,source})),
    previewMoldings:(activity,configuration={},rank=activity.item.system.effectiveRank)=>{const p=configuredMoldings(activity,configuration,rank,{subclassEnabled:!!environment?.settings?.get(MODULE_ID,'subclassMoldingAutomation')});return Object.freeze({ids:Object.freeze(p.selected.map(m=>m.id)),freeIds:Object.freeze([...p.freeIds]),uses:p.uses,additionalCost:p.additionalCost});},
    useMoldingAction:(message,id)=>runMoldingAction(environment,message,id),
    castMoldingEcho:(message,options={})=>runMoldingEcho(environment,message,options),
    getRefinedNinjutsu:actor=>({ids:refinedSelection(actor),maximum:refinedLimit(actor),bonus:refinedBonus(actor)}),
    configureRefinedNinjutsu:actor=>configureRefined(environment,actor),
    getVoidSurcharges:readVoidSurcharges,
    removeVoidSurcharge:async(actor,id)=>{
      if(!environment.user?.isGM||!actor?.isOwner)throw Error('GM-Berechtigung erforderlich.');
      await actor.update({[`flags.${MODULE_ID}.voidSurcharges`]:readVoidSurcharges(actor).filter(e=>e.id!==id)});
    },
    getNinjutsuTrackers:actor=>ninjutsu.list(actor),
    getNinjutsuTrackerWarnings:(actor,kind,phase='gain')=>ninjutsu.warnings(actor,kind,phase),
    previewMarkTrigger:(actor,key,options={})=>ninjutsu.previewTrigger(actor,key,options),
    getMarkTriggerRequests:actor=>ninjutsu.requests(actor),
    requestMarkTrigger:(actor,key,options={})=>ninjutsu.requestTrigger(actor,key,options),
    applyMarkTrigger:(actor,id)=>ninjutsu.applyTrigger(actor,id),
    cancelMarkTrigger:(actor,id)=>ninjutsu.cancelTrigger(actor,id),
    resolveMarkTriggerReview:(actor,id)=>ninjutsu.resolveReview(actor,id),
    addNinjutsuTrackerEntry:(actor,kind,target=null)=>ninjutsu.add(actor,kind,target),
    removeNinjutsuTrackerEntries:(actor,key,count)=>ninjutsu.remove(actor,key,count),
    registerDojutsuDefinition: definition => dojutsu.registry.register(definition),
    unregisterDojutsuDefinition: id => dojutsu.registry.unregister(id),
    listDojutsuDefinitions: () => dojutsu.registry.list(),
    getDojutsuInstances: actor => dojutsu.list(actor),
    activateDojutsu: (actor,instanceId) => dojutsu.activate(actor,instanceId),
    deactivateDojutsu: (actor,instanceId) => dojutsu.deactivate(actor,instanceId),
    assignDojutsuEye: (actor,instanceId,eye) => dojutsu.assignEye(actor,instanceId,eye),
    reconcileDojutsu: actor => dojutsu.reconcile(actor),
    setDojutsuTomoeUnlock: (actor,instanceId,maxTomoe) => dojutsu.setTomoeUnlock(actor,instanceId,maxTomoe),
    availableCastingModes: (item,options={})=>availableCastingModes(item,options.rank??item.system.effectiveRank),
    registerMaintainModifier: definition => {
      if((definition.change?.operation==="add" && definition.change.value>0) || (definition.change?.operation==="multiply" && definition.change.value>1)) throw new TypeError("Maintain API supports reductions only");
      return maintainRegistry.register(definition);
    },
    unregisterMaintainModifier: id => maintainRegistry.unregister(id),
    listMaintainModifiers: () => maintainRegistry.list(),
    calculateMaintainCost: context => calculateMaintainCost(maintainRegistry,context),
    configureFeatureChoice: item => configureFeatureChoice(game,item),
    previewMaintainCost: (item, options={}) => {
      const context = buildCastingContext(item, options, nativeChakraCost);
      const cost = options.cost ?? api.previewJutsuCost(item,{...options,ignoreFractureCosts:true,ignoreMoldingCost:true,ignoreMoldingFollowup:true,ignoreMirageGrant:true,ignoreSpecialGrant:true,chakraRecovery:false,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,rank:context.rank}).finalCost;
      context.baseCost = options.baseCost ?? nativeMaintainCost(item.system,{rank:context.rank,cost});
      return Object.freeze({...calculateMaintainCost(maintainRegistry,context),warnings:Object.freeze(context.warnings)});
    },
    registerCastingModifier: definition => registry.register(definition),
    unregisterCastingModifier: id => registry.unregister(id),
    listCastingModifiers: () => registry.list(),
    calculateChakraCost: context => calculateCost(registry, context),
    previewJutsuCost: (item, options={}) => {
      if(dragonSoulItem(environment,item)&&item.system.jutsu?.type!=='taijutsu'){const copy=new item.constructor(item.toObject(),{parent:item.actor});const activity=[...copy.system.activities][0];if(activity){prepareDragonSoulClone(environment,activity);return api.previewJutsuCost(copy,options);}}
      const tai=environment?.settings?.get(MODULE_ID,'taijutsuClassAutomation')&&item.getFlag(MODULE_ID,'taijutsuCast');if(options.rank===undefined&&tai?.flaming&&tai.paidRank)options={...options,rank:tai.paidRank};
      const ignoreImposed=stancerCostProtection(environment,item,options.taijutsu??castingUsage(item)?.n5ese?.taijutsu);
      let context = buildCastingContext(item,options,nativeChakraCost);if(ignoreImposed)context={...context,excludeCostIncreases:true};
      const special=options.ignoreSpecialGrant?null:specialCastGrant(environment,item);if(special?.half){if(options.martialTechnique!==false&&hasMartialTechnique(item))throw Error('Halber Sondercast-Preis und Martial-Technique-Festpreis sind nicht kombinierbar; Festpreis im Castingdialog abwählen.');context={...context,nativeBaseCost:context.baseCost,baseCost:Math.ceil(context.baseCost/2)};}const classGrant=options.ignoreClassGrant?null:classCastingGrant(item);if(special&&classGrant)throw Error('Konkurrierende Sondercast-Zusagen.');if(classGrant?.free)context={...context,nativeBaseCost:context.baseCost,baseCost:0,minimumCost:0};if(classGrant?.baseHalf)context={...context,baseCost:Math.floor(context.baseCost/2)};
      const sensoryFree=!!environment?.settings?.get(MODULE_ID,'genjutsuClassAutomation')&&sensoryDefinition(item)?.kind==='eagle'&&!!(options.genjutsu??castingUsage(item)?.n5ese?.genjutsu)?.eagleFree;if(sensoryFree)context={...context,nativeBaseCost:context.baseCost,baseCost:0,minimumCost:0};
      const innate=options.ignoreMirageGrant?null:innateGenjutsuFreeCast(environment,item),mirage=options.ignoreMirageGrant?null:mirageCastingGrant(item),freeGrant=classGrant?.free||mirage?.rule.price==='free'||!!innate||sensoryFree;if(innate)context={...context,nativeBaseCost:context.baseCost,baseCost:0,minimumCost:0};if(mirage){if(classGrant)throw Error('Konkurrierende Casting-Zusagen.');if(mirage.rule.price==='free')context={...context,nativeBaseCost:context.baseCost,baseCost:0,minimumCost:0};else if(mirage.rule.price==='half')context={...context,nativeBaseCost:context.baseCost,baseCost:Math.floor(context.baseCost/2)};}
      const followup=options.ignoreMoldingFollowup?null:sharedMoldingGrant(item),fixedFollowup=followup?.kind==='magnum-opus';
      if(fixedFollowup){if(!Number.isInteger(followup.fixedCost)||followup.fixedCost<0)throw Error('Ungültiger Magnum-Opus-Preis.');context={...context,nativeBaseCost:context.baseCost,baseCost:followup.fixedCost,minimumCost:0};}
      if(followup?.kind==='solar-interflow'&&(!Number.isInteger(followup.reduction)||followup.reduction<1||followup.reduction>6))throw Error('Ungültiger Solar-Finisher-Rabatt.');
      const adversary = item.actor.system?.details?.adversary;
      const nativeCostOverride = !!(adversary?.enabled && (adversary.class === "minion" || adversary.fixedJutsuCost));
      if(!nativeCostOverride&&!fixedFollowup&&!freeGrant) context=applyMartialTechnique(item,context,options,nativeChakraCost);
      const calculated=calculateCost(nativeCostOverride||fixedFollowup||freeGrant ? new ModifierRegistry() : registry, context);
      const finisher=followup?.kind==='solar-interflow'&&!context.excludeCostReductions?Math.max(calculated.minimumCost,calculated.finalCost-followup.reduction):calculated.finalCost;
      const cost=nativeCostOverride||fixedFollowup||freeGrant?calculated.finalCost:poolCost(item,options.pools,options.now??environment?.time?.worldTime??0,finisher);
      const rankEntries=calculated.breakdown.map(e=>({entry:e,definition:registry.list().find(d=>d.id===e.id)})).filter(e=>e.definition?.rankReduction);
      const classCost=environment?.settings?.get(MODULE_ID,'ninjutsuClassAutomation')&&!nativeCostOverride&&!fixedFollowup?classCostChanges(item,options.classFeatures,context.rank,cost,{excludeReductions:context.excludeCostReductions,minimumCost:calculated.minimumCost,rankExclusive:rankEntries.some(e=>e.definition.exclusiveRankReduction),existingRankReduction:rankEntries.reduce((n,e)=>n+e.entry.before-e.entry.after,0)}):{cost,noRecovery:false};
      const fractureMultiplier=options.ignoreFractureCosts||ignoreImposed?1:fractureState(environment,item.actor).costMultiplier,modifiedClassCost=classCost.cost*fractureMultiplier;
      const recovery=!classCost.noRecovery&&!!options.chakraRecovery&&!nativeCostOverride&&!fixedFollowup&&!freeGrant&&!!recoveryFeature(item);
      const surcharge=ignoreImposed||options.ignoreVoidSurcharge||options.ignorePostCostSurcharge?0:voidSurcharge(item.actor),pendingSurcharge=ignoreImposed||options.ignorePostCostSurcharge?0:pendingCastingSurcharge(environment,item.actor,context.rank);
      const activity=options.moldingActivityId&&item.actor.items.get?.(item.id)?.system.activities?.get(options.moldingActivityId);
      const molding=options.moldings&&!options.ignoreMoldingCost&&!followup?.sharedMoldings?configuredMoldings(activity??{item},options.moldings,context.rank,{subclassEnabled:!!environment?.settings?.get(MODULE_ID,'subclassMoldingAutomation')}).additionalCost:0;
      return Object.freeze({ ...calculated,fractureMultiplier,unrecoveredCost:modifiedClassCost,classCostDelta:modifiedClassCost-cost,chakraRecovery:recovery,castingPoolReduction:finisher-cost,followupReduction:calculated.finalCost-finisher,
        ignoresImposedCostIncreases:ignoreImposed,specialAdditionalCost:special?.additional??0,moldingAdditionalCost:molding,voidSurcharge:surcharge,pendingCastingSurcharge:pendingSurcharge,postReductionSurcharge:surcharge+pendingSurcharge,finalCost:(recovery?recoveryCost(modifiedClassCost):modifiedClassCost)+surcharge+pendingSurcharge+molding+(special?.additional??0),nativeCostOverride,
        martialTechnique:!nativeCostOverride && !!context.martialTechnique, nativeBaseCost:context.nativeBaseCost??context.baseCost,
        warnings: Object.freeze(context.warnings), sourceUuid: context.sourceUuid,
        mirage:mirage?.rule.name,innateGenjutsu:innate,sensoryFreeCast:sensoryFree, scope: "native-cost-plus-registered-modifiers", includesPostConsumptionConditions: false });
    }
  });
  return api;
}
