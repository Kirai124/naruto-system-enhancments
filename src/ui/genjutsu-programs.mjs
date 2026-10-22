import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {PROGRAMS,registerProgram,castProgram,endProgram,resolveProgram} from '../foundry/genjutsu-programs.mjs';

function button(host,label,actor,fn,gm=false){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!actor.isOwner||gm&&!game.user.isGM;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=!actor.isOwner||gm&&!game.user.isGM;}});host.append(b);}
function controls(game,actor,entry,host){
 const text=document.createElement('p');text.textContent=entry.name+' · '+entry.status+' · '+entry.trigger;host.append(text);
 if(entry.status==='ready'){const remaining=Number.isFinite(entry.lastCastAt)?Math.max(0,Math.ceil(entry.lastCastAt+60-game.time.worldTime)):0;button(host,remaining?'Minutensperre: '+remaining+' s':'Programm auslösen · normale Chakra-Kosten',actor,()=>castProgram(game,actor,entry.id));button(host,'Illusion beschädigt / Programm beenden',actor,()=>endProgram(game,actor,entry.id));}
 if(['casting','paid','review'].includes(entry.status))button(host,'GM: unterbrochenen Cast prüfen',actor,()=>resolveProgram(game,actor,entry.id),true);
}
export function installGenjutsuProgramsUI(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-genjutsu-program')?.remove();if(!genjutsuEnabled(game)||message.type!=='usage'||message.getFlag(MODULE_ID,'genjutsuMirageCast')?.name!=='Signature Work')return;const actor=message.getAssociatedActor();if(!actor)return;
  const panel=document.createElement('section');panel.className='n5ese-molding-chat n5ese-genjutsu-program';const entry=actor.getFlag(MODULE_ID,PROGRAMS)?.find(e=>e.messageId===message.id);if(entry)controls(game,actor,entry,panel);else if(message.system.deltas!==null)button(panel,'Signature Work · Genjutsu-Programm speichern',actor,()=>registerProgram(game,actor,message.id));html.append(panel);
 });
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{
  const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;root?.querySelector('.n5ese-genjutsu-program')?.remove();if(!genjutsuEnabled(game))return;const entries=(actor.getFlag(MODULE_ID,PROGRAMS)??[]).filter(e=>e.status!=='ended'),host=root?.querySelector('section[data-tab="features"]');if(!host||!entries.length)return;const panel=document.createElement('details');panel.className='n5ese-ninjutsu-card n5ese-genjutsu-program';const summary=document.createElement('summary');summary.textContent='Signature Work · '+entries.length+' Illusionsprogramme';panel.append(summary);for(const entry of entries)controls(game,actor,entry,panel);host.prepend(panel);
 });
 Hooks.on('updateActor',(actor,changes)=>{if(changes['flags.'+MODULE_ID+'.'+PROGRAMS]===undefined&&changes.flags?.[MODULE_ID]?.[PROGRAMS]===undefined)return;for(const message of game.messages)if(message.getAssociatedActor?.()?.uuid===actor.uuid&&message.getFlag(MODULE_ID,'genjutsuMirageCast')?.name==='Signature Work')ui.chat.updateMessage(message);});
}
