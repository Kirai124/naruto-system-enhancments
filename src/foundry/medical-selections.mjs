import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel} from '../casting/medical-context.mjs';
import {refreshActorPreparation} from './actor-preparation.mjs';

const KEY='medicalSelections';
export const MEDICAL_SELECTIONS=[
 {id:'combat',name:'Expert Combatant',category:'Combat Medic',limit:l=>1+Number(l>=13)+Number(l>=17),eligible:i=>['taijutsu','bukijutsu'].includes(i.system.jutsu?.type),rest:['long','full']},
 {id:'counselor',name:'Therapeutic Training',category:'Counselor-Nin',limit:l=>1+[5,9,13,17].filter(n=>l>=n).length,eligible:i=>i.system.jutsu?.type==='genjutsu',rest:[]},
 {id:'scribe',name:'Altered Enchantment',category:'Spiritual Scribe',limit:l=>1+Number(l>=13)+Number(l>=17),eligible:i=>i.system.jutsu?.keywords?.has('fuinjutsu'),rest:['full']},
 {id:'elemental',name:'Elemental Expert',category:'Elemental Medic',limit:l=>1+Number(l>=13)+Number(l>=17),eligible:(i,a)=>(a.getFlag(MODULE_ID,KEY)?.releases??[]).some(k=>i.system.jutsu?.keywords?.has(k)),rest:['full']}
];
export async function configureMedicalSelection(game,actor,id){
 const rule=MEDICAL_SELECTIONS.find(r=>r.id===id),feature=rule&&medicalFeature(actor,rule.name,rule.category);
 if(!medicalEnabled(game)||!actor?.isOwner||!feature)throw Error('Tatsächlich besessenes Auswahlfeature erforderlich.');
 const state=structuredClone(actor.getFlag(MODULE_ID,KEY)??{}),previous=state[id]??[];
 if(previous.length&&!game.user.isGM&&!state.unlock?.[id])throw Error('Auswahl ist festgelegt; Änderung nur nach der vorgesehenen Rast oder GM-Korrektur.');
 const candidates=[...actor.items].filter(i=>i.type==='spell'&&rule.eligible(i,actor)),div=document.createElement('div'),note=document.createElement('p');note.textContent=rule.name+': maximal '+rule.limit(medicalLevel(actor))+' tatsächlich bekannte Jutsu. Das Modul ergänzt Medical nur in vorbereiteten Daten; die Jutsu-Originaldaten bleiben erhalten.';div.append(note);
 for(const item of candidates){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='jutsu';input.value=item.id;if(previous.includes(item.id))input.setAttribute('checked','');l.append(input,document.createTextNode(item.name));div.append(l,document.createElement('br'));}
 const ids=await foundry.applications.api.DialogV2.wait({window:{title:rule.name},content:div.innerHTML,buttons:[{action:'save',label:'Auswahl speichern',callback:(_e,b)=>[...b.form.querySelectorAll('[name="jutsu"]:checked')].map(i=>i.value)}],rejectClose:false});if(!ids)return;
 if(ids.length>rule.limit(medicalLevel(actor))||ids.some(id=>!candidates.some(i=>i.id===id)))throw Error('Ungültige Medical-Jutsu-Auswahl.');
 state[id]=ids;state.unlock={...state.unlock,[id]:false};await actor.setFlag(MODULE_ID,KEY,state);refreshActorPreparation(actor);actor.sheet?.render(false);
}
export async function configureMedicalReleases(game,actor){
 if(!medicalEnabled(game)||!actor.isOwner||!medicalFeature(actor,'Elemental Beginning','Elemental Medic'))throw Error('Elemental Beginning erforderlich.');
 const state=structuredClone(actor.getFlag(MODULE_ID,KEY)??{}),maximum=medicalFeature(actor,'Preserve Life: Elemental Regrowth','Elemental Medic')?2:1;
 if(state.releases?.length&&!game.user.isGM)throw Error('Nature-Release ist festgelegt; Änderungen bestätigt der GM.');
 const div=document.createElement('div');for(const release of ['earth','wind','fire','water','lightning']){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.name='release';i.value=release;if(state.releases?.includes(release))i.setAttribute('checked','');l.append(i,document.createTextNode(release));div.append(l,document.createElement('br'));}
 const releases=await foundry.applications.api.DialogV2.wait({window:{title:'Elemental Medic · freigeschaltete Nature Releases'},content:div.innerHTML,buttons:[{action:'save',label:'Tatsächliche Feature-Auswahl bestätigen',callback:(_e,b)=>[...b.form.querySelectorAll('[name="release"]:checked')].map(i=>i.value)}],rejectClose:false});if(!releases)return;
 if(releases.length!==maximum||releases.some(r=>!['earth','wind','fire','water','lightning'].includes(r)))throw Error('Genau '+maximum+' freigeschaltete Nature-Release-Auswahl(en) erforderlich.');
 state.releases=releases;await actor.setFlag(MODULE_ID,KEY,state);refreshActorPreparation(actor);actor.sheet?.render(false);
}
export function installMedicalSelections(game,SpellModel){
 const previous=new WeakMap(),p=SpellModel.prototype,derive=p.prepareDerivedData;
 p.prepareDerivedData=function(...args){
  const old=previous.get(this);if(old?.field===this.jutsu)this.jutsu.keywords=old.keywords;previous.delete(this);
  const actor=this.parent.actor;
  if(actor&&medicalEnabled(game)){
   const state=actor.getFlag(MODULE_ID,KEY)??{};
   if(MEDICAL_SELECTIONS.some(r=>medicalFeature(actor,r.name,r.category)&&(state[r.id]??[]).length<=r.limit(medicalLevel(actor))&&state[r.id]?.includes(this.parent.id)&&r.eligible(this.parent,actor))){previous.set(this,{field:this.jutsu,keywords:this.jutsu.keywords});this.jutsu.keywords=new Set(this.jutsu.keywords);this.jutsu.keywords.add('medical');}
  }
  return derive.apply(this,args);
 };
 Hooks.on('dnd5e.restCompleted',async(actor,_result,config)=>{if(!medicalEnabled(game)||!actor.isOwner||!medicalLevel(actor))return;const state=actor.getFlag(MODULE_ID,KEY)??{},unlock={...state.unlock};for(const rule of MEDICAL_SELECTIONS)if(rule.rest.includes(config.type))unlock[rule.id]=true;await actor.setFlag(MODULE_ID,KEY,{...state,unlock});});
 Hooks.on('getHeaderControlsItemSheet5e',(sheet,buttons)=>{
  const item=sheet.document??sheet.object;if(!medicalEnabled(game)||!game.user.isGM||item?.type!=='spell'||!item.actor?.isOwner||!medicalFeature(item.actor,'Advanced Medical Research'))return;
  buttons.unshift({label:'Medical-Eigenentwicklung',action:'n5eseMedicalResearch',icon:'fa-solid fa-flask',onClick:async()=>{const before=item.getFlag(MODULE_ID,'medicalResearch'),confirm=await foundry.applications.api.DialogV2.confirm({window:{title:'Advanced Medical Research'},content:before?'<p>GM-Bestätigung dieser Eigenentwicklung entfernen?</p>':'<p>Bestätige, dass dieses konkrete Medical-Jutsu eine eigene, durch Advanced Medical Research entstandene Neuentwicklung dieses Charakters ist. Keine allgemeine Freigabe aller Medical-Jutsu.</p>',rejectClose:false});if(confirm){await item.setFlag(MODULE_ID,'medicalResearch',before?null:{actorUuid:item.actor.uuid,confirmedBy:game.user.id});refreshActorPreparation(item.actor);}}});
 });
}
