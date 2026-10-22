import {MODULE_ID} from '../settings/register.mjs';
import {classFeature} from '../casting/ninjutsu-class-options.mjs';
import {jutsuType} from '../casting/ninjutsu-selections.mjs';

const wrapped=new WeakSet();
/** Enforce the confirmed damage floor after native saves, defenses and managed wards.
 * Native immunity markers are authoritative, including physical bypass/downgrade rules.
 * This wrapper never applies damage or consumes resources during a preview.
 */
export function installDeadlyTradition(game,ActorClass){
 const p=ActorClass?.prototype;if(!p||wrapped.has(p))return;wrapped.add(p);
 const calculate=p.calculateDamage;
 p.calculateDamage=function(damages,options={}){
  const raw=damages.map(d=>({...d})),result=calculate.call(this,damages,options);
  if(!result||!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||options.only==='healing'||(options.multiplier??1)<0)return result;
  const message=options.originatingMessage,item=message?.getAssociatedItem?.(),source=message?.getAssociatedActor?.();
  if(!item||!classFeature(source,'Deadly Tradition')||jutsuType(item)!=='ninjutsu'||!item.system.jutsu.keywords.has('hijutsu'))return result;
  for(const chakra of [false,true]){
   const indices=raw.flatMap((d,i)=>d.value>0&&!!CONFIG.DND5E.damageTypes[d.type]&&(d.type==='chakra')===chakra&&!result[i]?.active?.all?.immunity&&!result[i]?.active?.type?.immunity?[i]:[]);
   if(!indices.length)continue;
   const floor=Math.floor(indices.reduce((n,i)=>n+raw[i].value,0)/2),remaining=indices.reduce((n,i)=>n+Math.max(0,result[i]?.value??0),0),extra=Math.max(0,floor-remaining);
   if(!extra)continue;
   const d=result[indices[0]];d.value+=extra;d.active??={};d.active.n5eseDeadlyTradition=true;
   result[chakra?'chakraAmount':'amount']+=extra;
  }
  return result;
 };
}
