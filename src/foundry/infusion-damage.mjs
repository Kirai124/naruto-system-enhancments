import {isMoldingPrimary} from '../casting/molding-record.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {NATURE_DAMAGE} from '../casting/professor-releases.mjs';
import {applySubclassDamage} from '../casting/subclass-molding-damage.mjs';
const queues=new WeakMap();
/** A single persistent claim per cast; canceled previews never claim or roll. */
export async function claimInfusionDamage(game,message,record){
 const primary=game.messages.find(m=>isMoldingPrimary(m)&&m.getFlag(MODULE_ID,'moldingCast')?.castId===record.castId);
 if(!primary)throw Error('Chakra Infusion: ursprüngliche Casting-Chatkarte fehlt.');
 if(primary.getFlag(MODULE_ID,'moldingCast')?.refunded)throw Error('Chakra Infusion: auslösender Cast wurde erstattet.');
 const next=(queues.get(primary)??Promise.resolve()).catch(()=>{}).then(async()=>{
  const claim=primary.getFlag(MODULE_ID,'infusionDamageClaim');
  if(claim?.status==='resolved')return [];
  if(claim&&claim.messageId!==message.id)return [];
  if(claim?.status==='ready')return claim.bonuses;
  if(claim)throw Error('Chakra-Infusion-Zusatzwurf benötigt GM-Prüfung; kein automatischer Neuwurf.');
  await primary.setFlag(MODULE_ID,'infusionDamageClaim',{messageId:message.id,status:'rolling'});
  try{
   if(!record.infusionReleases?.length||record.infusionReleases.some(k=>!NATURE_DAMAGE[k]))throw Error('Bestätigte Releases fehlen.');
   const bonuses=[];
   for(const key of record.infusionReleases){
    const config=applySubclassDamage({rolls:[{parts:['1d10'],options:{type:NATURE_DAMAGE[key]}}]},record,{attack:false}).rolls[0];
    const roll=await new CONFIG.Dice.DamageRoll(config.parts.join(' + '),{}, {...config.options,isCritical:message.rolls?.some(r=>r.isCritical)??false}).evaluate();bonuses.push({type:config.options.type,value:roll.total,roll:roll.toJSON()});
   }
   await primary.setFlag(MODULE_ID,'infusionDamageClaim',{messageId:message.id,status:'ready',bonuses});return bonuses;
  }catch(error){await primary.setFlag(MODULE_ID,'infusionDamageClaim',{messageId:message.id,status:'review',error:error.message});throw error;}
 });
 queues.set(primary,next);try{return await next;}finally{if(queues.get(primary)===next)queues.delete(primary);}
}
export function addInfusionDamage(damages,bonuses=[]){
 for(const bonus of bonuses){if(!Number.isFinite(bonus.value)||bonus.value<0)throw Error('Ungültiger Infusion-Schaden.');damages.push({type:bonus.type,value:bonus.value,properties:new Set()});}
}
export function installInfusionDamage(game){
 Hooks.on('createChatMessage',message=>{
  const record=message.getFlag(MODULE_ID,'moldingCast');
  if(!message.isAuthor||!record?.ids?.includes('chakra-infusion')||message.getFlag('n5eb','roll.type')!=='damage'||message.getFlag(MODULE_ID,'gigawattManagedByImbuement')||!game.settings.get(MODULE_ID,'subclassMoldingAutomation')||!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))return;
  (async()=>{
   try{const bonuses=await claimInfusionDamage(game,message,record);await message.update({[`flags.${MODULE_ID}.infusionDamageBonus`]:bonuses,[`flags.${MODULE_ID}.infusionDamageState`]:'ready'});}
   catch(error){await message.setFlag(MODULE_ID,'infusionDamageState','review');ui.notifications.error(error.message);}
  })();
 });
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelectorAll('.n5ese-infusion-damage').forEach(e=>e.remove());
  if(!game.settings.get(MODULE_ID,'subclassMoldingAutomation'))return;
  const bonuses=message.getFlag(MODULE_ID,'infusionDamageBonus');if(!bonuses?.length)return;
  const p=document.createElement('p');p.className='n5ese-infusion-damage';p.textContent=`Chakra Infusion · ${bonuses.map(b=>`${b.value} ${b.type}`).join(' + ')} · gemeinsam vor Verteidigungen angewendet`;html.querySelector('.message-content')?.append(p);
 });
}
