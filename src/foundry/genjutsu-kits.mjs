import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {MISTY_KIT_STATE,eligibleMistyKit,activeMistyKit,rollMistyCharges,mistyKitCharges,combatTurnKey} from '../casting/genjutsu-kits.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export async function infuseMistyKit(game,actor){
 if(!genjutsuEnabled(game)||!actor?.isOwner||!ownedGenjutsuFeature(actor,'Physical Imitations','Misty Distortionist'))throw Error('Physical Imitations und eigener Charakter erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const state=actor.getFlag(MODULE_ID,MISTY_KIT_STATE),retired=state?.retiredItemIds??[],items=[...actor.items].filter(i=>eligibleMistyKit(i)&&!retired.includes(i.id));if(!items.length)throw Error('Ein vorhandenes Alchemist Kit oder Poison Kit ist erforderlich.');
  const content=document.createElement('div'),select=document.createElement('select');select.name='kit';for(const item of items){const o=document.createElement('option');o.value=item.id;o.textContent=item.name;select.append(o);}content.append(select);
  const note=document.createElement('p');note.textContent='Bestätige eine tatsächlich abgeschlossene Stunde Chakra-Infusion, auch während einer Rast möglich. Das gewählte Kit startet mit d8. Beim Wechsel auf ein anderes Kit wird das vorherige laut Feature vollständig unbrauchbar.';content.append(note);
  const id=await foundry.applications.api.DialogV2.wait({window:{title:'Misty Kit infundieren'},content:content.innerHTML,buttons:[{action:'infuse',label:'Abgeschlossene Infusion bestätigen',callback:(_e,b)=>b.form.elements.kit.value}],rejectClose:false});if(!id)return;
  if(!items.some(i=>i.id===id))throw Error('Kit nicht mehr verfügbar.');
  await actor.setFlag(MODULE_ID,MISTY_KIT_STATE,{itemId:id,die:8,infusedAt:game.time.worldTime,retiredItemIds:[...new Set([...retired,...(state?.itemId&&state.itemId!==id?[state.itemId]:[])])]});
 });
}

/** Only called after the native confirmed-cast validation. The native actor batch commits kit and Chakra together. */
export async function appendMistyKitSpend(game,activity,config,updates){
 if(!config.n5ese?.genjutsu?.physicalImitations)return;
 const state=activeMistyKit(activity.actor),record=activity.item.getFlag(MODULE_ID,'genjutsuCast');if(!state||!record)throw Error('Infundiertes verfügbares Misty Kit fehlt.');
 if(!(config.consume===true||config.consume?.chakra===true)||config.cause)throw Error('Misty Kit verlangt einen bestätigten normalen Cast.');
 const turn=combatTurnKey(game);if(turn&&state.lastPhysicalTurn===turn){if(!game.user.isGM)throw Error('Physical Imitations in diesem Zug bereits verwendet; GM-Korrektur erforderlich.');if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Physical Imitations · GM-Korrektur'},content:'<p>Bereits in diesem Zug verwendet. Bestätigte GM-Korrektur trotzdem ausführen?</p>',rejectClose:false}))throw Error('GM-Korrektur abgebrochen.');}
 const result=await rollMistyCharges(state,mistyKitCharges(record.rank),async die=>{const roll=await new Roll('1d'+die).evaluate();return {total:roll.total,roll:roll.toJSON()};});
 const path='flags.'+MODULE_ID+'.'+MISTY_KIT_STATE;if(updates.actor[path]!==undefined)throw Error('Konkurrierender Misty-Kit-Verbrauch.');
 updates.actor[path]={...state,die:result.die,lastPhysicalTurn:turn,lastCastId:record.id};
 // Keep all degradation results on the actual cast; reopening the chat does not roll again.
 activity.item.updateSource({['flags.'+MODULE_ID+'.genjutsuCast.mistyKit']:{itemId:state.itemId,before:state.die,...result}});
}

export function installMistyKitRestrictions(game){
 Hooks.on('dnd5e.preUseActivity',activity=>{if(!genjutsuEnabled(game))return;const retired=activity.actor?.getFlag(MODULE_ID,MISTY_KIT_STATE)?.retiredItemIds;if(retired?.includes(activity.item.id)){ui.notifications.warn('Dieses ehemalige Misty Kit ist laut Physical Imitations unbrauchbar.');return false;}});
}
