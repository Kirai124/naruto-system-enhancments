import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature,isTaijutsu} from '../casting/taijutsu-context.mjs';
import {beginDisturbance,disturbanceAttack,endDisturbance,disturbanceEntries,disturbanceFeature} from '../foundry/taijutsu-disturbance.mjs';
import {beginBarrage,resumeBarrageTargets,disturbanceWorkflow,requestDisturbanceTargets} from '../foundry/taijutsu-disturbance-targets.mjs';
const button=(host,label,fn,enabled=true)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=!enabled;}});host.append(b);};
export function installDisturbanceUI(game){
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{
  const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;root?.querySelector('.n5ese-disturbance')?.remove();if(!taijutsuEnabled(game)||!['shatter','core','flurry','reflexes','barrage'].some(k=>disturbanceFeature(actor,k)))return;const host=root?.querySelector('section[data-tab="features"]');if(!host)return;
  const panel=document.createElement('details');panel.className='n5ese-ninjutsu-card n5ese-disturbance';const summary=document.createElement('summary');summary.textContent='Disturbance · Techniken und gespeicherte Vorgänge';panel.append(summary);
  for(const [kind,label]of [['shatter','Shatter · Jutsu-Versuch unterbrechen'],['core','Unstable Core · zwei unbewaffnete Angriffe'],['flurry','Disturbance Flurry · zusätzliche Bonusaktion'],['reflexes','Unmatched Reflexes · zusätzliche Taijutsu-Reaktion']])if(disturbanceFeature(actor,kind))button(panel,label,()=>beginDisturbance(game,actor,kind),actor.isOwner);
  if(disturbanceFeature(actor,'barrage'))button(panel,'Debilitating Barrage · zwei abgewickelte Treffer bestätigen',()=>beginBarrage(game,actor),actor.isOwner);
  if(taijutsuFeature(actor,'Disturbing Endurance','Disturbance')){const p=document.createElement('p');p.textContent='Disturbing Endurance: tatsächliche Disturbance-Preise über1 Martial Die automatisch um1 reduziert.';panel.append(p);}
  if(taijutsuFeature(actor,'Untouchable','Disturbance')){const p=document.createElement('p');p.textContent='Untouchable: keine Gelegenheitsangriffe gegen dich; bestätigte tatsächlich bezahlte Reaktionsangriffe mit Nachteil. Aktionen/Reaktionen weiterhin manuell.';panel.append(p);}
  for(const e of disturbanceEntries(actor)){
   if(['ended','cancelled'].includes(e.status))continue;const p=document.createElement('p');p.textContent=e.name+' · '+(e.mode??e.kind)+' · '+e.cost+' Martial Dice · '+e.status+(e.maxAttacks?' · '+e.attacks.filter(a=>a.status==='rolled').length+'/'+e.maxAttacks+' Angriffe gewürfelt':'');panel.append(p);
   if(e.status==='active'&&e.maxAttacks&&e.attacks.filter(a=>a.status==='rolled').length<e.maxAttacks)button(panel,'Bezahlten ursprünglichen Unarmed-Angriff ausführen',()=>disturbanceAttack(game,actor,e.id),actor.isOwner&&!e.attackPending);
   if(e.status==='active'&&['core','shatter'].includes(e.kind)&&e.attacks.filter(a=>a.status==='rolled').length===2&&!e.targetStatus&&!disturbanceWorkflow(game).list(actor).some(r=>r.ruleId===e.id&&r.status!=='cancelled'))button(panel,'Tatsächliche Treffer und Zielwirkung bestätigen',()=>requestDisturbanceTargets(game,actor,e.id),actor.isOwner);
   if(e.kind==='barrage'&&e.status==='paid'&&!e.targetStatus&&!disturbanceWorkflow(game).list(actor).some(r=>r.ruleId===e.id&&r.status!=='cancelled'))button(panel,'Bezahlte Barrage-Zielanfrage fortsetzen',()=>resumeBarrageTargets(game,actor,e.id),actor.isOwner);
   button(panel,'Ablauf beenden / GM: Unterbrechung prüfen',()=>endDisturbance(game,actor,e.id),actor.isOwner);
  }
  for(const r of disturbanceWorkflow(game).list(actor)){
   if(['applied','resolved','cancelled'].includes(r.status))continue;const p=document.createElement('p');p.textContent='Zielanfrage · '+r.targets.map(t=>t.name).join(', ')+' · '+r.status;panel.append(p);
   if(r.status==='pending'){button(panel,'GM: gespeicherte Saves und Zielwirkung anwenden',()=>disturbanceWorkflow(game).apply(actor,r.id),actor.isOwner&&game.user.isGM);button(panel,'Offene Zielanfrage verwerfen',()=>disturbanceWorkflow(game).cancel(actor,r.id),actor.isOwner);}
   else button(panel,'GM: Teilvorgang nach manueller Prüfung schließen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Disturbance-Zielanwendung prüfen'},content:'<p>Alle gespeicherten Saves, bereits angewendeten Effekte, ursprüngliche Konzentration und Chakra-Zahlungen manuell geprüft/korrigiert? Ohne Wiederholung schließen.</p>',rejectClose:false}))await disturbanceWorkflow(game).resolve(actor,r.id);},actor.isOwner&&game.user.isGM);
  }
  host.prepend(panel);
 });
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-disturbance-chat')?.remove();if(!taijutsuEnabled(game))return;const actor=message.getAssociatedActor?.();if(!actor)return;const section=document.createElement('section');section.className='n5ese-molding-chat n5ese-disturbance-chat';let added=false;
  if(message.type==='usage'&&isTaijutsu(message.getAssociatedItem?.())&&disturbanceFeature(actor,'core')){button(section,'Unstable Core · tatsächlichen vorherigen Aktions-Cast bestätigen',()=>beginDisturbance(game,actor,'core'),actor.isOwner);added=true;}
  if(message.getFlag('n5eb','roll.type')==='attack'&&disturbanceFeature(actor,'barrage')){button(section,'Barrage · zwei Treffer derselben Aktion und abgewickelten Schaden bestätigen',()=>beginBarrage(game,actor),actor.isOwner);added=true;}
  const group=message.getAssociatedItem?.()?.getFlag(MODULE_ID,'taijutsuDisturbanceGroup');if(group){const e=disturbanceEntries(actor).find(e=>e.id===group.id);if(e){const p=document.createElement('p');p.textContent=e.name+' · bezahlter Angriff '+(group.index+1)+' · Ressourcen bereits bezahlt. Originalschaden über den nativen Schadenswurf, einschließlich gespeicherter Zusatzwürfel, einmal anwenden.';section.append(p);if(['core','shatter'].includes(e.kind)&&['active','ended'].includes(e.status)&&e.attacks.filter(a=>a.status==='rolled').length===2&&!e.targetStatus&&!disturbanceWorkflow(game).list(actor).some(r=>r.ruleId===e.id&&r.status!=='cancelled'))button(section,'Zwei Angriffe abgeschlossen · tatsächliche Treffer/Zielwirkung bestätigen',()=>requestDisturbanceTargets(game,actor,e.id),actor.isOwner);added=true;}}
  if(added)html.append(section);
 });
}
