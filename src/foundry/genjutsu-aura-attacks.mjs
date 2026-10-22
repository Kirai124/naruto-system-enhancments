import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {genjutsuEffects,genjutsuPayload} from '../effects/genjutsu-effects.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

const KEY='genjutsuTrueStrikeReceipts';
const stamp=game=>game.combat?.started?`${game.combat.id}:${game.combat.round}:${game.combat.turn}`:null;
function auras(game){return [...new Set([...game.actors,...(globalThis.canvas?.tokens?.placeables??[]).map(t=>t.actor)].filter(Boolean))].flatMap(actor=>genjutsuEffects(game,actor).filter(e=>genjutsuPayload(e).trueStrikeAura).map(effect=>({actor,effect})));}
/** Preserve the original d20: True Strike corrects a missed attack, not a new attack. */
async function correctAttack(game,message){
 const actor=message.getAssociatedActor?.(),roll=message.rolls?.[0];
 if(!genjutsuEnabled(game)||!actor?.isOwner||message.flags.n5eb?.roll?.type!=='attack'||message.rolls.length!==1||!Number.isFinite(roll?.total))throw Error('Ein tatsächlich verfehlter eigener Angriff mit einem ursprünglichen Wurf ist erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const turn=stamp(game),all=structuredClone(actor.getFlag(MODULE_ID,KEY)??[]);
  if(all.some(e=>e.messageId===message.id)||turn&&all.some(e=>e.turn===turn))throw Error('True Strike für diesen Angriff/Zug bereits verwendet.');
  const choices=auras(game);if(!choices.length)throw Error('Keine aktive Distant-Influence-Aura.');
  const div=document.createElement('div'),select=document.createElement('select');select.name='aura';for(const {actor:source,effect}of choices){const o=document.createElement('option');o.value=effect.uuid;o.textContent=source.name+' · +'+genjutsuPayload(effect).trueStrikeBonus;select.append(o);}div.append(select);
  const p=document.createElement('p');p.textContent='Dieser Angriff hat tatsächlich verfehlt. Du bist ein tatsächlicher Verbündeter des gewählten Wirkers und befindest dich innerhalb 20 Fuß seiner noch aktiven Aura. Einmal pro Zug; außerhalb Kampf tatsächliche Zugbegrenzung bestätigen. Der ursprüngliche d20 und sein kritisches Ergebnis bleiben bestehen.';div.append(p);
  const id=await foundry.applications.api.DialogV2.wait({window:{title:'Distant Influence · True Strike'},content:div.innerHTML,buttons:[{action:'confirm',label:'Fehlschlag, Verbündetenstatus und 20 Fuß bestätigen',callback:(_e,b)=>b.form.elements.aura.value}],rejectClose:false});if(!id)return;
  const chosen=auras(game).find(e=>e.effect.uuid===id);if(!chosen||stamp(game)!==turn)throw Error('Aura oder Zug inzwischen verändert.');
  const bonus=Number(genjutsuPayload(chosen.effect).trueStrikeBonus);if(!Number.isFinite(bonus))throw Error('Aura-Bonus nicht auslesbar.');
  const entry={id:foundry.utils.randomID(),messageId:message.id,turn,auraUuid:id,originalTotal:roll.total,bonus,total:roll.total+bonus,critical:roll.isCritical===true,status:'applying'};all.push(entry);await actor.setFlag(MODULE_ID,KEY,all);
  try{const card=await CONFIG.ChatMessage.documentClass.create({speaker:CONFIG.ChatMessage.documentClass.getSpeaker({actor}),content:`<p>True Strike: ${entry.originalTotal} + ${bonus} = <strong>${entry.total}</strong>. Ursprünglicher d20 bleibt bestehen; Treffer anhand der tatsächlichen AC prüfen.</p>`,flags:{[MODULE_ID]:{genjutsuTrueStrikeCorrection:{actorUuid:actor.uuid,...entry}}}});entry.status='applied';entry.cardId=card.id;await actor.setFlag(MODULE_ID,KEY,all);}catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,KEY,all);throw error;}
 });
}
export function installGenjutsuAuraAttacks(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{html.querySelector('.n5ese-true-strike')?.remove();if(!genjutsuEnabled(game)||message.flags.n5eb?.roll?.type!=='attack'||!message.getAssociatedActor?.()?.isOwner||!auras(game).length)return;const b=document.createElement('button');b.type='button';b.className='n5ese-true-strike';b.textContent='Verfehlt: True-Strike-Aura bestätigen';b.addEventListener('click',async()=>{b.disabled=true;try{await correctAttack(game,message);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});html.append(b);});
}
