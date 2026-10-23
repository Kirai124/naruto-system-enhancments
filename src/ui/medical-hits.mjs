import {registerMedicalPanel} from './medical-window.mjs';
import {installMedicalWeaponDamageUI} from './medical-weapon-damage.mjs';
import {unarmedMedicalHit} from '../foundry/medical-combat.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalLevel} from '../casting/medical-context.mjs';
import {medicalSpiritualHit,MEDICAL_HITS,medicalMeleeHit,medicalBlackHit,medicalFuujutsuHit,medicalHitWorkflow,requestMedicalScalpelHit,resumeMedicalHit,resolveMedicalHit} from '../foundry/medical-hits.mjs';
const button=(host,label,fn,enabled)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=!enabled;}});host.append(b);};
export function installMedicalHitUI(game){
 installMedicalWeaponDamageUI(game);
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{html.querySelector('.n5ese-scalpel-hit')?.remove();if(!medicalEnabled(game)||message.getFlag('n5eb','roll.type')!=='damage'||!(message.getAssociatedItem?.()?.getFlag(MODULE_ID,'medicalScalpelWeapon')||medicalSpiritualHit(message.getAssociatedItem?.())||medicalMeleeHit(message)||unarmedMedicalHit(message)||medicalBlackHit(message)||medicalFuujutsuHit(message)))return;html.querySelectorAll('damage-application').forEach(e=>e.remove());const section=document.createElement('section');section.className='n5ese-molding-chat n5ese-scalpel-hit';button(section,'Medical-Waffentreffer · Zusätze und Zielanwendung',()=>requestMedicalScalpelHit(game,message),message.getAssociatedActor()?.isOwner);html.append(section);});
 registerMedicalPanel(game,'hits','Gespeicherte Waffentreffer',actor=>{
  if(!medicalEnabled(game)||!medicalLevel(actor))return;const entries=(actor.getFlag(MODULE_ID,MEDICAL_HITS)??[]).filter(e=>!['applied','resolved','cancelled'].includes(e.status));if(!entries.length)return;const section=document.createElement('section');section.className='n5ese-ninjutsu-card n5ese-medical-hits';const title=document.createElement('h3');title.textContent='Gespeicherte Medical-Waffentreffer';section.append(title);const workflow=medicalHitWorkflow(game);
  for(const entry of entries){const p=document.createElement('p');p.textContent=entry.target.name+' · '+entry.status;section.append(p);const related=workflow.list(actor).filter(r=>r.ruleId===entry.id);
   if(entry.status==='paid'&&!related.some(r=>r.status!=='cancelled'))button(section,'Bezahlten Treffer fortsetzen',()=>resumeMedicalHit(game,actor,entry.id),actor.isOwner);
   if(['paying','rolling','review'].includes(entry.status))button(section,'GM: Zahlung/Würfe prüfen',()=>resolveMedicalHit(game,actor,entry.id),actor.isOwner&&game.user.isGM);
   for(const r of related){const p=document.createElement('p');p.textContent='Zielanfrage · '+r.status;section.append(p);if(r.status==='pending')button(section,'Bestätigten Treffer anwenden · GM bei fremdem Ziel',()=>workflow.apply(actor,r.id),actor.isOwner);if(['applying','review'].includes(r.status))button(section,'GM: HP-/Chakra-Schritte prüfen und schließen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Waffentreffer prüfen'},content:'<p>Bereits erfolgte HP-/Chakra-Anwendung geprüft und nötigenfalls manuell korrigiert? Ohne Wiederholung schließen.</p>',rejectClose:false})){await workflow.resolve(actor,r.id);await resolveMedicalHit(game,actor,entry.id);}},actor.isOwner&&game.user.isGM);}
  }return section;
 });
}
