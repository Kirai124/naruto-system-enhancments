import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from './feature-rules.mjs';
import {MEDICAL_CLASS,MEDICAL_FEATURES} from './medical-sources.mjs';

export const medicalEnabled=game=>game.settings.get(MODULE_ID,'medicalClassAutomation');
export function medicalLevel(actor){
 const n=[...(actor?.items??[])].find(i=>i.type==='class'&&sourceOf(i)===MEDICAL_CLASS)?.system.levels;
 return Number.isInteger(n)&&n>=1&&n<=20?n:0;
}
export function medicalFeature(actor,name,category){
 if(actor?.type!=='character'||!medicalLevel(actor))return null;
 const definitions=MEDICAL_FEATURES.filter(d=>d.name===name&&(!category||d.category===category));
 return [...actor.items].find(i=>i.type==='feat'&&i.dependentOrigin?.active!==false&&definitions.some(d=>d.source===sourceOf(i)&&(!d.level||medicalLevel(actor)>=d.level)))??null;
}
export const isMedical=item=>item?.type==='spell'&&item.system.jutsu?.keywords?.has?.('medical');
export const medicalRank=item=>item?.system.effectiveRank??item?.system.rank;
export const medicalRankValue=rank=>({e:0,d:1,c:2,b:3,a:4,s:5}[rank]??0);
export function medicalAbility(actor){
 const selected=actor.getFlag(MODULE_ID,'medicalAbility');
 if(selected==='cha'&&medicalFeature(actor,'Fortifying Scripture','Spiritual Scribe'))return 'cha';
 return selected==='native'?'native':'wis';
}
export const medicalModifier=actor=>Number(actor.system.abilities[medicalAbility(actor)==='cha'?'cha':'wis'].mod);
export const ninjutsuModifier=actor=>Number(actor.system.attributes.jutsu.ninjutsu.mod);
export function medicalTurn(game){return game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:null;}
export function scalpelState(game,actor){const s=actor?.getFlag(MODULE_ID,'medicalScalpel');return s?.status==='active'&&s.expiresAt>game.time.worldTime&&!!medicalFeature(actor,'Chakra Scalpel')?s:null;}
