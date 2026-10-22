import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from './genjutsu-context.mjs';
export const DELAYED_CASTS='genjutsuDelayedCasts',DELAY_MARKER='genjutsuDelayedCast';
function origin(game,message){if(typeof message==='string')message=game.messages.get(message);return message?.getFlag(MODULE_ID,DELAY_MARKER)||message?.getFlag(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.[DELAY_MARKER]?message:message?.getOriginatingMessage?.()??message;}
export function delayedCastState(game,message){message=origin(game,message);const marker=message?.getFlag(MODULE_ID,DELAY_MARKER)??message?.getFlag(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.[DELAY_MARKER];if(!marker||!genjutsuEnabled(game))return null;const actor=message.getAssociatedActor?.();return actor?.getFlag(MODULE_ID,DELAYED_CASTS)?.find(e=>e.id===marker.id)??null;}
export function requireDelayedTarget(game,message,targetUuid,{save=false}={}){
 message=origin(game,message);
 const marker=message?.getFlag(MODULE_ID,DELAY_MARKER)??message?.getFlag(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.[DELAY_MARKER];if(!marker||!genjutsuEnabled(game))return null;
 const entry=delayedCastState(game,message);if(!entry)throw Error('Gespeicherter verzögerter Cast fehlt; GM-Prüfung erforderlich.');
 if(save&&entry.status==='awaiting-save'&&game.time.worldTime<entry.expiresAt&&targetUuid===entry.host.uuid)return {entry,initial:true};
 if(entry.status!=='released'||targetUuid&&!entry.releasedTargets?.some(t=>t.uuid===targetUuid))throw Error('Gespeichertes Genjutsu noch nicht ausgelöst oder unbestätigtes Ziel.');
 if(message.system.deltas===null||Number.isFinite(entry.effectExpiresAt)&&game.time.worldTime>=entry.effectExpiresAt||entry.concentrationId&&!message.getAssociatedActor().effects.has(entry.concentrationId))throw Error('Ausgelöstes Genjutsu erstattet oder beendet.');
 if(!save&&targetUuid&&entry.kind==='remote'&&targetUuid!==entry.host.uuid){const target=fromUuidSync(targetUuid),receipt=target?.getFlag(MODULE_ID,'genjutsuSaveReceipts')?.findLast(r=>r.messageId===message.id);if(!receipt||!['failure','critical-failure'].includes(receipt.outcome))throw Error('Zusätzliches Remote-Trigger-Ziel benötigt einen tatsächlich fehlgeschlagenen Save.');}
 if(save&&entry.kind==='brain'&&targetUuid===entry.host.uuid)throw Error('Brain Worm: kein wiederholter Rettungswurf nach dem fehlgeschlagenen Speicherungssave.');return {entry,initial:false};
}
