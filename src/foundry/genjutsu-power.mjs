import {handlesFearEffect,requestFearEffect} from './genjutsu-fear.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {genjutsuTargetWorkflow} from './genjutsu-targets.mjs';

export function powerEffects(activity){return [...(activity.effects??[])].map(ref=>ref.effect??activity.item.effects.get(ref._id)).filter(e=>e&&[...(e._source.statuses??[])].length);}
export async function requestActualizedPower(game,message,effectId){
 const record=message.getFlag(MODULE_ID,'genjutsuCast'),actor=message.getAssociatedActor();if(!genjutsuEnabled(game)||!actor?.isOwner||!record?.choice.power||!record.powerTarget)throw Error('Bezahlter Actualized-Power-Cast erforderlich.');
 const effects=powerEffects(message.getAssociatedActivity());if(!effects.length)throw Error('Kein strukturiert gespeicherter Condition-Effekt dieses Jutsu.');
 if(!effectId){const select=document.createElement('select');select.name='effect';for(const e of effects){const o=document.createElement('option');o.value=e.id;o.textContent=e.name;select.append(o);}const hint=document.createElement('p');hint.textContent='Genau die laut tatsächlichem Jutsu-Ergebnis anzuwendende Condition-Wirkung wählen. Die eigenen nativen Effektdaten werden einmalig auf das bestätigte Einzelziel angewendet; dafür keine zusätzliche normale Condition-Anwendung ausführen.';const div=document.createElement('div');div.append(hint,select);effectId=await foundry.applications.api.DialogV2.wait({window:{title:'Actualized Power · Condition-Wirkung'},content:div.innerHTML,buttons:[{action:'request',label:'Wirkung für GM vormerken',callback:(_e,b)=>b.form.elements.effect.value}],rejectClose:false});if(!effectId)return;}
 if(!effects.some(e=>e.id===effectId))throw Error('Condition-Effekt gehört nicht zu dieser Castingaktivität.');
 const token=await fromUuid(record.powerTarget.tokenUuid);if(token?.actor?.uuid!==record.powerTarget.uuid)throw Error('Bestätigtes Einzelziel nicht mehr verfügbar.');
 const chosen=effects.find(e=>e.id===effectId);if(handlesFearEffect(game,message,chosen,record.powerTarget.uuid))return requestFearEffect(game,message,effectId,token.actor);
 return genjutsuTargetWorkflow(game).request(actor,message.id,'actualized-power:'+effectId,[record.powerTarget]);
}
/** Reuse native effect data without changing the target's persistent immunity or resistance traits. */
export function installActualizedPower(game){
 const p=globalThis.customElements?.get('effect-application')?.prototype;if(!p)return;const apply=p._applyEffectToActor;
 p._applyEffectToActor=function(effect,actor){
  const record=this.chatMessage?.getFlag(MODULE_ID,'genjutsuCast');if(genjutsuEnabled(game)&&record?.choice.power&&powerEffects(this.chatMessage.getAssociatedActivity()).some(e=>e.id===effect.id)){
   if(record.powerTarget.uuid!==actor.uuid)throw Error('Actualized Power gilt nur für das bestätigte Einzelziel.');return requestActualizedPower(game,this.chatMessage,effect.id);
  }
  return apply.call(this,effect,actor);
 };
}
