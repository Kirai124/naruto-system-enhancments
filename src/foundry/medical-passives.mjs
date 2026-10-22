import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,isMedical} from '../casting/medical-context.mjs';
export function installMedicalPassives(game,CharacterModel){
 const fields=game.n5eb.dataModels.actor.AttributesFields,armor=fields.prepareArmorClass;
 fields.prepareArmorClass=function(rollData,...args){
  const actor=this.parent,enabled=medicalEnabled(game),diamond=enabled&&!!medicalFeature(actor,'Diamondheart Materialization','Diamond Heart')&&(actor.getFlag(MODULE_ID,'medicalCompanions')??[]).some(e=>e.kind==='diamond'&&e.status==='active'),combat=enabled&&medicalFeature(actor,'Competent Combatant','Combat Medic')&&actor.getFlag(MODULE_ID,'medicalWisdomAC'),oldDex=this.abilities.dex.mod,oldRollDex=rollData.abilities?.dex?.mod,ac=this.attributes.ac,oldBonus=ac.bonus;
  const concentration=[...(actor.concentration?.items??[])],scribe=enabled&&medicalFeature(actor,'Fortifying Scripture','Spiritual Scribe')&&concentration.length&&concentration.every(i=>isMedical(i)||i.system.jutsu?.keywords?.has('fuinjutsu'));
  if(combat||diamond){const mod=diamond?this.abilities.con.mod:this.abilities.wis.mod;this.abilities.dex.mod=mod;if(rollData.abilities?.dex)rollData.abilities.dex.mod=mod;}
  if(scribe){const bonus=medicalLevel(actor)>=9&&concentration.length>=2&&concentration.every(i=>isMedical(i)&&i.system.jutsu?.keywords?.has('fuinjutsu'))?2:1;ac.bonus='('+String(oldBonus||0)+') + '+bonus;}
  try{return armor.call(this,rollData,...args);}finally{this.abilities.dex.mod=oldDex;if(rollData.abilities?.dex)rollData.abilities.dex.mod=oldRollDex;ac.bonus=oldBonus;}
 };
 const skillBefore=new WeakMap(),skills=CharacterModel.prototype.prepareSkills;
 CharacterModel.prototype.prepareSkills=function(...args){const skill=this.skills.med,old=skillBefore.get(this);if(old?.skill===skill){if(skill.value===old.appliedValue)skill.value=old.value;if(skill.mastery===old.appliedMastery)skill.mastery=old.mastery;}skillBefore.delete(this);if(medicalEnabled(game)&&medicalFeature(this.parent,'Biological Knowledge','Chakra Scalpel Specialist')){const value=skill.value,mastery=skill.mastery;skill.value=Math.max(1,value);skill.mastery=Math.max(1,mastery??0);skillBefore.set(this,{skill,value,mastery,appliedValue:skill.value,appliedMastery:skill.mastery});}return skills.apply(this,args);};
 const previous=new WeakMap(),derive=CharacterModel.prototype.prepareDerivedData;
 CharacterModel.prototype.prepareDerivedData=function(...args){
  const before=previous.get(this);if(before?.traits===this.traits){if(this.traits.armorProf.value===before.armor)this.traits.armorProf.value=before.baseArmor;if(this.traits.weaponProf.value===before.weapons)this.traits.weaponProf.value=before.baseWeapons;if(this.traits.dr.value===before.resistance)this.traits.dr.value=before.baseResistance;if(this.traits.ci.value===before.immunity)this.traits.ci.value=before.baseImmunity;}previous.delete(this);
  const result=derive.apply(this,args),actor=this.parent;if(!medicalEnabled(game))return result;
  const baseArmor=this.traits.armorProf.value,baseWeapons=this.traits.weaponProf.value,armor=new Set(baseArmor),weapons=new Set(baseWeapons);if(medicalFeature(actor,'Martial Competency','Combat Medic')){armor.add('hvy');weapons.add('combatbracer');}this.traits.armorProf.value=armor;this.traits.weaponProf.value=weapons;
  const baseResistance=this.traits.dr.value,baseImmunity=this.traits.ci.value,resistance=new Set(baseResistance),immunity=new Set(baseImmunity);
  if(medicalFeature(actor,'Fortifying Scripture','Spiritual Scribe'))resistance.add('chakra');
  if(medicalFeature(actor,'Toxic Tongue','Black Medicine')){resistance.add('poison');immunity.add('envenomed');immunity.add('poisoned');}
  if(medicalFeature(actor,'Mental Master','Counselor-Nin'))for(const [id]of Object.entries(CONFIG.DND5E.conditionTypes??{}))if(game.n5eb.conditions.getConditionConfig(id)?.category==='mental')immunity.add(id);
  this.traits.dr.value=resistance;this.traits.ci.value=immunity;previous.set(this,{traits:this.traits,baseArmor,baseWeapons,armor,weapons,baseResistance,baseImmunity,resistance,immunity});return result;
 };
}
