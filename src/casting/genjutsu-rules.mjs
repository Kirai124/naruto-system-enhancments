import {genjutsuLevel,isGenjutsu,ownedGenjutsuFeature} from './genjutsu-context.mjs';

export function classifyGenjutsuSave(total,dc,{greaterMastery=false,higherUnderstanding=false}={}){
 if(!Number.isFinite(total)||!Number.isFinite(dc))throw Error('Auswertbarer Save und SG erforderlich.');
 if(total<dc)return total<=dc-(greaterMastery?2:5)?'critical-failure':'failure';
 return total>=dc+(higherUnderstanding?10:5)?'critical-success':'success';
}
export function genjutsuMastery(actor){return {greaterMastery:!!ownedGenjutsuFeature(actor,'Greater Mastery','Master of Illusion Features'),higherUnderstanding:!!ownedGenjutsuFeature(actor,'Higher Understanding','Master of Illusion Features')};}
export function appliedGenjutsuConditions(activity){
 return new Set([...(activity?.effects??[])].flatMap(ref=>[...(ref.effect?.statuses??activity.item.effects.get(ref._id)?.statuses??[])]));
}
export function genjutsuDCBonuses(activity){
 if(!isGenjutsu(activity?.item))return [];
 const actor=activity.actor,keys=activity.item.system.jutsu.keywords,tier=1+Number(genjutsuLevel(actor)>=10)+Number(genjutsuLevel(actor)>=19),out=[];
 const add=(name,category,eligible)=>{const feature=eligible&&ownedGenjutsuFeature(actor,name,category);if(feature)out.push({id:feature.uuid,label:name,value:tier});};
 add('Creeping Thoughts','Unseen Dream',keys.has('unaware'));
 add('Alluring Words','Siren',keys.has('auditory'));
 add('Shaping Your World','Illusionist',![...activity.item.system.activities].some(a=>a.damage?.parts?.length));
 add('Enhanced Inhalant','Misty Distortionist',keys.has('inhaled'));
 add('Beguiling Presence','Beguiler',keys.has('visual'));
 add('Psychic Inscription','Distant Soul',keys.has('fuinjutsu'));
 add('Phantom Pain','Umbra Cleaver',activity.save?.ability?.size&&[...activity.item.system.activities].some(a=>a.type==='attack'));
 add('Fear Of The Unknown','Nightmare Keeper',appliedGenjutsuConditions(activity).has('frightened'));
 return out;
}

export function validateGenjutsuCast(activity,selection={}){
 if(!isGenjutsu(activity.item))throw Error('Tatsächliches Genjutsu erforderlich.');
 const damageDice=Number(selection.damageDice??0);if(!Number.isSafeInteger(damageDice)||damageDice<0)throw Error('Ungültige Actualization-Schadenswürfel.');
 const count=Number(selection.saveDice??0);if(!Number.isSafeInteger(count)||count<0||count>5)throw Error('Actualization-Save: null bis fünf Dice wählen.');
 if(count&&!Number.isFinite(activity.save?.dc?.value))throw Error('Kein auslesbarer Genjutsu-Save vorhanden.');
 const alteration=selection.alteration??'';
 if(alteration&&(!['int','wis','cha'].includes(alteration)||!ownedGenjutsuFeature(activity.actor,'Actualized Alteration','Real World Conversions')||!activity.save?.ability?.size))throw Error('Actualized Alteration nicht verfügbar.');
 const perfection=selection.perfection??'';
 if(perfection&&(!/^(damage|healing|utility):\d+$/.test(perfection)||!ownedGenjutsuFeature(activity.actor,'Actualized Perfection','Real World Conversions')||!['e','d','c'].includes(selection.rank??activity.item.system.effectiveRank)))throw Error('Actualized Perfection verlangt ein berechtigtes E-/D-/C-Rang-Jutsu.');
 const power=!!selection.power;if(power&&(!ownedGenjutsuFeature(activity.actor,'Actualized Power','Real World Conversions')||!appliedGenjutsuConditions(activity).size))throw Error('Actualized Power benötigt einen strukturierten Condition-Effekt dieses Genjutsu.');
 const prestige=!!selection.prestige;if(prestige&&(!ownedGenjutsuFeature(activity.actor,'The Prestige')||!activity.save?.ability?.size))throw Error('The Prestige benötigt das Feature und ein Genjutsu mit Save.');
 return {power,prestige,damageDice,saveDice:count,alteration,perfection,totalDice:damageDice+count+Number(!!alteration)+Number(!!perfection)+Number(power)};
}
