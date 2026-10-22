import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel} from '../casting/medical-context.mjs';
import {mundaneWeaponProfile} from '../casting/weapon-profiles.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';

export const SPIRITUAL_WEAPONS='medicalSpiritualWeapons';
export const spiritualWeapons=actor=>structuredClone(actor.getFlag(MODULE_ID,SPIRITUAL_WEAPONS)??[]);
const allowed=['blo','cri','dea','dis','fin','mla','rch','trp','ver'];
function owner(game,actor){if(!medicalEnabled(game)||!actor?.isOwner||!medicalFeature(actor,'Spiritual Weapons','Shaman'))throw Error('Eigener Shaman mit Spiritual Weapons erforderlich.');}
export function spiritualWeaponAvailable(game,actor,state){return medicalEnabled(game)&&!!medicalFeature(actor,'Spiritual Weapons','Shaman')&&state?.status==='active';}
export async function summonSpiritualWeapon(game,actor){
 owner(game,actor);return withCastingActorLock(actor,async()=>{
  const candidates=[...actor.items].filter(i=>i.type==='weapon'&&['simpleM','martialM'].includes(i.system.type.value)).map(i=>({uuid:i.uuid,name:i.name+' · Inventar'})),pack=game.packs.get('n5eb.items');
  if(pack)for(const entry of await pack.getIndex({fields:['system.type.value']}))if(entry.type==='weapon'&&['simpleM','martialM'].includes(entry.system?.type?.value))candidates.push({uuid:'Compendium.n5eb.items.Item.'+entry._id,name:entry.name+' · Systemprofil'});
  if(!candidates.length)throw Error('Vorhandenes Simple-/Martial-Melee-Waffenprofil erforderlich.');
  const div=document.createElement('div'),select=document.createElement('select');select.name='weapon';for(const entry of candidates.sort((a,b)=>a.name.localeCompare(b.name))){const o=document.createElement('option');o.value=entry.uuid;o.textContent=entry.name;select.append(o);}div.append(select);
  const p=document.createElement('p');p.textContent='Waffenform und tatsächlich freie Hand bestätigen. Nur das Grundprofil wird verwendet; WIS statt STR ist wählbar. Vorhandene Inventarwaffen bleiben erhalten. Aktionsökonomie und Zahl freier Hände bleiben manuell.';div.append(p);
  const uuid=await foundry.applications.api.DialogV2.wait({window:{title:'Spiritual Weapons'},content:div.innerHTML,buttons:[{action:'summon',label:'Waffenform erzeugen',callback:(_e,b)=>b.form.elements.weapon.value}],rejectClose:false});if(!uuid)return;
  if(!candidates.some(c=>c.uuid===uuid))throw Error('Unbekanntes Waffenprofil.');const original=await fromUuid(uuid);if(!['simpleM','martialM'].includes(original?.system.type.value))throw Error('Nur Simple-/Martial-Melee-Waffen erlaubt.');
  const state={id:foundry.utils.randomID(),activityId:foundry.utils.randomID(),status:'active',profileSource:uuid,profile:mundaneWeaponProfile(original),ability:'wis',at:game.time.worldTime};
  await actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,[...spiritualWeapons(actor),state]);return state;
 });
}
export async function configureSpiritualWeapon(game,actor,id){
 owner(game,actor);return withCastingActorLock(actor,async()=>{
  const list=spiritualWeapons(actor),state=list.find(w=>w.id===id);if(!spiritualWeaponAvailable(game,actor,state))throw Error('Spiritual Weapon nicht aktiv.');
  if(['paying','review'].includes(state.upgrade?.status))throw Error('Unterbrochene Merkmalszahlung zuerst vom GM prüfen lassen.');
  const div=document.createElement('div'),select=document.createElement('select');select.name='ability';for(const value of ['wis','native']){const o=document.createElement('option');o.value=value;o.textContent=value==='wis'?'WIS für Angriff und Schaden':'Normales Waffenattribut';if(value===state.ability)o.setAttribute('selected','');select.append(o);}div.append(select);
  const properties=new Set(state.profile.system.properties),choices=allowed.filter(k=>!properties.has(k)&&(k!=='ver'||!state.profile.system.damage.base.custom?.enabled&&state.profile.system.damage.base.denomination&&state.profile.system.damage.base.denomination<12));
  if(medicalLevel(actor)>=5){const p=document.createElement('p');p.textContent='Optional genau zwei neue Merkmale wählen: eine Scalpel-Charge; ersetzt vorherige Zusatzmerkmale und startet deren zehn Minuten neu. Ohne Merkmalsauswahl wird nur das Attribut gespeichert.';div.append(p);for(const key of choices){const label=document.createElement('label'),input=document.createElement('input');input.name='property';input.value=key;input.type='checkbox';label.append(input,document.createTextNode(game.i18n.localize(CONFIG.DND5E.itemProperties[key].label)));div.append(label,document.createElement('br'));}}
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Spiritual Weapon · Attribut und Merkmale'},content:div.innerHTML,buttons:[{action:'save',label:'Auswahl und gegebenenfalls Charge bestätigen',callback:(_e,b)=>({ability:b.form.elements.ability.value,properties:[...b.form.querySelectorAll('[name="property"]:checked')].map(i=>i.value)})}],rejectClose:false});if(!choice)return;
  if(choice.properties.length&&medicalLevel(actor)<5||!['wis','native'].includes(choice.ability)||choice.properties.length&&choice.properties.length!==2||choice.properties.some(k=>!choices.includes(k))||new Set(choice.properties).size!==choice.properties.length)throw Error('Attribut und genau zwei neue Merkmale wählen.');
  state.ability=choice.ability;
  if(!choice.properties.length){await actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,list);return;}
  const feature=medicalFeature(actor,'Chakra Scalpel');if(!feature||feature.system.uses.value<1)throw Error('Eine Scalpel-Charge erforderlich.');
  state.upgrade={status:'paying',properties:choice.properties,expiresAt:game.time.worldTime+600};await actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,list);
  try{const updates={item:[]};appendFeatureSpend(updates,feature);await actor.updateEmbeddedDocuments('Item',updates.item);state.upgrade.status='active';await actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,list);}catch(error){state.upgrade.status='review';state.upgrade.error=error.message;await actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,list);throw error;}
 });
}
export function spiritualWeaponItem(game,actor,state){
 if(!spiritualWeaponAvailable(game,actor,state))throw Error('Spiritual Weapon nicht aktiv.');
 const profile=structuredClone(state.profile),properties=new Set(profile.system.properties),upgrade=state.upgrade?.status==='active'&&state.upgrade.expiresAt>game.time.worldTime?state.upgrade.properties:[];
 for(const key of upgrade)properties.add(key);
 if(upgrade.includes('ver')){const base=profile.system.damage.base,steps=[4,6,8,10,12],next=steps.find(n=>n>base.denomination);if(next)profile.system.damage.versatile={...base,denomination:next,custom:{enabled:false,formula:''}};}
 const data={_id:state.id,name:'Spiritual Weapon · '+profile.name,img:profile.img,type:'weapon',effects:[],flags:{[MODULE_ID]:{medicalSpiritualWeapon:{instanceId:state.id,sourceActorUuid:actor.uuid}}},system:{...profile.system,properties:[...properties],quantity:1,equipped:true,proficient:1,magicalBonus:'',identified:true,activities:{[state.activityId]:{_id:state.activityId,type:'attack',name:'Spiritual Weapon',activation:{type:'action',value:1},attack:{ability:state.ability==='wis'?'wis':'',type:{value:'melee',classification:'weapon'},bonus:''},damage:{includeBase:true,parts:[]},consumption:{targets:[]}}}}};
 const item=new CONFIG.Item.documentClass(data,{parent:actor});item.prepareFinalAttributes?.();return item;
}
export async function attackSpiritualWeapon(game,actor,id,{counterId}={}){owner(game,actor);const state=spiritualWeapons(actor).find(w=>w.id===id),item=spiritualWeaponItem(game,actor,state);if(counterId)item.updateSource({['flags.'+MODULE_ID+'.medicalSpiritualWeapon.counterId']:counterId});return item.system.activities.get(state.activityId).rollAttack({}, {configure:true},{data:{flags:{[MODULE_ID]:{castingSnapshot:item.toObject(),medicalSpiritualAttack:{id:foundry.utils.randomID(),instanceId:id}}}}});}
export async function dismissSpiritualWeapon(game,actor,id){owner(game,actor);return withCastingActorLock(actor,()=>actor.setFlag(MODULE_ID,SPIRITUAL_WEAPONS,spiritualWeapons(actor).map(w=>w.id===id?{...w,status:'ended'}:w)));}
export function installSpiritualWeapons(game,types,ActorClass){
 const virtual=new WeakMap(),wrapped=new WeakSet(),update=ActorClass.prototype.updateEmbeddedDocuments;
 ActorClass.prototype.updateEmbeddedDocuments=function(type,updates,...args){if(type==='Item'&&virtual.get(this)?.size){updates=updates.filter(u=>!virtual.get(this).has(u._id)||this.items.has(u._id));if(!updates.length)return Promise.resolve([]);}return update.call(this,type,updates,...args);};
 for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const attack=p.rollAttack;
  p.rollAttack=async function(config={},dialog={},message={}){const marker=this.item.getFlag(MODULE_ID,'medicalSpiritualWeapon');if(!marker)return attack.call(this,config,dialog,message);
   owner(game,this.actor);const state=spiritualWeapons(this.actor).find(w=>w.id===marker.instanceId);if(marker.sourceActorUuid!==this.actor.uuid||this.actor.items.has(this.item.id))throw Error('Ungültiges virtuelles Waffenprofil.');const item=spiritualWeaponItem(game,this.actor,state),activity=item.system.activities.get(state.activityId),ids=virtual.get(this.actor)??new Set();if(ids.has(item.id))throw Error('Ein Angriff dieser Waffe ist noch offen.');if(marker.counterId)item.updateSource({['flags.'+MODULE_ID+'.medicalSpiritualWeapon.counterId']:marker.counterId});ids.add(item.id);virtual.set(this.actor,ids);
   try{return await attack.call(activity,config,dialog,{...message,data:{...message.data,flags:{...message.data?.flags,[MODULE_ID]:{...message.data?.flags?.[MODULE_ID],castingSnapshot:item.toObject(),medicalSpiritualAttack:{id:foundry.utils.randomID(),instanceId:state.id}}}}});}finally{ids.delete(item.id);if(!ids.size)virtual.delete(this.actor);}
  };
 }
}
