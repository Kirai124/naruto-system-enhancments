import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,genjutsuAbility,ownedGenjutsuFeature,isGenjutsu} from '../casting/genjutsu-context.mjs';

const hasOwnChange=(feature,key)=>feature?.effects.some(e=>!e.disabled&&e.transfer&&(e.system?.changes??[]).some(c=>c.key===key));
/** Supply missing derived values only; authored native effects retain authority. */
export function installGenjutsuPassives(game,CharacterModel,ActorClass,types){
 const attributes=game.n5eb.dataModels.actor.AttributesFields,movement=attributes.prepareMovement;
 attributes.prepareMovement=function(...args){
  const actor=this.parent,feature=genjutsuEnabled(game)&&ownedGenjutsuFeature(actor,'Metashift','Umbra Cleaver'),field=this.attributes.movement,base=field.bonus;
  if(feature&&!hasOwnChange(feature,'system.attributes.movement.bonus'))field.bonus='('+String(base||0)+') + '+(5+5*Number(genjutsuLevel(actor)>=6)+5*Number(genjutsuLevel(actor)>=10)+5*Number(genjutsuLevel(actor)>=14));
  try{return movement.apply(this,args);}finally{field.bonus=base;}
 };
 const derive=CharacterModel.prototype.prepareDerivedData;
 CharacterModel.prototype.prepareDerivedData=function(...args){const result=derive.apply(this,args);if(genjutsuEnabled(game)&&ownedGenjutsuFeature(this.parent,'Demon Sight','Malleable Mirages')){const senses=this.attributes.senses,range=game.n5eb.utils.convertLength(120,'ft',senses.units);senses.ranges.darkvision=Math.max(senses.ranges.darkvision??0,range);}if(genjutsuEnabled(game)&&ownedGenjutsuFeature(this.parent,'Sensory Mode','Sensory Type')){const senses=this.attributes.senses,range=game.n5eb.utils.convertLength(30,'ft',senses.units);senses.ranges.chakrasight=Math.max(senses.ranges.chakrasight??0,range);}return result;};
 const skill=ActorClass.prototype.rollSkill;
 ActorClass.prototype.rollSkill=async function(config={},dialog={},message={}){
  if(genjutsuEnabled(game)&&config.skill==='ste'&&ownedGenjutsuFeature(this,'Out Of Sight','Unseen Dream'))config={...config,ability:genjutsuAbility(this)};
  if(genjutsuEnabled(game)&&config.skill==='ste'&&ownedGenjutsuFeature(this,'Out Of Mind','Unseen Dream')&&[...this.concentration.items].some(i=>isGenjutsu(i)&&i.system.jutsu.keywords.has('unaware'))){const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],options:{...rolls[0]?.options,advantage:true}};config={...config,rolls};}
  return skill.call(this,config,dialog,message);
 };
 const configs=new WeakSet(),wrapped=new WeakSet();for(const {documentClass} of Object.values(types)){
  const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.getDamageConfig!=='function')continue;wrapped.add(p);const damage=p.getDamageConfig;
  p.getDamageConfig=function(...args){const result=damage.apply(this,args);if(!result||configs.has(result))return result;configs.add(result);
   if(!genjutsuEnabled(game)||!isGenjutsu(this.item)||!(ownedGenjutsuFeature(this.actor,'Collapsing Your World','Corrupt Thoughts')||this.type==='attack'&&ownedGenjutsuFeature(this.actor,'Agonizing Thoughts','Malleable Mirages'))||!result.rolls?.length)return result;
   // Native formulas and virtual weapon/beam profiles may already include this ability.
   if(this.item.getFlag(MODULE_ID,'genjutsuWeapon')||this.item.getFlag(MODULE_ID,'genjutsuPhantasmal')&&ownedGenjutsuFeature(this.actor,'Agonizing Thoughts','Malleable Mirages'))return result;
   const ability=genjutsuAbility(this.actor),hasModifier=result.rolls.some(r=>r.parts.some(part=>/@mod\b|@(?:attributes\.jutsu\.genjutsu\.mod|abilities\.(?:wis|cha)\.mod)\b/.test(String(part))));
   if(!hasModifier)result.rolls[0].parts.push(String(this.actor.system.abilities[ability].mod));return result;
  };
 }
}
