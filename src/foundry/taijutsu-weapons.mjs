import {MODULE_ID} from '../settings/register.mjs';
import {unarmedContext} from './taijutsu-unarmed.mjs';
import {taijutsuLevel,unarmedDie} from '../casting/taijutsu-context.mjs';
const weapons=new Set(['combatbracer','ironclaw','quarterstaff','nunchaku','tonfa','knuckleblades']);
/** Prepared roll changes only; inventory profiles and additional damage dice remain intact. */
export function installTaijutsuWeapons(game,types){
 const abilities=new WeakSet(),damage=new WeakSet(),results=new WeakSet();
 for(const {documentClass}of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.getOwnPropertyDescriptor(p,'ability'))p=Object.getPrototypeOf(p);
  const descriptor=p&&Object.getOwnPropertyDescriptor(p,'ability');if(p&&descriptor?.get&&descriptor.configurable&&!abilities.has(p)){abilities.add(p);Object.defineProperty(p,'ability',{...descriptor,get(){const state=unarmedContext(game,this.actor);return state&&this.item?.type==='weapon'&&(this.attack?.type?.classification==='unarmed'||weapons.has(this.item.system.type?.baseItem))?state.ability:descriptor.get.call(this);}});}
  p=documentClass?.prototype;if(!p||damage.has(p)||typeof p.getDamageConfig!=='function')continue;damage.add(p);const original=p.getDamageConfig;
  p.getDamageConfig=function(...args){const result=original.apply(this,args);if(results.has(result))return result;results.add(result);const state=unarmedContext(game,this.actor),item=this.item;if(!state?.replaceWeaponDie||item?.type!=='weapon'||item.system.proficiencyMultiplier<1||item.getFlag(MODULE_ID,'medicalScalpelWeapon')||item.system.damage.base.custom?.enabled||args[0]?.ammunition?.system?.damage?.replace)return result;
   for(const roll of result.rolls??[])if(roll.base&&roll.parts?.[0]){const formula=roll.parts[0],match=formula.match(/^\s*\d+d\d+\b/i);if(match)roll.parts[0]=formula.replace(/^\s*\d+d\d+\b/i,'1d'+unarmedDie(taijutsuLevel(this.actor)));}
   return result;
  };
 }
}
