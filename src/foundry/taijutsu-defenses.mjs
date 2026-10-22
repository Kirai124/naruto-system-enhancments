import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature,isTaijutsu} from '../casting/taijutsu-context.mjs';
import {natureForm} from './taijutsu-nin-tai.mjs';
import {prepareMoldingReduction} from '../casting/subclass-molding-damage.mjs';
function castRecord(options){const message=options.originatingMessage,primary=message?.type==='usage'?message:message?.getOriginatingMessage?.();if(primary?.system?.deltas===null)return null;return message?.getFlag?.(MODULE_ID,'taijutsuCast')??primary?.getFlag?.(MODULE_ID,'taijutsuCast');}
/** Reuse the existing half-DR calculation; never change stored defenses. */
export function installTaijutsuDefenses(game){
 Hooks.on('dnd5e.preCalculateDamage',(actor,damages,options)=>{
  const message=options.originatingMessage,activity=message?.getAssociatedActivity?.(),source=message?.getAssociatedActor?.(),form=natureForm(game,source),unarmed=activity?.attack?.type?.classification==='unarmed'||castRecord(options)?.actualUnarmed,lightning=form?.data.armor&&form.data.nature==='lightning'&&unarmed;
  if(!taijutsuEnabled(game)||options.n5eseNoDamageReduction||!castRecord(options)?.halfDR&&!lightning||options.ignore===true)return;
  const modifiers=Object.fromEntries(Object.entries(actor.system.traits.dm?.amount??{}).map(([key,formula])=>[key,game.n5eb.utils.simplifyBonus(formula,actor.getRollData({deterministic:true}))])),immunity=actor.system.traits.di.value;
  const eligible=damages.filter(d=>d.value>0&&(!lightning||d.type!=='chakra')&&!CONFIG.DND5E.healingTypes[d.type]&&(options.ignore?.immunity===true||options.ignore?.immunity?.has?.(d.type)||!immunity.has('ALL')&&!immunity.has(d.type)));
  Object.assign(options,prepareMoldingReduction(eligible,modifiers,options,true));
  if(!options.ignore?.armorDR){options.n5eseTaijutsuHalfArmor=true;options.ignore={...options.ignore,armorDR:true};}
 });
 Hooks.on('dnd5e.preCalculateDamage',(_target,damages,options)=>{const m=options.originatingMessage,source=m?.getAssociatedActor?.(),form=natureForm(game,source);if(!form?.data.armor||form.data.nature!=='fire'||!taijutsuFeature(source,'Wrath Of Nature','Nin-Tai')||options.ignore===true)return;const activity=m.getAssociatedActivity?.();if(!isTaijutsu(m.getAssociatedItem?.())&&activity?.attack?.type?.classification!=='unarmed'&&!castRecord(options)?.actualUnarmed)return;const types=damages.filter(p=>p.value>0&&p.type!=='chakra'&&!CONFIG.DND5E.healingTypes[p.type]).map(p=>p.type);if(types.length)options.downgrade=options.downgrade===true?true:new Set([...(options.downgrade instanceof Set?options.downgrade:[]),...types,'ALL']);});
 Hooks.on('dnd5e.calculateDamage',(actor,damages,options)=>{
  if(!taijutsuEnabled(game)||!options.n5eseTaijutsuHalfArmor||options.n5eseNoDamageReduction)return;const armor=game.n5eb.seals.getEquippedArmor(actor),reduction=armor&&game.n5eb.seals.isArmorProficient(actor,armor)?Math.max(0,game.n5eb.seals.getArmorDamageReduction(armor)-2*actor.getConditionRank('corroded')):0;
  for(const part of damages)if(part.value>0&&['bludgeoning','piercing','slashing'].includes(part.type)){const taken=Math.min(part.value,Math.ceil(reduction/2));part.value-=taken;damages.amount-=taken;}
 });
 Hooks.on('dnd5e.preApplyDamage',(actor,amount,updates,options)=>{
  if(!taijutsuEnabled(game)||!castRecord(options)?.raw||amount<=0)return;
  updates['system.attributes.hp.value']=Math.max(0,actor.system.attributes.hp.value-amount);
  updates['system.attributes.hp.temp']=Math.max(0,(actor.system.attributes.hp.temp??0)-amount);
 });
}
