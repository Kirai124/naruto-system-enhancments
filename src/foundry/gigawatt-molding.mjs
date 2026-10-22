import {refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';
import {increaseMoldingDice} from '../casting/subclass-molding-effects.mjs';
import {MODULE_ID} from '../settings/register.mjs';
/** Roll once per real damage roll, never during damage previews or once per affected creature. */
export async function prepareGigawattBonus(game,activity,record,{critical:isCritical=false}={}){
 const choices=refinedDamageChoices(activity);if(!choices.length){if(activity.damage?.parts?.length)throw Error('Gigawatt: ursprüngliche Schadenswürfel sind nicht eindeutig strukturiert.');return null;}
 const index=Number(record.options.gigawatt.damagePart??(choices.length===1?choices[0].index:NaN)),part=choices.find(p=>p.index===index);
 if(!part)throw Error('Gigawatt: tatsächlichen Schadenswürfel im Castingdialog auswählen.');
 const config=activity.getDamageConfig(),base=config.rolls[index];if(!base?.options.type)throw Error('Gigawatt: Schadensart nicht eindeutig.');
 const formula=record.ids.includes('stone-crusher')||(record.ids.includes('blaze-walker')&&base.options.type==='fire')?increaseMoldingDice(`1d${part.die}`):`1d${part.die}`;
 const critical={powerfulCritical:game.settings.get('n5eb','criticalDamageMaxDice'),multiplyNumeric:game.settings.get('n5eb','criticalDamageModifiers'),...config.critical,...base.options.critical,bonusDice:0,bonusDamage:''};
 const roll=await new CONFIG.Dice.DamageRoll(formula,base.data,{...base.options,critical,isCritical,configured:false,preprocessed:false}).evaluate();
 return {index,type:base.options.type,value:roll.total,critical:isCritical,roll:roll.toJSON()};
}
export function addGigawattBonus(damages,bonus,{targetType}={}){
 if(!bonus||!['aberration','celestial','mutant'].includes(targetType))return false;
 const part=damages[bonus.index]?.type===bonus.type?damages[bonus.index]:damages.find(d=>d.type===bonus.type),amount=bonus.value;
 if(!part||!Number.isFinite(amount)||amount<0)return false;
 part.value+=amount;return true;
}
export function installGigawattRolls(game){
 Hooks.on('createChatMessage',message=>{
  const record=message.getFlag(MODULE_ID,'moldingCast');
  if(!message.isAuthor||!record?.ids?.includes('gigawatt')||message.getFlag('n5eb','roll.type')!=='damage'||message.getFlag(MODULE_ID,'gigawattManagedByImbuement')||!game.settings.get(MODULE_ID,'subclassMoldingAutomation')||!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))return;
  prepareGigawattMessage(game,message).catch(error=>ui.notifications.error(`Gigawatt-Zusatzwürfel benötigt Prüfung: ${error.message}`));
 });
}
export async function prepareGigawattMessage(game,message){
 if(!message.isAuthor&&!game.user.isGM)throw Error('Berechtigung für den Zusatzwurf fehlt.');
 if(['rolling','ready'].includes(message.getFlag(MODULE_ID,'gigawattBonusState')))return;
 await message.setFlag(MODULE_ID,'gigawattBonusState','rolling');
 try{
  const record=message.getFlag(MODULE_ID,'moldingCast'),bonus=await prepareGigawattBonus(game,message.getAssociatedActivity(),record,{critical:message.rolls.some(r=>r.isCritical)});
  await message.update({[`flags.${MODULE_ID}.gigawattDamageBonus`]:bonus,[`flags.${MODULE_ID}.gigawattBonusState`]:'ready'});
 }catch(error){await message.setFlag(MODULE_ID,'gigawattBonusState','review');throw error;}
}
