import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {combatTurnKey} from '../casting/genjutsu-kits.mjs';

const key='genjutsuStopwatch',dice=[12,10,8,6,4,0],releasing=new WeakSet();
const read=actor=>structuredClone(actor.getFlag(MODULE_ID,key)??{die:0,deferred:[]});
export const displacedByStopwatch=(game,actor)=>genjutsuEnabled(game)&&!!ownedGenjutsuFeature(actor,'Temporal Stopwatch','Choose Inception')&&read(actor).die>0;
function requireActor(game,actor){if(!genjutsuEnabled(game)||!actor?.isOwner||!ownedGenjutsuFeature(actor,'Temporal Stopwatch','Choose Inception'))throw Error('Eigener Charakter mit Temporal Stopwatch erforderlich.');}
export async function activateStopwatch(game,message){
 const actor=message?.getAssociatedActor();requireActor(game,actor);
 return withCastingActorLock(actor,async()=>{
  const cast=message.getFlag(MODULE_ID,'genjutsuCast'),state=read(actor);if(!cast||message.system.deltas===null)throw Error('Gültiger eigener Genjutsu-Cast erforderlich.');
  if(state.die||['applying','rolled','review'].includes(state.step?.status)||state.deferred.some(c=>c.status==='pending')||game.time.worldTime<(state.availableAt??0))throw Error('Stopwatch aktiv, noch gesperrt oder verschobene Conditions ungeklärt.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Temporal Stopwatch'},content:'<p>Bestätige: Du erhältst gerade durch dieses Genjutsu einen Bonus auf Angriff, Skill, Save oder AC. Stopwatch aktivieren? Abbau zu Beginn jedes Kampfteilnehmer-Zuges; eine Stunde bis zur nächsten Aktivierung.</p>',rejectClose:false}))return;
  await actor.setFlag(MODULE_ID,key,{id:foundry.utils.randomID(),die:12,messageId:message.id,activatedAt:game.time.worldTime,availableAt:game.time.worldTime+3600,lastTurn:combatTurnKey(game),processedTurns:[combatTurnKey(game)].filter(Boolean),deferred:[]});
 });
}
async function applyDeferred(game,actor,state){
 releasing.add(actor);
 try{
  for(const condition of state.deferred.filter(c=>c.status==='pending')){
   // A partial write is never repeated automatically after an interruption.
   condition.status='applying';await actor.setFlag(MODULE_ID,key,state);
   const duration=condition.duration&&structuredClone(condition.duration),expiresAt=condition.expiresAt;
   if(Number.isFinite(expiresAt)&&game.time.worldTime>=expiresAt)condition.status='expired';
   else{
    if(Number.isFinite(expiresAt)){duration.seconds=Math.max(0,expiresAt-game.time.worldTime);duration.startTime=game.time.worldTime;}
    await actor.applyCondition(condition.conditionId,{...condition.options,duration});condition.status='applied';
   }
   await actor.setFlag(MODULE_ID,key,state);
  }
  for(const effect of actor.effects.filter(e=>e.getFlag(MODULE_ID,'stopwatchDeferred')?.sessionId===state.id)){
   const timed=(effect._source.duration?.seconds??0)>0||(effect._source.duration?.rounds??0)>0;
   if(timed&&Number.isFinite(effect.duration.remaining)&&effect.duration.remaining<=0)await effect.delete();
   else await effect.update({disabled:false,['flags.'+MODULE_ID+'.-=stopwatchDeferred']:null});
  }
 }finally{releasing.delete(actor);}
}
export async function stepStopwatch(game,actor,{manual=false}={}){
 requireActor(game,actor);
 return withCastingActorLock(actor,async()=>{
  const state=read(actor),turn=combatTurnKey(game);if(!state.die)return;
  if(['applying','rolled','review'].includes(state.step?.status)||state.deferred.some(c=>c.status==='applying'))throw Error('Unterbrochenen Stopwatch-Vorgang vom GM prüfen lassen.');
  if(!manual&&(!turn||turn===state.lastTurn||state.processedTurns?.includes(turn)))return;
  if(manual&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Temporal Stopwatch · Zugbeginn'},content:'<p>Tatsächlichen Beginn eines neuen Kampfteilnehmer-Zuges bestätigen und den aktuellen Abbauwürfel würfeln?</p>',rejectClose:false}))return;
  state.step={id:foundry.utils.randomID(),status:'applying',die:state.die,turn};await actor.setFlag(MODULE_ID,key,state);
  try{
   const roll=await new Roll('1d'+state.die).evaluate();state.step.roll=roll.toJSON();state.step.total=roll.total;if(roll.total<=3)state.die=dice[dice.indexOf(state.die)+1];state.lastTurn=turn;state.processedTurns=[...new Set([...(state.processedTurns??[]),turn].filter(Boolean))];state.step.status='rolled';await actor.setFlag(MODULE_ID,key,state);
   await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'Temporal Stopwatch · '+(state.die?'weiter mit d'+state.die:'Displaced endet')});
   if(!state.die)await applyDeferred(game,actor,state);
   state.step.status='applied';await actor.setFlag(MODULE_ID,key,state);
  }catch(error){state.step.status='review';state.step.error=error.message;await actor.setFlag(MODULE_ID,key,state);throw error;}
 });
}
export async function resolveStopwatch(game,actor){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const state=read(actor);if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Stopwatch prüfen'},content:'<p>Abbauwurf, aktuellen Würfel und gegebenenfalls bereits angewendete Conditions manuell geprüft/korrigiert? Unterbrochene Anwendungen werden ohne Wiederholung abgeschlossen.</p>',rejectClose:false}))return;
  for(const c of state.deferred)if(c.status==='applying')c.status='resolved';if(state.step)state.step.status='resolved';await actor.setFlag(MODULE_ID,key,state);
 });
}
export async function releaseStopwatchConditions(game,actor){
 requireActor(game,actor);return withCastingActorLock(actor,async()=>{const state=read(actor);if(state.die)throw Error('Conditions bleiben während Displaced verschoben.');if(state.deferred.some(c=>c.status==='applying'))throw Error('Unterbrochene Condition zuerst vom GM prüfen.');await applyDeferred(game,actor,state);});
}

