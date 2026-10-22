import {MODULE_ID} from '../settings/register.mjs';
import {currentMoldingRecord} from '../casting/molding-damage.mjs';
const queues=new WeakMap();
/** Native hook amount is damage after defenses, before temporary HP. Never infer it from HP deltas. */
export function installMoldingDamageReceipts(game){
 Hooks.on('dnd5e.applyDamage',(actor,amount,options)=>{
  if(!actor.isOwner||!game.settings.get(MODULE_ID,'subclassMoldingAutomation')||!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||options.n5eseSecondaryMolding||amount<=0)return;
  const message=options.originatingMessage,cast=currentMoldingRecord(game,message?.getFlag?.(MODULE_ID,'moldingCast')??message?.getOriginatingMessage?.()?.getFlag(MODULE_ID,'moldingCast'));
  if(!cast?.ids?.some(id=>['sanguine-master','talent-voider'].includes(id)))return;
  const receipt={id:foundry.utils.randomID(),castId:cast.castId,amount,at:game.time.worldTime,usedBy:[]};
  const next=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(async()=>{
   const entries=actor.getFlag(MODULE_ID,'moldingDamageReceipts')??[];
   await actor.setFlag(MODULE_ID,'moldingDamageReceipts',[...entries,receipt]);
  });queues.set(actor,next);next.catch(error=>ui.notifications.error(`Molding-Schadensbeleg konnte nicht gespeichert werden: ${error.message}`));
 });
}
export function availableDamageReceipts(actor,castId,ruleId){return (actor.getFlag(MODULE_ID,'moldingDamageReceipts')??[]).filter(r=>r.castId===castId&&!r.usedBy?.includes(ruleId)&&Number.isInteger(r.amount)&&r.amount>0);}
