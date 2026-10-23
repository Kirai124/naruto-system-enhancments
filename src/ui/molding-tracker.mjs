import {registerClassSheetPanel} from './class-window.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {moldingFeature,ALL_MOLDINGS as MOLDINGS} from '../casting/efficient-molding.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {ownedSubclassMoldings} from '../casting/subclass-moldings.mjs';
import {useAdaptiveMolding} from '../foundry/adaptive-moldings.mjs';
import {refreshMoldingEffects} from '../effects/molding-effects.mjs';
import {addProfessorReleaseControl} from './professor-releases.mjs';
import {runPainterTrigger} from '../foundry/painter-triggers.mjs';
import {refreshActorPreparation} from '../foundry/actor-preparation.mjs';
import {addSolarFinishers} from './solar-finishers.mjs';
export function installMoldingTracker(game){
  const render=(sheet,html)=>{
    const root=html instanceof HTMLElement?html:sheet.element,actor=sheet.actor??sheet.document;
    root?.querySelectorAll('.n5ese-molding-tracker').forEach(e=>e.remove());
    root?.querySelectorAll('[data-n5ese-molding-managed]').forEach(e=>e.removeAttribute('data-n5ese-molding-managed'));
    if(!root?.querySelector||!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))return;
    let feature;try{feature=moldingFeature(actor);}catch(error){ui.notifications.warn(error.message);return;}if(!feature)return;
    const host=root.querySelector('section[data-tab="features"]');if(!host)return;
    const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-molding-tracker';
    for(const row of root.querySelectorAll('[data-item-id]'))if(row.dataset.itemId===feature.id)row.setAttribute('data-n5ese-molding-managed','');
    const heading=document.createElement('strong');heading.textContent=`Efficient Molding · ${feature.system.uses.value}/${feature.system.uses.max}`;panel.append(heading);
    const pips=document.createElement('div');pips.className='n5ese-ninjutsu-pips';pips.setAttribute('role','img');pips.setAttribute('aria-label',`${feature.system.uses.value} von ${feature.system.uses.max} Nutzungen`);
    for(let i=0;i<feature.system.uses.max;i++){const pip=document.createElement('i');pip.className=i<feature.system.uses.value?'filled':'';pips.append(pip);}panel.append(pips);
    const subclassEnabled=game.settings.get(MODULE_ID,'subclassMoldingAutomation');
    const managedSources=new Set([...MOLDINGS.filter(m=>subclassEnabled||!m.subclass),...(subclassEnabled?ownedSubclassMoldings(actor):[])].map(m=>m.source));
    const managedItems=new Set([...actor.items].filter(i=>i.type==='feat'&&i.dependentOrigin?.active!==false&&managedSources.has(sourceOf(i))).map(i=>i.id));
    for(const row of root.querySelectorAll('[data-item-id]'))if(managedItems.has(row.dataset.itemId))row.setAttribute('data-n5ese-molding-managed','');
    if(subclassEnabled)addSolarFinishers(game,actor,panel);
    const names=MOLDINGS.filter(m=>(subclassEnabled||!m.subclass)&&[...actor.items].some(i=>i.type==='feat'&&sourceOf(i)===m.source&&i.dependentOrigin?.active!==false)).map(m=>m.name);
    const description=document.createElement('p');description.textContent=names.length?names.join(' · '):'Moldings über die vorhandene Klassenauswahl lernen.';panel.append(description);
    if(subclassEnabled&&ownedSubclassMoldings(actor).some(r=>r.id==='chakra-infusion'))addProfessorReleaseControl(game,actor,panel);
    if(subclassEnabled&&ownedSubclassMoldings(actor).some(r=>r.id==='painter')){
      const button=document.createElement('button');button.type='button';button.textContent='Painter: Ink Summon kommandiert / zerstört';button.disabled=!actor.isOwner;
      button.addEventListener('click',async()=>{button.disabled=true;try{await runPainterTrigger(game,actor);}catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}});panel.append(button);
    }
    if(game.user.isGM&&actor.isOwner)for(const key of ['adaptiveMoldingJournal','painterJournal','sharedMoldingJournal'])if(['review','applying'].includes(actor.getFlag(MODULE_ID,key)?.status)){
      const button=document.createElement('button');button.type='button';button.textContent=`GM: ${{painterJournal:'Painter',adaptiveMoldingJournal:'Adaptive',sharedMoldingJournal:'Jutsu-Paar'}[key]}-Vorgang prüfen`;
      button.addEventListener('click',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Unterbrochenen Vorgang prüfen'},content:'<p>Ressourcen, Effekte und vorhandene Chatkarten geprüft und gegebenenfalls korrigiert? Ohne erneute Ausführung abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,key,{...actor.getFlag(MODULE_ID,key),status:'resolved',resolvedBy:game.user.id});});panel.append(button);
    }
    for(const rule of ownedSubclassMoldings(actor).filter(r=>subclassEnabled&&r.phase==='self')){
      const button=document.createElement('button');button.type='button';button.textContent=`${rule.name} · 5 Chakra`;button.disabled=!actor.isOwner;
      button.addEventListener('click',async()=>{button.disabled=true;try{await useAdaptiveMolding(game,actor,rule.id);}catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}});panel.append(button);
    }
    const hint=document.createElement('small');hint.textContent='Im Castingdialog wählen · Focused / Redirected / Tenacious an der Jutsu-Chatkarte · gemeinsame Nutzungen erholen sich über die native Rast';panel.append(hint);
    if(game.user.isGM&&actor.isOwner){
      const correction=document.createElement('button');correction.type='button';correction.textContent='GM: Nutzungen korrigieren';
      correction.addEventListener('click',async()=>{
        const spent=await foundry.applications.api.DialogV2.wait({window:{title:'Molding-Nutzungen korrigieren'},content:`<label>Verbrauchte Nutzungen <input type="number" name="spent" min="0" max="${feature.system.uses.max}" value="${feature.system.uses.spent}"></label>`,buttons:[{action:'save',label:'Speichern',callback:(_event,button)=>Number(button.form.elements.spent.value)}],rejectClose:false});
        if(spent===null||spent===undefined||spent===false)return;
        if(!Number.isInteger(spent)||spent<0||spent>feature.system.uses.max)return ui.notifications.warn('Ungültiger Nutzungswert.');
        await feature.update({'system.uses.spent':spent});sheet.render(false);
      });panel.append(correction);
    }
    host.prepend(panel);
  };
  registerClassSheetPanel(game,'ninjutsu','.n5ese-molding-tracker','Efficient Molding',render);
  game.settings.settings.get(`${MODULE_ID}.efficientMoldingAutomation`).onChange=()=>{refreshMoldingEffects(game);for(const actor of game.actors){refreshActorPreparation(actor);if(actor.sheet?.rendered)actor.sheet.render(false);}};
  game.settings.settings.get(`${MODULE_ID}.subclassMoldingAutomation`).onChange=game.settings.settings.get(`${MODULE_ID}.efficientMoldingAutomation`).onChange;
}
