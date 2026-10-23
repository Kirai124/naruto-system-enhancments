import {registerClassSheetPanel} from './class-window.mjs';
import {usePhantasmalForce,resolvePhantasmal} from '../foundry/genjutsu-phantasmal.mjs';
import {activateMoment,resolveMoment} from '../foundry/genjutsu-moment.mjs';
import {addIllusionaryWeaponControls} from './genjutsu-weapons.mjs';
import {reconcileInceptionGrants} from '../foundry/genjutsu-inception-grants.mjs';
import {ownedCastingMirages,castMirage,resolveMirage} from '../foundry/genjutsu-mirage-casts.mjs';
import {createActualizedDuplicate,resolveDuplicity} from '../foundry/genjutsu-duplicity.mjs';
import {stepStopwatch,resolveStopwatch,releaseStopwatchConditions} from '../foundry/genjutsu-stopwatch.mjs';
import {infuseMistyKit} from '../foundry/genjutsu-kits.mjs';
import {MISTY_KIT_STATE} from '../casting/genjutsu-kits.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {actualizationPool,genjutsuAbility,genjutsuEnabled,genjutsuSourcesOwned,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {rollGenjutsuSkill,recoverKeenAwareness} from '../foundry/genjutsu-skill-actions.mjs';

export function installGenjutsuControls(game){
 registerClassSheetPanel(game,'genjutsu','.n5ese-genjutsu','Grundklasse & Ressourcen',(sheet,html)=>{
  const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;root?.querySelector('.n5ese-genjutsu')?.remove();
  if(!genjutsuEnabled(game)||actor.type!=='character')return;const pool=actualizationPool(actor),host=root?.querySelector('section[data-tab="features"]');if(!pool||!host)return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-genjutsu';
  const title=document.createElement('h3');title.textContent='Genjutsu Specialist';panel.append(title);
  const count=document.createElement('p');count.textContent='Actualization · '+pool.remaining+'/'+pool.maximum+' · d'+pool.die;panel.append(count);
  const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!actor.isOwner;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=!actor.isOwner;sheet.render(false);}});panel.append(b);};
  button('Genjutsu-Attribut: '+genjutsuAbility(actor).toUpperCase(),async()=>{const current=genjutsuAbility(actor);const ability=await foundry.applications.api.DialogV2.wait({window:{title:'Actualization – Genjutsu-Attribut'},content:'<p>Native Genjutsu-Einstellung des Charakters verwenden; bestehende Jutsu bleiben unverändert.</p><select name="ability"><option value="wis"'+(current==='wis'?' selected':'')+'>WIS</option><option value="cha"'+(current==='cha'?' selected':'')+'>CHA</option></select>',buttons:[{action:'save',label:'Speichern',callback:(_e,b)=>b.form.elements.ability.value}],rejectClose:false});if(['wis','cha'].includes(ability))await actor.update({'system.attributes.jutsu.genjutsu.ability':ability});});
  button('Read the Enemy (+1d4)',()=>rollGenjutsuSkill(game,actor,{readEnemy:true}));button('Actualization – Skillcheck',()=>rollGenjutsuSkill(game,actor));
  if(ownedGenjutsuFeature(actor,'Keen Awareness'))button('Keen Awareness – Die zurückerhalten',()=>recoverKeenAwareness(game,actor));
  if(ownedGenjutsuFeature(actor,'Physical Imitations','Misty Distortionist')){const kit=actor.getFlag(MODULE_ID,MISTY_KIT_STATE),p=document.createElement('p');p.textContent=kit?'Misty Kit · '+(actor.items.get(kit.itemId)?.name??'Kit fehlt')+' · '+(kit.die?'d'+kit.die:'leer'):'Misty Kit · nicht infundiert';panel.append(p);button('Misty Kit infundieren',()=>infuseMistyKit(game,actor));}
  if(ownedGenjutsuFeature(actor,'Temporal Stopwatch','Choose Inception')){const state=actor.getFlag(MODULE_ID,'genjutsuStopwatch'),nativeDeferred=actor.effects.filter(e=>e.getFlag(MODULE_ID,'stopwatchDeferred')?.sessionId===state?.id),line=document.createElement('p');line.textContent='Temporal Stopwatch · '+(state?.die?'Displaced · d'+state.die:'inaktiv')+(state?.availableAt>game.time.worldTime?' · erneut in '+Math.ceil((state.availableAt-game.time.worldTime)/60)+' min':'')+' · '+((state?.deferred?.filter(c=>c.status==='pending').length??0)+nativeDeferred.length)+' verschobene Conditions';panel.append(line);if(state?.die)button('Stopwatch – tatsächlichen Zugbeginn bestätigen',()=>stepStopwatch(game,actor,{manual:true}));else if(state?.deferred?.some(c=>c.status==='pending')||nativeDeferred.length)button('Verschobene Conditions jetzt anwenden',()=>releaseStopwatchConditions(game,actor));if(state?.deferred?.length||nativeDeferred.length){const list=document.createElement('p');list.textContent=[...(state?.deferred??[]).map(c=>c.conditionId+': '+c.status),...nativeDeferred.map(e=>e.name+': verschoben')].join(' · ');panel.append(list);}if(game.user.isGM&&(state?.step&&['applying','rolled','review'].includes(state.step.status)||state?.deferred?.some(c=>c.status==='applying')))button('GM: Stopwatch-Vorgang prüfen',()=>resolveStopwatch(game,actor));}
  if(ownedGenjutsuFeature(actor,'Actualized Duplicity','Real World Conversions'))button('Actualized Duplicity – markierten Doppelgänger verknüpfen',()=>createActualizedDuplicate(game,actor));
  if(game.user.isGM&&['applying','review'].includes(actor.getFlag(MODULE_ID,'genjutsuDuplicityJournal')?.status))button('GM: Duplicity-Aktivierung prüfen',()=>resolveDuplicity(game,actor));
  addIllusionaryWeaponControls(game,actor,panel,button);
  if(ownedGenjutsuFeature(actor,'Phantasmal Force','Choose Inception'))button('Phantasmal Force – getrennte Strahlen',()=>usePhantasmalForce(game,actor));
  if(game.user.isGM&&['applying','review'].includes(actor.getFlag(MODULE_ID,'genjutsuPhantasmalJournal')?.status))button('GM: Phantasmal-Force-Angriffe prüfen',()=>resolvePhantasmal(game,actor));
  if(ownedGenjutsuFeature(actor,'A Moment In Time','Time Slipper'))button('A Moment In Time – Vorteile wählen',()=>activateMoment(game,actor));
  if(game.user.isGM&&['applying','paid','review'].includes(actor.getFlag(MODULE_ID,'genjutsuMomentJournal')?.status))button('GM: Moment-Vorgang prüfen',()=>resolveMoment(game,actor));
  const mirages=ownedCastingMirages(actor);if(mirages.length){const group=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Genjutsu-Feature-Casts · '+mirages.length;group.append(summary);for(const rule of mirages){const b=document.createElement('button');b.type='button';b.textContent=rule.name;b.disabled=!actor.isOwner;b.addEventListener('click',async()=>{b.disabled=true;try{await castMirage(game,actor,rule.name);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=!actor.isOwner;sheet.render(false);}});group.append(b);}panel.append(group);}
  if(game.user.isGM&&['applying','paid','review'].includes(actor.getFlag(MODULE_ID,'genjutsuMirageJournal')?.status))button('GM: Mirage-Cast prüfen',()=>resolveMirage(game,actor));
  if(ownedGenjutsuFeature(actor,'Genjutsu Inception'))button('Fehlende Inception-Mirage ab Stufe 7 ergänzen',()=>reconcileInceptionGrants(game,actor,{explicit:true}));
  const selections=genjutsuSourcesOwned(actor).filter(f=>['Choose Inception','Real World Conversions','Master of Illusion Features'].includes(f.category));
  if(selections.length){const list=document.createElement('p');list.textContent=selections.map(s=>s.name).join(' · ');panel.append(list);}
  if(game.user.isGM&&['applying','review'].includes(actor.getFlag(MODULE_ID,'genjutsuSkillJournal')?.status))button('GM: Genjutsu-Check prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Genjutsu-Check prüfen'},content:'<p>Bereits gewürfelten Check und Ressourcen manuell geprüft/korrigiert? Ohne erneute Ausführung abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'genjutsuSkillJournal',{...actor.getFlag(MODULE_ID,'genjutsuSkillJournal'),status:'resolved'});});
  host.prepend(panel);
 });
}
