import {registerClassSheetPanel} from './class-window.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {activeMoldingEffect,moldingMarker} from '../effects/molding-effects.mjs';
import {triggerRainingVortex} from '../foundry/molding-restrictions.mjs';

export function installSubclassTargetControls(game){
 const render=(sheet,html)=>{
  const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;
  root?.querySelectorAll('.n5ese-molding-targets').forEach(e=>e.remove());
  if(!root?.querySelector||!actor?.isOwner)return;
  const effects=actor.effects.filter(e=>activeMoldingEffect(game,e));if(!effects.length)return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-molding-targets';
  const heading=document.createElement('strong');heading.textContent='Aktive Unterklassen-Moldings';panel.append(heading);
  for(const effect of effects){
   const marker=moldingMarker(effect),row=document.createElement('div'),name=document.createElement('span');name.textContent=effect.name;row.append(name);
   const button=(label,operation)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',async()=>{b.disabled=true;try{await operation();}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=false;}});row.append(b);};
   if(marker.metadata.id==='raining-vortex')button('Nachfolgenden fehlgeschlagenen Save bestätigen',()=>triggerRainingVortex(game,actor,effect));
   if(game.user.isGM&&['review','applying'].includes(marker.metadata.application))button('GM: Anwendung geprüft',async()=>{
    if(await foundry.applications.api.DialogV2.confirm({window:{title:'Molding-Anwendung prüfen'},content:'<p>Vorherige Anwendung geprüft und gegebenenfalls manuell korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))await effect.setFlag(MODULE_ID,'moldingEffect',{...marker,metadata:{...marker.metadata,application:'resolved'}});
   });
   button('Beenden',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Molding-Effekt beenden'},content:'<p>Diesen verwalteten Effekt beenden? Andere Effekte bleiben erhalten.</p>',rejectClose:false}))await effect.delete();});
   panel.append(row);
  }
  (root.querySelector('section[data-tab="features"]')??root.querySelector('.window-content'))?.prepend(panel);
 };
 registerClassSheetPanel(game,'ninjutsu','.n5ese-molding-targets','Gespeicherte Zielwirkungen',render);Hooks.on('renderNPCActorSheet',render);
}
