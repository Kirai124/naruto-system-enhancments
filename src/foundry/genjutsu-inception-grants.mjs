import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {GENJUTSU_FEATURES} from '../casting/genjutsu-sources.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';

const grants=[['Elemental Manifestation','Illusionary Chronicle'],['Hallucinatory Instrument','Song of the End'],['Phantasmal Force','Agonizing Thoughts'],['Reality Marble','Persistent Genjutsu'],['Temporal Stopwatch','Pause'],['Illusionary Weapon','Vicious Illusion']],busy=new WeakSet();
export async function chooseTemporalTechnique(game,actor){
 const feature=ownedGenjutsuFeature(actor,'Temporal Technique','Time Slipper');if(!genjutsuEnabled(game)||!actor?.isOwner||!feature||busy.has(actor))throw Error('Eigene Temporal Technique erforderlich.');busy.add(actor);
 try{
  if(feature.getFlag(MODULE_ID,'genjutsuTemporalChoice'))throw Error('Zusätzliche Mirage bereits festgelegt; Änderungen bei erlaubtem Klassenaufstieg mit dem GM abwickeln.');
  const choices=GENJUTSU_FEATURES.filter(d=>d.category==='Malleable Mirages'&&/temporal stopwatch/i.test(d.requirements??'')&&(!d.level||d.level<=genjutsuLevel(actor))&&![...actor.items].some(i=>sourceOf(i)===d.source));
  if(!choices.length)throw Error('Keine weitere belegte Stopwatch-Mirage auf dieser Klassenstufe verfügbar.');const select=document.createElement('select');select.name='mirage';for(const c of choices){const option=document.createElement('option');option.value=c.source;option.textContent=c.name+(c.level?' · Stufe '+c.level:'');select.append(option);}
  const source=await foundry.applications.api.DialogV2.wait({window:{title:'Temporal Technique · zusätzliche Mirage'},content:select.outerHTML,buttons:[{action:'choose',label:'Zusätzliche bekannte Mirage bestätigen',callback:(_e,b)=>b.form.elements.mirage.value}],rejectClose:false});if(!source)return;
  const choice=choices.find(d=>d.source===source),original=choice&&await fromUuid(source);if(!original||feature.getFlag(MODULE_ID,'genjutsuTemporalChoice')||!actor.items.has(feature.id)||[...actor.items].some(i=>sourceOf(i)===source)||choice.level>genjutsuLevel(actor))throw Error('Mirage-Auswahl oder Voraussetzungen inzwischen verändert.');
  const data=original.toObject();delete data._id;delete data.folder;data._stats??={};data._stats.compendiumSource=source;data.flags??={};data.flags.core??={};data.flags.core.sourceId=source;data.flags[MODULE_ID]??={};data.flags[MODULE_ID].genjutsuTemporalGrant={sourceFeatureId:feature.id};
  const [created]=await actor.createEmbeddedDocuments('Item',[data]);if(!created)throw Error('Zusätzliche Mirage nicht erstellt.');await feature.setFlag(MODULE_ID,'genjutsuTemporalChoice',{source,itemId:created.id});
 }finally{busy.delete(actor);}
}
export async function reconcileInceptionGrants(game,actor,{explicit=false}={}){
 if(!genjutsuEnabled(game)||!actor?.isOwner||genjutsuLevel(actor)<7||busy.has(actor))return;
 busy.add(actor);
 try{
  for(const [name,mirage] of grants){
   const source=ownedGenjutsuFeature(actor,name,'Choose Inception'),definition=GENJUTSU_FEATURES.find(f=>f.name===mirage&&f.category==='Malleable Mirages');if(!source||!definition||[...actor.items].some(i=>i.type==='feat'&&sourceOf(i)===definition.source))continue;
   // An intentionally deleted grant is not silently recreated on every reload.
   if(source.getFlag(MODULE_ID,'genjutsuInceptionGranted')&&!explicit)continue;
   const original=await fromUuid(definition.source);if(original?.type!=='feat')throw Error('Belegte Inception-Mirage fehlt: '+mirage);
   // Recheck after the asynchronous source load.
   if(genjutsuLevel(actor)<7||!actor.items.has(source.id)||[...actor.items].some(i=>i.type==='feat'&&sourceOf(i)===definition.source))continue;
   const data=original.toObject();delete data._id;delete data.folder;data._stats??={};data._stats.compendiumSource=definition.source;data.flags??={};data.flags.core??={};data.flags.core.sourceId=definition.source;data.flags[MODULE_ID]??={};data.flags[MODULE_ID].genjutsuInceptionGrant={sourceFeatureId:source.id,inception:name,level:7};
   const [created]=await actor.createEmbeddedDocuments('Item',[data]);if(!created)throw Error('Inception-Mirage wurde nicht erstellt.');await source.setFlag(MODULE_ID,'genjutsuInceptionGranted',{itemId:created.id,source:definition.source});
  }
 }finally{busy.delete(actor);}
}
export function installInceptionGrants(game){
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;root?.querySelector('.n5ese-temporal-technique')?.remove();const feature=genjutsuEnabled(game)&&ownedGenjutsuFeature(actor,'Temporal Technique','Time Slipper'),host=root?.querySelector('section[data-tab="features"]');if(!feature||!host)return;const b=document.createElement('button');b.type='button';b.className='n5ese-temporal-technique';b.textContent='Temporal Technique · '+(feature.getFlag(MODULE_ID,'genjutsuTemporalChoice')?'zusätzliche Mirage gewählt':'zusätzliche Stopwatch-Mirage wählen');b.disabled=!actor.isOwner||!!feature.getFlag(MODULE_ID,'genjutsuTemporalChoice');b.addEventListener('click',()=>chooseTemporalTechnique(game,actor).catch(e=>ui.notifications.warn(e.message)));host.prepend(b);});
 const authority=actor=>actor?.isOwner&&(game.users.activeGM?game.users.activeGM.id===game.user.id:game.users.find(u=>u.active&&!u.isGM&&actor.testUserPermission(u,'OWNER'))?.id===game.user.id);
 const queue=actor=>{if(authority(actor))reconcileInceptionGrants(game,actor).catch(e=>ui.notifications.warn(e.message));};
 for(const actor of game.actors)queue(actor);
 Hooks.on(MODULE_ID+'.genjutsuAutomationChanged',()=>{for(const actor of game.actors)queue(actor);});
 for(const hook of ['createItem','updateItem'])Hooks.on(hook,(item,_changes,_options,userId)=>{if(item.actor&&['class','feat'].includes(item.type)&&(userId??_options)===game.user.id)queue(item.actor);});
}
