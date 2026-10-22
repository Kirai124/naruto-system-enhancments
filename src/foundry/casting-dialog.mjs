import {addMartialProfileFields} from './taijutsu-martial-profiles.mjs';
import {addVersatilityFields} from './taijutsu-versatility.mjs';
import {addMartialCombatFields} from './taijutsu-martial-combat-cast.mjs';
import {addDragonSoulFields} from './taijutsu-dragon-soul.mjs';
import {addTaijutsuCastingFields} from './taijutsu-casting.mjs';
import {addPsionicFields} from './genjutsu-psionic.mjs';
import {addMedicalCastingFields} from './medical-casting.mjs';
import {postCostSurcharge} from '../casting/pending-costs.mjs';
import {addWeaponCastingFields} from './genjutsu-weapon-casting.mjs';
import {addGenjutsuCastingFields} from './genjutsu-casting.mjs';
import {addClassCastingFields} from './ninjutsu-class-casting.mjs';
import { MODULE_ID } from "../settings/register.mjs";
import {availableCastingModes,modeUpkeep} from "../casting/casting-modes.mjs";

import {hasMartialTechnique} from "../casting/martial-technique.mjs";
import {recoveryFeature} from '../casting/ninjutsu-resources.mjs';
import {isRefined,refinedBonus,refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';
import {poolChoices} from '../casting/ninjutsu-pools.mjs';
import {addMoldingDialogFields,normalizeMoldingConfig} from '../ui/molding-dialog.mjs';

/** Preserve the activity's chosen dialog class, including other module subclasses. */
export function extendCastingDialog(game, activity, usage, dialog, api) {
  const costs=game.settings.get(MODULE_ID,'dynamicChakraCosts'),classes=game.settings.get(MODULE_ID,'ninjutsuClassAutomation');
  const pools=game.settings.get(MODULE_ID,'ninjutsuTrackers');
  if (!(costs||classes||pools||game.settings.get(MODULE_ID,'genjutsuClassAutomation')||game.settings.get(MODULE_ID,'medicalClassAutomation')||game.settings.get(MODULE_ID,'taijutsuClassAutomation')) || !activity.isSpell) return;
  const adversary = activity.actor?.system.details?.adversary;
  if (adversary?.enabled && (adversary.class === "minion" || adversary.fixedJutsuCost)) return;
  const Base = dialog.applicationClass;
  if (typeof Base?.prototype?._prepareConsumptionContext !== "function") return;
  dialog.applicationClass = class extends Base {
    async _onRender(context,options){
      await super._onRender(context,options);
      if(!this.element?.querySelector('[name^="n5ese."]'))return;
      this.element.classList.add('n5ese-enhanced-casting');
      const bounds=this.element.getBoundingClientRect();
      if(bounds.bottom>window.innerHeight-16)this.setPosition({top:16});
    }
    async _prepareConcentrationContext(context, options) {
      const result=await super._prepareConcentrationContext(context,options);
      const lightning=pools&&costs&&poolChoices(this.activity,'lightning-motes',game.time?.worldTime??0).find(p=>p.mode==='maintain'&&p.value===this.config.n5ese?.pools?.['lightning-motes']);
      if(lightning&&result.hasConcentration){
        const rank=this.config.jutsu?.rank??this.item.system.effectiveRank,cost=api.previewJutsuCost(this.item,{rank,pools:this.config.n5ese?.pools,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,martialTechnique:this.config.n5ese?.martialTechnique}).finalCost;
        const maintain=api.previewMaintainCost(this.item,{rank,cost}),effective=modeUpkeep(maintain.baseCost,maintain.finalCost,{lightningReduction:Math.floor(lightning.count/2),frenzy:!!this.config.n5ese?.frenzy});
        const normal=game.i18n.format('N5EB.JUTSU.ConcentrationGuidance',{cost:this.item.system.getMaintainCost({rank,cost:this.item.system.getChakraCost({rank})})});
        const note=result.notes.find(n=>n.message===normal);
        if(note)note.message=game.i18n.format('N5EB.JUTSU.ConcentrationGuidance',{cost:effective});
        else result.notes.push({type:'info',message:`Lightning Motes: effektiver Unterhalt ${effective} Chakra; stärkste Reduktion gilt.`});
      }
      if(this.config.n5ese?.technical || this.config.n5ese?.frenzy) result.notes.push({type:"info",message:game.i18n.localize(this.config.n5ese.frenzy?"N5ESE.Mode.FrenzyUpkeep":"N5ESE.Mode.TechnicalPending")});
      return result;
    }
    async _prepareConsumptionContext(context, options) {
      const result = await super._prepareConsumptionContext(context, options);
      addMedicalCastingFields(game,this.activity,this.config,result);addTaijutsuCastingFields(game,this.activity,this.config,result);addDragonSoulFields(game,this.activity,this.config,result);addMartialCombatFields(game,this.activity,this.config,result);addVersatilityFields(game,this.activity,this.config,result);addMartialProfileFields(game,this.activity,this.config,result);
      addWeaponCastingFields(game,this.activity,this.config,result);
      if(game.settings.get(MODULE_ID,'genjutsuClassAutomation')){addGenjutsuCastingFields(this.activity,this.config,result);addPsionicFields(game,this.activity,this.config,result);}
      if(classes&&costs)addClassCastingFields(this.activity,this.config,result);
      if(costs&&game.settings.get(MODULE_ID,'efficientMoldingAutomation'))addMoldingDialogFields(this.activity,this.config,result,{subclassEnabled:game.settings.get(MODULE_ID,'subclassMoldingAutomation')});
      if(pools)for(const [kind,label] of [['void-shards','Void Shards'],['lightning-motes','Lightning Motes'],['elemental-motes','Elemental Motes'],['blood-vials','Blood Vials'],['rain-blades','Rain Blades'],['traditional-inertia','Traditional Inertia'],['solid-gems','Solid Gems'],['ink-sketches','Ink Sketches']]){
        const choices=poolChoices(this.activity,kind,game.time?.worldTime??0).filter(c=>costs||!['cost','maintain'].includes(c.mode));
        if(!choices.length)continue;
        result.fields.push({value:this.config.n5ese?.pools?.[kind]??'none',name:`n5ese.pools.${kind}`,field:new foundry.data.fields.StringField({label,hint:'Verbrauch erst beim bestätigten Cast. Im selben Zug keine Motes erzeugen und ausgeben; Ausnahmen mit dem GM klären.'}),input:(_field,config)=>foundry.applications.fields.createSelectInput({...config,options:[{value:'none',label:'Keine ausgeben'},...choices]})});result.hasConsumption=true;
      }
      if(classes&&isRefined(this.item)) {
        const bonus=refinedBonus(this.item.actor),choices=[{value:'none',label:'Ohne Refined-Bonus'}];
        if(Number.isFinite(this.activity?.save?.dc?.value))choices.push({value:'save',label:`Rettungswurf-SG +${bonus}`});
        for(const part of refinedDamageChoices(this.activity))choices.push({value:`damage:${part.index}`,label:`Schaden ${part.index+1}: +${bonus}d${part.die} (${part.formula})`});
        result.fields.push({value:this.config.n5ese?.refined??'none',name:'n5ese.refined',field:new foundry.data.fields.StringField({label:'Refined Ninjutsu',hint:'Ein Bonus je Cast, vor der Zielwirkung auswählen. Unklare Schadensformeln werden nicht automatisch verändert.'}),input:(_field,config)=>foundry.applications.fields.createSelectInput({...config,options:choices})});
        result.hasConsumption=true;
      }
      if(!costs)return result;
      const recovery=game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&recoveryFeature(this.item);
      if(recovery) {
        result.fields.push({value:!!this.config.n5ese?.chakraRecovery,name:'n5ese.chakraRecovery',field:new foundry.data.fields.BooleanField({label:'Chakra Recovery',hint:`Wirkkosten nach Reduktionen halbieren (abgerundet), Unterhalt unverändert. Verfügbar: ${recovery.system.uses.value}/${recovery.system.uses.max}. Verbraucht eine Nutzung.`}),input:result.inputs.createCheckboxInput});
        result.hasConsumption=true;
      }
      if(hasMartialTechnique(this.item)) {
        result.fields.push({value:this.config.n5ese?.martialTechnique!==false,name:"n5ese.martialTechnique",field:new foundry.data.fields.BooleanField({label:"Martial Technique",hint:game.i18n.localize("N5ESE.Mode.MartialTechnique")}),input:result.inputs.createCheckboxInput});
        result.hasConsumption=true;
      }
      for(const mode of availableCastingModes(this.item,this.config.jutsu?.rank??this.item.system.effectiveRank)) {
        result.fields.push({value:!!this.config.n5ese?.[mode.id],name:`n5ese.${mode.id}`,field:new foundry.data.fields.BooleanField({label:mode.label,hint:game.i18n.format(mode.id==="technical"?"N5ESE.Mode.Technical":"N5ESE.Mode.Frenzy",{dice:mode.dice,die:mode.die})}),input:result.inputs.createCheckboxInput});
        result.hasConsumption=true;
      }
      let preview;
      try{preview=api.previewJutsuCost(this.item, {taijutsu:this.config.n5ese?.taijutsu,classFeatures:this.config.n5ese?.classFeatures,moldings:game.settings.get(MODULE_ID,'efficientMoldingAutomation')?normalizeMoldingConfig(this.config.n5ese?.moldings):undefined,moldingActivityId:this.activity?.id,pools:this.config.n5ese?.pools,chakraRecovery:!!recovery&&!!this.config.n5ese?.chakraRecovery,martialTechnique:this.config.n5ese?.martialTechnique,rank: this.config.jutsu?.rank ?? this.item.system.effectiveRank });}
      catch(error){result.notes.push({type:'warn',message:error.message});return result;}
      if(preview.castingPoolReduction)result.notes.push({type:'info',message:`Void Shards: −${preview.castingPoolReduction} Chakra vor Chakra Recovery.`});
      if(preview.chakraRecovery)result.notes.push({type:'info',message:`Chakra Recovery: ${preview.unrecoveredCost} → ${preview.finalCost-postCostSurcharge(preview)-(preview.moldingAdditionalCost??0)} Chakra; eine Nutzung, Unterhalt unverändert.`});
      if(preview.pendingCastingSurcharge)result.notes.push({type:'info',message:'Genjutsu-Zuschläge: +'+preview.pendingCastingSurcharge+' Chakra nach allen Reduktionen. Disruption wird beim bestätigten Cast verbraucht; Persistent gilt solange die Zielwirkung besteht.'});
      if(preview.voidSurcharge)result.notes.push({type:'info',message:`Gespeicherte Void Shards: +${preview.voidSurcharge} Chakra nach allen Reduktionen und Chakra Recovery. Verbrauch erst beim bestätigten Cast.`});
      if(preview.martialTechnique) result.notes.push({type:"info",message:game.i18n.format("N5ESE.Mode.MartialTechniqueCost",{cost:preview.finalCost})});
      if((preview.skipped??[]).some(entry=>entry.reason==="exclusive-rank-reduction")) result.notes.push({type:"info",message:game.i18n.localize("N5ESE.ExclusiveRankReduction")});
      if (preview.breakdown.length) result.notes.push({ type: "info", message: game.i18n.format("N5ESE.CostBreakdown", {
        base: preview.baseCost, final: preview.finalCost, delta: preview.finalCost - preview.baseCost
      }) });
      if (preview.warnings.includes("missing-cost-choice")) result.notes.push({type:"warn",message:game.i18n.localize("N5ESE.Choice.Missing")});
      if (preview.warnings.some(warning=>warning!=="missing-cost-choice")) result.notes.push({ type: "warn", message: game.i18n.localize("N5ESE.Unverified") });
      if(this.activity?.duration?.concentration) {
        const maintain=api.previewMaintainCost(this.item,{rank:this.config.jutsu?.rank??this.item.system.effectiveRank,cost:preview.unrecoveredCost*(this.config.n5eb?.shockedCostMultiplier??1)});
        if(maintain.breakdown.length) result.notes.push({type:"info",message:game.i18n.format("N5ESE.MaintainBreakdown",{base:maintain.baseCost,final:maintain.finalCost})});
      }
      if (this.config.n5eb?.shockedCostMultiplier) result.notes.push({ type: "warn", message: game.i18n.format("N5ESE.ShockedCost", {
        cost: (preview.finalCost-postCostSurcharge(preview)) * this.config.n5eb.shockedCostMultiplier+postCostSurcharge(preview)
      }) });
      return result;
    }
  };
}
