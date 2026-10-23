import {registerClassSheetPanel} from './class-window.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {readPendingCastingCosts,activePendingCastingCosts} from '../casting/pending-costs.mjs';
import {withCastingActorLock} from '../foundry/mode-adapter.mjs';

/** Expired entries stay visible for review but are never charged again. */
export function installGenjutsuPendingCosts(game){
 const render=(sheet,html)=>{
  const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;
  root?.querySelector('.n5ese-genjutsu-costs')?.remove();if(!genjutsuEnabled(game))return;
  const entries=readPendingCastingCosts(actor),host=root?.querySelector('section[data-tab="features"],section[data-tab="actions"]');if(!entries.length||!host)return;
  const active=new Set(activePendingCastingCosts(game,actor).map(e=>e.id)),card=document.createElement('section');card.className='n5ese-ninjutsu-card n5ese-genjutsu-costs';
  const title=document.createElement('strong');title.textContent='Chakra Disruption · nächstes Jutsu';card.append(title);
  for(const entry of entries){
   const row=document.createElement('p');row.textContent='+'+entry.amount+' Chakra · '+(active.has(entry.id)?'offen':'abgelaufen')+' · '+entry.sourceActorUuid;
   if(game.user.isGM&&actor.isOwner){const b=document.createElement('button');b.type='button';b.textContent='GM: entfernen';b.addEventListener('click',async()=>{b.disabled=true;try{
    if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Disruption-Zuschlag entfernen'},content:'<p>Diesen gespeicherten Zuschlag ohne Chakra-Verbrauch entfernen?</p>',rejectClose:false}))return;
    await withCastingActorLock(actor,()=>actor.setFlag(MODULE_ID,'pendingCastingCosts',readPendingCastingCosts(actor).filter(e=>e.id!==entry.id)));sheet.render(false);
   }catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});row.append(b);}card.append(row);
  }
  const note=document.createElement('small');note.textContent='Aktive Zuschläge addieren sich ganz am Ende. Außerhalb des Kampfes oder nach geänderter Initiative beendet der GM sie manuell. Unterhalt bleibt unverändert.';card.append(note);host.prepend(card);
 };
 registerClassSheetPanel(game,'genjutsu','.n5ese-genjutsu-costs','Gespeicherte Kostenzuschläge',render);Hooks.on('renderNPCActorSheet',render);
 for(const hook of ['updateWorldTime','updateCombat','deleteCombat'])Hooks.on(hook,()=>{if(!genjutsuEnabled(game))return;for(const actor of new Set([...game.actors,...(globalThis.canvas?.tokens?.placeables??[]).map(t=>t.actor)].filter(Boolean)))if(actor.getFlag(MODULE_ID,'pendingCastingCosts')?.length)actor.sheet?.render(false);});
}
