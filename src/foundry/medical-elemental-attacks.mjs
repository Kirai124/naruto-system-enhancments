import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled} from '../casting/medical-context.mjs';
import {ninjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
export function installMedicalElementalAttacks(game,types){
 const wrapped=new WeakSet(),configured=new WeakSet();for(const {documentClass}of Object.values(types)){const p=documentClass?.prototype;if(!p||wrapped.has(p))continue;wrapped.add(p);
  const attack=p.rollAttack;if(typeof attack==='function')p.rollAttack=async function(config={},dialog={},message={}){
   if(!medicalEnabled(game)||this.item.getFlag(MODULE_ID,'medicalAttackBoost'))return attack.call(this,config,dialog,message);const effects=this.actor.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e)?.metadata?.genjutsu?.medicalNextAttackDice);if(!effects.length)return attack.call(this,config,dialog,message);

   const bonus=Math.max(...effects.map(e=>ninjutsuEffect(e).metadata.genjutsu.medicalNextAttackDice)),data=this.item.toObject();foundry.utils.setProperty(data,'flags.'+MODULE_ID+'.medicalAttackBoost',{count:bonus,effectIds:effects.map(e=>e.id)});const item=new CONFIG.Item.documentClass(data,{parent:this.actor});item.prepareFinalAttributes?.();const activity=item.system.activities.get(this.id),copy=foundry.utils.mergeObject(message,{data:{flags:{[MODULE_ID]:{castingSnapshot:item.toObject(),medicalAttackBoost:item.getFlag(MODULE_ID,'medicalAttackBoost')}}}},{inplace:false});
   const result=await activity.rollAttack(config,dialog,copy);if(result?.length)await this.actor.deleteEmbeddedDocuments('ActiveEffect',effects.filter(e=>this.actor.effects.has(e.id)).map(e=>e.id));return result;
  };
  const damage=p.getDamageConfig;if(typeof damage==='function')p.getDamageConfig=function(...args){const result=damage.apply(this,args),bonus=this.item.getFlag(MODULE_ID,'medicalAttackBoost');if(!medicalEnabled(game)||!bonus||configured.has(result))return result;configured.add(result);const roll=result.rolls?.find(r=>r.parts?.some(part=>/\d+d\d+/i.test(String(part))));if(!roll)throw Error('Elemental Master: tatsächlicher ursprünglicher Schadenswürfel nicht auslesbar.');const match=String(roll.parts.find(part=>/\d+d\d+/i.test(String(part)))).match(/\d+d(\d+)/i);roll.parts.push(bonus.count+'d'+match[1]);return result;};
 }
}
