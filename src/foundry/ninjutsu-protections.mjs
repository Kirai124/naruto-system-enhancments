import {taijutsuLevel} from '../casting/taijutsu-context.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {activeNinjutsuEffect,ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
export function installNinjutsuProtections(game){
 Hooks.on('dnd5e.calculateDamage',(actor,damages,options)=>{
  const reduction=e=>ninjutsuEffect(e).metadata.taijutsuWraps==='guards'?(taijutsuLevel(actor)>=14?actor.system.attributes.prof:Math.floor(actor.system.attributes.prof/2)):ninjutsuEffect(e).metadata.reduction;
  const effects=actor.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata.reduction),wards=effects.filter(e=>ninjutsuEffect(e).metadata.oneDamage);
  const strongest=wards.sort((a,b)=>ninjutsuEffect(b).metadata.reduction-ninjutsuEffect(a).metadata.reduction)[0];
  const budgets=effects.filter(e=>!ninjutsuEffect(e).metadata.oneDamage||e===strongest).map(e=>({remaining:reduction(e),except:ninjutsuEffect(e).metadata.except??[],only:ninjutsuEffect(e).metadata.only}));
  if(wards.length&&damages.some(d=>d.value>0&&!CONFIG.DND5E.healingTypes[d.type]))options.n5eseConsumedAegis=wards.map(e=>e.id);
  if(options.n5eseNoDamageReduction)return;
  for(const d of damages){if(d.value<=0||CONFIG.DND5E.healingTypes[d.type])continue;for(const b of budgets){if(b.except.includes(d.type)||b.only&&!b.only.includes(d.type))continue;const n=Math.min(b.remaining,d.value);d.value-=n;b.remaining-=n;if(d.type==='chakra')damages.chakraAmount-=n;else damages.amount-=n;}}
 });
 Hooks.on('dnd5e.applyDamage',(actor,_amount,options)=>{const ids=options.n5eseConsumedAegis?.filter(id=>actor.effects.has(id));if(actor.isOwner&&ids?.length)actor.deleteEmbeddedDocuments('ActiveEffect',ids).catch(console.error);});
}
