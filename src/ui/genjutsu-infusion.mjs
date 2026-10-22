import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {illusionaryWeapons} from '../foundry/genjutsu-weapons.mjs';
import {infusionHit,releaseWeaponInfusion,INFUSION_HITS} from '../foundry/genjutsu-weapon-casting.mjs';
import {infusionWorkflow,requestInfusionEffect} from '../foundry/genjutsu-infusion-targets.mjs';

export function installInfusionControls(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-genjutsu-infusion')?.remove();if(!genjutsuEnabled(game))return;
  const actor=message.getAssociatedActor(),data=message.getFlag(MODULE_ID,'genjutsuWeaponCasting'),attack=message.getFlag(MODULE_ID,'genjutsuWeaponAttack');if(!actor||!data&&!attack)return;
  const div=document.createElement('section');div.className='n5ese-molding-chat n5ese-genjutsu-infusion';
  const button=(label,fn,enabled=actor.isOwner)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{ui.chat.updateMessage(message);}});div.append(b);};
  if(attack){const weapon=illusionaryWeapons(actor).find(w=>w.id===attack.instanceId);if(weapon?.infusion)button('Gespeichertes Genjutsu – Treffer auf ein Ziel bestätigen',()=>releaseWeaponInfusion(game,message));}
  if(data&&!data.infusion){const p=document.createElement('p');p.textContent='Illusionary Bukijutsu · '+data.ability.toUpperCase()+' für Angriff, Attributschaden und berechneten SG';div.append(p);}
  if(data?.infusion){
   const hit=infusionHit(game,message),p=document.createElement('p');p.textContent=hit?'Infusion durch Treffer freigegeben · '+hit.targetUuid:'In Waffenform gespeichert · noch kein bestätigter Treffer';div.append(p);
   for(const b of html.querySelectorAll('[data-action="rollAttack"]')){b.disabled=true;b.title='Stattdessen den Treffer mit der Illusionary Weapon bestätigen.';}
   if(!hit){for(const b of html.querySelectorAll('[data-action="rollSave"],[data-action="rollDamage"],.n5ese-genjutsu-chat button'))b.disabled=true;}
   if(hit){for(const ref of message.getAssociatedActivity()?.effects??[]){const effect=ref.effect??message.getAssociatedItem().effects.get(ref._id);if(effect)button('Infusion: '+effect.name+' gemäß Ergebnis vormerken',()=>requestInfusionEffect(game,message,effect.id));}}
   const manager=infusionWorkflow(game);for(const request of manager.list(actor).filter(r=>r.messageId===message.id)){
    const p=document.createElement('p');p.textContent='Infusionswirkung · '+request.ruleId+' · '+request.status;div.append(p);
    if(request.status==='pending'){
     button('GM: Infusionswirkung anwenden',()=>manager.apply(actor,request.id),actor.isOwner&&game.user.isGM);
     button('Offene Infusionswirkung verwerfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Infusionswirkung verwerfen'},content:'<p>Offene Effektanfrage verwerfen? Keine Rückerstattung des bereits gewirkten Genjutsu.</p>',rejectClose:false}))return manager.cancel(actor,request.id);});
    }else if(['applying','review'].includes(request.status))button('GM: Infusionswirkung prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Infusionswirkung prüfen'},content:'<p>Zieleffekte manuell geprüft/korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))return manager.resolve(actor,request.id);},actor.isOwner&&game.user.isGM);
   }
  }
  if(div.childElementCount)html.append(div);
 });
 Hooks.on('updateActor',(actor,changes)=>{if(![INFUSION_HITS,'genjutsuInfusionRequests','genjutsuIllusionaryWeapons'].some(k=>changes['flags.'+MODULE_ID+'.'+k]!==undefined||changes.flags?.[MODULE_ID]?.[k]!==undefined))return;const ids=new Set([...(actor.getFlag(MODULE_ID,INFUSION_HITS)??[]).flatMap(h=>[h.castMessageId,h.attackMessageId]),...(actor.getFlag(MODULE_ID,'genjutsuInfusionRequests')??[]).map(r=>r.messageId)]);for(const id of ids){const message=game.messages.get(id);if(message)ui.chat.updateMessage(message);}});
}
