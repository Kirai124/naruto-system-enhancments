import {handlesFearEffect,requestFearEffect} from './genjutsu-fear.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {infusionMessage,requireInfusionTarget} from './genjutsu-weapon-casting.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {powerEffects,requestActualizedPower} from './genjutsu-power.mjs';

const managers=new WeakMap();
export function infusionWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{
  storage:'genjutsuInfusionRequests',id:()=>foundry.utils.randomID(),resolve:uuid=>fromUuid(uuid),
  owner(actor){if(!genjutsuEnabled(game)||!actor?.isOwner)throw Error('Genjutsu-Automation und Quellenberechtigung erforderlich.');},
  context(actor,messageId,effectId){
   const message=game.messages.get(messageId),hit=requireInfusionTarget(game,message),activity=message?.getAssociatedActivity(),ref=activity?.effects?.find(r=>r._id===effectId),effect=ref&&(ref.effect??activity.item.effects.get(effectId));
   if(!hit||message.getAssociatedActor()?.uuid!==actor.uuid||!effect)throw Error('Freigegebene eigene Infusion und tatsächlicher nativer Jutsu-Effekt erforderlich.');
   return {message,hit,effect,record:{castId:hit.id},rule:{id:effectId,source:message.getAssociatedItem().uuid}};
  },
  prepare(ctx,request,targets){
   if(targets.length!==1)throw Error('Infusion gilt nur für die getroffene Kreatur.');requireInfusionTarget(game,ctx.message,targets[0].uuid);
   const data=ctx.effect.toObject();delete data._id;data.disabled=false;data.transfer=false;const actor=ctx.message.getAssociatedActor(),concentration=actor.effects.get(ctx.message.system.concentration);data.origin=concentration?.uuid??ctx.effect.uuid;
   data.flags??={};data.flags.n5eb={...data.flags.n5eb,dependentOn:data.origin,scaling:ctx.message.system.scaling,spellLevel:ctx.message.system.spellLevel};data.flags[MODULE_ID]={...data.flags[MODULE_ID],genjutsuInfusionEffect:{requestId:request.id,sourceMessageId:ctx.message.id,hitId:ctx.hit.id}};
   const cast=ctx.message.getFlag(MODULE_ID,'genjutsuWeaponCasting'),deadlines=[cast.expiresAt,data.duration?.seconds>0?cast.createdAt+data.duration.seconds:undefined].filter(Number.isFinite),expiresAt=deadlines.length?Math.min(...deadlines):undefined;
   if(Number.isFinite(expiresAt)&&expiresAt<=game.time.worldTime)throw Error('Ursprüngliche Genjutsu-Effektdauer abgelaufen.');
   return [{data,expiresAt,targetUuid:targets[0].uuid}];
  },
  confirm(ctx){const p=document.createElement('p');p.textContent=ctx.effect.name+' gemäß tatsächlichem Genjutsu-Ergebnis auf die getroffene Kreatur anwenden? Originaldauer läuft weiter; Save und sonstige textliche Voraussetzungen prüfen. Keine zusätzliche normale Effektanwendung.';return foundry.applications.api.DialogV2.confirm({window:{title:'Infundierten Jutsu-Effekt anwenden'},content:p.outerHTML,rejectClose:false});},
  async apply(target,plan,ctx,request){
   requireInfusionTarget(game,ctx.message,target.uuid);if(Number.isFinite(plan.expiresAt)&&plan.expiresAt<=game.time.worldTime)throw Error('Effekt während der Bestätigung abgelaufen.');
   if(target.effects.some(e=>e.getFlag(MODULE_ID,'genjutsuInfusionEffect')?.requestId===request.id))throw Error('Diese Infusionswirkung existiert bereits; GM-Prüfung erforderlich.');
   const data=structuredClone(plan.data);if(Number.isFinite(plan.expiresAt))data.duration={...data.duration,seconds:plan.expiresAt-game.time.worldTime,startTime:game.time.worldTime};
   const [effect]=await target.createEmbeddedDocuments('ActiveEffect',[data]);if(!effect)throw Error('Nativer Infusions-Effekt nicht erstellt.');return {effectId:effect.id};
  }
 });managers.set(game,manager);return manager;
}
export async function requestInfusionEffect(game,message,effectId){
 const cast=infusionMessage(game,message),hit=requireInfusionTarget(game,message),actor=cast?.getAssociatedActor();if(!actor?.isOwner||!hit)throw Error('Eigene freigegebene Infusion erforderlich.');
 const token=await fromUuid(hit.targetTokenUuid);if(token?.actor?.uuid!==hit.targetUuid)throw Error('Ursprüngliches Trefferziel fehlt.');
 if(cast.getFlag(MODULE_ID,'genjutsuCast')?.choice.power&&powerEffects(cast.getAssociatedActivity()).some(e=>e.id===effectId))return requestActualizedPower(game,cast,effectId);
 const native=cast.getAssociatedItem()?.effects.get(effectId);if(native&&handlesFearEffect(game,cast,native,hit.targetUuid))return requestFearEffect(game,cast,effectId,token.actor);
 return infusionWorkflow(game).request(actor,cast.id,effectId,[{uuid:hit.targetUuid,tokenUuid:hit.targetTokenUuid,name:token.name}]);
}
export function installInfusionEffects(game){
 const p=globalThis.customElements?.get('effect-application')?.prototype;if(!p)return;const apply=p._applyEffectToActor;
 p._applyEffectToActor=function(effect,actor){
  const message=this.chatMessage,hit=requireInfusionTarget(game,message,actor.uuid);
  if(hit)return requestInfusionEffect(game,message,effect.id);
  return apply.call(this,effect,actor);
 };
}
