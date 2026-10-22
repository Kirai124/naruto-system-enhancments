import {MODULE_ID} from '../settings/register.mjs';

/** Respect native roll visibility; never reveal a GM-only save through a public cast card. */
export function genjutsuSaveReceipts(game,messageId){
 const actors=[...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(t=>t.actor??t).filter((a,i,all)=>all.indexOf(a)===i);
 return actors.flatMap(actor=>(actor.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]).filter(r=>r.messageId===messageId&&!r.supersededBy&&(game.user.isGM||r.automatic&&actor.isOwner||game.messages.get(r.rollMessageId)?.isContentVisible===true)).map(r=>({...r,name:actor.name,actor})));
}
