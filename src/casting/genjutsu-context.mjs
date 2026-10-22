import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from './feature-rules.mjs';
import {GENJUTSU_CLASS,GENJUTSU_FEATURES} from './genjutsu-sources.mjs';

export const genjutsuClass=actor=>[...(actor?.items??[])].find(i=>i.type==='class'&&sourceOf(i)===GENJUTSU_CLASS);
export function genjutsuLevel(actor){const level=genjutsuClass(actor)?.system.levels;return Number.isInteger(level)&&level>=1&&level<=20?level:0;}
export const isGenjutsu=item=>item?.type==='spell'&&(item.system.jutsu?.type==='genjutsu'||item.system.jutsu?.keywords?.has?.('genjutsu'));
export const psionicEligible=item=>item?.type==='spell'&&item.system.jutsu?.type==='ninjutsu'&&item.system.jutsu.keywords.has('fuinjutsu')&&!!ownedGenjutsuFeature(item.actor,'Psionic Scrivener','Distant Soul');
export const isPsionicCast=item=>psionicEligible(item)&&!!item.getFlag(MODULE_ID,'genjutsuPsionicCast');
export const isDistantSoulJutsu=item=>isGenjutsu(item)||isPsionicCast(item);
function inceptionGrantAvailable(actor,item){const temporal=item.getFlag?.(MODULE_ID,'genjutsuTemporalGrant');if(temporal){const parent=actor.items.get(temporal.sourceFeatureId);if(genjutsuLevel(actor)<2||parent?.dependentOrigin?.active===false||sourceOf(parent??{})!=='Compendium.n5eb.subclass.Item.JDZsvUQYVgbYhyik')return false;}const grant=item.getFlag?.(MODULE_ID,'genjutsuInceptionGrant');if(!grant)return true;const source=actor.items.get(grant.sourceFeatureId);return genjutsuLevel(actor)>=grant.level&&source?.dependentOrigin?.active!==false&&GENJUTSU_FEATURES.some(d=>d.category==='Choose Inception'&&d.name===grant.inception&&d.source===sourceOf(source??{}));}
export function ownedGenjutsuFeature(actor,name,category='Base'){
 if(actor?.type!=='character'||!genjutsuLevel(actor))return null;
 const definitions=GENJUTSU_FEATURES.filter(f=>f.name===name&&f.category===category);
 return [...actor.items].find(i=>i.type==='feat'&&i.dependentOrigin?.active!==false&&inceptionGrantAvailable(actor,i)&&definitions.some(f=>f.source===sourceOf(i)&&(!f.level||genjutsuLevel(actor)>=f.level)))??null;
}
export function genjutsuSourcesOwned(actor){
 if(actor?.type!=='character'||!genjutsuLevel(actor))return [];
 return GENJUTSU_FEATURES.flatMap(definition=>{const item=[...actor.items].find(i=>i.type==='feat'&&sourceOf(i)===definition.source&&i.dependentOrigin?.active!==false&&inceptionGrantAvailable(actor,i)&&(!definition.level||genjutsuLevel(actor)>=definition.level));return item?[{...definition,item}]:[];});
}
export const genjutsuEnabled=game=>game.settings.get(MODULE_ID,'genjutsuClassAutomation');
export function actualizationDie(actor){const level=genjutsuLevel(actor);return level>=17?8:level>=9?6:4;}
export function actualizationPool(actor){const feature=ownedGenjutsuFeature(actor,'Actualization');return feature?{feature,maximum:feature.system.uses.max,remaining:feature.system.uses.value,spent:feature.system.uses.spent,die:actualizationDie(actor)}:null;}
export function genjutsuAbility(actor){const ability=actor?.system.attributes.jutsu.genjutsu.ability;return ['wis','cha'].includes(ability)?ability:'wis';}
