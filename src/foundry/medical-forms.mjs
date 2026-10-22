import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel} from '../casting/medical-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {refreshActorPreparation} from './actor-preparation.mjs';
function originalFormBounds(actor){const data=actor.toObject();foundry.utils.setProperty(data,'flags.'+MODULE_ID+'.medicalForm.status','ended');const reference=new CONFIG.Actor.documentClass(data);reference.prepareData();return reference.system.attributes;}
const KEY='medicalForm',path='flags.'+MODULE_ID+'.'+KEY;
export function medicalForm(game,actor){const form=actor?.getFlag(MODULE_ID,KEY);return medicalEnabled(game)&&form?.status==='active'&&form.expiresAt>game.time.worldTime&&medicalFeature(actor,'Natural Talent','Natural Medicine')&&(!form.avatar||medicalFeature(actor,'Natures Avatar','Natural Medicine'))?form:null;}
export async function activateMedicalForm(game,actor,{avatar=false}={}){
 if(!actor?.isOwner||!medicalEnabled(game)||!medicalFeature(actor,'Natural Talent','Natural Medicine'))throw Error('Eigener Medical-Nin mit Natural Talent erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const feature=medicalFeature(actor,'Natural Talent','Natural Medicine');if(medicalForm(game,actor))throw Error('Vorherige Natural-Talent-Form zuerst beenden.');
  if(avatar&&(!medicalFeature(actor,'Natures Avatar','Natural Medicine')||medicalLevel(actor)<17))throw Error('Natures Avatar ab Medical-Nin-Stufe 17 erforderlich.');
  if(feature.system.uses.value<1)throw Error('Natural-Talent-Nutzungen erschöpft.');
  if(['paying','review'].includes(actor.getFlag(MODULE_ID,KEY)?.status))throw Error('Vorherige Transformation zuerst vom GM prüfen lassen.');
  const rank=medicalLevel(actor)>=17?'a':medicalLevel(actor)>=13?'b':medicalLevel(actor)>=9?'c':'d';
  const ranks=['d','c','b','a'],profiles=game.actors.filter(a=>a.uuid!==actor.uuid&&a.type==='npc'&&a.testUserPermission(game.user,'OBSERVER')&&a.system.details.summon?.enabled&&ranks.includes(a.system.details.summon.rank)&&ranks.indexOf(a.system.details.summon.rank)<=ranks.indexOf(rank));
  if(!profiles.length)throw Error('Ein zugänglicher vorhandener Summon-Actor des freigeschalteten Rangs '+rank.toUpperCase()+' ist erforderlich.');
  const div=document.createElement('div'),p=document.createElement('p'),s=document.createElement('select');s.name='profile';p.textContent='Tatsächlich zur eigenen Summoning-Tribe gehörendes Profil bestätigen. '+(avatar?'Eine Minute: Alle sechs Attribute werden nur auf höhere Profilwerte angehoben. Eigene HP, AC, Jutsu und Chakra bleiben erhalten.':'Körperliche Werte, HP und AC werden nur in vorbereiteten Daten ersetzt; ursprüngliche HP bleiben gespeichert und Jutsu/Chakra bleiben beim Charakter.')+' Die Rangstufe wird am vorhandenen Summon-Profil geprüft. Token-Erscheinung und nicht strukturierte Stamm-/Transformations-Traits bleiben ausdrücklich manuell.';div.append(p,s);
  for(const profile of profiles){const o=document.createElement('option');o.value=profile.uuid;o.textContent=profile.name+' · '+profile.system.details.summon.rank.toUpperCase()+' · '+profile.system.details.summon.tribe;s.append(o);}
  const uuid=await foundry.applications.api.DialogV2.wait({window:{title:avatar?'Natures Avatar':'Natural Talent'},content:div.innerHTML,buttons:[{action:'transform',label:'Tribe und Profil bestätigen; Nutzung verbrauchen',callback:(_e,b)=>b.form.elements.profile.value}],rejectClose:false});if(!uuid)return;
  const profile=profiles.find(p=>p.uuid===uuid);if(!profile||!ranks.includes(profile.system.details.summon.rank)||ranks.indexOf(profile.system.details.summon.rank)>ranks.indexOf(rank)||feature.system.uses.value<1)throw Error('Profil/Rang oder Ressource inzwischen verändert.');
  const attributes=profile.system.attributes,form={id:foundry.utils.randomID(),status:'paying',avatar,profileUuid:uuid,profileName:profile.name,traits:Object.fromEntries(['di','dr','dv','ci'].map(k=>[k,[...profile.system.traits[k].value]])),traitReferences:[...profile.items].filter(i=>i.type==='feat').map(i=>({uuid:i.uuid,name:i.name})),rank:profile.system.details.summon.rank,at:game.time.worldTime,expiresAt:game.time.worldTime+(avatar?60:(medicalLevel(actor)/2)*3600),abilities:Object.fromEntries((avatar?['str','dex','con','int','wis','cha']:['str','dex','con']).map(k=>[k,profile.system.abilities[k].value])),ac:attributes.ac.value,hpMax:attributes.hp.effectiveMax,hpValue:attributes.hp.effectiveMax,originalHP:actor.system.attributes.hp.value,originalHPMax:actor.system.attributes.hp.max,originalHPEffectiveMax:actor.system.attributes.hp.effectiveMax,originalAC:actor.system.attributes.ac.value,originalChakraMax:actor.system.attributes.chakra.max,originalChakraEffectiveMax:actor.system.attributes.chakra.effectiveMax};
  await actor.setFlag(MODULE_ID,KEY,form);
  try{const updates={item:[]};appendFeatureSpend(updates,feature);await actor.updateEmbeddedDocuments('Item',updates.item);form.status='active';await actor.setFlag(MODULE_ID,KEY,form);refreshActorPreparation(actor);actor.sheet?.render(false);}catch(error){form.status='review';form.error=error.message;await actor.setFlag(MODULE_ID,KEY,form);throw error;}
 });
}
export async function endMedicalForm(game,actor){
 if(!actor.isOwner)throw Error('Eigentümer erforderlich.');return withCastingActorLock(actor,async()=>{const form=actor.getFlag(MODULE_ID,KEY);if(!form)return;if(['paying','review'].includes(form.status)&&!game.user.isGM)throw Error('GM-Prüfung erforderlich.');if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Natural-Talent-Form beenden'},content:'<p>Transformation beenden? Avatar verwendet weiterhin die aktuellen eigenen HP; Natural Talent kehrt zu den ursprünglichen HP zurück. Die bezahlte Nutzung bleibt verbraucht.</p>',rejectClose:false}))return;await actor.setFlag(MODULE_ID,KEY,{...form,status:'ended'});refreshActorPreparation(actor);actor.sheet?.render(false);});
}
export function installMedicalForms(game,CharacterModel){
 const before=new WeakMap(),p=CharacterModel.prototype,abilities=p.prepareAbilities;
 p.prepareAbilities=function(config={},...args){
  const old=before.get(this);if(old)for(const [key,snapshot]of Object.entries(old))if(this.abilities[key].value===snapshot.applied)this.abilities[key].value=snapshot.base;before.delete(this);
  const form=medicalForm(game,this.parent);if(form){const changed={};for(const key of (form.avatar?['str','dex','con','int','wis','cha']:['str','dex','con'])){const value=form.avatar?Math.max(this.abilities[key].value,form.abilities[key]):form.abilities[key];if(!Number.isFinite(value))continue;changed[key]={base:this.abilities[key].value,applied:value};this.abilities[key].value=value;if(config.rollData?.abilities?.[key])config.rollData.abilities[key].value=value;}before.set(this,changed);}
  return abilities.call(this,config,...args);
 };
 const oldTraits=new WeakMap(),derive=p.prepareDerivedData;
 p.prepareDerivedData=function(...args){const previous=oldTraits.get(this);if(previous?.field===this.traits)for(const key of ['di','dr','dv','ci'])if(this.traits[key].value===previous.applied[key])this.traits[key].value=previous.base[key];oldTraits.delete(this);const result=derive.apply(this,args),form=medicalForm(game,this.parent);if(!form)return result;const base={},applied={};for(const key of ['di','dr','dv','ci']){base[key]=this.traits[key].value;applied[key]=new Set([...base[key],...(form.traits?.[key]??[])]);this.traits[key].value=applied[key];}oldTraits.set(this,{field:this.traits,base,applied});
  const hp=this.attributes.hp,chakra=this.attributes.chakra,own=originalFormBounds(this.parent);if(form.avatar){hp.max=own.hp.max;hp.effectiveMax=own.hp.effectiveMax;hp.value=Math.min(hp.effectiveMax,Math.max(0,this._source.attributes.hp.value));hp.damage=hp.effectiveMax-hp.value;this.attributes.ac.value=own.ac.value;chakra.max=own.chakra.max;chakra.effectiveMax=own.chakra.effectiveMax;chakra.value=Math.min(chakra.effectiveMax,this._source.attributes.chakra.value);chakra.damage=Math.max(0,chakra.effectiveMax-chakra.value);return result;}
  hp.max=form.hpMax;hp.effectiveMax=form.hpMax;hp.value=Math.min(form.hpMax,Math.max(0,form.hpValue));hp.damage=form.hpMax-hp.value;this.attributes.ac.value=form.ac;
  chakra.max=own.chakra.max;chakra.effectiveMax=own.chakra.effectiveMax;chakra.value=Math.min(chakra.effectiveMax,this._source.attributes.chakra.value);chakra.damage=Math.max(0,chakra.effectiveMax-chakra.value);return result;};
 Hooks.on('preUpdateActor',(actor,update,options)=>{
  const form=medicalForm(game,actor);if(!form||form.avatar||options.n5eseMedicalOriginalHP)return;
  const key='system.attributes.hp.value',value=update[key]??update.system?.attributes?.hp?.value;if(value===undefined)return;
  if(update[path]!==undefined||update.flags?.[MODULE_ID]?.[KEY]!==undefined)return false;
  const next={...form,hpValue:Math.max(0,Math.min(form.hpMax,Number(value)))};if(!Number.isFinite(next.hpValue))return false;
  if(next.hpValue===0)next.status='ended';update[path]=next;delete update[key];if(update.system?.attributes?.hp)delete update.system.attributes.hp.value;
 });
 Hooks.on('updateWorldTime',()=>{for(const actor of game.actors.filter(a=>a.getFlag(MODULE_ID,KEY)?.status==='active')){refreshActorPreparation(actor);actor.sheet?.render(false);}});
}
