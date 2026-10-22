import {MODULE_ID} from '../settings/register.mjs';
import {prepareGigawattMessage} from '../foundry/gigawatt-molding.mjs';
export function installGigawattDamageDisplay(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelectorAll('.n5ese-gigawatt-damage').forEach(e=>e.remove());
  if(!game.settings.get(MODULE_ID,'subclassMoldingAutomation')||!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!message.getFlag(MODULE_ID,'moldingCast')?.ids?.includes('gigawatt')||message.getFlag('n5eb','roll.type')!=='damage'||message.getFlag(MODULE_ID,'gigawattManagedByImbuement'))return;
  const panel=document.createElement('section');panel.className='n5ese-gigawatt-damage';const text=document.createElement('p');
  const bonus=message.getFlag(MODULE_ID,'gigawattDamageBonus'),state=message.getFlag(MODULE_ID,'gigawattBonusState');
  text.textContent=state==='ready'?(bonus?`Gigawatt: +${bonus.value} ${bonus.type}${bonus.critical?' (kritisch)':''} gegen Aberration/Celestial/Mutant. Wird bei der Anwendung vor Verteidigungen zum obigen Schaden addiert; übrige Ziele unverändert.`:'Gigawatt: kein ursprünglicher Schadenswürfel für einen Zusatz vorhanden.'):'Gigawatt: Zusatzwürfel wird vorbereitet oder benötigt eine Prüfung.';panel.append(text);
  if(state==='review'&&(message.isAuthor||game.user.isGM)){
   const button=document.createElement('button');button.type='button';button.textContent='Fehlgeschlagenen Gigawatt-Zusatzwurf erneut vorbereiten';button.addEventListener('click',async()=>{
    if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Gigawatt-Zusatzwurf prüfen'},content:'<p>Der vorherige Zusatzwurf ist fehlgeschlagen. Schaden auf besondere Kreaturentypen war bis zur Vorbereitung gesperrt. Nach Prüfung erneut vorbereiten?</p>',rejectClose:false}))return;
    button.disabled=true;try{await prepareGigawattMessage(game,message);}catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}
   });panel.append(button);
  }
  html.querySelector('.message-content,.card-content')?.append(panel);
 });
}
