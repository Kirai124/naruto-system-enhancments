import {MODULE_ID} from '../settings/register.mjs';
import {prepareGigawattBonus,addGigawattBonus} from './gigawatt-molding.mjs';
import {claimInfusionDamage} from './infusion-damage.mjs';
/** Roll each confirmed attack through the native damage pipeline, then apply one combined damage event. */
export async function prepareImbuementTarget(game,message,record,target){
 const source=message.getAssociatedActor(),item=message.getAssociatedItem(),options=record.options['imbuement-master'];
 if(!options?.groups?.length)throw Error('Bestätigte Imbuement-Angriffsgruppen fehlen.');
 const dc=source.system.attributes.jutsu?.[item.system.jutsuCastingType]?.dc;
 if(!Number.isFinite(dc))throw Error('Nativer Taijutsu-SG fehlt.');
 const saves=await target.rollSavingThrow({ability:'con',target:dc},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});
 if(!saves?.length)return null;
 const total=saves[0].total,success=total>=dc,critical=total<=dc-5,effects=[],damageRolls=[];
 if(!success){
  for(const group of options.groups){
   const data=item.toObject();data.flags[MODULE_ID].moldingCast={...record,activityId:group.activityId};
   const clone=new Item.implementation(data,{parent:source});clone.prepareFinalAttributes?.();const activity=clone.system.activities.get(group.activityId);
   if(activity?.type!=='attack')throw Error('Bestätigte Angriffsaktivität fehlt im Casting-Snapshot.');
   for(let i=0;i<group.count;i++){
    const isCritical=critical&&group.slot===options.criticalSlot&&i===0;
    const config={...activity.getDamageConfig({isCritical}),subject:activity,hookNames:['damage']};
    const rolls=await CONFIG.Dice.DamageRoll.build(config,{configure:false},{create:true,data:{speaker:ChatMessage.getSpeaker({actor:source}),flavor:`Imbuement Master · ${activity.name}${isCritical?' · kritischer Treffer':''}`,flags:{n5eb:{...activity.messageFlags,originatingMessage:message.id,roll:{type:'damage'}},[MODULE_ID]:{moldingCast:record,castingSnapshot:clone.toObject(),gigawattManagedByImbuement:true}}}});
    if(!rolls?.length)throw Error('Nativer Schadenswurf abgebrochen.');
    const descriptions=rolls.map(roll=>({type:roll.options.type,value:roll.total,properties:[...(roll.options.properties??[])]}));
    if(record.ids.includes('gigawatt')&&['aberration','celestial','mutant'].includes(target.system.details?.type?.value)){
     const bonus=await prepareGigawattBonus(game,activity,record,{critical:isCritical});addGigawattBonus(descriptions,bonus,{targetType:target.system.details.type.value});if(bonus)damageRolls.push(bonus.roll);
    }
    for(const [index,roll] of rolls.entries()){
     if(!Number.isFinite(roll.total)||!CONFIG.DND5E.damageTypes[roll.options.type])throw Error('Nativer Angriffsschaden nicht eindeutig.');
     effects.push({kind:'damage',type:roll.options.type,amount:descriptions[index].value,properties:descriptions[index].properties});damageRolls.push(roll.toJSON());
    }
   }
  }
  if(record.ids.includes('chakra-infusion'))for(const bonus of await claimInfusionDamage(game,message,record))effects.push({kind:'damage',type:bonus.type,amount:bonus.value});
  effects.push(...options.conditions);
 }
 return {target:target.uuid,success,critical:!success&&critical,dc,effects,rolls:saves.map(r=>r.toJSON()),damageRolls};
}
