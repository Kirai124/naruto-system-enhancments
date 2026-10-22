import {MODULE_ID} from "../settings/register.mjs";
import {sourceOf} from "../casting/feature-rules.mjs";
import {MARTIAL,TAI_CLASS} from "../casting/casting-modes.mjs";

/** Extend the native recovery update batch; never write documents from this hook. */
export function prepareMartialRecovery(game,combatant,periods,results) {
  if(!(game.settings.get(MODULE_ID,"martialPoolRecovery")||game.settings.get(MODULE_ID,"taijutsuClassAutomation")) || !periods.includes("turnStart")) return;
  const actor=combatant.actor,combat=combatant.combat;
  if(!actor || !combat?.started || combat.combatant?.id!==combatant.id) return;
  const levels=[...actor.items].find(item=>item.type==="class" && sourceOf(item)===TAI_CLASS)?.system.levels;
  if(!Number.isInteger(levels) || levels<2) return;
  const turnKey=`${combat.id}:${combat.round}:${combat.turn}:${combatant.id}`;
  for(const item of actor.items) {
    if(item.type!=="feat" || sourceOf(item)!==MARTIAL || item.dependentOrigin?.active===false) continue;
    const uses=item.system.uses;
    if(!Number.isInteger(uses?.max) || uses.max<1 || !Number.isInteger(uses.spent)) continue;
    // Native/custom profiles own their matching recovery, including partial recovery.
    if(uses.recovery?.some(profile=>periods.includes(profile.period))) continue;
    if(item.flags?.[MODULE_ID]?.martialRecoveryTurn===turnKey || results.delete.includes(item.id)) continue;
    let update=results.item.find(update=>update._id===item.id);
    if(update && (update["system.uses.spent"]!==undefined || update.system?.uses?.spent!==undefined || update["system.uses"]?.spent!==undefined)) continue;
    if(!update) {update={_id:item.id};results.item.push(update);}
    update["system.uses.spent"]=0;
    update[`flags.${MODULE_ID}.martialRecoveryTurn`]=turnKey;
  }
}
