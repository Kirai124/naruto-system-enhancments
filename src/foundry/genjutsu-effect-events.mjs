import {applyFractureSave} from './genjutsu-fractures.mjs';
import {fractureGain} from '../casting/genjutsu-fractures.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEffects,genjutsuPayload,activeGenjutsuEffect,genjutsuEffectData,prepareGenjutsuConditions} from '../effects/genjutsu-effects.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {moldingLifetimeExpired} from '../casting/molding-lifetimes.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {grantGenjutsuTempHP} from './genjutsu-temp-hp.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

const KEY='genjutsuEffectEvents',read=a=>structuredClone(a.getFlag(MODULE_ID,KEY)??[]),queues=new WeakMap();
function serialize(actor,work){const next=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(work);queues.set(actor,next);next.finally(()=>{if(queues.get(actor)===next)queues.delete(actor);}).catch(()=>{});return next;}
const persist=(actor,entry)=>serialize(actor,async()=>{const latest=read(actor),index=latest.findIndex(e=>e.id===entry.id);if(index<0)throw Error('Gespeicherter Genjutsu-Vorgang fehlt.');latest[index]=entry;await actor.setFlag(MODULE_ID,KEY,latest);});
const authority=(game,actor)=>actor.isOwner&&(game.users.activeGM?game.users.activeGM.id===game.user.id:game.users.find(u=>u.active&&!u.isGM&&actor.testUserPermission(u,'OWNER'))?.id===game.user.id);
const actors=game=>[...new Set([...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(v=>v.actor??v))];
async function queue(game,actor,effect,kind,stamp,index=0){
 return serialize(actor,async()=>{if(!activeGenjutsuEffect(game,effect))return;const entries=read(actor),id=effect.id+':'+kind+':'+stamp+':'+index;if(entries.some(e=>e.id===id))return;entries.push({id,effectId:effect.id,name:effect.name,kind,index,stamp,status:'pending',at:game.time.worldTime});await actor.setFlag(MODULE_ID,KEY,entries);const p=document.createElement('p');p.textContent=actor.name+' · '+effect.name+' · '+(kind==='tick'?'Zugwirkung':'Wiederholungswurf')+' vorgemerkt';const whisper=game.users.activeGM?[game.users.activeGM.id]:game.users.filter(u=>u.active&&actor.testUserPermission(u,'OWNER')).map(u=>u.id);await ChatMessage.create({content:p.outerHTML,whisper,flags:{[MODULE_ID]:{genjutsuEffectEvent:{actorUuid:actor.uuid,id}}}});});
}
export async function queueGenjutsuManualTick(game,actor,effect,index){if(!actor.isOwner||game.combat?.started||!genjutsuPayload(effect)?.ticks?.[index])throw Error('Manuelle Zugwirkung nur außerhalb eines aktiven Kampfes.');if(await foundry.applications.api.DialogV2.confirm({window:{title:effect.name},content:genjutsuPayload(effect).onDamageOncePerTurn?'<p>Dies ist der erste tatsächliche Schadensvorgang eines neuen Zuges gegen das weiterhin betroffene Ziel? Den einmaligen Phantom-Pain-Zusatz vormerken. Bereits automatisch vorgemerkte Vorgänge nicht nochmals bestätigen.</p>':'<p>Tatsächlich neuen, zum Feature passenden Zugbeginn bestätigen? Keine sechs Sekunden und keine neue Runde werden erfunden.</p>',rejectClose:false}))return queue(game,actor,effect,'tick',foundry.utils.randomID(),index);}
export async function queueGenjutsuRepeat(game,actor,effect,{damaged=false}={}){
 const repeat=genjutsuPayload(effect)?.repeat;if(!actor.isOwner||!repeat||repeat.timing!==(damaged?'damaged':'action'))throw Error('Kein passender Wiederholungswurf.');
 if(!await foundry.applications.api.DialogV2.confirm({window:{title:effect.name},content:'<p>Tatsächlichen '+(damaged?'neuen Schadensvorgang':'Einsatz der erforderlichen Aktion')+' bestätigen? Aktionsökonomie bleibt manuell.</p>',rejectClose:false}))return;
 return queue(game,actor,effect,'repeat',foundry.utils.randomID());
}
function blocksRepeat(game,actor,effect){const messageId=genjutsuPayload(effect)?.messageId;return messageId&&genjutsuEffects(game,actor).some(e=>genjutsuPayload(e).messageId===messageId&&genjutsuPayload(e).noRepeatSaves);}
function falseSecurityBlocksEnd(game,actor,effect){const source=ninjutsuEffect(effect)?.sourceActorUuid,id=genjutsuPayload(effect)?.messageId;return id&&genjutsuEffects(game,actor).some(e=>genjutsuPayload(e).falseSecurity&&genjutsuPayload(e).messageId!==id&&ninjutsuEffect(e).sourceActorUuid===source);}
export async function applyGenjutsuEvent(game,actor,id){
 if(!actor.isOwner||!genjutsuEnabled(game))throw Error('Berechtigung und Genjutsu-Automation erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const entries=read(actor),entry=entries.find(e=>e.id===id),effect=entry&&actor.effects.get(entry.effectId);if(entry?.status!=='pending')throw Error('Vorgang bereits angewendet oder zur Prüfung gesperrt.');
  if(!effect||!activeGenjutsuEffect(game,effect)){entry.status='expired';await persist(actor,entry);return;}
  const payload=genjutsuPayload(effect),rule=entry.kind==='tick'?payload.ticks?.[entry.index]:payload.repeat;if(!rule)throw Error('Wirkungsdaten fehlen.');
  if(entry.kind==='repeat'&&blocksRepeat(game,actor,effect))throw Error('Beguiling Influence verhindert Wiederholungswürfe gegen dieses Genjutsu.');
  if(!entry.prepared){
   if(rule.conditional&&!await foundry.applications.api.DialogV2.confirm({window:{title:effect.name},content:'<p>'+foundry.utils.escapeHTML(rule.conditional)+' – trifft diese Voraussetzung tatsächlich zu?</p>',rejectClose:false}))return;
   if(rule.save){const rolls=await actor.rollSavingThrow({ability:rule.save,target:payload.dc,rolls:[{options:{n5eseGenjutsuSave:true}}]},{configure:true});if(!rolls?.length)return;entry.prepared={roll:rolls[0].toJSON(),total:rolls[0].total,...(rule.fractures?{beforeFractures:payload.fractures}:{}),success:rolls[0].total>=payload.dc};}
   else{const formula=rule.damage??rule.tempHP,roll=await new Roll(String(formula)).evaluate();entry.prepared={roll:roll.toJSON(),amount:Math.max(0,roll.total),tempHP:rule.tempHP!==undefined,damageType:rule.damageType??'psychic'};}
   await persist(actor,entry);
  }
  const plan=entry.prepared,p=document.createElement('p');p.textContent=effect.name+': '+(rule.fractures?'Fractures '+payload.fractures+' → '+(payload.fractures+fractureGain(plan.total,payload.dc))+'; weitere Wirkungsschwellen werden nach Anwendung berücksichtigt':rule.save?(plan.success?(falseSecurityBlocksEnd(game,actor,effect)?'Save erfolgreich – False Security verhindert das Beenden dieser anderen Genjutsu-Wirkung.':'Save erfolgreich – diese eigene Wirkung beenden.'):'Save fehlgeschlagen – Wirkung bleibt.'):plan.amount+(plan.tempHP?' temporäre HP':' '+plan.damageType+' vor Zielverteidigungen'));
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Genjutsu-Wirkung bestätigen'},content:p.outerHTML,rejectClose:false}))return;
  if(!activeGenjutsuEffect(game,effect))throw Error('Wirkung inzwischen beendet.');entry.status='applying';await persist(actor,entry);
  try{
   if(rule.fractures)await applyFractureSave(game,effect,plan);
   else if(rule.save){if(blocksRepeat(game,actor,effect))throw Error('Wiederholungswurf inzwischen gesperrt.');if(plan.success){if(!falseSecurityBlocksEnd(game,actor,effect))await effect.delete();}else if(rule.failureSavePenalty){const data=structuredClone(ninjutsuEffect(effect)),current=data.metadata.genjutsu;current.repeatFailures=Math.min(rule.failureSavePenalty,(current.repeatFailures??0)+1);current.rolls=[...(current.rolls??[]).filter(r=>!r.repeatFailurePenalty),{kind:'save',bonus:String(-current.repeatFailures),once:true,repeatFailurePenalty:true}];await effect.setFlag(MODULE_ID,'ninjutsuEffect',data);}}
   else if(plan.tempHP)await grantGenjutsuTempHP(actor,{id:effect.id,ruleId:payload.ruleId,amount:plan.amount});
   else if(plan.amount)await actor.applyDamage([{type:plan.damageType,value:plan.amount}],{n5eseGenjutsuEvent:id,originatingMessage:game.messages.get(payload.messageId)});
   if(rule.consumeOnApply&&actor.effects.has(effect.id))await effect.delete();
   entry.status='applied';await persist(actor,entry);
  }catch(error){entry.status='review';entry.error=error.message;await persist(actor,entry);throw error;}
 });
}
export async function resolveGenjutsuEvent(game,actor,id){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');const entries=read(actor),entry=entries.find(e=>e.id===id);if(!['applying','review'].includes(entry?.status))throw Error('Keine unterbrochene Wirkung.');
 if(await foundry.applications.api.DialogV2.confirm({window:{title:'Genjutsu-Wirkung prüfen'},content:'<p>HP, temporäre HP, Condition und bereits erfolgte Anwendung manuell geprüft/korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false})){entry.status='resolved';await persist(actor,entry);}
}
export async function confirmGenjutsuTurnEnd(game,effect){if(game.combat?.started||!effect.parent?.isOwner||!genjutsuPayload(effect)?.manualTurnEnd)throw Error('Manuelles Zugende nur außerhalb eines aktiven Kampfes.');if(!await foundry.applications.api.DialogV2.confirm({window:{title:effect.name},content:'<p>Tatsächliches Ende dieses Zuges bestätigen? Bonus endet; die festgelegte Folgewirkung tritt ein.</p>',rejectClose:false}))return;const data=structuredClone(ninjutsuEffect(effect));data.lifetime={expiresAt:game.time.worldTime};await effect.setFlag(MODULE_ID,'ninjutsuEffect',data);await effect.delete();}
export function installGenjutsuEffectEvents(game){
 Hooks.on('preDeleteActiveEffect',(effect,options)=>{const payload=genjutsuPayload(effect);if(payload?.manualTurnEnd&&genjutsuEnabled(game)&&!options.n5eseGenjutsuCorrection&&!moldingLifetimeExpired(ninjutsuEffect(effect).lifetime,{combat:game.combat,worldTime:game.time.worldTime})){ui.notifications.warn('Diese Wirkung endet am tatsächlichen Zugende; außerhalb des Kampfes das Zugende ausdrücklich bestätigen.');return false;}});
 const previous=new Map();for(const combat of game.combats)previous.set(combat.id,{round:combat.round,turn:combat.turn,actorUuid:combat.combatant?.actor?.uuid});
 Hooks.on('updateCombat',(combat,changes)=>{
  const old=previous.get(combat.id),now={round:combat.round,turn:combat.turn,actorUuid:combat.combatant?.actor?.uuid};previous.set(combat.id,now);
  if(!genjutsuEnabled(game)||!combat.started||combat.id!==game.combat?.id||!['turn','round'].some(k=>Object.hasOwn(changes,k))||old?.round===now.round&&old?.turn===now.turn)return;
  const stamp=combat.id+':'+now.round+':'+now.turn;
  for(const actor of actors(game)){if(!authority(game,actor))continue;for(const effect of genjutsuEffects(game,actor)){
   const data=ninjutsuEffect(effect),p=genjutsuPayload(effect),edges=[];if(now.actorUuid===actor.uuid)edges.push('target-start');if(now.actorUuid===data.sourceActorUuid)edges.push('source-start');if(old?.actorUuid===actor.uuid)edges.push('target-end');if(old?.actorUuid===data.sourceActorUuid)edges.push('source-end');
   for(const [index,tick] of (p.ticks??[]).entries())if(!p.onDamageOncePerTurn&&tick.edges?.some(e=>edges.includes(e)))queue(game,actor,effect,'tick',stamp,index).catch(console.error);
   if(p.repeat&&edges.includes(p.repeat.timing))queue(game,actor,effect,'repeat',stamp).catch(console.error);
  }}
 });
 Hooks.on('dnd5e.applyDamage',(actor,amount,options)=>{if(amount<=0||!authority(game,actor)||options.n5eseGenjutsuEvent)return;for(const effect of genjutsuEffects(game,actor)){const payload=genjutsuPayload(effect);if(payload.maddeningAttackTriggers&&!options.n5esePainFeatureDamage&&options.originatingMessage?.getAssociatedActivity?.()?.type==='attack'&&!genjutsuEffects(game,actor).some(e=>genjutsuPayload(e).onDamageOncePerTurn&&genjutsuPayload(e).messageId===payload.messageId)){for(const [index,tick]of (payload.ticks??[]).entries())if(tick.edges?.includes('damaged-attack'))queue(game,actor,effect,'tick','single-pain-trigger',index).catch(console.error);}if(payload.onDamageOncePerTurn&&!options.n5esePhantomPainImmediate){const stamp=game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:'manual';for(const [index,tick]of (payload.ticks??[]).entries())if(tick.edges?.includes('damaged'))queue(game,actor,effect,'tick',stamp,index).catch(console.error);}if(payload.repeat?.timing==='damaged')queue(game,actor,effect,'repeat',foundry.utils.randomID()).catch(console.error);}});
 Hooks.on('deleteActiveEffect',async effect=>{
  const p=genjutsuPayload(effect),actor=effect.parent,data=ninjutsuEffect(effect);if(!p?.afterExpiry||!authority(game,actor)||!genjutsuEnabled(game)||!moldingLifetimeExpired(data.lifetime,{combat:game.combat,worldTime:game.time.worldTime}))return;
  const source=await fromUuid(data.sourceActorUuid),feature=await fromUuid(data.sourceItemUuid);if(!source||!feature)return;
  const next=p.afterExpiry,expiresAt=Number.isFinite(next.seconds)?(data.lifetime.expiresAt??game.time.worldTime)+next.seconds:undefined;if(Number.isFinite(expiresAt)&&expiresAt<=game.time.worldTime)return;
  await actor.createEmbeddedDocuments('ActiveEffect',[genjutsuEffectData({name:effect.name+' · Folge',id:data.id+':follow',actor:source,feature,lifetime:{expiresAt},payload:{ruleId:p.ruleId,conditions:prepareGenjutsuConditions(game,actor,next.conditions??[])}})]);
 });
}
