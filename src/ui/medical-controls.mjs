import {registerMedicalPanel} from './medical-window.mjs';
import {linkMedicalCompanion} from '../foundry/medical-companions.mjs';
import {summonSpiritualWeapon} from '../foundry/medical-spiritual-weapons.mjs';
import {useMedicalProtector,resolveMedicalProtector} from '../foundry/medical-protector.mjs';
import {elementalJutsu} from '../foundry/medical-elemental.mjs';
import {medicalFeatureOrigin} from '../foundry/medical-companions.mjs';
import {configureTherapeuticSkill} from '../foundry/medical-counselor.mjs';
import {activateYinAttackAction,endYinAttackAction} from '../foundry/medical-combat.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,medicalAbility,scalpelState} from '../casting/medical-context.mjs';
import {MEDICAL_SELECTIONS,configureMedicalSelection,configureMedicalReleases} from '../foundry/medical-selections.mjs';
import {activateMedicalScalpel,endMedicalScalpel,attackMedicalScalpel} from '../foundry/medical-scalpel.mjs';
import {MEDICAL_ACTIONS,medicalHealingWorkflow,requestMedicalHealing,requestMedicalTakeLife,resumeMedicalHealing,resolveMedicalAction} from '../foundry/medical-healing.mjs';
import {ownedMedicalClinicalRules,requestMedicalClinical} from '../foundry/medical-clinical.mjs';
import {medicalForm,activateMedicalForm,endMedicalForm} from '../foundry/medical-forms.mjs';
import {elementalEmpowerment,activateElementalEmpowerment,endElementalEmpowerment} from '../foundry/medical-elemental.mjs';

