import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,isMedical,ninjutsuModifier} from '../casting/medical-context.mjs';

/** Attach source choices before native damage-type selection; evaluate only the actual selected type. */
export function installBlackMedicine(game,types,ActorClass){
 const wrapped=new WeakSet(),prepared=new WeakSet();
 for(const {documentClass}of Object.values(types)){
  const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.getDamageConfig!=='function')continue;wrapped.add(p);const get=p.getDamageConfig;
  p.getDamageConfig=function(...args){const result=get.apply(this,args);if(!medicalEnabled(game)||prepared.has(result))return result;prepared.add(result);
   const tainted=!!medicalFeature(this.actor,'Tainted Hands','Black Medicine')&&!!this.actor.getFlag(MODULE_ID,'medicalTaintedHands'),child=isMedical(this.item)&&medicalFeature(this.actor,'Child of Venom','Black Medicine')?ninjutsuModifier(this.actor):0;
   if(tainted||child)for(const roll of result.rolls??[])roll.options={...roll.options,n5eseMedicalBlack:{tainted,child}};return result;
  };
 }
 const p=CONFIG.Dice.DamageRoll.prototype,configure=p.configureDamage;
 p.configureDamage=function(...args){
  this.terms=this.terms.filter(t=>!t.options.n5eseMedicalChild);
  const result=configure.apply(this,args),options=this.options.n5eseMedicalBlack;
  if(!medicalEnabled(game)||!options||!['acid','poison'].includes(this.options.type))return result;
  if(options.tainted)for(const die of this.dice)if(!die.modifiers.some(m=>/^r/.test(m)))die.modifiers.push('ro<=2');
  if(options.child){const terms=new Roll('0 '+(options.child<0?'-':'+')+' '+Math.abs(options.child)).terms.slice(1);for(const term of terms)term.options.n5eseMedicalChild=true;this.terms.push(...terms);}
  this.resetFormula();return result;
 };
 const calculate=ActorClass.prototype.calculateDamage;
 ActorClass.prototype.calculateDamage=function(parts,options={}){
  const source=options.n5eseMedicalSource?fromUuidSync(options.n5eseMedicalSource):options.originatingMessage?.getAssociatedActor?.();
  if(!medicalEnabled(game)||!medicalFeature(source,'Toxic Tongue','Black Medicine')||!parts.some(p=>p.value>0&&['acid','poison'].includes(p.type)))return calculate.call(this,parts,options);
  const traits=this.system.traits,before=traits.dr.value,resistance=new Set(before);
  if(resistance.has('ALL')){resistance.delete('ALL');for(const type of Object.keys(CONFIG.DND5E.damageTypes))if(!['acid','poison'].includes(type))resistance.add(type);}
  resistance.delete('acid');resistance.delete('poison');traits.dr.value=resistance;
  try{return calculate.call(this,parts,options);}finally{if(traits.dr.value===resistance)traits.dr.value=before;}
 };
}
