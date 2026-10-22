import {addMedicalPowerFields,prepareMedicalPower} from './medical-power.mjs';
import {addCombatCastingFields,prepareCombatCast} from './medical-combat.mjs';
import {spiritualWeapons} from './medical-spiritual-weapons.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalAbility,isMedical} from '../casting/medical-context.mjs';
import {addElementalCastingFields,prepareElementalCast} from './medical-elemental.mjs';

export function addMedicalCastingFields(game,activity,config,result){
 if(!medicalEnabled(game)||!medicalFeature(activity.actor,'Medical Ninjutsu'))return;
 addCombatCastingFields(activity,config,result);addMedicalPowerFields(activity,config,result);addElementalCastingFields(game,activity,config,result);
 if(activity.item.system.jutsu?.keywords?.has('bukijutsu')&&medicalFeature(activity.actor,'Master Of Hexes','Shaman')&&spiritualWeapons(activity.actor).some(w=>w.status==='active')){result.fields.push({name:'n5ese.medicalSpiritualBukijutsu',value:config.n5ese?.medicalSpiritualBukijutsu??false,field:new foundry.data.fields.BooleanField({label:'Master Of Hexes · tatsächlich mit aktiver Spiritual Weapon ausgeführtes Bukijutsu bestätigen'})});result.hasConsumption=true;}if(!isMedical(activity.item))return;
 const fallback=medicalAbility(activity.actor);
 result.fields.push({name:'n5ese.medicalAbility',value:config.n5ese?.medicalAbility??fallback,field:new foundry.data.fields.StringField({label:'Medical Ninjutsu · Attribut'}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options:[{value:'native',label:'Bisheriges Jutsu-Attribut'},{value:'wis',label:'WIS'},...(medicalFeature(activity.actor,'Fortifying Scripture','Spiritual Scribe')?[{value:'cha',label:'CHA · Fortifying Scripture'}]:[])]})});result.hasConsumption=true;
}
export function installMedicalCasting(game,types){
 const wrapped=new WeakSet();for(const {documentClass}of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageScaling'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const scale=p._prepareUsageScaling,finish=p._finalizeMessageConfig;
  p._prepareUsageScaling=async function(config,message,item){
   if(medicalEnabled(game)&&isMedical(item)&&medicalFeature(item.actor,'Medical Ninjutsu')){
    const choice=config.n5ese?.medicalAbility??medicalAbility(item.actor);
    if(!['native','wis','cha'].includes(choice)||choice==='cha'&&!medicalFeature(item.actor,'Fortifying Scripture','Spiritual Scribe'))throw Error('Medical-Attribut nicht verfügbar.');
    if(choice!=='native'){item.updateSource({'system.jutsu.ability':choice});item.prepareFinalAttributes?.();}
    item.updateSource({['flags.'+MODULE_ID+'.medicalCast']:{id:foundry.utils.randomID(),ability:choice,rank:config.jutsu?.rank??item.system.effectiveRank,at:game.time.worldTime}});
   }
   const result=await scale.call(this,config,message,item);if(medicalEnabled(game)&&this.isSpell){prepareElementalCast(game,item.system.activities.get(this.id),config,item);prepareCombatCast(game,this,config,item,message);prepareMedicalPower(game,item.system.activities.get(this.id),config,item,message);if(config.n5ese?.medicalSpiritualBukijutsu){if(!item.system.jutsu?.keywords?.has('bukijutsu')||!medicalFeature(item.actor,'Master Of Hexes','Shaman')||!spiritualWeapons(item.actor).some(w=>w.status==='active'))throw Error('Tatsächlich aktive Spiritual Weapon und passendes Bukijutsu erforderlich.');const record=item.getFlag(MODULE_ID,'medicalCast')??{};item.updateSource({['flags.'+MODULE_ID+'.medicalCast']:{...record,spiritualWeapon:{sourceActorUuid:item.actor.uuid,bukijutsu:true}}});}}return result;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finish.call(this,config,message,updates);if(medicalEnabled(game)&&this.item.getFlag(MODULE_ID,'medicalCast')){const record=this.item.getFlag(MODULE_ID,'medicalCast');if(record.effectRank){foundry.utils.setProperty(message,'data.system.jutsuRank',record.effectRank);foundry.utils.setProperty(message,'data.system.spellLevel',CONFIG.DND5E.jutsuSpellLevelByRank[record.effectRank]);foundry.utils.setProperty(message,'data.system.maintainCost',config.chakra?.maintain??0);if(Number.isFinite(config.chakra?.cost))foundry.utils.setProperty(message,'data.system.chakraCost',config.chakra.cost);}message.data.flags??={};message.data.flags[MODULE_ID]??={};Object.assign(message.data.flags[MODULE_ID],{medicalCast:this.item.getFlag(MODULE_ID,'medicalCast'),castingSnapshot:this.item.toObject()});}return result;};
 }
}
