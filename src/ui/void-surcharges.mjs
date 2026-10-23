import {registerClassSheetPanel} from './class-window.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {readVoidSurcharges} from '../trackers/pool-targets.mjs';
export function installVoidSurchargeControls(game){
 const render=(sheet,html)=>{
  const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;
  root?.querySelectorAll('.n5ese-void-surcharges').forEach(e=>e.remove());
  if(!root?.querySelector||!game.settings.get(MODULE_ID,'ninjutsuTrackers'))return;
  const entries=readVoidSurcharges(actor);if(!entries.length)return;
  const host=root.querySelector('section[data-tab="features"],section[data-tab="actions"]');if(!host)return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-void-surcharges';
  const title=document.createElement('strong');title.textContent='Void Shards — nächstes Jutsu';panel.append(title);
  for(const entry of entries){
   const row=document.createElement('p');row.textContent=`+${entry.amount} Chakra · Quelle ${entry.sourceActorUuid}`;
   if(game.user.isGM&&actor.isOwner){const button=document.createElement('button');button.type='button';button.textContent='GM: Zuschlag entfernen';button.addEventListener('click',async()=>{
    if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Void-Zuschlag entfernen'},content:`<p>Gespeicherten Zuschlag von ${entry.amount} Chakra entfernen?</p>`,rejectClose:false}))return;
    await game.modules.get(MODULE_ID).api.removeVoidSurcharge(actor,entry.id);sheet.render(false);
   });row.append(button);}panel.append(row);
  }
  const hint=document.createElement('small');hint.textContent='Zuschläge addieren sich nach Kostenreduktionen und Chakra Recovery. Verbrauch beim nächsten bestätigten Jutsu mit Chakra-Verbrauch; Unterhalt bleibt unverändert.';panel.append(hint);host.prepend(panel);
 };
 registerClassSheetPanel(game,'ninjutsu','.n5ese-void-surcharges','Void-Zuschläge',render);Hooks.on('renderNPCActorSheet',render);
}
