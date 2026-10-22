import {genjutsuEffects,genjutsuPayload} from '../effects/genjutsu-effects.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {ownedGenjutsuFeature} from './genjutsu-context.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {moldingLifetimeExpired} from './molding-lifetimes.mjs';

export const pendingCostPath='flags.'+MODULE_ID+'.pendingCastingCosts';
export function readPendingCastingCosts(actor){
 const entries=actor?.getFlag?.(MODULE_ID,'pendingCastingCosts')??[];
 if(!Array.isArray(entries)||entries.some(e=>!e.id||!e.sourceActorUuid||!e.sourceItemUuid||e.kind!=='chakra-disruption'||!Number.isSafeInteger(e.amount)||e.amount<0)||new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Ungültige gespeicherte Casting-Zuschläge.');
 return entries;
}
export function activePendingCastingCosts(game,actor){
 if(!game?.settings?.get(MODULE_ID,'genjutsuClassAutomation'))return [];
 return readPendingCastingCosts(actor).filter(e=>!moldingLifetimeExpired(e.lifetime,{combat:game.combat,worldTime:game.time.worldTime}));
}
export function persistentCastingCosts(game,actor,rank='d'){
 const amount={d:3,c:5,b:7,a:9,s:11}[rank];if(!amount||!actor||!game?.settings?.get(MODULE_ID,'genjutsuClassAutomation'))return [];
 return genjutsuEffects(game,actor).filter(e=>{if(!genjutsuPayload(e).persistentCost)return false;const source=fromUuidSync(ninjutsuEffect(e).sourceActorUuid);return !!ownedGenjutsuFeature(source,'Persistent Genjutsu','Malleable Mirages');}).map(e=>({id:e.uuid,amount}));
}
export const pendingCastingSurcharge=(game,actor,rank)=>activePendingCastingCosts(game,actor).reduce((sum,e)=>sum+e.amount,0)+Math.max(0,...persistentCastingCosts(game,actor,rank).map(e=>e.amount));
/** Backwards-compatible result helper for wrappers predating non-Void late surcharges. */
export const postCostSurcharge=preview=>preview.postReductionSurcharge??preview.voidSurcharge??0;
