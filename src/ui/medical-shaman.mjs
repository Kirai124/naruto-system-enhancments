import {MEDICAL_FOLLOWCASTS,resolveMedicalFollowcast} from '../foundry/medical-followcasts.mjs';
import {resumeDrainingCounter} from '../foundry/medical-shaman-actions.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature} from '../casting/medical-context.mjs';
import {spiritualWeapons,spiritualWeaponAvailable,summonSpiritualWeapon,configureSpiritualWeapon,attackSpiritualWeapon,dismissSpiritualWeapon,SPIRITUAL_WEAPONS} from '../foundry/medical-spiritual-weapons.mjs';
const button=(host,label,fn,enabled)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=!enabled;}});host.append(b);};
export function installMedicalShamanUI(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{html.querySelector('.n5ese-hex-critical-note')?.remove();const record=message.getFlag(MODULE_ID,'medicalHexCritical');if(record){const p=document.createElement('p');p.className='n5ese-hex-critical-note';p.textContent='Shaman’s Hex: kritischer Treffer wurde für das bestätigte einzelne Hex-Ziel in einen normalen Treffer umgewandelt. Angriffsergebnis unverändert; Schaden normal würfeln.';html.append(p);}});
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{
  const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;root?.querySelector('.n5ese-medical-shaman')?.remove();if(!medicalEnabled(game)||!medicalFeature(actor,'Spiritual Weapons','Shaman'))return;
  const host=root?.querySelector('section[data-tab="features"]');if(!host)return;const section=document.createElement('section'),h=document.createElement('h3');section.className='n5ese-ninjutsu-card n5ese-medical-shaman';h.textContent='Shaman · Spiritual Weapons';section.append(h);
  button(section,'Spiritual Weapon · Waffenform erzeugen',()=>summonSpiritualWeapon(game,actor),actor.isOwner);
  for(const state of spiritualWeapons(actor).filter(w=>spiritualWeaponAvailable(game,actor,w))){const p=document.createElement('p');p.textContent=state.profile.name+' · '+state.ability.toUpperCase()+(state.upgrade?.status==='active'&&state.upgrade.expiresAt>game.time.worldTime?' · '+state.upgrade.properties.join(', ')+' · '+Math.ceil(state.upgrade.expiresAt-game.time.worldTime)+' s':'');section.append(p);
   button(section,'Nativer Waffenangriff',()=>attackSpiritualWeapon(game,actor,state.id),actor.isOwner);
   button(section,'Attribut / Zusatzmerkmale',()=>configureSpiritualWeapon(game,actor,state.id),actor.isOwner);
   button(section,'Diese Waffenform auflösen',()=>dismissSpiritualWeapon(game,actor,state.id),actor.isOwner);
   if(game.user.isGM&&['paying','review'].includes(state.upgrade?.status))button(section,'GM: Merkmalszahlung prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Spiritual-Weapon-Zahlung prüfen'},content:'<p>Charge manuell geprüft und gegebenenfalls korrigiert? Unklaren Merkmalsvorgang ohne weitere Zahlung schließen.</p>',rejectClose:false})){const list=spiritualWeapons(actor),current=list.find(w=>w.id===state.id);current.upgrade.status='resolved';await actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,list);}},actor.isOwner);
  }for(const entry of actor.getFlag(MODULE_ID,'medicalClinicalActions')??[])if(entry.ruleId==='medical.draining-counter'&&entry.status==='applied'&&entry.counterAttackStatus==='waiting'&&!entry.counterResolved)button(section,'Bezahlten Draining-Gegenangriff wieder öffnen',()=>resumeDrainingCounter(game,actor,entry.id),actor.isOwner);for(const entry of actor.getFlag(MODULE_ID,MEDICAL_FOLLOWCASTS)??[])if(['casting','paid','review'].includes(entry.status))button(section,'GM: Hexing-Smite-Folgecast prüfen',()=>resolveMedicalFollowcast(game,actor,entry.id),actor.isOwner&&game.user.isGM);host.prepend(section);
 });
}
