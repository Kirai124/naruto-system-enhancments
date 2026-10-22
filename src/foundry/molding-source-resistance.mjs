import {activeMoldingEffect,moldingMarker} from '../effects/molding-effects.mjs';
const wrapped=new WeakSet();
/** Scope the native resistance calculation to a verified damage source without changing actor source data. */
export function installMoldingSourceResistance(game,ActorClass){
 const p=ActorClass?.prototype;if(!p?.calculateDamage||wrapped.has(p))return;wrapped.add(p);
 const original=p.calculateDamage;
 p.calculateDamage=function(damages,options={}){
  const source=options.originatingMessage?.getAssociatedActor?.()?.uuid;
  const active=source&&this.effects.some(e=>activeMoldingEffect(game,e)&&moldingMarker(e).metadata?.resistanceFrom===source);
  if(!active||!this.system.traits?.dr)return original.call(this,damages,options);
  const dr=this.system.traits.dr,previous=dr.value,bypasses=dr.bypasses;
  try{dr.value=new Set([...previous,'ALL']);dr.bypasses=new Set();return original.call(this,damages,options);}
  finally{dr.value=previous;dr.bypasses=bypasses;}
 };
}
