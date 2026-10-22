import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {requestIllusionarySmite,resumeSmiteRequest,resolveSmitePayment,smiteWorkflow} from '../foundry/genjutsu-smite.mjs';

export function installSmiteControls(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-genjutsu-smite')?.remove();
  if(!genjutsuEnabled(game)||!message.getFlag(MODULE_ID,'genjutsuWeaponAttack'))return;
  const actor=message.getAssociatedActor();if(!actor||!ownedGenjutsuFeature(actor,'Illusionary Smite','Malleable Mirages'))return;
  const panel=document.createElement('section');panel.className='n5ese-molding-chat n5ese-genjutsu-smite';
  const button=(label,fn,enabled=actor.isOwner)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{ui.chat.updateMessage(message);b.disabled=!enabled;}});panel.append(b);};
  const workflow=smiteWorkflow(game),requests=workflow.list(actor).filter(r=>r.messageId===message.id),payments=(actor.getFlag(MODULE_ID,'genjutsuSmitePayments')??[]).filter(p=>p.messageId===message.id);
  if(!payments.length)button('Illusionary Smite – Treffer bestätigen',()=>requestIllusionarySmite(game,message));
  for(const payment of payments){
   const p=document.createElement('p');p.textContent='Illusionary Smite · '+payment.dice+'d8'+(payment.critical?' ×2 kritisch':'')+' · '+payment.chakra+' Chakra · '+payment.status+(Number.isFinite(payment.total)?' · '+payment.total+' Psychic':'');panel.append(p);
   if(['applying','paid-unrolled','review'].includes(payment.status))button('GM: Smite-Zahlung prüfen',()=>resolveSmitePayment(game,actor,payment.id),actor.isOwner&&game.user.isGM);
   if(payment.status==='paid'&&!requests.some(r=>r.ruleId===payment.id&&r.status!=='cancelled'))button('Bezahlte Smite-Zielanfrage vormerken',()=>resumeSmiteRequest(game,actor,payment.id));
  }
  for(const request of requests){
   const p=document.createElement('p');p.textContent='Smite-Zielanfrage · '+request.status;panel.append(p);
   if(request.status==='pending'){
    button('GM: Smite-Schaden anwenden',()=>workflow.apply(actor,request.id),actor.isOwner&&game.user.isGM);
    button('Zielanfrage verwerfen; keine Erstattung',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Smite-Anfrage verwerfen'},content:'<p>Nur die offene Zielanfrage verwerfen? Bereits bezahlte Chakra bleiben verbraucht.</p>',rejectClose:false}))return workflow.cancel(actor,request.id);});
   }else if(['applying','review'].includes(request.status))button('GM: Smite-Zielwirkung prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Smite-Zielwirkung prüfen'},content:'<p>Zielschaden manuell geprüft/korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))return workflow.resolve(actor,request.id);},actor.isOwner&&game.user.isGM);
  }
  html.append(panel);
 });
 Hooks.on('updateActor',(actor,changes)=>{if(!['genjutsuSmitePayments','genjutsuSmiteRequests'].some(k=>changes['flags.'+MODULE_ID+'.'+k]!==undefined||changes.flags?.[MODULE_ID]?.[k]!==undefined))return;for(const id of new Set((actor.getFlag(MODULE_ID,'genjutsuSmitePayments')??[]).map(p=>p.messageId))){const message=game.messages.get(id);if(message)ui.chat.updateMessage(message);}});
}
