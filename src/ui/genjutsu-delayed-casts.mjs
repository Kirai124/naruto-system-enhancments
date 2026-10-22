import {resolveCrestReturn} from '../foundry/genjutsu-escrow.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {DELAYED_CASTS,DELAY_MARKER} from '../casting/genjutsu-delay-state.mjs';
import {rollDelayedHostSave,confirmDelayedHost,requestDelayedRelease,releaseDelayedCast,discardDelayedCast,resolveDelayedCast} from '../foundry/genjutsu-delayed-casts.mjs';

function controls(game,actor,entry,host){
 const p=document.createElement('p');p.textContent=(entry.kind==='brain'?'Brain Worm':'Remote Trigger')+' · '+entry.host.name+' · '+entry.status+(entry.status==='stored'?' · '+Math.max(0,Math.ceil((entry.expiresAt-game.time.worldTime)/3600))+' h Speicherrest':'')+(entry.trigger?' · '+entry.trigger:'');host.append(p);
 const button=(label,fn,gm=false)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!actor.isOwner||gm&&!game.user.isGM;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=!actor.isOwner||gm&&!game.user.isGM;}});host.append(b);};
 if(entry.crest){const note=document.createElement('p');note.textContent='Crest: '+entry.crest.count+' Dice · '+entry.crest.purpose+' · '+entry.crest.state;host.append(note);if(['returning','return-review'].includes(entry.crest.state))button('GM: Crest-Rückgabe prüfen',()=>resolveCrestReturn(game,actor,entry.id),true);}
 if(entry.status==='awaiting-save'){button('GM: Speicherungssave würfeln',()=>rollDelayedHostSave(game,actor,entry.id),true);button('GM: Speicherungsergebnis bestätigen',()=>confirmDelayedHost(game,actor,entry.id),true);}
 if(entry.status==='stored'&&entry.expiresAt>game.time.worldTime)button('Auslöser und tatsächliche Ziele bestätigen',()=>requestDelayedRelease(game,actor,entry.id));
 if(entry.status==='release-pending')button('GM: bezahltes Genjutsu freigeben',()=>releaseDelayedCast(game,actor,entry.id),true);
 if(['awaiting-save','stored','release-pending'].includes(entry.status))button('Speicher verwerfen',()=>discardDelayedCast(game,actor,entry.id));
 if(['paying','releasing','review'].includes(entry.status))button('GM: unterbrochenen Vorgang prüfen',()=>resolveDelayedCast(game,actor,entry.id),true);
 if(entry.status==='released'){const hint=document.createElement('small');hint.textContent='Die ursprüngliche Chatkarte ist für die bestätigten Ziele freigegeben. Remote Trigger: zusätzliche Kreaturen zuerst CHA-Save, volle Wirkung nur bei Fehlschlag. Brain Worm: kein wiederholter Save. Tatsächliche Jutsu-Wirkung auf der Karte anwenden.';host.append(hint);}
}
export function installDelayedCastingUI(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{html.querySelector('.n5ese-genjutsu-delayed')?.remove();if(!genjutsuEnabled(game)||message.type!=='usage')return;const marker=message.getFlag(MODULE_ID,DELAY_MARKER),actor=message.getAssociatedActor();if(!marker||!actor)return;const entry=actor.getFlag(MODULE_ID,DELAYED_CASTS)?.find(e=>e.id===marker.id);if(!entry)return;const panel=document.createElement('section');panel.className='n5ese-molding-chat n5ese-genjutsu-delayed';controls(game,actor,entry,panel);html.append(panel);});
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;root?.querySelector('.n5ese-genjutsu-delayed')?.remove();if(!genjutsuEnabled(game))return;const entries=(actor.getFlag(MODULE_ID,DELAYED_CASTS)??[]).filter(e=>!['failed','discarded','resolved'].includes(e.status)||['returning','return-review'].includes(e.crest?.state)),host=root?.querySelector('section[data-tab="features"]');if(!host||!entries.length)return;const panel=document.createElement('details');panel.className='n5ese-ninjutsu-card n5ese-genjutsu-delayed';const summary=document.createElement('summary');summary.textContent='Gespeicherte Genjutsu · '+entries.length;panel.append(summary);for(const entry of entries)controls(game,actor,entry,panel);host.prepend(panel);});
 Hooks.on('updateActor',(actor,changes)=>{if(changes[path()]===undefined&&changes.flags?.[MODULE_ID]?.[DELAYED_CASTS]===undefined)return;for(const message of game.messages)if(message.type==='usage'&&message.getAssociatedActor()?.uuid===actor.uuid&&message.getFlag(MODULE_ID,DELAY_MARKER))ui.chat.updateMessage(message);});
}
function path(){return 'flags.'+MODULE_ID+'.'+DELAYED_CASTS;}
