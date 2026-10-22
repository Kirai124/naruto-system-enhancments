import {MODULE_ID} from '../settings/register.mjs';
import {installDojutsuEffects} from '../effects/dojutsu-effects.mjs';
import {renderDojutsuControls} from '../ui/dojutsu-controls.mjs';
import {refreshActorPreparation} from './actor-preparation.mjs';
const installed=new WeakSet();
export function installDojutsuIntegration(game,manager){
 if(installed.has(game))return;installed.add(game);
 installDojutsuEffects(game,CONFIG.ActiveEffect.documentClass,manager);
 const actors=()=>[...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(a=>a.actor??a)
  .filter((a,index,array)=>a.type==='character'&&a.flags?.[MODULE_ID]?.dojutsu?.instances && array.indexOf(a)===index);
 const authority=actor=>actor.isOwner && (game.users.activeGM?game.user===game.users.activeGM:true);
 const sync=actor=>{if(authority(actor))manager.reconcile(actor).catch(error=>console.error(`[${MODULE_ID}] Dojutsu reconciliation failed`,error));};
 const refresh=()=>{for(const actor of actors()){refreshActorPreparation(actor);actor.sheet?.render(false);sync(actor)}};
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>renderDojutsuControls(game,sheet,html,manager));
 Hooks.on('updateWorldTime',refresh);
 for(const hook of ['createCombat','updateCombat','deleteCombat','createCombatant','deleteCombatant'])Hooks.on(hook,refresh);
 for(const hook of ['createItem','updateItem','deleteItem'])Hooks.on(hook,item=>{
  if(item.actor?.type==='character'&&item.actor.flags?.[MODULE_ID]?.dojutsu?.instances){refreshActorPreparation(item.actor);sync(item.actor)}
 });
 game.settings.settings.get(`${MODULE_ID}.dojutsuControls`).onChange=refresh;
 refresh();
}
