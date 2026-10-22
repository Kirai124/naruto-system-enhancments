import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,actualizationPool,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {regainActualization} from '../casting/genjutsu-resources.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

const key='genjutsuAttackRecovery';
const currentTurn=game=>game.combat?.started?{combatId:game.combat.id,round:game.combat.round,turn:game.combat.turn}:null;
function context(game,message){
 const actor=message.getAssociatedActor(),weapon=message.getFlag(MODULE_ID,'genjutsuWeaponAttack'),phantasmal=message.getFlag(MODULE_ID,'genjutsuPhantasmalAttack'),name=weapon?'Illusionary Weapon':'Phantasmal Force',feature=ownedGenjutsuFeature(actor,name,'Choose Inception');
 if(!genjutsuEnabled(game)||!actor?.isOwner||genjutsuLevel(actor)<11||!feature||!(weapon||phantasmal)||!Number.isFinite(message.rolls?.[0]?.total))throw Error('Eigener qualifizierender Inception-Angriff ab Klassenstufe 11 erforderlich.');
 return {actor,feature,name,margin:weapon?10:7,total:message.rolls[0].total};
}
export async function recoverFromInceptionAttack(game,message){
 const {actor}=context(game,message);
 return withCastingActorLock(actor,async()=>{
  const ctx=context(game,message),entries=structuredClone(actor.getFlag(MODULE_ID,key)??[]),turn=currentTurn(game);
  if(entries.some(e=>e.messageId===message.id))throw Error('Dieser Angriff wurde bereits für die Rückgewinnung bearbeitet.');
  if(entries.some(e=>['applying','review'].includes(e.status)))throw Error('Vorherige Rückgewinnung zuerst vom GM prüfen lassen.');
  const used=turn&&entries.some(e=>e.sourceItemUuid===ctx.feature.uuid&&JSON.stringify(e.turn)===JSON.stringify(turn));if(used&&!game.user.isGM)throw Error('Durch diese Inception wurde in diesem Zug bereits ein Die zurückgewonnen.');
  if(actualizationPool(actor).spent<1)throw Error('Kein verbrauchter Actualization Die vorhanden.');
  const tokens=[...game.user.targets].filter(t=>t.actor);if(tokens.length!==1)throw Error('Genau die tatsächlich angegriffene feindliche Kreatur markieren.');
  const div=document.createElement('div'),p=document.createElement('p');p.textContent=ctx.name+': tatsächlicher Angriff '+ctx.total+' gegen '+tokens[0].name+'. Um mindestens '+ctx.margin+' über der tatsächlichen AC benötigt. '+(used?'GM bestätigt eine Korrektur der Zugbegrenzung.':'Außerhalb des Kampfes die Begrenzung einmal pro Zug selbst bestätigen.');div.append(p);
  const input=document.createElement('input');input.type='number';input.name='ac';input.step='1';input.value=String(tokens[0].actor.system.attributes.ac.value);div.append(input);
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.name='confirmed';label.append(check,document.createTextNode('Ursprüngliches feindliches Ziel, tatsächliche AC und Zugbegrenzung bestätigt'));div.append(label);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Inception · Actualization zurückgewinnen'},content:div.innerHTML,buttons:[{action:'recover',label:'Einen verbrauchten Die zurückgewinnen',callback:(_e,b)=>({ac:Number(b.form.elements.ac.value),confirmed:b.form.elements.confirmed.checked})}],rejectClose:false});if(!choice)return;
  context(game,message);if(!choice.confirmed||!Number.isInteger(choice.ac)||ctx.total<choice.ac+ctx.margin||JSON.stringify(turn)!==JSON.stringify(currentTurn(game)))throw Error('Abstand zur AC nicht ausreichend, Bestätigung fehlt oder Zug inzwischen geändert.');
  const entry={id:foundry.utils.randomID(),messageId:message.id,sourceItemUuid:ctx.feature.uuid,targetUuid:tokens[0].actor.uuid,turn,total:ctx.total,ac:choice.ac,status:'applying',gmOverride:!!used};entries.push(entry);await actor.setFlag(MODULE_ID,key,entries);
  try{entry.recovered=await regainActualization(actor,1);entry.status='applied';await actor.setFlag(MODULE_ID,key,entries);}catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,key,entries);throw error;}
 });
}
export async function resolveAttackRecovery(game,actor,id){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{const entries=structuredClone(actor.getFlag(MODULE_ID,key)??[]),entry=entries.find(e=>e.id===id);if(!['applying','review'].includes(entry?.status))throw Error('Keine unterbrochene Rückgewinnung.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Rückgewinnung prüfen'},content:'<p>Actualization-Pool manuell geprüft/korrigiert? Ohne erneute Rückgewinnung abschließen.</p>',rejectClose:false})){entry.status='resolved';await actor.setFlag(MODULE_ID,key,entries);}});
}
