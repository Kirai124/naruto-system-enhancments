import {MODULE_ID} from '../settings/register.mjs';
import {ninjutsuLevel,CHAKRA_RECOVERY,EFFICIENT_MOLDING} from '../casting/ninjutsu-resources.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {genjutsuLevel,actualizationPool} from '../casting/genjutsu-context.mjs';
import {medicalLevel,medicalFeature,scalpelState} from '../casting/medical-context.mjs';
import {taijutsuLevel,taijutsuFeature,martialDie} from '../casting/taijutsu-context.mjs';

export const CLASS_WINDOWS=Object.freeze({
 ninjutsu:{name:'Ninjutsu Specialist',level:ninjutsuLevel,settings:['ninjutsuClassAutomation','ninjutsuTrackers','efficientMoldingAutomation','subclassMoldingAutomation'],icon:'fa-hand-sparkles'},
 genjutsu:{name:'Genjutsu Specialist',level:genjutsuLevel,settings:['genjutsuClassAutomation'],icon:'fa-eye'},
 medical:{name:'Medical-Nin',level:medicalLevel,settings:['medicalClassAutomation'],icon:'fa-kit-medical'},
 taijutsu:{name:'Taijutsu Specialist',level:taijutsuLevel,settings:['taijutsuClassAutomation'],icon:'fa-hand-fist'}
});
const stores=new WeakMap();
const store=game=>{if(!stores.has(game))stores.set(game,{panels:new Map(),windows:new Map()});return stores.get(game);};
export const classWindowAvailable=(game,actor,kind)=>actor?.type==='character'&&!!CLASS_WINDOWS[kind]?.level(actor)&&CLASS_WINDOWS[kind].settings.some(k=>game.settings.get(MODULE_ID,k));
export function registerClassPanel(game,kind,id,label,build){store(game).panels.set(kind+':'+id,{kind,id,label,build});}
export function classPanelEntries(game,actor,kind){return [...store(game).panels.values()].filter(p=>p.kind===kind).flatMap(p=>{try{const panel=p.build(actor);return panel?[{id:p.id,label:p.label,panel}]:[];}catch(error){console.error(`[${MODULE_ID}] ${kind}/${p.id}`,error);const panel=document.createElement('p');panel.textContent='Dieser Abschnitt konnte nicht geladen werden. Details in der Konsole.';return [{id:p.id,label:p.label,panel}];}});}
/** Preserve native sheet decoration, but render executable panels in the class window. */
export function registerClassSheetPanel(game,kind,selector,label,render){
 registerClassPanel(game,kind,selector,label,actor=>{
  const root=document.createElement('div'),host=document.createElement('section');host.dataset.tab='features';root.append(host);
  render(actor.sheet??{actor,document:actor,render(){}},root);const panels=[...root.querySelectorAll(selector)];if(panels.length<2)return panels[0];const group=document.createElement('section');group.append(...panels);return group;
 });
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{render(sheet,html);const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;if(classWindowAvailable(game,actor,kind))root?.querySelectorAll(selector).forEach(p=>p.remove());});
}
export function registerClassSheetPanelForHook(game,kind,selector,label,hook,render){if(hook==='renderCharacterActorSheet')registerClassSheetPanel(game,kind,selector,label,render);else Hooks.on(hook,render);}
export function classResourceSummary(game,actor,kind){
 if(kind==='medical')return ['Chakra Scalpel','Preserve/Take Life','Channeled Healing','Natural Healing'].flatMap(name=>{const u=medicalFeature(actor,name)?.system.uses;return Number.isFinite(u?.max)?[name+' '+u.value+'/'+u.max]:[];}).concat(scalpelState(game,actor)?'Scalpel aktiv':'Scalpel inaktiv');
 if(kind==='taijutsu'){const u=taijutsuFeature(actor,'Martial Adept')?.system.uses;return u?['Martial Dice '+u.value+'/'+u.max,'d'+martialDie(taijutsuLevel(actor))]:[];}
 if(kind==='genjutsu'){const p=actualizationPool(actor);return p?['Actualization '+p.remaining+'/'+p.maximum,'d'+p.die]:[];}
 return [...actor.items].filter(i=>[CHAKRA_RECOVERY,EFFICIENT_MOLDING].includes(sourceOf(i))&&Number.isFinite(i.system.uses?.max)).map(i=>i.name+' '+i.system.uses.value+'/'+i.system.uses.max);
}
function chips(game,actor,kind){const div=document.createElement('div');div.className='n5ese-class-resources';for(const text of classResourceSummary(game,actor,kind)){const span=document.createElement('span');span.textContent=text;div.append(span);}return div;}
let WindowClass;
function windowClass(){return WindowClass??=class extends foundry.applications.api.ApplicationV2{
 static DEFAULT_OPTIONS={classes:['n5ese-class-window'],window:{resizable:true},position:{width:680,height:680}};
 constructor(game,actor,kind){super({window:{title:CLASS_WINDOWS[kind].name+' · '+actor.name,icon:'fa-solid '+CLASS_WINDOWS[kind].icon},classes:['n5ese-class-window','n5ese-class-'+kind]});Object.assign(this,{game,actor,kind,query:'',closedGroups:new Set()});}
 async _renderHTML(){
  const root=document.createElement('div');root.className='n5ese-class-workspace';
  if(!classWindowAvailable(this.game,this.actor,this.kind)||!this.actor.testUserPermission(this.game.user,'OBSERVER')){root.textContent='Klasse oder Leseberechtigung nicht verfügbar.';return root;}
  const header=document.createElement('header');header.className='n5ese-class-hero';const title=document.createElement('strong');title.textContent=CLASS_WINDOWS[this.kind].name;const subtitle=document.createElement('small');subtitle.textContent=this.actor.name+' · Stufe '+CLASS_WINDOWS[this.kind].level(this.actor);header.append(title,subtitle,chips(this.game,this.actor,this.kind));root.append(header);
  const hint=document.createElement('p');hint.className='n5ese-class-hint';hint.textContent='Nur vorhandene Fähigkeiten · Ziele auf der Szene markieren · Jutsu- und Trefferoptionen an der Chatkarte';root.append(hint);
  const search=document.createElement('input');search.type='search';search.placeholder='Fähigkeit oder gespeicherten Vorgang suchen …';search.setAttribute('aria-label','Klassenaktionen suchen');search.value=this.query;root.append(search);
  const body=document.createElement('div');body.className='n5ese-class-groups';root.append(body);
  for(const {id,label,panel}of classPanelEntries(this.game,this.actor,this.kind)){
   const group=document.createElement('details'),summary=document.createElement('summary');group.dataset.group=id;summary.textContent=label;group.open=!this.closedGroups.has(id);group.append(summary);panel.querySelector(':scope > h3')?.remove();group.append(panel);body.append(group);group.addEventListener('toggle',()=>{if(group.open)this.closedGroups.delete(id);else this.closedGroups.add(id);});
  }
  const empty=document.createElement('p');empty.setAttribute('role','status');empty.textContent='Keine passenden Aktionen vorhanden.';root.append(empty);
  const filter=()=>{this.query=search.value;const q=this.query.trim().toLocaleLowerCase('de');let n=0;for(const group of body.children){group.hidden=!!q&&!group.textContent.toLocaleLowerCase('de').includes(q);if(!group.hidden){n++;if(q)group.open=true;}}empty.hidden=n>0;};search.addEventListener('input',filter);filter();return root;
 }
 _replaceHTML(result,content){const focused=content.contains(document.activeElement)&&document.activeElement?.matches('input[type="search"]'),scroll=content.querySelector('.n5ese-class-groups')?.scrollTop??0;content.replaceChildren(result);const body=content.querySelector('.n5ese-class-groups');if(body)body.scrollTop=scroll;if(focused)content.querySelector('input[type="search"]')?.focus();}
 async close(options){store(this.game).windows.delete(this.actor.uuid+':'+this.kind);return super.close(options);}
};}
export function openClassWindow(game,actor,kind){
 if(!classWindowAvailable(game,actor,kind)||!actor.testUserPermission(game.user,'OBSERVER'))throw Error('Vorhandene Klasse, aktivierte Automation und Leseberechtigung erforderlich.');
 const windows=store(game).windows,key=actor.uuid+':'+kind;let app=windows.get(key);if(!app){const Class=windowClass();app=new Class(game,actor,kind);windows.set(key,app);}if(app.rendered)app.bringToFront();else app.render({force:true});return app;
}
export function installClassWindows(game){
 const state=store(game);if(state.installed)return;state.installed=true;
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element,host=root?.querySelector('section[data-tab="features"]');root?.querySelector('.n5ese-class-launchers')?.remove();if(!host)return;const bar=document.createElement('section');bar.className='n5ese-class-launchers';for(const [kind,definition]of Object.entries(CLASS_WINDOWS))if(classWindowAvailable(game,actor,kind)){const b=document.createElement('button');b.type='button';b.className='n5ese-class-launch n5ese-class-'+kind;b.textContent=definition.name+' · Aktionen';b.addEventListener('click',()=>{try{openClassWindow(game,actor,kind);}catch(error){ui.notifications.warn(error.message);}});bar.append(b);}if(bar.childNodes.length)host.prepend(bar);});
 let scheduled=false;const refresh=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;for(const app of state.windows.values())if(app.rendered)app.render({force:false});});};
 for(const hook of ['updateActor','createItem','updateItem','deleteItem','createActiveEffect','updateActiveEffect','deleteActiveEffect','updateWorldTime','updateCombat','deleteCombat','updateUser','updateSetting'])Hooks.on(hook,refresh);
 Hooks.on('deleteActor',actor=>{for(const app of state.windows.values())if(app.actor.uuid===actor.uuid)app.close();});
}