const button=(host,label,fn,enabled=true)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=!enabled;}});host.append(b);return b;};
const actionLabels={
 'touch-terror':'nächsten Gift-Save erschweren','poison-potency':'nächsten Einsatz verstärken',
 'diamond-echoes':'Deckung durch Echoes','diamond-kind-soul':'Kind Soul · stabilisieren',
 'restoration-mark':'Struktur markieren','restoration-collision':'Struktur bewegen / Kollision',
 'universal-restoration':'zerstörte Struktur wiederherstellen','unbreakable-aura':'Aura-Heilung am Zugbeginn',
 'hex-critical':'kritischen Treffer abwehren','shaman-hex':'Ziel mit Hex markieren',
 'draining-hex-death':'Tod eines Hex-Ziels','draining-counter':'Gegenangriff und Heilung',
 'transmuted-construct':'Construct','transmuted-demon':'Demon','transmuted-plant':'Plant',
 'transmuted-monstrosity':'Monstrosity','transmuted-mutant':'Mutant',
 'plague-envenomed':'Envenomed','plague-corroded':'Corroded'
};
const clinicalActionLabel=rule=>{const suffix=actionLabels[rule.id.split('.').at(-1)];return rule.name+(suffix?' · '+suffix:'');};
function renderRequests(game,actor,host){
 const list=actor.getFlag(MODULE_ID,MEDICAL_ACTIONS)??[],workflow=medicalHealingWorkflow(game),requests=workflow.list(actor);
 for(const entry of list.filter(e=>!['applied','resolved','cancelled'].includes(e.status))){
  const p=document.createElement('p');p.textContent=entry.kind+' · '+entry.targets.map(t=>t.name).join(', ')+' · '+entry.status;host.append(p);
  const related=requests.filter(r=>r.ruleId===entry.id);
  if(entry.status==='paid'&&!related.some(r=>r.status!=='cancelled'))button(host,'Gespeicherte Zielanfrage fortsetzen',()=>resumeMedicalHealing(game,actor,entry.id),actor.isOwner);
  if(['paying','rolling','review'].includes(entry.status))button(host,'GM: Medical-Unterbrechung prüfen',()=>resolveMedicalAction(game,actor,entry.id),game.user.isGM&&actor.isOwner);
  for(const request of related){
   const line=document.createElement('p');line.textContent='Zielanfrage · '+request.status;host.append(line);
   if(request.status==='pending'){
    button(host,'Bestätigte Ziele anwenden / GM-Anwenden',()=>workflow.apply(actor,request.id),actor.isOwner);
    button(host,'Anfrage verwerfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Anfrage verwerfen'},content:'<p>Offene Zielanfrage verwerfen? Bereits bezahlte Ressourcen bleiben verbraucht. Ein neuer Heilungswurf darf denselben ursprünglichen Vorgang nicht doppelt anwenden.</p>',rejectClose:false}))await workflow.cancel(actor,request.id);},actor.isOwner);
   }
   if(['applying','review'].includes(request.status))button(host,'GM: Zielschritte prüfen und abschließen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Zielschritte prüfen'},content:'<p>Bereits angewendete Schritte geprüft und gegebenenfalls manuell korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false})){await workflow.resolve(actor,request.id);await resolveMedicalAction(game,actor,entry.id);}},game.user.isGM&&actor.isOwner);
  }
 }
}
export function installMedicalControls(game){
 registerMedicalPanel(game,'actions','Klassenaktionen & Einstellungen',actor=>{
  if(!medicalEnabled(game)||!medicalLevel(actor))return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-medical';const h=document.createElement('h3');h.textContent='Medical-Nin';panel.append(h);
  const add=(label,fn)=>button(panel,label,fn,actor.isOwner);const origin=medicalFeatureOrigin(actor);if(origin){const p=document.createElement('p');p.textContent='Medical-Feature-Ursprung: '+origin.name+'; Ressourcen beim Wirker. Tatsächliche Reichweite/Berührung vom Begleiter prüfen.';panel.append(p);add('Wieder selbst als Medical-Ursprung handeln',()=>actor.unsetFlag(MODULE_ID,'medicalFeatureOrigin'));}
  if(medicalFeature(actor,'Never On The Front Lines')){const p=document.createElement('p');p.textContent='Never On The Front Lines: Innerhalb von 10 Fuß um einen Feind ist Dash als Bonusaktion möglich. Bewegung und Aktionsökonomie manuell bestätigen.';panel.append(p);}
  add('Medical-Attribut · '+medicalAbility(actor).toUpperCase(),async()=>{const div=document.createElement('div'),select=document.createElement('select');select.name='ability';for(const value of ['native','wis',...(medicalFeature(actor,'Fortifying Scripture','Spiritual Scribe')?['cha']:[])]){const o=document.createElement('option');o.value=value;o.textContent=value;if(value===medicalAbility(actor))o.setAttribute('selected','');select.append(o);}div.append(select);const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Medical-Attribut · Vorgabe für den Castingdialog'},content:div.innerHTML,buttons:[{action:'save',label:'Vorgabe speichern',callback:(_e,b)=>b.form.elements.ability.value}],rejectClose:false});if(choice)await actor.setFlag(MODULE_ID,'medicalAbility',choice);});
  if(medicalFeature(actor,'Tainted Hands','Black Medicine'))add('Tainted Hands · 1/2 einmal neu würfeln: '+(actor.getFlag(MODULE_ID,'medicalTaintedHands')?'an':'aus'),async()=>{await actor.setFlag(MODULE_ID,'medicalTaintedHands',!actor.getFlag(MODULE_ID,'medicalTaintedHands'));});
  if(medicalFeature(actor,'Competent Combatant','Combat Medic'))add('Competent Combatant · WIS statt DEX für AC: '+(actor.getFlag(MODULE_ID,'medicalWisdomAC')?'an':'aus'),async()=>{await actor.setFlag(MODULE_ID,'medicalWisdomAC',!actor.getFlag(MODULE_ID,'medicalWisdomAC'));actor.prepareData();actor.sheet?.render(false);});
  if(medicalFeature(actor,'Yin Seal: Charge','Combat Medic')){const state=actor.getFlag(MODULE_ID,'medicalYinAction');add(state&&['active','paying','review'].includes(state.status)?'Yin Seal · Angriffsaktion beenden / Zahlung prüfen':'Yin Seal · eine Angriffsaktion verstärken (2 Motes)',()=>state&&['active','paying','review'].includes(state.status)?endYinAttackAction(game,actor):activateYinAttackAction(game,actor));}
  if(medicalFeature(actor,'Competent Combatant','Combat Medic'))add('Scalpel-Angriffsbonus · '+(actor.getFlag(MODULE_ID,'medicalScalpelTaijutsu')?'Taijutsu':'Ninjutsu'),async()=>{await actor.setFlag(MODULE_ID,'medicalScalpelTaijutsu',!actor.getFlag(MODULE_ID,'medicalScalpelTaijutsu'));});
  if(medicalFeature(actor,'Therapeutic Training','Counselor-Nin'))add('Therapeutic Training · Fertigkeit wählen',()=>configureTherapeuticSkill(game,actor));
  if(medicalFeature(actor,'Rejuvenating Rest'))add('Rejuvenating Rest · tatsächliche Rastheilung bestätigen',()=>requestMedicalHealing(game,actor,'rest'));
  if(medicalFeature(actor,'Preserve/Take Life'))add('Preserve Life · Heilbudget verteilen',()=>requestMedicalHealing(game,actor,'preserve'));
  if(medicalFeature(actor,'Natural Healing','Natural Medicine'))add('Natural Healing · Heilwürfel wählen',()=>requestMedicalHealing(game,actor,'natural'));
  if(medicalFeature(actor,'Protector Of Nature','Natural Medicine')){const pending=actor.getFlag(MODULE_ID,'medicalProtector');if(['casting','paid','review'].includes(pending?.status)){if(game.user.isGM)add('GM: Protector-Summoning geprüft schließen',()=>resolveMedicalProtector(game,actor));}else add('Protector Of Nature · tatsächlichen Notfall / S-Rang-Profil bestätigen',()=>useMedicalProtector(game,actor));}
  if(medicalFeature(actor,'Natural Talent','Natural Medicine')){const form=medicalForm(game,actor),stored=actor.getFlag(MODULE_ID,'medicalForm');if(form){add('Aktuelles Formprofil und tatsächliche Traits ansehen',async()=>{const profile=await fromUuid(form.profileUuid);if(!profile)throw Error('Ursprüngliches Formprofil fehlt.');profile.sheet.render(true);});const p=document.createElement('p');p.textContent=(form.avatar?'Natures Avatar':'Natural Talent')+' · '+form.profileName+(form.avatar?' · eigene HP/AC · '+Math.ceil(form.expiresAt-game.time.worldTime)+' s':' · Form-HP '+form.hpValue+'/'+form.hpMax);panel.append(p);add('Natural Talent · Rückverwandlung',()=>endMedicalForm(game,actor));}else if(['paying','review'].includes(stored?.status)){if(game.user.isGM)add('GM: Transformation geprüft beenden',()=>endMedicalForm(game,actor));}else{add('Natural Talent · vorhandenes Summon-Profil',()=>activateMedicalForm(game,actor));if(medicalFeature(actor,'Natures Avatar','Natural Medicine'))add('Natures Avatar · eine Minute',()=>activateMedicalForm(game,actor,{avatar:true}));}}
  if(medicalFeature(actor,'Chakra Scalpel')){
   if(medicalFeature(actor,'Biological Knowledge','Chakra Scalpel Specialist'))add('Scalpel-Attribut · '+(actor.getFlag(MODULE_ID,'medicalScalpelAbility')??'wis').toUpperCase(),async()=>{const next=actor.getFlag(MODULE_ID,'medicalScalpelAbility')==='int'?'wis':'int';if(await foundry.applications.api.DialogV2.confirm({window:{title:'Biological Knowledge · Scalpel-Attribut'},content:'<p>Scalpel-Angriff und -Schaden künftig mit '+next.toUpperCase()+' berechnen? Allgemeine Medical-Jutsu bleiben bei ihrer eigenen Auswahl.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'medicalScalpelAbility',next);});
   const state=scalpelState(game,actor),p=document.createElement('p');p.textContent=state?(state.sabre?'Chakra Sabre':'Chakra Scalpel')+' aktiv · '+Math.ceil(state.expiresAt-game.time.worldTime)+' s verbleibend':'Chakra Scalpel inaktiv';panel.append(p);
   if(state){add('Scalpel · nativer Angriff',()=>attackMedicalScalpel(game,actor));add('Scalpel beenden',()=>endMedicalScalpel(game,actor));if(medicalLevel(actor)>=7&&!game.combat?.started)add('Scalpel · chirurgische Condition-Entfernung',()=>requestMedicalClinical(game,actor,'medical.scalpel-surgery'));}
   else{add('Chakra Scalpel aktivieren',()=>activateMedicalScalpel(game,actor));if(medicalFeature(actor,'Chakra Sabre','Chakra Scalpel Specialist'))add('Chakra Sabre aktivieren · 5 Charges',()=>activateMedicalScalpel(game,actor,{sabre:true}));}
   const journal=actor.getFlag(MODULE_ID,'medicalScalpel');if(game.user.isGM&&['paying','review'].includes(journal?.status))add('GM: Scalpel-Zahlung prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Scalpel-Zahlung prüfen'},content:'<p>Charge-Verbrauch und Aktivierung manuell geprüft? Ohne erneuten Verbrauch schließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'medicalScalpel',{...journal,status:'ended'});});
  }
  if(medicalFeature(actor,'Elemental Beginning','Elemental Medic'))add('Elemental Medic · Nature Releases',()=>configureMedicalReleases(game,actor));
  if(medicalFeature(actor,'Elemental Traces','Elemental Medic')&&medicalLevel(actor)>=5){const state=actor.getFlag(MODULE_ID,'medicalElementalEmpowerment');if(elementalEmpowerment(game,actor))add('Elemental Traces · aktiven Zugbonus beenden',()=>endElementalEmpowerment(game,actor));else if(['paying','review'].includes(state?.status)){if(game.user.isGM)add('GM: Elemental-Traces-Zahlung prüfen',()=>endElementalEmpowerment(game,actor));}else add('Elemental Traces · Zugverstärkung aktivieren',()=>activateElementalEmpowerment(game,actor));}
  for(const rule of MEDICAL_SELECTIONS)if(medicalFeature(actor,rule.name,rule.category))add(rule.name+' · Medical-Jutsu wählen',()=>configureMedicalSelection(game,actor,rule.id));
  for(const rule of ownedMedicalClinicalRules(actor).filter(r=>!r.cast&&!r.scalpel&&!r.preserveTrigger&&r.id!=='medical.scalpel-surgery'))add(clinicalActionLabel(rule),()=>requestMedicalClinical(game,actor,rule.id));
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Gespeicherte Medical-Vorgänge';details.append(summary);renderRequests(game,actor,details);if(details.children.length>1)panel.append(details);
  return panel;
 });
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-medical-chat')?.remove();if(!medicalEnabled(game))return;
  const marker=message.getFlag(MODULE_ID,'medicalAction'),actor=marker?fromUuidSync(marker.actorUuid):message.getAssociatedActor?.();if(!actor||!medicalLevel(actor))return;
  const heal=message.getFlag(MODULE_ID,'medicalHealingRoll'),item=message.getAssociatedItem?.(),medical=item?.system.jutsu?.keywords?.has('medical'),scalpel=item?.getFlag(MODULE_ID,'medicalScalpelWeapon'),damage=message.getFlag('n5eb','roll.type')==='damage'&&medical&&medicalFeature(actor,'Preserve/Take Life');if(!heal&&!damage&&!marker&&!medical&&!elementalJutsu(item)&&!scalpel&&!item?.getFlag(MODULE_ID,'medicalCast')?.blackPotency)return;
  const panel=document.createElement('section');panel.className='n5ese-molding-chat n5ese-medical-chat';
  if(heal){html.querySelectorAll('damage-application').forEach(e=>e.remove());button(panel,'Medical-Heilung · Ziele und Heilwürfel bestätigen',()=>requestMedicalHealing(game,actor,'cast',{messageId:message.id}),actor.isOwner);}
  if(damage)button(panel,'Take Life · Originaltreffer + Zusatz gemeinsam',()=>requestMedicalTakeLife(game,message),actor.isOwner);
  if(item?.system.jutsu?.keywords?.has('medical')||elementalJutsu(item)||item?.getFlag(MODULE_ID,'medicalCast')?.blackPotency)for(const rule of ownedMedicalClinicalRules(actor).filter(r=>r.cast&&(medical||r.elementalCast||r.potencyTarget)&&(!r.anyCast||item?.getFlag(MODULE_ID,'medicalCast')?.blackPotency)))button(panel,rule.name+' · bestätigte Zielwirkung',()=>requestMedicalClinical(game,actor,rule.id,{messageId:message.id}),actor.isOwner);
  if(elementalJutsu(item)&&medicalFeature(actor,'Elemental Beginning','Elemental Medic'))button(panel,'Elemental Beginning · stattdessen dich selbst heilen',()=>requestMedicalClinical(game,actor,'medical.elemental-beginning',{messageId:message.id,self:true}),actor.isOwner);
  if(elementalJutsu(item)&&medicalFeature(actor,'Preserve Life: Elemental Regrowth','Elemental Medic'))button(panel,'Elemental Regrowth · Preserve-Life-Budget für diesen Cast',()=>requestMedicalHealing(game,actor,'preserve'),actor.isOwner);
  if(scalpel)for(const rule of ownedMedicalClinicalRules(actor).filter(r=>r.scalpel&&!r.cast&&!r.surgeryCleanse))button(panel,rule.name+' · bestätigter Treffer',()=>requestMedicalClinical(game,actor,rule.id,{messageId:message.id}),actor.isOwner);
  if(marker){const entry=(actor.getFlag(MODULE_ID,'medicalActions')??[]).find(e=>e.id===marker.entryId);if(entry?.kind==='preserve'&&entry.status==='applied'&&medicalFeature(actor,'Warrior Of The Hex','Shaman'))button(panel,'Warrior Of The Hex · zusätzliche temporäre HP vergeben',()=>requestMedicalClinical(game,actor,'medical.warrior-preserve',{actionId:entry.id}),actor.isOwner);renderRequests(game,actor,panel);}html.append(panel);
 });
 Hooks.on('dnd5e.preUseActivity',activity=>{
  if(!medicalEnabled(game)||!activity.actor?.isOwner||activity.item?.type!=='feat')return;
  const actor=activity.actor,match=name=>medicalFeature(actor,name)?.id===activity.item.id;
  let fn;if(match('Chakra Scalpel'))fn=()=>activateMedicalScalpel(game,actor);if(match('Preserve Life'))fn=()=>requestMedicalHealing(game,actor,'preserve');if(match('Natural Healing'))fn=()=>requestMedicalHealing(game,actor,'natural');if(match('Rejuvenating Rest'))fn=()=>requestMedicalHealing(game,actor,'rest');
  if(!fn&&match('Spiritual Weapons'))fn=()=>summonSpiritualWeapon(game,actor);
  if(!fn&&match('Diamondheart Materialization'))fn=()=>linkMedicalCompanion(game,actor,'diamond');
  if(!fn&&match('Echoes of Life'))fn=()=>linkMedicalCompanion(game,actor,'golem');
  if(!fn&&match('Natural Talent'))fn=()=>activateMedicalForm(game,actor);
  if(!fn&&match('Natures Avatar'))fn=()=>activateMedicalForm(game,actor,{avatar:true});
  if(!fn&&match('Protector Of Nature'))fn=()=>useMedicalProtector(game,actor);
  if(!fn&&match('Preserve/Take Life'))fn=()=>requestMedicalHealing(game,actor,'preserve');
  if(!fn&&match('Yin Seal: Charge'))fn=async()=>{const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Yin Seal: Charge'},content:'<p>Folgecasts und kostenlose Rangstufen stehen an der ursprünglichen Castkarte bzw. im Castingdialog bereit. Hier eine tatsächliche Angriffsaktion verstärken oder beenden.</p>',buttons:[{action:'start',label:'Eine Angriffsaktion · 2 Motes',callback:()=>true},{action:'end',label:'Aktuelle Angriffsaktion beenden',callback:()=>false}],rejectClose:false});if(choice===true)return activateYinAttackAction(game,actor);if(choice===false)return endYinAttackAction(game,actor);};
  if(!fn&&match('Long Life, Short Death'))fn=async()=>ui.notifications.info('Long Life wird über die tatsächliche Heilungsanwendung geführt: gemeinsame Grenze je Empfänger, unabhängig vom alten Zähler dieser passiven Fähigkeit.');
  if(!fn&&['Take Life','Surgical Precision'].some(match))fn=async()=>ui.notifications.info('Diese Fähigkeit am bestätigten ursprünglichen Schadenswurf wählen; Originaltreffer und Zusatz gemeinsam anwenden. Dort erfolgt der einmalige Ressourcenverbrauch.');
  if(!fn){const rules=ownedMedicalClinicalRules(actor).filter(r=>!r.cast&&!r.scalpel&&medicalFeature(actor,r.name,r.category)?.id===activity.item.id);if(rules.length)fn=async()=>{if(rules.length===1)return requestMedicalClinical(game,actor,rules[0].id);const select=document.createElement('select');select.name='rule';for(const r of rules){const o=document.createElement('option');o.value=r.id;o.textContent=r.id+' · '+r.context;select.append(o);}const id=await foundry.applications.api.DialogV2.wait({window:{title:activity.item.name},content:select.outerHTML,buttons:[{action:'choose',label:'Gewählten Ablauf öffnen',callback:(_e,b)=>b.form.elements.rule.value}],rejectClose:false});if(id)return requestMedicalClinical(game,actor,id);};}
  if(fn){fn().catch(e=>ui.notifications.warn(e.message));return false;}
 });
 Hooks.on('updateActor',(actor,changes)=>{if(Object.keys(changes).some(k=>k.startsWith('flags.'+MODULE_ID+'.medical'))||Object.keys(changes.flags?.[MODULE_ID]??{}).some(k=>k.startsWith('medical')))for(const message of game.messages)if(message.getAssociatedActor?.()?.uuid===actor.uuid&&message.getFlag(MODULE_ID,'medicalHealingRoll')||message.getFlag(MODULE_ID,'medicalAction')?.actorUuid===actor.uuid)ui.chat.updateMessage(message);});
}
