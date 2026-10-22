import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,medicalRankValue} from '../casting/medical-context.mjs';
import {grantMedicalTempHP} from './medical-temp-hp.mjs';
import {applyMedicalHealing} from './medical-healing.mjs';
export function installMedicalHealingEvents(game){
 const queues=new WeakMap();Hooks.on('dnd5e.applyDamage',(target,amount,options)=>{
  const before=options.n5eseMedicalGrantBefore,item=options.originatingMessage?.getAssociatedItem?.(),source=options.n5eseMedicalSource?fromUuidSync(options.n5eseMedicalSource):item?.actor;
  if(!medicalEnabled(game)||!target.isOwner||!before||!source||options.n5eseMedicalBonusesHandled||amount>=0)return;
  const restored=Math.max(0,target.system.attributes.hp.value-before.hp),effective=Math.max(0,-amount),rank=item?.system.effectiveRank,id=options.n5eseMedicalReceipt??foundry.utils.randomID();
  const work=async()=>{
   const temp=(n,rule,mode='normal')=>grantMedicalTempHP(target,{sourceActorUuid:source.uuid,itemUuid:item?.uuid,amount:n,rule,mode});
   if(restored>0&&medicalLevel(source)>=9&&medicalFeature(source,'Talented Healer','Adept Medic'))await temp(Math.floor(restored/2),'talented-healer');
   if(restored>0&&medicalFeature(source,'Long Life, Short Death')&&medicalRankValue(rank)>0){const state=target.getFlag(MODULE_ID,'medicalRecipientUses')??{};if((state.longLife??0)<2&&await temp(5*medicalRankValue(rank),'long-life'))await target.setFlag(MODULE_ID,'medicalRecipientUses',{...state,longLife:(state.longLife??0)+1});}
   if(medicalFeature(source,'Over Heal','Adept Medic')&&effective>restored&&target.system.attributes.hp.value===target.system.attributes.hp.effectiveMax){const state=target.getFlag(MODULE_ID,'medicalRecipientUses')??{};if(!(state.overHealUntil>game.time.worldTime)&&await temp(Math.floor((effective-restored)/2),'over-heal','same-source'))await target.setFlag(MODULE_ID,'medicalRecipientUses',{...state,overHealUntil:game.time.worldTime+60});}
   if(!options.n5eseMedicalSelfBonus&&restored>0&&target.uuid!==source.uuid&&item?.type==='spell'&&medicalRankValue(rank)>0&&medicalFeature(source,'Talented Healer','Adept Medic')&&source.isOwner)await applyMedicalHealing(source,4+medicalRankValue(rank),{n5eseMedicalSource:source.uuid,n5eseMedicalSelfBonus:true,n5eseMedicalRequest:id});
  };
  const job=(queues.get(target)??Promise.resolve()).catch(()=>{}).then(work);queues.set(target,job);job.catch(e=>ui.notifications.warn('Medical-Heilungsbonus benötigt GM-Prüfung: '+e.message));
 });
}
