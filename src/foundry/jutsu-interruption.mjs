import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled} from '../casting/taijutsu-context.mjs';
export function interruptedJutsu(game,message){
 if(!taijutsuEnabled(game)||!message)return null;
 const seen=new Set();for(let m=message;m&&!seen.has(m.id);m=m.getOriginatingMessage?.()){seen.add(m.id);const state=m.getFlag(MODULE_ID,'interruptedJutsu');if(state)return state;const id=m.getAssociatedItem?.()?.getFlag(MODULE_ID,'interruptedUsageId'),origin=id&&game.messages.get(id);if(origin?.getFlag(MODULE_ID,'interruptedJutsu'))return origin.getFlag(MODULE_ID,'interruptedJutsu');}
 return null;
}
export function requireUninterrupted(game,message){if(interruptedJutsu(game,message))throw Error('Shatter: dieses Jutsu wurde unterbrochen; seine Wirkung nicht anwenden. Die Chakra-Kosten bleiben bezahlt.');}
export async function interruptJutsu(game,message,actor,entry){
 if(!game.user.isGM||!message?.getAssociatedActor?.()?.isOwner||message.type!=='usage'||message.system?.deltas===null)throw Error('Ursprünglicher bezahlter Cast und GM-Rechte erforderlich.');
 const prior=message.getFlag(MODULE_ID,'interruptedJutsu');if(prior){if(prior.entryId!==entry.id)throw Error('Cast bereits durch einen anderen Vorgang unterbrochen.');return prior;}
 const item=message.getAssociatedItem(),snapshot=structuredClone(message.getFlag(MODULE_ID,'castingSnapshot')??item.toObject());snapshot.flags??={};snapshot.flags[MODULE_ID]??={};snapshot.flags[MODULE_ID].interruptedUsageId=message.id;
 const marker={entryId:entry.id,sourceActorUuid:actor.uuid,sourceItemUuid:entry.sourceUuid,at:game.time.worldTime};
 await message.update({['flags.'+MODULE_ID+'.interruptedJutsu']:marker,['flags.'+MODULE_ID+'.castingSnapshot']:snapshot});
 const caster=message.getAssociatedActor(),concentrationId=message.system?.concentration,effect=concentrationId&&caster.effects.get(concentrationId);
 if(effect)await caster.deleteEmbeddedDocuments('ActiveEffect',[effect.id]);
 return {...marker,endedConcentrationId:effect?.id};
}
export function installJutsuInterruption(game,ActorClass,types){
 const begin=ActorClass.prototype.beginConcentrating;ActorClass.prototype.beginConcentrating=function(activity,...args){const id=activity?.item?.getFlag(MODULE_ID,'interruptedUsageId');if(id)requireUninterrupted(game,game.messages.get(id));return begin.call(this,activity,...args);};
 const save=ActorClass.prototype.rollSavingThrow;ActorClass.prototype.rollSavingThrow=function(config={},dialog={},message={}){const id=message.data?.flags?.n5eb?.originatingMessage??message.data?.['flags.n5eb.originatingMessage'];if(id)requireUninterrupted(game,game.messages.get(id));return save.call(this,config,dialog,message);};
 const apply=ActorClass.prototype.applyDamage;ActorClass.prototype.applyDamage=function(parts,options={}){requireUninterrupted(game,options.originatingMessage);return apply.call(this,parts,options);};
 const element=customElements.get('effect-application')?.prototype;if(element){const original=element._applyEffectToActor;element._applyEffectToActor=function(data,target){requireUninterrupted(game,this.chatMessage);return original.call(this,data,target);};}
 for(const method of ['rollAttack','rollDamage']){const wrapped=new WeakSet();for(const {documentClass}of Object.values(types)){const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p[method]!=='function')continue;wrapped.add(p);const original=p[method];p[method]=function(config={},dialog={},message={}){if(taijutsuEnabled(game)){const id=this.item.getFlag(MODULE_ID,'interruptedUsageId');if(id)requireUninterrupted(game,game.messages.get(id));const origin=message.data?.flags?.n5eb?.originatingMessage??message.data?.['flags.n5eb.originatingMessage'];if(origin)requireUninterrupted(game,game.messages.get(origin));}return original.call(this,config,dialog,message);};}}
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{html.querySelector('.n5ese-interrupted-jutsu')?.remove();if(!interruptedJutsu(game,message))return;html.querySelectorAll('damage-application,effect-application,[data-action="rollDamage"],[data-action="rollAttack"],[data-action="rollSave"]').forEach(e=>e.remove());const p=document.createElement('p');p.className='n5ese-interrupted-jutsu';p.textContent='Shatter · Jutsu unterbrochen, Chakra bleibt verbraucht. Keine weitere Wirkung dieser Chatkarte anwenden.';html.append(p);});
}
