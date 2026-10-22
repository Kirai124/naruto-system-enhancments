import {genjutsuEffects,genjutsuPayload} from '../effects/genjutsu-effects.mjs';
import {genjutsuEnabled} from './genjutsu-context.mjs';
/** Shift effect thresholds, never the save-failure bands or the two-fracture rank progression. */
export function fractureState(game,actor){
 if(!game||!actor||!genjutsuEnabled(game))return {costMultiplier:1,concentrationCap:null};
 const states=genjutsuEffects(game,actor).map(e=>genjutsuPayload(e)).filter(p=>Number.isSafeInteger(p.fractures)&&p.fractures>=0),blocked=[];let costMultiplier=1,concentrationCap=null;
 for(const p of states){const effective=p.fractures+(p.fractureThresholdShift??0);if(p.fractures<=0)continue;if(effective>=7)costMultiplier=2;if(effective>=3)concentrationCap=1;for(const [threshold,rank]of [[2,'a'],[4,'b'],[6,'c'],[8,'d']])if(effective>=threshold)blocked.push(rank);}
 const order=['d','c','b','a','s'],lowest=blocked.sort((a,b)=>order.indexOf(a)-order.indexOf(b))[0];return {costMultiplier,concentrationCap,blockedRank:lowest,handseals:states.some(p=>p.fractures>0&&p.fractures+(p.fractureThresholdShift??0)>=9)};
}
export const fractureGain=(total,dc)=>total>=dc?0:Math.min(4,Math.floor((dc-total)/5)+1);
