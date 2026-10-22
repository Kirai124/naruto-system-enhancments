import {MODULE_ID} from '../settings/register.mjs';
import {ALL_MOLDINGS as MOLDINGS,availableMoldings,planMoldings,spendMoldings} from '../casting/efficient-molding.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {promptTenacious} from '../ui/tenacious-dialog.mjs';
const clashBonus=new WeakSet();
export function installMoldingActionRolls(ActorClass){
  if(!ActorClass?.prototype?.rollSkill)return;
  const prototype=ActorClass.prototype,original=prototype.rollSkill;
  prototype.rollSkill=function(config={},...args){
    if(clashBonus.has(this)&&config.hookNames?.includes('clash'))config={...config,bonus:[config.bonus,'1d10'].filter(Boolean).join(' + ')};
    return original.call(this,config,...args);
  };
}
/** Saved journal prevents replay after a partial multi-document operation. */
export async function runMoldingAction(game,message,id){
  if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))throw Error('Molding-Automation ist ausgeschaltet.');
  const actor=message.getAssociatedActor(),record=message.getFlag(MODULE_ID,'moldingCast');
  if(!actor?.isOwner||(!message.isAuthor&&!game.user.isGM))throw Error('Berechtigung für Charakter und Chatkarte erforderlich.');
  const item=actor.items.get(record?.itemId),activity=item?.system.activities.get(record?.activityId);
  const phase={focused:'concentration',redirected:'miss',tenacious:'clash'}[id];
  if(!phase||!availableMoldings(activity,{phase}).some(m=>m.id===id))throw Error('Molding ist für dieses Jutsu nicht verfügbar.');
  if(record.refunded)throw Error('Dieser Cast wurde erstattet.');
  if(id==='tenacious'&&record.ids.some(used=>used!==id&&!MOLDINGS.find(m=>m.id===used)?.additive))throw Error('Dieses Jutsu verwendet bereits ein anderes reguläres Molding.');
  return withCastingActorLock(actor,async()=>{
    const previous=message.getFlag(MODULE_ID,'moldingAction');
    if(previous&&['applying','review'].includes(previous.state))throw Error('Der vorherige Vorgang benötigt eine GM-Prüfung; kein automatischer Wiederholungsversuch.');
    const descriptions={focused:'Eine Konzentrationsprüfung für dieses weiterhin aufrechterhaltene Ninjutsu steht an. Mit Focused wird diese Prüfung automatisch bestanden.',redirected:'Der vorherige Angriff hat verfehlt. Reichweite und dasselbe oder ein anderes zulässiges Ziel sind bestätigt. Das Ergebnis des zweiten Angriffs ist verbindlich.',tenacious:'Eine Kreatur versucht dieses Jutsu zu clashen, zu kontern, zu dispellen oder zu unterbrechen. Tenacious erhöht den Clash um 1d10 und den entsprechenden Counter-/Dispel-/Interrupt-SG um 3.'};
    if(id==='focused'&&![...(actor.concentration?.effects??[])].some(e=>e.flags?.n5eb?.item?.id===item.id))throw Error('Dieses Jutsu wird nicht mehr aufrechterhalten.');
    const attackTargets=id==='redirected'?[...game.user.targets].filter(t=>t.actor).map(t=>t.actor.uuid):[];
    if(id==='redirected'&&attackTargets.length!==1)throw Error('Für den verbindlichen zweiten Angriff genau ein zulässiges Ziel auswählen.');
    const trigger=id==='tenacious'?await promptTenacious(record):null;
    if(id==='tenacious'&&!trigger)return;
    const initial=planMoldings(item,{ids:[id],phase,rank:record.rank});
    if(!await foundry.applications.api.DialogV2.confirm({window:{title:initial.selected[0].name},content:`<p>${descriptions[id]}</p><p>${initial.uses} gemeinsame Nutzung(en), ${initial.additionalCost} zusätzliche Chakra. Aktionsökonomie bleibt manuell.</p>`,rejectClose:false}))return;
    if(!actor.items.has(item.id)||message.getFlag(MODULE_ID,'moldingCast')?.refunded||!availableMoldings(actor.items.get(item.id)?.system.activities.get(record.activityId),{phase}).some(m=>m.id===id))throw Error('Molding-Kontext hat sich während der Bestätigung geändert.');
    if(id==='redirected'&&JSON.stringify([...game.user.targets].filter(t=>t.actor).map(t=>t.actor.uuid))!==JSON.stringify(attackTargets))throw Error('Angriffsziel hat sich während der Bestätigung geändert.');
    if(id==='focused'&&![...(actor.concentration?.effects??[])].some(e=>e.flags?.n5eb?.item?.id===item.id))throw Error('Konzentration wurde inzwischen beendet.');
    const plan=planMoldings(item,{ids:[id],phase,rank:record.rank,subclassEnabled:game.settings.get(MODULE_ID,'subclassMoldingAutomation')}),updates={actor:{},item:[]};
    spendMoldings(updates,plan);
    if(plan.additionalCost>actor.getChakraAvailable())throw Error('Nicht genügend Chakra für das Molding.');
    if(plan.additionalCost)Object.assign(updates.actor,actor.getChakraSpendUpdates(plan.additionalCost));
    const action={id,requestId:foundry.utils.randomID(),state:'applying',uses:plan.uses,chakra:plan.additionalCost};
    await message.setFlag(MODULE_ID,'moldingAction',action);
    try{
      // Native batch ordering, with an explicit journal for interruptions.
      if(Object.keys(updates.actor).length)await actor.update(updates.actor);
      if(updates.item.length)await actor.updateEmbeddedDocuments('Item',updates.item);
      let rolls;
      const castActivity=message.getAssociatedActivity();
      if(id==='redirected')rolls=await castActivity.rollAttack({}, {configure:false},{data:{flags:{n5eb:{originatingMessage:message.id},[MODULE_ID]:{redirected:true}}}});
      else if(id==='tenacious'&&trigger.kind==='clash'){
        clashBonus.add(actor);
        try{rolls=await actor.rollClash({...trigger,item,rank:record.rank,messageId:message.id},{},{data:{flags:{n5eb:{originatingMessage:message.id}}}});}finally{clashBonus.delete(actor);}
        await message.setFlag(MODULE_ID,'tenaciousDC',3);
      }else if(id==='tenacious'){
        await message.setFlag(MODULE_ID,'tenaciousDC',3);
        await message.setFlag(MODULE_ID,'tenaciousResult',trigger);
        await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`Tenacious Ninjutsu: Counter-/Dispel-/Interrupt-SG ${trigger.baseDC} + 3 = ${trigger.dc}.`,flags:{[MODULE_ID]:{originatingMessage:message.id,tenacious:trigger}}});
      }else await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:'Focused Ninjutsu: Konzentrationsprüfung automatisch bestanden.',flags:{[MODULE_ID]:{focused:true,originatingMessage:message.id}}});
      if((id==='redirected'||(id==='tenacious'&&trigger.kind==='clash'))&&!rolls?.length)throw Error('Wurf nicht abgeschlossen; Ressourcen und Vorgang durch GM prüfen.');
      await message.setFlag(MODULE_ID,'moldingAction',{...action,state:'applied'});
      await message.setFlag(MODULE_ID,'moldingCast',{...message.getFlag(MODULE_ID,'moldingCast'),ids:[...new Set([...message.getFlag(MODULE_ID,'moldingCast').ids,id])]});
      return rolls??true;
    }catch(error){await message.setFlag(MODULE_ID,'moldingAction',{...action,state:'review',error:error.message});throw error;}
  });
}
