import {ownedGenjutsuFeature,actualizationPool} from './genjutsu-context.mjs';
const planned=new WeakMap();

/** Add all Actualization costs to the native batch exactly once. No document writes here. */
export function appendActualizationSpend(actor,count,updates){
 const pool=actualizationPool(actor);if(!pool||!Number.isSafeInteger(count)||count<1||pool.remaining<count)throw Error('Nicht genügend Actualization Dice.');
 if(!updates?.actor||!Array.isArray(updates.item))throw Error('Nativer Ressourcenbatch fehlt.');
 let update=updates.item.find(i=>i._id===pool.feature.id);if(!update){update={_id:pool.feature.id};updates.item.push(update);}
 const prior=planned.get(updates);
 if(update.system?.uses?.spent!==undefined||update['system.uses.spent']!==undefined&&(!prior||prior.itemId!==pool.feature.id||prior.base!==pool.spent||update['system.uses.spent']!==prior.base+prior.count))throw Error('Konkurrierender Actualization-Verbrauch.');
 const total=(prior?.count??0)+count;if(total>pool.remaining)throw Error('Nicht genügend Actualization Dice für alle kombinierten Feature-Optionen.');
 update['system.uses.spent']=pool.spent+total;planned.set(updates,{itemId:pool.feature.id,base:pool.spent,count:total});
 return updates;
}
export async function regainActualization(actor,count=1){
 const feature=ownedGenjutsuFeature(actor,'Actualization');if(!feature||!Number.isSafeInteger(count)||count<1)throw Error('Actualization-Quelle fehlt.');
 const recovered=Math.min(count,feature.system.uses.spent);if(recovered)await feature.update({'system.uses.spent':feature.system.uses.spent-recovered});return recovered;
}
