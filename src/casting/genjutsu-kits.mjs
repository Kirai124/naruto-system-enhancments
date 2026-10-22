import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from './feature-rules.mjs';
import {ownedGenjutsuFeature} from './genjutsu-context.mjs';

export const MISTY_KIT_STATE='genjutsuMistyKit';
export const mistyDice=[8,6,4,1,0];
export function mistyKitCharges(rank){const count={d:1,c:1,b:2,a:2,s:3}[rank];if(!count)throw Error('Physical Imitations nennt nur D- bis S-Rang.');return count;}
export function eligibleMistyKit(item){return item?.type==='tool'&&(item.system.quantity??1)>0&&(['alchemistKit','poisonKit'].includes(item.system.type?.baseItem)||['Compendium.n5eb.items.Item.D6VMeGBiJcYRWzMv','Compendium.n5eb.items.Item.KCfr0NyRpCPclJeT'].includes(sourceOf(item)));}
export function activeMistyKit(actor){
 const state=actor?.getFlag(MODULE_ID,MISTY_KIT_STATE);if(!ownedGenjutsuFeature(actor,'Physical Imitations','Misty Distortionist')||!state||!eligibleMistyKit(actor.items.get(state.itemId))||!mistyDice.includes(state.die)||!state.die)return null;
 return state;
}
/** One roll per charge, using the just-degraded die. An accepted use finishes even if the kit empties. */
export async function rollMistyCharges(state,count,roll){
 if(!Number.isSafeInteger(count)||count<1||count>3||!mistyDice.includes(state.die)||!state.die)throw Error('Ungültiger Misty-Kit-Verbrauch.');
 let die=state.die;const rolls=[];
 for(let charge=0;charge<count&&die>0;charge++){
  const result=die===1?{total:1}:await roll(die);if(!Number.isInteger(result.total)||result.total<1||result.total>die)throw Error('Ungültiges Misty-Kit-Würfelergebnis.');
  const before=die;if(result.total<=2)die=mistyDice[mistyDice.indexOf(die)+1];rolls.push({charge:charge+1,die:before,total:result.total,roll:result.roll,after:die});
 }
 return {die,rolls,charges:count};
}
export const combatTurnKey=game=>game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:null;
