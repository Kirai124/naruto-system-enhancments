import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled} from '../casting/medical-context.mjs';

const rolling=new Set();
export function medicalAttackHasDamage(game,message){
 return [...game.messages].some(m=>m.getFlag(MODULE_ID,'medicalWeaponAttackId')===message.id);
}
export async function rollMedicalWeaponDamage(game,message){
 const actor=message.getAssociatedActor?.(),activity=message.getAssociatedActivity?.();
 if(!medicalEnabled(game)||!actor?.isOwner||message.getFlag('n5eb','roll.type')!=='attack'||
  !(message.getFlag(MODULE_ID,'medicalScalpelAttack')||message.getFlag(MODULE_ID,'medicalSpiritualAttack'))||!activity?.rollDamage)
  throw Error('Eigener ursprünglicher Medical-Waffenangriff erforderlich.');
 if(rolling.has(message.id)||medicalAttackHasDamage(game,message))throw Error('Schadenswurf bereits geöffnet oder vorhanden.');
 rolling.add(message.id);
 try{
  const isCritical=!!message.rolls?.[0]?.isCritical;
  return await activity.rollDamage({isCritical},{configure:true,...(isCritical?{options:{defaultButton:'critical'}}:{})},{data:{flags:{[MODULE_ID]:{
   castingSnapshot:message.getFlag(MODULE_ID,'castingSnapshot'),medicalWeaponAttackId:message.id
  }}}});
 }finally{rolling.delete(message.id);}
}
export function installMedicalWeaponDamageUI(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-medical-weapon-damage')?.remove();
  if(!medicalEnabled(game)||message.getFlag('n5eb','roll.type')!=='attack'||
   !(message.getFlag(MODULE_ID,'medicalScalpelAttack')||message.getFlag(MODULE_ID,'medicalSpiritualAttack')))return;
  const button=document.createElement('button');button.type='button';button.className='n5ese-medical-weapon-damage';
  const refresh=()=>{const done=medicalAttackHasDamage(game,message);button.textContent=done?'Schaden bereits gewürfelt':'Schaden würfeln';button.disabled=done||!message.getAssociatedActor?.()?.isOwner;};
  refresh();button.addEventListener('click',async()=>{button.disabled=true;try{await rollMedicalWeaponDamage(game,message);}catch(error){ui.notifications.warn(error.message);}finally{refresh();}});html.append(button);
 });
}
