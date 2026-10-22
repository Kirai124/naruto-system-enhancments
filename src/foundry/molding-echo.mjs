import {MODULE_ID} from '../settings/register.mjs';
import {availableMoldings} from '../casting/efficient-molding.mjs';
import {castingActorBusy} from './mode-adapter.mjs';
const busy=new WeakSet();
export function echoWindow(record,actor,combat){
  if(!record?.timing)return 'manual';
  if(!combat?.started||combat.id!==record.timing.combatId)return 'unavailable';
  if(combat.round>record.timing.round+1)return 'expired';
  return combat.round===record.timing.round+1&&combat.combatant?.actor?.uuid===actor.uuid?'ready':'waiting';
}
export async function runMoldingEcho(game,message,{discard=false}={}){
  if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))throw Error('Molding-Automation ist ausgeschaltet.');
  const actor=message.getAssociatedActor(),record=message.getFlag(MODULE_ID,'moldingCast');
  if(!actor?.isOwner||(!message.isAuthor&&!game.user.isGM)||!record?.ids.includes('echoing'))throw Error('Kein eigenes verfügbares Echo.');
  if(record.refunded)throw Error('Der ursprüngliche Cast wurde erstattet.');
  if(busy.has(message)||castingActorBusy(actor))throw Error('Ein Castingvorgang ist noch offen.');
  const state=message.getFlag(MODULE_ID,'echoState')?.state;
  if(state&&state!=='pending')throw Error('Dieses Echo ist bereits erledigt oder benötigt eine GM-Prüfung.');
  const activity=actor.items.get(record.itemId)?.system.activities.get(record.activityId);
  if(!availableMoldings(activity).some(m=>m.id==='echoing'))throw Error('Jutsu oder Echoing-Feature nicht mehr vorhanden.');
  busy.add(message);
  try{
    const window=echoWindow(record,actor,game.combat);
    if(!discard&&!['ready','manual'].includes(window))throw Error('Echoing ist nur im auf den ursprünglichen Cast folgenden eigenen Zug möglich.');
    const target=record.targets.echoing?.[0];
    if(!discard&&!fromUuidSync(target?.uuid))throw Error('Gespeichertes Ziel nicht mehr vorhanden.');
    const hint=discard?'Das gespeicherte Echo ohne Erstattung verwerfen.':`Dasselbe Ziel (${target.name}), derselbe Rang und der folgende eigene Zug sind bestätigt. Das Echo kostet keine Chakra, verursacht aufgerundeten halben Schaden und benötigt manuell eine Bonusaktion.`;
    const p=document.createElement('p');p.textContent=hint;
    if(!await foundry.applications.api.DialogV2.confirm({window:{title:discard?'Echo verwerfen':'Echoing Ninjutsu'},content:p.outerHTML,rejectClose:false}))return;
    const currentState=message.getFlag(MODULE_ID,'echoState')?.state;
    if((currentState&&currentState!=='pending')||message.getFlag(MODULE_ID,'moldingCast')?.refunded||!actor.items.has(record.itemId))throw Error('Echo-Kontext hat sich während der Bestätigung geändert.');
    if(discard){await message.setFlag(MODULE_ID,'echoState',{state:'discarded'});return true;}
    // Recheck after the dialog; never infer a turn from elapsed wall time.
    if(!['ready','manual'].includes(echoWindow(record,actor,game.combat)))throw Error('Echo-Zeitfenster hat sich geändert.');
    await message.setFlag(MODULE_ID,'echoState',{state:'applying'});
    try{
      const result=await activity.use({jutsu:{rank:record.rank},consume:false,concentration:{begin:false},subsequentActions:false,create:{measuredTemplate:false},n5ese:{echoOf:message.id}},{configure:false},{create:true});
      if(!result?.message)throw Error('Echo-Folgecast nicht abgeschlossen.');
      await message.setFlag(MODULE_ID,'echoState',{state:'applied',messageId:result.message.id});
      return result;
    }catch(error){await message.setFlag(MODULE_ID,'echoState',{state:'review',error:error.message});throw error;}
  }finally{busy.delete(message);}
}
