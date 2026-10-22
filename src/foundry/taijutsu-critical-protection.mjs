import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {ultraInstinct} from './taijutsu-ultra-instinct.mjs';
import {natureForm} from './taijutsu-nin-tai.mjs';
export function protectedFromCritical(game,actor){const form=natureForm(game,actor);return taijutsuEnabled(game)&&!!actor&&(!!ultraInstinct(game,actor,'defensive')&&actor.system.attributes.hp.value<actor.system.attributes.hp.max/2||form?.data.armor&&form.data.nature==='earth'&&!!taijutsuFeature(actor,'Wrath Of Nature','Nin-Tai'));}
/** Normalize before native critical dice configuration. Never edit or reroll an evaluated damage card. */
export function installCriticalProtection(game,types){
 const seen=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'getDamageConfig'))p=Object.getPrototypeOf(p);if(!p||seen.has(p))continue;seen.add(p);const original=p.getDamageConfig;p.getDamageConfig=function(...args){const result=original.apply(this,args),targets=[...game.user.targets].filter(t=>t.actor);if(targets.length&&targets.every(t=>protectedFromCritical(game,t.actor)))for(const roll of result.rolls??[]){roll.options??={};roll.options.n5eseNormalCritical=true;roll.options.isCritical=false;}return result;};}
 const RollClass=CONFIG.Dice.DamageRoll,configure=RollClass.prototype.configureDamage;RollClass.prototype.configureDamage=function(...args){if(this.options.n5eseNormalCritical)this.options.isCritical=false;return configure.apply(this,args);};
}