export function installStopwatch(game,ActorClass,EffectClass){
 const p=ActorClass.prototype,apply=p.applyCondition;
 p.applyCondition=async function(id,options={}){
  if(releasing.has(this)||!this.isOwner||!displacedByStopwatch(game,this)||(options.delta??options.rank??1)<=0)return apply.call(this,id,options);
  return withCastingActorLock(this,async()=>{
   const state=read(this);if(!state.die)return apply.call(this,id,options);
   const content=document.createElement('p');content.textContent='Temporal Stopwatch: Stammt '+id+' aus einem feindlichen Effekt? Dann bis zum Ende von Displaced vormerken; die ursprüngliche Laufzeit läuft weiter.';
   const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Displaced · neue Condition'},content:content.outerHTML,buttons:[{action:'defer',label:'Feindlich: verschieben',callback:()=>true},{action:'apply',label:'Andere Quelle: normal anwenden',callback:()=>false}],rejectClose:false});if(choice===null||choice===undefined)return null;
   if(!choice){releasing.add(this);try{return await apply.call(this,id,options);}finally{releasing.delete(this);}}
   const duration=options.duration&&structuredClone(options.duration),start=Number.isFinite(duration?.startTime)?duration.startTime:game.time.worldTime;
   state.deferred.push({id:foundry.utils.randomID(),conditionId:id,options:{rank:options.rank??1,delta:options.delta??0,origin:options.origin},duration,expiresAt:Number.isFinite(duration?.seconds)?start+duration.seconds:undefined,status:'pending',receivedAt:game.time.worldTime});await this.setFlag(MODULE_ID,key,state);return null;
  });
 };
 // Native chat effect application creates ActiveEffects directly, without Actor.applyCondition.
 // Keep its dependency and clock intact; only the condition-bearing portion is disabled.
 const create=EffectClass.createDocuments;
 EffectClass.createDocuments=async function(data,options={}){
  const actor=options.parent;
  if(!actor?.isOwner||actor.documentName!=='Actor'||releasing.has(actor)||!displacedByStopwatch(game,actor))return create.call(this,data,options);
  const hasCondition=d=>!d.disabled&&((d.statuses??[]).some(id=>CONFIG.DND5E.conditionTypes[id]?.pseudo===false)||!!d.flags?.n5eb?.condition?.id);
  if(!data.some(hasCondition))return create.call(this,data,options);
  const content=document.createElement('div'),hint=document.createElement('p');hint.textContent='Temporal Stopwatch: Enthält diese neue Condition-Anwendung auf '+actor.name+' feindliche Conditions? Diese bis zum Ende von Displaced deaktiviert vormerken; ihre Laufzeit und die Bindung an das ursprüngliche Jutsu laufen weiter. Zugehörige Condition-Modifikatoren werden ebenfalls verschoben.';content.append(hint);
  if(data.some(d=>hasCondition(d)&&(d.system?.changes??d.changes??[]).length)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='split';label.append(input,document.createTextNode('Die zusätzlichen Effektmodifikatoren sind unabhängig von der Condition und sollen weiterwirken'));content.append(label);}
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Displaced · native Condition-Effekte'},content:content.innerHTML,buttons:[{action:'defer',label:'Feindliche Conditions verschieben',callback:(_e,b)=>({defer:true,split:!!b.form.elements.split?.checked})},{action:'apply',label:'Andere Quelle: normal anwenden',callback:()=>({defer:false})}],rejectClose:false});
  if(choice===null||choice===undefined)return [];
  if(!choice.defer||!displacedByStopwatch(game,actor))return create.call(this,data,options);
  const sessionId=read(actor).id,next=[];
  for(const original of data){
   if(!hasCondition(original)){next.push(original);continue;}
   const condition=foundry.utils.deepClone(original),changes=condition.system?.changes??condition.changes??[];
   if(changes.length&&choice.split){
    const other=foundry.utils.deepClone(original);other.statuses=[];if(other.flags?.n5eb)delete other.flags.n5eb.condition;
    next.push(other);delete condition._id;condition.name+=' · verschobene Condition';if(condition.system)condition.system.changes=[];if(condition.changes)condition.changes=[];
   }
   condition.disabled=true;condition.flags??={};condition.flags[MODULE_ID]??={};condition.flags[MODULE_ID].stopwatchDeferred={sessionId,receivedAt:game.time.worldTime};next.push(condition);
  }
  return create.call(this,next,options);
 };
 Hooks.on('updateCombat',(combat,changes)=>{
  if(!genjutsuEnabled(game)||combat.id!==game.combat?.id||!['turn','round'].some(k=>Object.hasOwn(changes,k)))return;
  for(const actor of new Set([...game.actors,...combat.turns.map(t=>t.actor)].filter(Boolean))){
   if(!actor.isOwner||(game.users.activeGM?game.users.activeGM.id!==game.user.id:game.users.find(u=>u.active&&!u.isGM&&actor.testUserPermission(u,'OWNER'))?.id!==game.user.id)||!displacedByStopwatch(game,actor))continue;
   stepStopwatch(game,actor).catch(error=>ui.notifications.warn(actor.name+': '+error.message));
  }
 });
}
