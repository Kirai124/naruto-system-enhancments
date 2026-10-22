import {classFeature} from './ninjutsu-class-options.mjs';
import {linkedSummoning} from '../foundry/ninjutsu-links.mjs';
import {isSummoningTechnique,SOURCES,jutsuType,selectionIds,ownedNinjutsuFeature,refinedEligibleType,grantsNinjutsu} from './ninjutsu-selections.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from './feature-rules.mjs';
import {ninjutsuLevel} from './ninjutsu-resources.mjs';

export const REFINED_NINJUTSU='Compendium.n5eb.class.Item.n5ebRefinedNin01';
export function refinedFeature(actor) {
  const linked=linkedSummoning(actor);if(linked)return refinedFeature(linked.source);
  if(actor?.type!=='character'||!ninjutsuLevel(actor))return null;
  return [...actor.items].find(i=>i.type==='feat'&&sourceOf(i)===REFINED_NINJUTSU&&i.dependentOrigin?.active!==false)??null;
}
export function refinedLimit(actor){const level=ninjutsuLevel(actor);return level?2+Math.floor((level-1)/3):0;}
export function refinedBonus(actor){const level=ninjutsuLevel(linkedSummoning(actor)?.source??actor);return level?1+Number(level>=9)+Number(level>=17):0;}
export function eligibleRefined(item) {
  if(item?.type!=='spell'||!refinedFeature(item.actor))return false;
  const keywords=[...(item.system.jutsu?.keywords??[])];
  return !keywords.includes('combination')&&(!!linkedSummoning(item.actor)||refinedEligibleType(item));
}
export function refinedSelection(actor) {
  const ids=refinedFeature(actor)?.getFlag(MODULE_ID,'refinedJutsu')?.ids;
  return Array.isArray(ids)?[...new Set(ids)].filter(id=>typeof id==='string'&&eligibleRefined(actor.items.get(id))).slice(0,refinedLimit(actor)):[];
}
export function isRefined(item){return eligibleRefined(item)&&(!!linkedSummoning(item.actor)||refinedSelection(item.actor).includes(item.id)||jutsuType(item)==='taijutsu'&&selectionIds(item.actor,'tai').includes(item.id)&&!!ownedNinjutsuFeature(item.actor,SOURCES.tai)||!!classFeature(item.actor,'Summoning Adept')&&isSummoningTechnique(item));}
/** Reject ambiguous custom formulae rather than guessing which die to increase. */
export function refinedDamageChoices(activity) {
  return [...(activity.damage?.parts??[])].flatMap((part,index)=>{
    let die=Number(part.denomination);
    if(part.custom?.enabled){
      const formula=part.custom.formula??'',matches=[...formula.matchAll(/\b\d+d(\d+)\b/gi)];
      if(matches.length!==1||/[{}]|\bd[0-9]+(?:k|r|x|cs|cf)/i.test(formula))return [];
      die=Number(matches[0][1]);
    }else if(!(part.number>0))return [];
    if(!Number.isInteger(die)||die<2)return [];
    return [{index,die,formula:part.formula??part.custom?.formula??`${part.number}d${die}`,types:[...(part.types??[])]}];
  });
}
export function refinedCastingChoice(activity,selected) {
  if(!selected||selected==='none')return null;
  if(!isRefined(activity.item))throw Error('Dieses Jutsu gehört nicht zur gültigen Refined-Ninjutsu-Auswahl.');
  const bonus=refinedBonus(activity.actor);
  if(selected==='save'&&Number.isFinite(activity.save?.dc?.value))return {activityId:activity.id,mode:'save',bonus};
  const index=typeof selected==='string'&&/^damage:\d+$/.test(selected)?Number(selected.slice(7)):-1;
  const part=refinedDamageChoices(activity).find(p=>p.index===index);
  if(part)return {activityId:activity.id,mode:'damage',bonus,index,die:part.die};
  throw Error('Die gewählte Refined-Ninjutsu-Wirkung ist für diese Aktivität nicht verfügbar.');
}
export function validateRefinedSelection(actor,ids,{gm=false}={}) {
  const feature=refinedFeature(actor);
  if(!feature||!Array.isArray(ids)||ids.length>refinedLimit(actor)||new Set(ids).size!==ids.length||ids.some(id=>!eligibleRefined(actor.items.get(id))))throw Error('Ungültige Refined-Ninjutsu-Auswahl.');
  const previous=refinedSelection(actor),mayReplace=gm||feature.getFlag(MODULE_ID,'refinedJutsu')?.reselect===true;
  if(!mayReplace&&previous.some(id=>!ids.includes(id)))throw Error('Bestehende Auswahl erst nach einer langen Rast ändern.');
  return {ids:[...ids],reselect:false};
}
