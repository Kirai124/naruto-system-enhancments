import {sourceOf} from './feature-rules.mjs';
import {TAI_CLASS} from './casting-modes.mjs';
export const MARTIAL_TECHNIQUE='Compendium.n5eb.class.Item.S1TglFLRvVSLZHNL';
const costs=Object.freeze({d:3,c:5,b:9,a:14,s:20});
export function hasMartialTechnique(item){return item.type==='spell' && (item.system.jutsuCastingType??item.system.jutsu?.type)==='taijutsu' && !item.system.chakra?.special?.trim() && costs[item.system.rank]!==undefined && [...(item.actor?.items??[])].some(i=>i.type==='feat'&&sourceOf(i)===MARTIAL_TECHNIQUE) && [...item.actor.items].some(i=>i.type==='class'&&sourceOf(i)===TAI_CLASS&&Number.isInteger(i.system.levels)&&i.system.levels>=1);}
export function applyMartialTechnique(item,context,options,nativeCost){
 if(options?.martialTechnique===false || !hasMartialTechnique(item))return context;
 const originalBase=nativeCost(item.system,{rank:item.system.rank});
 const upcastDelta=context.baseCost-originalBase;
 if(!Number.isFinite(upcastDelta)||upcastDelta<0)return context;
 return {...context,nativeBaseCost:context.baseCost,baseCost:costs[item.system.rank]+upcastDelta,excludeCostReductions:true,martialTechnique:true};
}
