import {withCastingActorLock} from './mode-adapter.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {activeMedicalHexes,medicalHexActive} from './medical-hex.mjs';
import {activeNinjutsuEffect,ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {spiritualWeapons,spiritualWeaponAvailable,attackSpiritualWeapon} from './medical-spiritual-weapons.mjs';
import {applyMedicalHealing} from './medical-healing.mjs';

export function deadMedicalHex(game,source){return activeMedicalHexes(game,source).find(e=>e.parent.system.attributes.hp.value<=0);}
export function validateHexDeath(game,source,reference){
 const effect=reference&&fromUuidSync(reference.effectUuid);
 if(!effect||!activeNinjutsuEffect(game,effect)||!medicalHexActive(game,effect)||ninjutsuEffect(effect).sourceActorUuid!==source.uuid||effect.parent.uuid!==reference.targetUuid||effect.parent.system.attributes.hp.value>0)throw Error('Ursprüngliche tote Hex-Kreatur nicht mehr verfügbar.');
 return effect;
}
export function addShamanActionFields(game,source,rule,hexDeath,host){
 const list=rule.battleDeath?[...fromUuidSync(hexDeath.targetUuid).items].filter(i=>i.type==='weapon').flatMap(item=>[...item.system.activities].filter(a=>a.type==='attack').map(a=>({id:item.id+'|'+a.id,name:item.name+' · '+a.name}))):rule.counterAttack?spiritualWeapons(source).filter(w=>spiritualWeaponAvailable(game,source,w)).map(w=>({id:w.id,name:w.profile.name})):[];
 if(rule.criticalGuard){const select=document.createElement('select');select.name='criticalAttack';for(const message of game.messages.filter(m=>m.isContentVisible&&m.getFlag('n5eb','roll.type')==='attack'&&m.rolls.length===1&&m.rolls[0].isCritical)){const o=document.createElement('option');o.value=message.id;o.textContent=(message.getAssociatedActor?.()?.name??'Angreifer')+' · '+(message.getAssociatedItem?.()?.name??message.id);select.append(o);}if(!select.options.length)throw Error('Sichtbare ursprüngliche kritische Angriffskarte erforderlich.');host.append(select);}
 if(rule.battleDeath||rule.counterAttack){if(!list.length)throw Error('Passendes tatsächlich vorhandenes Waffenprofil erforderlich.');const select=document.createElement('select');select.name='shamanWeapon';for(const choice of list){const o=document.createElement('option');o.value=choice.id;o.textContent=choice.name;select.append(o);}host.append(select);}
}
export async function applyHexDeath(game,source,target,entry,rule,plan){
 const effect=validateHexDeath(game,source,entry.hexDeath);if(!effect.parent.isOwner)throw Error('Der GM muss die fremde Hex beenden.');
 if(rule.battleDeath){
  if(target.uuid!==effect.parent.uuid)throw Error('Nur die ursprüngliche tote Kreatur kommandieren.');
  const [itemId,activityId]=String(entry.shamanWeapon).split('|'),item=target.items.get(itemId),activity=item?.system.activities.get(activityId);
  if(item?.type!=='weapon'||activity?.type!=='attack')throw Error('Ursprünglicher Waffenangriff fehlt.');
  const rolls=await activity.rollAttack({}, {configure:true},{data:{flags:{[MODULE_ID]:{medicalBattleHex:{sourceActorUuid:source.uuid,entryId:entry.id}}}}});
  if(!rolls?.length)return {attackCancelled:true,hexConsumed:false};
  await effect.delete();return {attackRolled:true,hexConsumed:true};
 }
 await effect.delete();const receipt=await applyMedicalHealing(target,plan.amount,{n5eseMedicalRequest:entry.id});return {hexConsumed:true,receipt};
}
export async function applyDrainingCounter(game,source,entry){
 if(source.system.attributes.hp.value>0)throw Error('Draining-Hexes-Gegenangriff erfordert den bestätigten Fall auf 0 HP durch einen Nahkampfangriff.');
 const rolls=await attackSpiritualWeapon(game,source,entry.shamanWeapon,{counterId:entry.id});const entries=structuredClone(source.getFlag(MODULE_ID,'medicalClinicalActions')??[]),current=entries.find(e=>e.id===entry.id);if(current){current.counterAttackStatus=rolls?.length?'rolled':'waiting';await source.setFlag(MODULE_ID,'medicalClinicalActions',entries);}return rolls;
}

export async function resumeDrainingCounter(game,source,id){if(!source.isOwner)throw Error('Eigentümer erforderlich.');return withCastingActorLock(source,async()=>{const entry=(source.getFlag(MODULE_ID,'medicalClinicalActions')??[]).find(e=>e.id===id);if(entry?.ruleId!=='medical.draining-counter'||entry.status!=='applied'||entry.counterAttackStatus!=='waiting'||entry.counterResolved)throw Error('Kein bezahlter abgebrochener Gegenangriff verfügbar.');return applyDrainingCounter(game,source,entry);});}

export function validateHexCritical(game,source,target,entry){const effect=activeMedicalHexes(game,source).find(e=>e.parent.uuid===target.uuid),message=game.messages.get(entry.criticalAttack);if(!effect||!message?.isContentVisible||message.getFlag('n5eb','roll.type')!=='attack'||message.rolls.length!==1||!message.rolls[0].isCritical||message.getFlag(MODULE_ID,'medicalHexCritical'))throw Error('Aktive eigene Hex und unveränderter ursprünglicher kritischer Angriff erforderlich.');const targets=message.getFlag('n5eb','targets')??[];if(targets.length>1||targets.length===1&&(fromUuidSync(targets[0].uuid)?.actor?.uuid??targets[0].uuid)!==target.uuid)throw Error('Nur eindeutig auf diese Hex-Kreatur gerichtete einzelne Angriffe werden automatisch konvertiert.');return message;}
export async function applyHexCritical(game,source,target,entry){const message=validateHexCritical(game,source,target,entry);if(!message.isOwner)throw Error('Der GM muss die fremde Angriffskarte bearbeiten.');const original=message.rolls[0].toJSON(),roll=Roll.fromJSON(original);roll.options.criticalSuccess=21;roll.options.n5eseCriticalFaces=[];roll.d20.options.criticalSuccess=21;await message.update({rolls:[roll.toJSON()],['flags.'+MODULE_ID+'.medicalHexCritical']:{sourceActorUuid:source.uuid,targetUuid:target.uuid,entryId:entry.id,originalRoll:original}});return {criticalConverted:true,attackId:message.id};}
