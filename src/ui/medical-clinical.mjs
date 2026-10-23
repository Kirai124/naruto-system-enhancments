import {registerMedicalPanel} from './medical-window.mjs';
import {finishMindfulInsight} from '../foundry/medical-counselor.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalLevel,medicalFeature} from '../casting/medical-context.mjs';
import {MEDICAL_CLINICAL,medicalClinicalWorkflow,resumeMedicalClinical,resolveMedicalClinical,medicalEffects,medicalPayload} from '../foundry/medical-clinical.mjs';
import {MEDICAL_EVENTS,queueMedicalEvent,applyMedicalEvent,resolveMedicalEvent} from '../foundry/medical-effect-events.mjs';
const button=(host,label,fn,enabled)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=!enabled;}});host.append(b);};
export function installMedicalClinicalUI(game){
 const build=actor=>{if(!medicalEnabled(game)||!actor?.effects)return;
  const entries=actor.getFlag(MODULE_ID,MEDICAL_CLINICAL)??[],events=actor.getFlag(MODULE_ID,MEDICAL_EVENTS)??[],effects=medicalEffects(game,actor),mindful=actor.getFlag(MODULE_ID,'medicalMindfulPending')??[];if(!entries.length&&!events.length&&!effects.length&&!mindful.length)return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-medical-clinical';const h=document.createElement('h3');h.textContent='Medical · Zielwirkungen und Folgeauslöser';panel.append(h);
  for(const pending of mindful)button(panel,'Mindful Insight · tatsächliche Erholung / Haltung bestätigen',()=>finishMindfulInsight(game,{parent:actor,flags:{[MODULE_ID]:{ninjutsuEffect:pending.marker}},id:pending.effectId,delete:async()=>{const effect=actor.effects.get(pending.effectId);if(effect)await effect.delete();await actor.setFlag(MODULE_ID,'medicalMindfulPending',(actor.getFlag(MODULE_ID,'medicalMindfulPending')??[]).filter(e=>e.id!==pending.id));}}),actor.isOwner);
  if(medicalLevel(actor)){
   const workflow=medicalClinicalWorkflow(game),requests=workflow.list(actor);
   for(const entry of entries.filter(e=>!['applied','resolved','cancelled'].includes(e.status))){
    const p=document.createElement('p');p.textContent=entry.ruleId+' · '+entry.targets.map(t=>t.name).join(', ')+' · '+entry.status;panel.append(p);
    const related=requests.filter(r=>r.ruleId===entry.id);
    if(entry.status==='paid'&&!related.some(r=>r.status!=='cancelled'))button(panel,'Gespeicherte klinische Anfrage fortsetzen',()=>resumeMedicalClinical(game,actor,entry.id),actor.isOwner);
    for(const request of related){
     const p=document.createElement('p');p.textContent='Zielanfrage · '+request.status;panel.append(p);
     if(request.status==='pending')button(panel,'Bestätigte Saves/Wirkungen anwenden · GM bei fremden Zielen',()=>workflow.apply(actor,request.id),actor.isOwner);
     if(['applying','review'].includes(request.status))button(panel,'GM: unterbrochene Zielanwendung prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Zielanwendung prüfen'},content:'<p>Alle bereits erfolgten Zielschritte manuell geprüft/korrigiert? Ohne erneute Anwendung schließen.</p>',rejectClose:false})){await workflow.resolve(actor,request.id);await resolveMedicalClinical(game,actor,entry.id);}},actor.isOwner&&game.user.isGM);
    }
    if(['paying','review'].includes(entry.status)||Object.values(entry.results??{}).some(r=>r.status==='rolling'))button(panel,'GM: Zahlung/Wurf prüfen',()=>resolveMedicalClinical(game,actor,entry.id),actor.isOwner&&game.user.isGM);
   }
  }
  for(const effect of effects){
   const payload=medicalPayload(effect),p=document.createElement('p');p.textContent=effect.name+(payload.disruption?' · '+payload.failures+' fehlgeschlagene Saves':'')+(payload.healOnDamage?' · '+(payload.triggers??0)+'/'+payload.triggerLimit+' Auslösungen':'');panel.append(p);
   if(!game.combat?.started&&payload.ruleId==='medical.altered-strength'&&(payload.rolls?.some(r=>r.oncePerTurn&&r.usedTurn==='manual')||payload.medicalRebuiltDice?.usedTurn==='manual'))button(panel,'Tatsächlichen neuen Zug bestätigen · Verstärkung zurücksetzen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Altered Strength · neuer Zug'},content:'<p>Tatsächlich neuer eigener Zug begonnen? Nur die einmaligen Zugboni dieser Wirkung wieder verfügbar machen.</p>',rejectClose:false})){const marker=structuredClone(effect.getFlag(MODULE_ID,'ninjutsuEffect'));for(const roll of marker.metadata.genjutsu.rolls??[])if(roll.oncePerTurn)delete roll.usedTurn;if(marker.metadata.genjutsu.medicalRebuiltDice)delete marker.metadata.genjutsu.medicalRebuiltDice.usedTurn;await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}},actor.isOwner);
   if(payload.medicalNonHostile)button(panel,'Schaden durch Wirker/Verbündeten bestätigen · Nichtfeindlichkeit beenden',()=>effect.delete(),actor.isOwner);
   if(payload.medicalRepeat)button(panel,'Tatsächlichen '+(payload.medicalRepeat.timing==='target-start'?'Zugbeginn':'Zugabschluss')+' und Wiederholungs-Save bestätigen',()=>queueMedicalEvent(game,effect,payload.medicalRepeat.timing),actor.isOwner);
   if(payload.healOnDamage)button(panel,'Tatsächlich erlittenen Schaden bestätigen',()=>queueMedicalEvent(game,effect,'damaged'),actor.isOwner);
   if(payload.traceWaterRemaining>0)button(panel,'Water Traces · eigenen Zugbeginn bestätigen ('+payload.traceWaterRemaining+' verbleibend)',()=>queueMedicalEvent(game,effect,'target-start'),actor.isOwner);
   if(payload.traceFireAvailable)button(panel,'Fire Traces · einen Hit Die ausgeben und doppelte Würfelheilung',()=>queueMedicalEvent(game,effect,'trace-fire'),actor.isOwner);
   if(payload.turnTempCon||payload.alteredTemporaryHP)button(panel,'Tatsächlichen eigenen Zugbeginn bestätigen',()=>queueMedicalEvent(game,effect,'target-start'),actor.isOwner);
   if(payload.rolls?.some(r=>r.confirmedOnly))button(panel,'Nächsten Save/Skillcheck zum Beenden der feindlichen Condition',async()=>{
    const div=document.createElement('div'),select=document.createElement('select');select.name='kind';for(const value of ['save','ability']){const o=document.createElement('option');o.value=value;o.textContent=value;select.append(o);}div.append(select);const ability=document.createElement('select');ability.name='ability';for(const key of Object.keys(CONFIG.DND5E.abilities)){const o=document.createElement('option');o.value=key;o.textContent=key;ability.append(o);}div.append(ability);const skill=document.createElement('select');skill.name='skill';for(const key of Object.keys(CONFIG.DND5E.skills)){const o=document.createElement('option');o.value=key;o.textContent=game.i18n.localize(CONFIG.DND5E.skills[key].label);skill.append(o);}div.append(skill);
    const c=await foundry.applications.api.DialogV2.wait({window:{title:'Tatsächlichen Condition-Beendigungswurf bestätigen'},content:div.innerHTML,buttons:[{action:'roll',label:'Auslöser bestätigen und würfeln',callback:(_e,b)=>({kind:b.form.elements.kind.value,ability:b.form.elements.ability.value,skill:b.form.elements.skill.value})}],rejectClose:false});if(!c)return;
    const config={ability:c.ability,rolls:[{options:{n5eseConfirmedGenjutsuEffect:effect.id}}]};if(c.kind==='save')await actor.rollSavingThrow(config,{configure:true});else await actor.rollAbilityCheck(config,{configure:true});
   },actor.isOwner);
   button(panel,'Nur diese Medical-Wirkung beenden',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Wirkung beenden'},content:'<p>Nur diesen verwalteten Effekt beenden?</p>',rejectClose:false}))await effect.delete();},actor.isOwner);
  }
  for(const entry of events.filter(e=>!['applied','resolved'].includes(e.status))){const effect=actor.effects.get(entry.effectId),p=document.createElement('p');p.textContent=(effect?.name??'Beendete Wirkung')+' · '+entry.timing+' · '+entry.status;panel.append(p);if(effect&&['pending','ready'].includes(entry.status))button(panel,'Gespeicherte Folgewirkung bestätigen und anwenden',()=>applyMedicalEvent(game,actor,entry.id),actor.isOwner);if(['rolling','applying','review'].includes(entry.status))button(panel,'GM: unterbrochene Folgewirkung prüfen',()=>resolveMedicalEvent(game,actor,entry.id),actor.isOwner&&game.user.isGM);}
  return panel;
 };
 registerMedicalPanel(game,'clinical','Wirkungen & gespeicherte Vorgänge',build);
 const render=(sheet,html)=>{const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;root?.querySelector('.n5ese-medical-clinical')?.remove();if(medicalLevel(actor))return;const host=root?.querySelector('section[data-tab="features"]')??root?.querySelector('section[data-tab="effects"]'),panel=host&&build(actor);if(panel)host.prepend(panel);};
 for(const hook of ['renderCharacterActorSheet','renderNPCActorSheet'])Hooks.on(hook,render);
}
