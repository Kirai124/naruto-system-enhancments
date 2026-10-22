import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuPayload} from '../effects/genjutsu-effects.mjs';
const key='genjutsuTemporaryHP',path='flags.'+MODULE_ID+'.'+key,hp='system.attributes.hp.temp';
const read=actor=>structuredClone(actor.getFlag(MODULE_ID,key)??[]);
const additive=new Set(['words-affirmation','visceral-language']);
/** Normal THP replace with the higher value; only the two stated Siren sources add. */
export async function grantGenjutsuTempHP(actor,{id,ruleId,amount}){
 amount=Math.max(0,Math.floor(amount));const before=actor.system.attributes.hp.temp??0,entries=read(actor);
 let next;if(additive.has(ruleId)){
  const compatible=entries.filter(e=>additive.has(e.ruleId)&&e.remaining>0),same=compatible.filter(e=>e.ruleId===ruleId),other=compatible.filter(e=>e.ruleId!==ruleId),oldSame=same.reduce((n,e)=>n+e.remaining,0);
  const offered=Math.max(oldSame,amount)+other.reduce((n,e)=>n+e.remaining,0);if(offered<before)return null;
  next=oldSame>=amount?[...same,...other]:[...other,{id,ruleId,remaining:amount}];
 }else{if(amount<before)return null;next=[{id,ruleId,remaining:amount}];}
 await actor.update({[hp]:next.reduce((n,e)=>n+e.remaining,0),[path]:next});return next.some(e=>e.id===id)?id:null;
}
export async function expireGenjutsuTempHP(actor,id){const entries=read(actor),entry=entries.find(e=>e.id===id);if(!entry)return;await actor.update({[hp]:Math.max(0,(actor.system.attributes.hp.temp??0)-entry.remaining),[path]:entries.filter(e=>e.id!==id)});}
export function installGenjutsuTempHP(game){
 Hooks.on('preUpdateActor',(actor,update)=>{
  const value=update[hp]??update.system?.attributes?.hp?.temp;if(value===undefined||update[path]!==undefined||update.flags?.[MODULE_ID]?.[key]!==undefined)return;
  const entries=read(actor);if(!entries.length)return;const before=actor.system.attributes.hp.temp??0;
  if(value>before){update[path]=[];return;}
  let loss=before-value;for(const entry of entries){const take=Math.min(entry.remaining,loss);entry.remaining-=take;loss-=take;}update[path]=entries.filter(e=>e.remaining>0);
 });
 Hooks.on('deleteActiveEffect',async effect=>{const id=genjutsuPayload(effect)?.tempGrantId,actor=effect.parent;if(!id||!actor?.isOwner||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;await expireGenjutsuTempHP(actor,id);});
}
