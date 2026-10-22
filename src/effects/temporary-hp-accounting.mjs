import {MODULE_ID} from '../settings/register.mjs';
const HP='system.attributes.hp.temp',keys=['medicalTemporaryHP','genjutsuTemporaryHP','ninjutsuTemporaryHP'];
const path=key=>'flags.'+MODULE_ID+'.'+key;
const get=(update,key)=>update[path(key)]??update.flags?.[MODULE_ID]?.[key];
const empty=key=>key==='ninjutsuTemporaryHP'?{gems:0,tenacity:0}:[];
function lifetimeFor(actor,entry){
 if(entry.lifetime)return entry.lifetime;
 const effect=actor.effects.find(e=>e.id===entry.id||e.flags?.[MODULE_ID]?.ninjutsuEffect?.metadata?.genjutsu?.tempGrantId===entry.id);return effect?.flags?.[MODULE_ID]?.ninjutsuEffect?.lifetime;
}
function distance(game,lifetime){
 if(Number.isFinite(lifetime?.expiresAt))return Math.max(0,lifetime.expiresAt-game.time.worldTime);
 const due=lifetime?.deadline,combat=game.combat;
 if(due&&combat?.started&&due.combatId===combat.id){const length=combat.turns?.length??1;return Math.max(0,((due.round-combat.round)*length+due.turn-combat.turn)*6/length);}
 return Infinity;
}
/** One shared loss distribution prevents independently tracked additive pools consuming the same damage twice. */
export function installTemporaryHPAccounting(game){
 Hooks.on('preUpdateActor',(actor,update,options)=>{
  const next=update[HP]??update.system?.attributes?.hp?.temp;if(next===undefined)return;
  const before=Number(actor.system.attributes.hp.temp??0),states=Object.fromEntries(keys.map(key=>[key,structuredClone(actor.getFlag(MODULE_ID,key)??empty(key))]));
  const explicit=keys.filter(key=>get(update,key)!==undefined);
  if(explicit.length){
   // A named grant/removal already supplied its own ledger. Do not redistribute its delta as damage.
   for(const key of keys)if(!explicit.includes(key))update[path(key)]=next>=before&&!options?.n5eseTemporaryHPKeepOthers?empty(key):states[key];
   return;
  }
  if(!keys.some(key=>actor.getFlag(MODULE_ID,key)!==undefined)||next===before)return;
  if(next>before){for(const key of keys)update[path(key)]=empty(key);return;}
  const portions=[];let index=0;
  for(const key of ['medicalTemporaryHP','genjutsuTemporaryHP'])for(const entry of states[key])if(entry.remaining>0)portions.push({priority:1,due:distance(game,lifetimeFor(actor,entry)),index:index++,amount:entry.remaining,consume:n=>{entry.remaining-=n;}});
  for(const kind of ['tenacity','gems'])if(states.ninjutsuTemporaryHP[kind]>0)portions.push({priority:kind==='tenacity'?0:1,due:Infinity,index:index++,amount:states.ninjutsuTemporaryHP[kind],consume:n=>{states.ninjutsuTemporaryHP[kind]-=n;}});
  const tracked=portions.reduce((n,p)=>n+p.amount,0);
  if(tracked>before){ui.notifications.warn('Temporäre HP: ältere Quellendaten überschneiden sich. Vor dem Verbrauch vom GM prüfen lassen.');return false;}
  let loss=Math.max(0,before-next);
  portions.sort((a,b)=>a.priority-b.priority||(Number.isFinite(a.due)&&Number.isFinite(b.due)?a.due-b.due:Number.isFinite(a.due)?-1:Number.isFinite(b.due)?1:0)||a.index-b.index);
  for(const portion of portions){const taken=Math.min(portion.amount,loss);portion.consume(taken);loss-=taken;if(loss<=0)break;}
  for(const key of ['medicalTemporaryHP','genjutsuTemporaryHP'])states[key]=states[key].filter(e=>e.remaining>0);
  for(const key of keys)update[path(key)]=states[key];
  if(next===0){const state=actor.getFlag(MODULE_ID,'medicalRecipientUses');if(state?.assistedCoping)update['flags.'+MODULE_ID+'.medicalRecipientUses']={...state,assistedCoping:false};}
 });
}
