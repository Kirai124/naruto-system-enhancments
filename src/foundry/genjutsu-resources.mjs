import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {GENJUTSU_FEATURES} from '../casting/genjutsu-sources.mjs';
import {genjutsuLevel,genjutsuEnabled} from '../casting/genjutsu-context.mjs';

const wrapped=new WeakSet(),prepared=new WeakMap();
export function installGenjutsuResources(game,FeatModel){
 const p=FeatModel?.prototype;if(!p||wrapped.has(p))return;wrapped.add(p);const prepare=p.prepareFinalData;
 p.prepareFinalData=function(...args){
  const before=prepared.get(this),overrides=this.parent?.overrides;
  if(before&&this.uses===before.field&&this.uses.max===before.maximum)this.uses.max=before.base;
  prepared.delete(this);
  if(before?.field===this.uses&&before.recovery===this.uses.recovery)this.uses.recovery=before.baseRecovery;
  const result=prepare.apply(this,args),actor=this.parent.actor;
  if(!genjutsuEnabled(game)||!genjutsuLevel(actor)||this.parent.dependentOrigin?.active===false||overrides?.['system.uses.max']!==undefined||overrides?.system?.uses?.max!==undefined)return result;
  const definition=GENJUTSU_FEATURES.find(d=>d.source===sourceOf(this.parent));if(!definition)return result;
  const sourceMax=String(this._source.uses.max),installed=definition.uses?.max;
  // Preserve authored custom formulas and third-party replacements.
  if(installed===undefined||sourceMax!==String(installed))return result;
  let maximum;
  if((definition.name==='The Turn'&&genjutsuLevel(actor)>=15||definition.name==='Illusionary Chronicle')&&this.uses.recovery.length===1&&this.uses.recovery[0].period==='lr'&&this.uses.recovery[0].type==='recoverAll'){const baseRecovery=this.uses.recovery,recovery=baseRecovery.map(r=>({...r,period:'sr'}));this.uses.recovery=recovery;prepared.set(this,{field:this.uses,base:this.uses.max,maximum:this.uses.max,baseRecovery,recovery});}
  if(sourceOf(this.parent)==='Compendium.n5eb.class.Item.WOhaRe7Pr9nrecxL')maximum=actor.system.attributes.prof;
  if(definition.name==='Shroud of Shadows')maximum=2;
  if(definition.name==='Nightmare Incarnates')maximum=2+Number(genjutsuLevel(actor)>=10)+Number(genjutsuLevel(actor)>=13);
  if(sourceOf(this.parent)==='Compendium.n5eb.class.Item.9eaUSxgdlllEhJPt')maximum=1+Number(genjutsuLevel(actor)>=7)+Number(genjutsuLevel(actor)>=14);
  // Invalid legacy Genjutsu-modifier paths are repaired only for their exact installed formula.
  if(['@attributes.genjutsumod','@abilities.gen.mod'].includes(sourceMax)){
   const ability=actor.system.attributes.jutsu.genjutsu.ability;maximum=Math.max(0,actor.system.abilities[ability]?.mod??0);
  }
  if(Number.isSafeInteger(maximum)&&maximum>=0){const base=this.uses.max;this.uses.max=maximum;this.uses.value=Math.max(0,maximum-this.uses.spent);prepared.set(this,{field:this.uses,base,maximum});}
  return result;
 };
}
