import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuAbility,ownedGenjutsuFeature} from './genjutsu-context.mjs';

export const ILLUSIONARY_WEAPONS='genjutsuIllusionaryWeapons';
export function illusionaryWeaponStage(actor){return ownedGenjutsuFeature(actor,'Ultimate Illusionary Weapon','Malleable Mirages')?3:ownedGenjutsuFeature(actor,'Supreme Illusionary Weapon','Malleable Mirages')?2:ownedGenjutsuFeature(actor,'Improved Illusionary Weapon','Malleable Mirages')?1:0;}
export function illusionaryWeaponAvailable(game,actor,weapon){
 return genjutsuEnabled(game)&&!!ownedGenjutsuFeature(actor,'Illusionary Weapon','Choose Inception')&&weapon.active&&actor.getChakraAvailable()>0&&!actor.statuses.has('unconscious')&&!actor.statuses.has('dead')&&(!Number.isFinite(weapon.separatedAt)||game.time.worldTime<weapon.separatedAt+60);
}
/** Retain only the selected mundane profile. Enchantments, extra activities and other item effects are not copied. */
export {mundaneWeaponProfile as illusionaryWeaponProfile} from './weapon-profiles.mjs';
export function illusionaryWeaponData(game,actor,state,{bonus=0}={}){
 const profile=structuredClone(state.profile),ability=genjutsuAbility(actor),stage=illusionaryWeaponStage(actor),ranged=String(profile.system.type.value).endsWith('R'),properties=new Set(profile.system.properties??[]);
 if(stage)properties.delete('hvy');properties.delete('amm');properties.add('mgc');
 const range={...profile.system.range},baseRange=range.value;
 if(ranged){const cap=stage>=2?baseRange:game.n5eb.utils.convertLength(stage?60:30,'ft',range.units);if(!(cap>0))throw Error('Ranged-Waffenprofil hat keine gültige Normalreichweite.');range.value=Math.min(baseRange||cap,cap);range.long=cap;}
 for(const part of Object.values(profile.system.damage))if(part)part.types=['psychic'];
 // WeaponData supplies ability and proficiency normally; add only the separate Genjutsu attack bonus.
 const offset=actor.system.attributes.jutsu.genjutsu.attack-actor.system.abilities[ability].mod-actor.system.attributes.prof;
 return {_id:state.id,name:'Illusionary Weapon · '+profile.name,img:profile.img,type:'weapon',effects:[],flags:{[MODULE_ID]:{genjutsuWeapon:{instanceId:state.id,sourceActorUuid:actor.uuid,profileSource:state.profileSource,countsAs:'melee-genjutsu'}}},system:{...profile.system,range,properties:[...properties],proficient:1,equipped:true,quantity:1,magicalBonus:String(bonus),identified:true,activities:{[state.activityId]:{_id:state.activityId,type:'attack',name:'Illusionary Weapon',activation:{type:'action',value:1},attack:{ability,bonus:String(offset),type:{value:ranged?'ranged':'melee',classification:'spell'}},damage:{includeBase:true,parts:[]},range:{override:false}}}}};
}
