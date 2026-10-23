import {registerClassSheetPanel} from '../ui/class-window.mjs';
import {refreshActorPreparation} from './actor-preparation.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {refinedFeature,refinedLimit,refinedSelection,eligibleRefined,validateRefinedSelection} from '../casting/refined-ninjutsu.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pending=new Set();
export async function configureRefined(game,actor) {
  const feature=refinedFeature(actor);
  if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!actor.isOwner||!feature||pending.has(actor.uuid))return false;
  pending.add(actor.uuid);
  try {
    const previous=refinedSelection(actor),locked=!game.user.isGM&&!feature.getFlag(MODULE_ID,'refinedJutsu')?.reselect;
    const items=[...actor.items].filter(eligibleRefined).sort((a,b)=>a.name.localeCompare(b.name));
    const ids=await foundry.applications.api.DialogV2.wait({window:{title:'Refined Ninjutsu — Jutsu auswählen'},rejectClose:false,
      content:`<p>Bis zu ${refinedLimit(actor)} bekannte berechtigte Jutsu ohne Combination. Bestehende Einträge können nach einer langen Rast ersetzt werden. Der GM darf korrigieren.</p>${items.map(i=>`<div class="form-group"><label><input type="checkbox" name="jutsu" value="${escape(i.id)}" ${previous.includes(i.id)?'checked':''} ${locked&&previous.includes(i.id)?'disabled':''}> ${escape(i.name)}</label></div>`).join('')}`,
      buttons:[{action:'save',label:'Auswahl speichern',callback:(_e,b)=>[...new Set([...(locked?previous:[]),...[...b.form.querySelectorAll('input[name="jutsu"]:checked')].map(i=>i.value)])]}, {action:'cancel',label:'Abbrechen',callback:()=>null}]});
    if(!ids||!actor.items.has(feature.id))return false;
    const state=validateRefinedSelection(actor,ids,{gm:game.user.isGM});
    await feature.setFlag(MODULE_ID,'refinedJutsu',state);refreshActorPreparation(actor);actor.sheet?.render(false);return true;
  }finally{pending.delete(actor.uuid);}
}
export function renderRefined(game,sheet,html) {
  const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;
  root?.querySelector('.n5ese-refined')?.remove();
  if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!refinedFeature(actor))return;
  const host=root?.querySelector('section[data-tab="features"]');if(!host)return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-refined';
  const header=document.createElement('header'),title=document.createElement('strong');title.textContent='Refined Ninjutsu';header.append(title);
  const ids=refinedSelection(actor),count=document.createElement('span');count.className='n5ese-ninjutsu-count';count.textContent=`${ids.length} / ${refinedLimit(actor)}`;header.append(count);panel.append(header);
  const names=document.createElement('p');names.textContent=ids.map(id=>actor.items.get(id).name).join(' · ')||'Noch keine Jutsu ausgewählt';panel.append(names);
  const button=document.createElement('button');button.type='button';button.textContent='Jutsu-Auswahl';button.disabled=!actor.isOwner;
  button.addEventListener('click',()=>configureRefined(game,actor).catch(e=>ui.notifications.warn(e.message)));panel.append(button);host.prepend(panel);
}
export function installRefinedChoices(game) {
  registerClassSheetPanel(game,'ninjutsu','.n5ese-refined','Refined Ninjutsu',(sheet,html)=>renderRefined(game,sheet,html));
  Hooks.on('getHeaderControlsItemSheet5e',(sheet,controls)=>{
    const item=sheet.item??sheet.document;
    if(item?.actor&&refinedFeature(item.actor)?.id===item.id&&item.isOwner&&game.settings.get(MODULE_ID,'ninjutsuClassAutomation'))controls.push({action:'n5eseRefined',icon:'fa-solid fa-wand-magic-sparkles',label:'Refined Ninjutsu — Auswahl',onClick:()=>configureRefined(game,item.actor).catch(e=>ui.notifications.warn(e.message))});
  });
  Hooks.on('createItem',(item,_options,userId)=>{
    if(userId===game.user.id&&item.actor&&refinedFeature(item.actor)?.id===item.id&&!item.getFlag(MODULE_ID,'refinedJutsu'))configureRefined(game,item.actor).catch(e=>ui.notifications.warn(e.message));
  });
  Hooks.on('dnd5e.restCompleted',async(actor,result)=>{
    if(!actor.isOwner||result.userId&&result.userId!==game.user.id||!['long','full'].includes(result.type)||!game.settings.get(MODULE_ID,'ninjutsuClassAutomation'))return;
    const feature=refinedFeature(actor);if(!feature)return;
    await feature.setFlag(MODULE_ID,'refinedJutsu',{ids:refinedSelection(actor),reselect:true});
    await configureRefined(game,actor).catch(e=>ui.notifications.warn(e.message));
  });
}
