import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
const KEY='taijutsuMatrixFreedom';
/** One explicitly confirmed shared allowance. Never grants either prerequisite feature. */
export function matrixFreedom(game,actor){
 const state=actor.getFlag(MODULE_ID,KEY)??{spent:0,restId:null};
 const max=taijutsuEnabled(game)&&taijutsuFeature(actor,'Freedom from the Machine','Matrix')?Math.max(0,actor.system.abilities.wis.mod):0;
 if(!Number.isSafeInteger(state.spent)||state.spent<0)throw Error('Matrix-Vorrat vom GM prüfen lassen.');
 return {max,spent:state.spent,remaining:Math.max(0,max-state.spent),restId:state.restId??null};
}
/** Called inside the caller's actor lock and persistent payment journal. */
export async function spendMatrixFreedom(game,actor,expected){
 const current=matrixFreedom(game,actor);
 if(!actor.isOwner||current.remaining<1||current.spent!==expected.spent||current.restId!==expected.restId)throw Error('Kostenlose Matrix-Nutzung inzwischen verändert; gespeicherten Vorgang prüfen.');
 await actor.setFlag(MODULE_ID,KEY,{spent:current.spent+1,restId:current.restId});
}
export function installMatrixFreedom(game){
 Hooks.on('dnd5e.restCompleted',async(actor,result,config)=>{
  if(!taijutsuEnabled(game)||!actor.isOwner||!['long','full'].includes(config?.type)||!taijutsuFeature(actor,'Freedom from the Machine','Matrix'))return;
  // The initiating user writes once; older events without an initiator use the active GM.
  if(result?.userId?result.userId!==game.user.id:game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;
  await actor.setFlag(MODULE_ID,KEY,{spent:0,restId:foundry.utils.randomID()});
 });
}
