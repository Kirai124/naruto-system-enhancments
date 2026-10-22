import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,isGenjutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';

const busy=new WeakSet();
export function installGenjutsuUpkeep(game,ActorClass){
 const original=ActorClass.prototype.payConcentrationMaintainCost;
 ActorClass.prototype.payConcentrationMaintainCost=async function(effectId,options={}){
  if(!genjutsuEnabled(game)||!this.isOwner)return original.call(this,effectId,options);const effect=this.concentration.effects.find(e=>e.id===effectId);if(!effect)return original.call(this,effectId,options);
  if(busy.has(effect))throw Error('Unterhalt für diese Konzentration wird bereits bearbeitet.');busy.add(effect);
  try{
   const turn=ActorClass.getConcentrationTurnKey(options.combat,options.combatant),concentration=effect.getFlag('n5eb','concentration');if(concentration?.paidTurn===turn)return {paid:true};
   const credit=effect.getFlag(MODULE_ID,'genjutsuInsigniaMaintain');
   if(credit?.status==='available'&&ownedGenjutsuFeature(this,'Genjutsu Insignia','Distant Soul')){
    const source=game.messages.get(credit.messageId);if(source?.getAssociatedActor()?.uuid===this.uuid&&source.system.deltas!==null){await effect.update({'flags.n5eb.concentration.paidTurn':turn,['flags.'+MODULE_ID+'.genjutsuInsigniaMaintain']:{...credit,status:'used',turn}});return {paid:true,genjutsuInsignia:true};}
   }
   const reference=effect.getFlag('n5eb','item'),item=reference?.data?new CONFIG.Item.documentClass(reference.data,{parent:this}):this.items.get(reference?.id);
   if(isGenjutsu(item)&&item.system.jutsu.keywords.has('auditory')&&ownedGenjutsuFeature(this,'Prolonged Songs','Malleable Mirages')&&ownedGenjutsuFeature(this,'Hallucinatory Instrument','Choose Inception')){
    const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Prolonged Songs · Unterhalt'},content:'<p>Dieses Auditory-Genjutsu wurde tatsächlich mit deinem Hallucinatory Instrument gewirkt? Du kannst in diesem Zug deine Bonusaktion statt Chakra für den Unterhalt einsetzen. Aktionsökonomie bleibt manuell.</p>',buttons:[{action:'bonus',label:'Bonusaktion tatsächlich eingesetzt · kein Chakra',callback:()=>'bonus'},{action:'normal',label:'Normalen Chakra-Unterhalt bezahlen',callback:()=>'normal'}],rejectClose:false});if(!choice)return null;
    if(choice==='bonus'){if(!this.effects.has(effectId)||ActorClass.getConcentrationTurnKey(options.combat,options.combatant)!==turn||!ownedGenjutsuFeature(this,'Prolonged Songs','Malleable Mirages'))throw Error('Konzentration, Fähigkeit oder Zug verändert.');await effect.update({'flags.n5eb.concentration.paidTurn':turn});return {paid:true,prolongedSongs:true};}
   }
   return await original.call(this,effectId,options);
  }finally{busy.delete(effect);}
 };
}
