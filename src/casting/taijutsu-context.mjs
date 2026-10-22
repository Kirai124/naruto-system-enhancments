import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from './feature-rules.mjs';
import {TAIJUTSU_CLASS,TAIJUTSU_FEATURES} from './taijutsu-sources.mjs';
export const taijutsuEnabled=game=>game.settings.get(MODULE_ID,'taijutsuClassAutomation');
export function taijutsuLevel(actor){const level=[...(actor?.items??[])].find(i=>i.type==='class'&&sourceOf(i)===TAIJUTSU_CLASS)?.system.levels;return Number.isInteger(level)&&level>=1&&level<=20?level:0;}
export function taijutsuFeature(actor,name,category){if(actor?.type!=='character'||!taijutsuLevel(actor))return null;const sources=TAIJUTSU_FEATURES.filter(f=>f.name===name&&(!category||f.category===category)&&(!f.level||f.level<=taijutsuLevel(actor)));return [...actor.items].find(i=>i.type==='feat'&&i.dependentOrigin?.active!==false&&sources.some(s=>s.source===sourceOf(i)))??null;}
export const isTaijutsu=item=>item?.type==='spell'&&(item.system.jutsu?.type==='taijutsu'||item.system.jutsu?.keywords?.has('taijutsu'));
export const martialDie=level=>level<2?0:level>=17?8:level>=9?6:4;
export const baseMartialPool=level=>level<2?0:1+Math.floor((level-2)/4);
export const unarmedDie=level=>level>=11?10:level>=6?8:6;
export const enhancedMovement=level=>level<2?0:level>=17?30:level>=13?25:level>=9?20:level>=6?15:10;
export function martialPoolMaximum(actor){const level=taijutsuLevel(actor),talent=!!taijutsuFeature(actor,'Unnatural Talent','Talent & Focus');return baseMartialPool(level)+(talent?(level>=17?3:level>=10?2:1):0);}
