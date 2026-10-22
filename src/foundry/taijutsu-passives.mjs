import {martialDexModifier} from './taijutsu-alternate-ability.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
const PERFECT='Compendium.n5eb.class.Item.EvKdFOPdNcGonstj',MOVE='Compendium.n5eb.class.Item.5i8xFLpNK1EVelUk',MIND='Compendium.n5eb.class.Item.tToM7bhkFUvO6Xrk';
export function installTaijutsuPassives(game,CharacterModel,EffectClass){
 const apply=EffectClass.applyChange;
 EffectClass.applyChange=function(actor,change,options){const effect=change.effect;if(taijutsuEnabled(game)&&actor?.documentName==='Actor'){
  const origin=effect?.parent?.documentName==='Item'?sourceOf(effect.parent):effect?.origin?.split('.ActiveEffect.')[0],heavy=[...actor.items].some(i=>i.type==='equipment'&&i.system.equipped&&i.system.type?.value==='heavy');
  if(origin===MOVE&&taijutsuFeature(actor,'Enhanced Movement')&&heavy&&!taijutsuFeature(actor,'Ironclad','Ironclad')&&change.key==='system.attributes.movement.walk')return {};
  if(origin===PERFECT&&taijutsuFeature(actor,'Perfect Body')){if(/^system\.abilities\.(con|wis|int)\.bonuses\.save$/.test(change.key)&&String(change.value)==='@abilities.dex.mod')return {};if(change.key==='system.abilities.con.proficient')change={...change,type:'upgrade',value:1};}
  const selected=actor.getFlag(MODULE_ID,'taijutsuPerfectMind');if(origin===MIND&&taijutsuFeature(actor,'Perfect Mind')&&['int','wis'].includes(selected)&&/^system\.abilities\.(int|wis)\.proficient$/.test(change.key))return {};
 }return apply.call(this,actor,change,options);};
 const abilities=CharacterModel.prototype.prepareAbilities;
 CharacterModel.prototype.prepareAbilities=function(...args){const actor=this.parent;if(taijutsuEnabled(game)){if(taijutsuFeature(actor,'Perfect Body'))this.abilities.con.proficient=Math.max(1,this.abilities.con.proficient);const selected=actor.getFlag(MODULE_ID,'taijutsuPerfectMind');if(taijutsuFeature(actor,'Perfect Mind')&&['int','wis'].includes(selected))this.abilities[selected].proficient=Math.max(1,this.abilities[selected].proficient);}
  const result=abilities.apply(this,args);if(taijutsuEnabled(game)&&taijutsuFeature(actor,'Perfect Body'))for(const ability of Object.values(this.abilities))if((ability.proficient??0)<1){ability.saveBonus+=martialDexModifier(game,actor);ability.save.value+=martialDexModifier(game,actor);}return result;
 };
 const fields=game.n5eb.dataModels.actor.AttributesFields,initiative=fields.prepareInitiative;
 fields.prepareInitiative=function(...args){const result=initiative.apply(this,args),actor=this.parent,key=actor.getFlag(MODULE_ID,'taijutsuFlowAbility');if(taijutsuEnabled(game)&&taijutsuFeature(actor,'Flow of Battle')&&['int','wis','cha'].includes(key)){this.attributes.init.total+=this.abilities[key].mod;this.attributes.init.score+=this.abilities[key].mod;}return result;};
}
