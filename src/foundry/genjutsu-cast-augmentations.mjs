import {sourceOf} from '../casting/feature-rules.mjs';
import {sensoryDefinition} from '../casting/genjutsu-sensory.mjs';
import {activeMistyKit,MISTY_KIT_STATE,mistyDice} from '../casting/genjutsu-kits.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,isGenjutsu,isDistantSoulJutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {appendActualizationSpend} from '../casting/genjutsu-resources.mjs';
import {subclassCastExpiry} from '../casting/subclass-cast-lifetime.mjs';

const sensory=['auditory','inhaled','tactile','visual','unaware'];
const feature=(actor,name,category)=>ownedGenjutsuFeature(actor,name,category);
export function addGenjutsuAugmentationFields(game,activity,config,result){
 if(!genjutsuEnabled(game)||!isGenjutsu(activity.item))return;const selected=config.n5ese?.genjutsu??{},actor=activity.actor;
 const checkbox=(key,label)=>result.fields.push({name:'n5ese.genjutsu.'+key,value:!!selected[key],field:new foundry.data.fields.BooleanField({label}),input:result.inputs.createCheckboxInput});
 if(sourceOf(activity.item)==='Compendium.n5eb.jutsus.Item.om6RDjvrJ0uYn5UU'&&feature(actor,'Synchronous Technique','Layered Reality'))result.fields.push({name:'n5ese.genjutsu.synchronous',value:selected.synchronous??'',field:new foundry.data.fields.StringField({label:'Synchronous Doubt: Ziel steht tatsächlich unter dieser eigenen Genjutsu-Konzentration (60 ft, gekoppelte Dauer)'}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options:[{value:'',label:'Normale Doubt-Dauer und Berührung'},...[...actor.concentration.effects].filter(e=>{const ref=e.getFlag('n5eb','item'),item=ref?.data?new CONFIG.Item.documentClass(ref.data,{parent:actor}):actor.items.get(ref?.id);return isGenjutsu(item)&&!e.disabled;}).map(e=>({value:e.id,label:e.name}))]})});
 if(feature(actor,'Imperceptible','Unseen Dream')&&activity.item.system.jutsu.keywords.has('unaware'))checkbox('imperceptible','Imperceptible: keine Reaktion beim Cast; Schutz bis Ende des nächsten eigenen Zuges (1 Nutzung)');
 if(feature(actor,'Words Of Detriment','Siren')&&sensory.some(k=>activity.item.system.jutsu.keywords.has(k)))checkbox('wordsDetriment','Words Of Detriment: nur Auditory; zusätzliche Zielwirkung an der Chatkarte (1 Nutzung)');
 if(feature(actor,'Permeating Seals','Distant Soul')&&activity.item.system.jutsu.keywords.has('fuinjutsu'))checkbox('permeatingSeal','Permeating Seals: keine Reaktion auf diesen Cast (8 Chakra + 1 Nutzung)');
 if(feature(actor,'Nightmare Incarnates','Corrupt Thoughts')&&activity.activation.type==='action'&&[...activity.item.system.activities].some(a=>a.damage?.parts?.length))checkbox('nightmareIncarnates','Nightmare Incarnates: schädigendes Genjutsu als Bonusaktion (1 Nutzung)');
 if(sensoryDefinition(activity.item)?.kind==='eagle')checkbox('eagleFree',"Sensor's Influence: Eagle’s Eye ohne Wirkkosten (3 AD + 1 Nutzung)");
 if(feature(actor,'Genjutsu Insignia','Distant Soul')&&activity.item.system.jutsu.keywords.has('fuinjutsu')&&activity.save?.ability?.size)checkbox('insignia','Genjutsu Insignia: Nachteil beim Save; bei Fehlschlag Zielwirkung und nächsten Unterhalt bestätigen (1 Nutzung)');
 if(feature(actor,'Poisoned Mists','Misty Distortionist'))checkbox('poisonedMists','Poisoned Mists: Kit um eine Stufe abbauen; CON-Save, Envenomed + Weakened');
 if(feature(actor,'Venomous Illusions','Misty Distortionist'))checkbox('venomousIllusions','Venomous Illusions: längeren Inhaled-Cast als Full-Turn-Action bestätigen (3 Actualization Dice)');
 if(feature(actor,'Illusionary Fury','Illusionist')){
  for(const [key,label,options] of [['furyFrom','Illusionary Fury: ersetztes Sinneskeyword',sensory.filter(k=>k!=='unaware')],['furyTo','Illusionary Fury: neues Sinneskeyword',sensory.filter(k=>k!=='unaware')],['furyBenefit','Illusionary Fury: Verstärkung zusätzlich zum Keywordwechsel',['duration','conditions']]])result.fields.push({name:'n5ese.genjutsu.'+key,value:selected[key]??'',field:new foundry.data.fields.StringField({label:label+' · 1 Actualization Die, Verstärkung 1×/Long Rest'}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options:[{value:'',label:'Nicht verwenden'},...options.map(value=>({value,label:value}))]})});
 }
}
export function prepareGenjutsuAugmentation(game,activity,config,item){
 if(!genjutsuEnabled(game)||!isDistantSoulJutsu(item))return;const selected=config.n5ese?.genjutsu??{},keys=new Set(item.system.jutsu.keywords),patch={},marker={};
 if(selected.synchronous){const concentration=item.actor.effects.get(selected.synchronous),ref=concentration?.getFlag('n5eb','item'),original=ref?.data?new CONFIG.Item.documentClass(ref.data,{parent:item.actor}):item.actor.items.get(ref?.id),targets=[...game.user.targets].filter(t=>t.actor);if(sourceOf(item)!=='Compendium.n5eb.jutsus.Item.om6RDjvrJ0uYn5UU'||!feature(item.actor,'Synchronous Technique','Layered Reality')||!concentration||concentration.disabled||!isGenjutsu(original)||targets.length!==1)throw Error('Synchronous Doubt benötigt genau ein tatsächlich von der bestätigten eigenen Genjutsu-Konzentration betroffenes Ziel.');marker.synchronous={concentrationId:concentration.id,targetUuid:targets[0].actor.uuid};patch['system.activities.'+activity.id+'.range']={...foundry.utils.deepClone(activity.range),value:'60',units:'ft',override:true};patch['system.activities.'+activity.id+'.duration']={...foundry.utils.deepClone(activity.duration),value:'',units:'spec',concentration:false,override:true};}
 if(selected.imperceptible){if(!keys.has('unaware')||!feature(item.actor,'Imperceptible','Unseen Dream'))throw Error('Imperceptible benötigt ein tatsächlich besessenes Feature und Unaware.');marker.imperceptible=true;}
 if(selected.nightmareIncarnates){const rank=config.jutsu?.rank??item.system.effectiveRank,allowed=genjutsuLevel(item.actor)>=13?['e','d','c','b']:['e','d','c'];if(!feature(item.actor,'Nightmare Incarnates','Corrupt Thoughts')||activity.activation.type!=='action'||!allowed.includes(rank)||![...item.system.activities].some(a=>a.damage?.parts?.length))throw Error('Nightmare Incarnates: passendes schädigendes Action-Genjutsu bis zum erlaubten Rang erforderlich.');patch['system.activities.'+activity.id+'.activation']={...foundry.utils.deepClone(activity.activation),type:'bonus',value:1,override:true};marker.nightmareIncarnates=true;}
 if(selected.eagleFree){if(sensoryDefinition(item)?.kind!=='eagle'||!game.settings.get(MODULE_ID,'dynamicChakraCosts'))throw Error('Kostenloses Eagle’s Eye benötigt Sensor’s Influence und die Kostenengine.');marker.eagleFree=true;}
 if(selected.insignia){if(!feature(item.actor,'Genjutsu Insignia','Distant Soul')||!keys.has('fuinjutsu')||!activity.save?.ability?.size)throw Error('Genjutsu Insignia benötigt Fuinjutsu mit Save.');const targets=[...game.user.targets].filter(t=>t.actor);if(!targets.length)throw Error('Tatsächlich betroffene Insignia-Ziele markieren.');marker.insignia={targets:[...new Set(targets.map(t=>t.actor.uuid))]};}
 if(selected.poisonedMists||selected.venomousIllusions){if(!keys.has('inhaled')&&!selected.physicalImitations)throw Error('Die gewählte Misty-Verstärkung benötigt Inhaled.');}
 if(selected.poisonedMists){if(!feature(item.actor,'Poisoned Mists','Misty Distortionist')||!activeMistyKit(item.actor))throw Error('Poisoned Mists benötigt das Feature und ein aktives Misty Kit.');marker.poisonedMists=true;}
 if(selected.venomousIllusions){if(!feature(item.actor,'Venomous Illusions','Misty Distortionist')||!['minute','hour','day'].includes(activity.activation.type))throw Error('Venomous Illusions benötigt einen auslesbar längeren Cast als eine Action.');marker.venomousIllusions=true;patch['system.activities.'+activity.id+'.activation']={...foundry.utils.deepClone(activity.activation),type:'special',value:1,condition:'Full-Turn Action (Venomous Illusions)',override:true};}
 if(selected.wordsDetriment){if(!feature(item.actor,'Words Of Detriment','Siren')||!sensory.some(k=>keys.has(k)))throw Error('Words Of Detriment benötigt ein Sinneskeyword und das tatsächliche Feature.');for(const k of sensory)keys.delete(k);keys.add('auditory');marker.wordsDetriment=true;}
 if(selected.permeatingSeal){if(!feature(item.actor,'Permeating Seals','Distant Soul')||!keys.has('fuinjutsu'))throw Error('Permeating Seals benötigt Fuinjutsu und das tatsächliche Feature.');marker.permeatingSeal=true;}
 if(selected.furyFrom||selected.furyTo||selected.furyBenefit){
  const allowed=sensory.filter(k=>k!=='unaware');if(!feature(item.actor,'Illusionary Fury','Illusionist')||!allowed.includes(selected.furyFrom)||!allowed.includes(selected.furyTo)||selected.furyFrom===selected.furyTo||!keys.has(selected.furyFrom))throw Error('Illusionary Fury: einen vorhandenen Sinn durch einen anderen ersetzen.');
  const duration=activity.duration,seconds=subclassCastExpiry(duration,0);if(!Number.isFinite(seconds)||seconds<60)throw Error('Illusionary Fury benötigt eine auslesbare Dauer von mindestens einer Minute.');
  const conditions=[...(activity.effects??[])].flatMap(ref=>[...(ref.effect??item.effects.get(ref._id))?.statuses??[]]).filter(id=>game.n5eb.conditions.getConditionConfig(id)?.category==='mental');if(!conditions.length)throw Error('Illusionary Fury benötigt eine strukturierte mentale Condition.');
  if(selected.furyBenefit&&!['duration','conditions'].includes(selected.furyBenefit))throw Error('Ungültige Fury-Verstärkung.');if(selected.wordsDetriment)throw Error('Für diesen Cast genau eine Sinnesumwandlung wählen.');
  keys.delete(selected.furyFrom);keys.add(selected.furyTo);marker.fury={from:selected.furyFrom,to:selected.furyTo,benefit:selected.furyBenefit??''};
  if(selected.furyBenefit==='conditions'){
   const ids=new Set([...(activity.effects??[])].map(ref=>(ref.effect??item.effects.get(ref._id))?.id));patch.effects=structuredClone(item._source.effects??[]);
   for(const data of patch.effects){if(!ids.has(data._id))continue;const id=game.n5eb.conditions.getEffectConditionId(data);if(game.n5eb.conditions.getConditionConfig(id)?.category!=='mental')continue;data.flags??={};data.flags.n5eb??={};data.flags.n5eb.condition={...(data.flags.n5eb.condition??{}),id,rank:game.n5eb.conditions.normalizeConditionRank(id,2*game.n5eb.conditions.getEffectConditionRank(data))};}
  }
  if(selected.furyBenefit==='duration'){patch.effects??=structuredClone(item._source.effects??[]);for(const data of patch.effects)if(Number(data.duration?.seconds)>0)data.duration.seconds*=2;}
  if(selected.furyBenefit==='duration')for(const a of item.system.activities)if(Number(a.duration.value)>0)patch['system.activities.'+a.id+'.duration']={...foundry.utils.deepClone(a.duration),value:String(Number(a.duration.value)*2),override:true};
 }
 if(Object.keys(marker).length){patch['system.jutsu.keywords']=[...keys];patch['flags.'+MODULE_ID+'.genjutsuAugmentation']=marker;item.updateSource(patch);item.prepareFinalAttributes?.();}
}
export function appendGenjutsuAugmentationSpend(game,activity,config,updates){
 const marker=activity.item.getFlag(MODULE_ID,'genjutsuAugmentation');if(!genjutsuEnabled(game)||!marker)return;
 if(config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Genjutsu-Verstärkungen benötigen einen bestätigten bezahlten Cast.');
 if(marker.imperceptible)appendFeatureSpend(updates,feature(activity.actor,'Imperceptible','Unseen Dream'));
 if(marker.nightmareIncarnates)appendFeatureSpend(updates,feature(activity.actor,'Nightmare Incarnates','Corrupt Thoughts'));
 if(marker.eagleFree){appendActualizationSpend(activity.actor,3,updates);appendFeatureSpend(updates,feature(activity.actor,"Sensor's Influence",'Sensory Type'));}
 if(marker.insignia)appendFeatureSpend(updates,feature(activity.actor,'Genjutsu Insignia','Distant Soul'));
 if(marker.poisonedMists){const state=activeMistyKit(activity.actor);if(!state)throw Error('Misty Kit inzwischen nicht verfügbar.');const path='flags.'+MODULE_ID+'.'+MISTY_KIT_STATE,planned=updates.actor[path]??state;updates.actor[path]={...planned,die:mistyDice[Math.min(mistyDice.length-1,mistyDice.indexOf(planned.die)+1)]};}
 if(marker.venomousIllusions)appendActualizationSpend(activity.actor,3,updates);
 if(marker.wordsDetriment)appendFeatureSpend(updates,feature(activity.actor,'Words Of Detriment','Siren'));
 if(marker.fury){appendActualizationSpend(activity.actor,1,updates);if(marker.fury.benefit)appendFeatureSpend(updates,feature(activity.actor,'Illusionary Fury','Illusionist'));}
 if(marker.permeatingSeal){
  appendFeatureSpend(updates,feature(activity.actor,'Permeating Seals','Distant Soul'));
  const planned=foundry.utils.expandObject(updates.actor),chakra=activity.actor.system.attributes.chakra;
  const remaining=['temp','value'].reduce((n,k)=>n+Number(foundry.utils.getProperty(planned,'system.attributes.chakra.'+k)??chakra[k]??0),0);
  if(remaining<8)throw Error('Nicht genügend Chakra einschließlich Permeating Seals.');
  Object.assign(updates.actor,activity.actor.getChakraSpendUpdates(8,planned));
 }
}
