import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel} from '../casting/genjutsu-context.mjs';
import {recoverFromInceptionAttack,resolveAttackRecovery} from '../foundry/genjutsu-attack-recovery.mjs';

export function installInceptionAttackRecovery(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-genjutsu-recovery')?.remove();
  const actor=message.getAssociatedActor();if(!genjutsuEnabled(game)||!actor||genjutsuLevel(actor)<11||!message.getFlag(MODULE_ID,'genjutsuWeaponAttack')&&!message.getFlag(MODULE_ID,'genjutsuPhantasmalAttack'))return;
  const div=document.createElement('section');div.className='n5ese-genjutsu-recovery';const entries=(actor.getFlag(MODULE_ID,'genjutsuAttackRecovery')??[]).filter(e=>e.messageId===message.id);
  const button=(label,fn,enabled)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{ui.chat.updateMessage(message);}});div.append(b);};
  if(!entries.length)button('Inception – überlegenen Treffer für Actualization bestätigen',()=>recoverFromInceptionAttack(game,message),actor.isOwner);
  for(const entry of entries){const p=document.createElement('p');p.textContent='Actualization-Rückgewinnung · '+entry.status+(Number.isFinite(entry.recovered)?' · +'+entry.recovered:'');div.append(p);if(['applying','review'].includes(entry.status))button('GM: Rückgewinnung prüfen',()=>resolveAttackRecovery(game,actor,entry.id),actor.isOwner&&game.user.isGM);}
  html.append(div);
 });
 Hooks.on('updateActor',(actor,changes)=>{if(changes['flags.'+MODULE_ID+'.genjutsuAttackRecovery']===undefined&&changes.flags?.[MODULE_ID]?.genjutsuAttackRecovery===undefined)return;for(const entry of actor.getFlag(MODULE_ID,'genjutsuAttackRecovery')??[]){const message=game.messages.get(entry.messageId);if(message)ui.chat.updateMessage(message);}});
}
