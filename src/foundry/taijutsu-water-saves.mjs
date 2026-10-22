import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature,isTaijutsu} from '../casting/taijutsu-context.mjs';
import {natureForm} from './taijutsu-nin-tai.mjs';
import {chooseJutsuDefenses,defenseActorClone} from './taijutsu-defense-context.mjs';

/** Compute only native saving-throw components on a read-only actor clone. Roll and pay on the real actor. */
export function installWaterArmorSaves(game,ActorClass){const original=ActorClass.prototype.rollSavingThrow;ActorClass.prototype.rollSavingThrow=async function(config={},dialog={},message={}){
 const origin=game.messages.get(message.data?.flags?.n5eb?.originatingMessage??message.data?.['flags.n5eb.originatingMessage']),item=origin?.getAssociatedItem?.(),source=origin?.getAssociatedActor?.(),saved=item?.getFlag(MODULE_ID,'taijutsuNatureCast'),form=saved??natureForm(game,source)?.data;
 if(config.n5eseWaterSavePrepared||!taijutsuEnabled(game)||!source||!isTaijutsu(item)||!form?.armor||form.nature!=='water'||!taijutsuFeature(source,'Elemental Armor','Nin-Tai'))return original.call(this,config,dialog,message);
 const selected=await chooseJutsuDefenses(game,this,{title:'Water Armor · Jutsu-Save-Boni',description:'Nur tatsächliche positive, durch Jutsu gewährte Rettungswurf-Boni bestätigen. Diese Beiträge werden für genau diesen Save ausgelassen. Andere Features, Nachteile und fremde Effekte bleiben erhalten; Originaleffekte werden nicht verändert. Gemischte unbekannte Custom-Effekte manuell abgrenzen.'});if(selected===null)return null;if(!selected.length)return original.call(this,{...config,n5eseWaterSavePrepared:true},dialog,message);
 const clone=defenseActorClone(this,selected),ability=clone.system.abilities[config.ability];if(!ability)throw Error('Tatsächliches Save-Attribut fehlt.');const data=clone.getRollData(),bonus=value=>typeof value==='string'?Roll.replaceFormulaData(value,data,{missing:0}):value??0,values={mod:ability.mod,prof:ability.saveProf?.hasBonus?ability.saveProf.term:0,[config.ability+'SaveBonus']:bonus(ability.bonuses.save),saveBonus:bonus(clone.system.bonuses.abilities.save),cover:config.ability==='dex'?clone.system.attributes.ac.cover??0:0},mode=ability.save?.roll?.mode;
 config={...config,n5eseWaterSavePrepared:true,n5eseSaveIgnoredEffects:[...(config.n5eseSaveIgnoredEffects??[]),...selected],rolls:(config.rolls??[{}]).map((r,i)=>i?r:{...r,data:{...r.data,...values},options:{...r.options,advantage:!!r.options?.advantage||mode===CONFIG.Dice.D20Roll.ADV_MODE.ADVANTAGE,disadvantage:!!r.options?.disadvantage||mode===CONFIG.Dice.D20Roll.ADV_MODE.DISADVANTAGE,maximum:ability.save?.roll?.max,minimum:ability.save?.roll?.min}})};
 return original.call(this,config,dialog,message);
 };}
