import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature,isGenjutsu} from '../casting/genjutsu-context.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {castingActorBusy} from './mode-adapter.mjs';

export const PROGRAMS='genjutsuPrograms';
const tickets=new Map(),busy=new WeakSet(),wrapped=new WeakSet();
const pending=e=>['casting','paid','review'].includes(e?.status);
const entries=actor=>actor.getFlag(MODULE_ID,PROGRAMS)??[];
const eligible=item=>isGenjutsu(item)&&['e','d'].includes(item.system.effectiveRank);
function requireActor(game,actor){if(!genjutsuEnabled(game)||!actor?.isOwner||!ownedGenjutsuFeature(actor,'Signature Work','Malleable Mirages'))throw Error('Signature Work nicht verfügbar.');}
function sourceCard(game,actor,id){const message=game.messages.get(id);if(message?.getAssociatedActor()?.uuid!==actor.uuid||message.getFlag(MODULE_ID,'genjutsuMirageCast')?.name!=='Signature Work'||message.system.deltas===null)throw Error('Bezahlte Signature-Work-Chatkarte fehlt oder wurde erstattet.');return message;}
async function persist(actor,entry){const current=entries(actor);await actor.setFlag(MODULE_ID,PROGRAMS,current.some(e=>e.id===entry.id)?current.map(e=>e.id===entry.id?entry:e):[...current,entry]);}
function requireProgram(game,actor,id){requireActor(game,actor);const entry=entries(actor).find(e=>e.id===id);if(!entry||entry.status==='ended')throw Error('Kein aktives Illusionsprogramm.');sourceCard(game,actor,entry.messageId);return entry;}
function available(game,entry){if(pending(entry))throw Error('Unterbrochenen Programm-Cast zuerst vom GM prüfen lassen.');if(Number.isFinite(entry.lastCastAt)&&game.time.worldTime<entry.lastCastAt+60)throw Error('Das Programm darf erst eine Minute nach seinem letzten Cast erneut wirken.');}
function selectItems(actor){return [...actor.items].filter(eligible).flatMap(item=>[...item.system.activities].filter(a=>typeof a.use==='function').map(activity=>({item,activity})));}
export async function registerProgram(game,actor,messageId){
 requireActor(game,actor);sourceCard(game,actor,messageId);if(busy.has(actor)||castingActorBusy(actor))throw Error('Ein anderer Vorgang ist offen.');busy.add(actor);
 try{
  if(entries(actor).some(e=>e.messageId===messageId))throw Error('Diese Illusion hat bereits ein Programm; ein beendetes Programm wird nicht erneut aktiviert.');
  const candidates=selectItems(actor);if(!candidates.length)throw Error('Kein bekanntes Genjutsu bis D-Rang mit Castingaktivität vorhanden.');
  const root=document.createElement('div'),select=document.createElement('select');select.name='jutsu';candidates.forEach((c,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=c.item.name+' · '+c.activity.name;select.append(option);});root.append(select);
  const label=document.createElement('label');label.textContent='Programmierter Auslöser und Ort der Illusion';const input=document.createElement('textarea');input.name='trigger';input.required=true;label.append(input);root.append(label);
  const note=document.createElement('p');note.textContent='Ein bekanntes Genjutsu bis D-Rang. Jeder Folgecast kostet normal Chakra beim ursprünglichen Wirker. Auslöser, Position, Reichweite und tatsächliche Ziele bestätigt ihr selbst. Erleidet die Illusion Schaden, muss sie beendet werden. Keine automatische Aktionsausgabe.';root.append(note);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Signature Work · Programm speichern'},content:root.innerHTML,buttons:[{action:'save',label:'Programm bestätigen',callback:(_e,b)=>({index:Number(b.form.elements.jutsu.value),trigger:b.form.elements.trigger.value.trim()})}],rejectClose:false});if(!choice)return;
  const candidate=candidates[choice.index];if(!candidate||!choice.trigger||!eligible(actor.items.get(candidate.item.id)))throw Error('Bekanntes Genjutsu und tatsächliches Programm erforderlich.');sourceCard(game,actor,messageId);
  await persist(actor,{id:foundry.utils.randomID(),messageId,itemId:candidate.item.id,itemSource:sourceOf(candidate.item),activityId:candidate.activity.id,name:candidate.item.name,trigger:choice.trigger.slice(0,2000),rank:candidate.item.system.effectiveRank,status:'ready',createdAt:game.time.worldTime});
 }finally{busy.delete(actor);}
}
export async function castProgram(game,actor,id){
 let entry=requireProgram(game,actor,id);available(game,entry);if(busy.has(actor)||castingActorBusy(actor)||entries(actor).some(pending))throw Error('Ein anderer bzw. unterbrochener Vorgang ist offen.');busy.add(actor);
 try{
  const confirmed=await foundry.applications.api.DialogV2.confirm({window:{title:'Signature Work · Auslöser bestätigen'},content:'<p>Die unbeschädigte Illusion hat ihren programmierten Auslöser erreicht. Position, Reichweite und markierte betroffene Ziele sind vom Ort der Illusion aus geprüft. Der ursprüngliche Wirker bezahlt diesen Cast normal. Aktionsökonomie bleibt manuell.</p>',rejectClose:false});if(!confirmed)return;
  entry=requireProgram(game,actor,id);available(game,entry);const item=actor.items.get(entry.itemId),activity=item?.system.activities.get(entry.activityId);if(!eligible(item)||sourceOf(item)!==entry.itemSource||!activity||item.system.effectiveRank!==entry.rank)throw Error('Das gespeicherte bekannte Genjutsu ist nicht mehr verfügbar.');
  const attempt=foundry.utils.randomID();entry={...entry,status:'casting',attempt};await persist(actor,entry);tickets.set(attempt,{actorUuid:actor.uuid,itemId:item.id,activityId:activity.id,programId:id,rank:entry.rank});
  try{
   const result=await activity.use({consume:{chakra:true,resources:false,action:false},jutsu:{rank:entry.rank},n5ese:{programTicket:attempt}},{configure:true},{create:true});
   const current=entries(actor).find(e=>e.id===id);if(current?.attempt!==attempt)throw Error('Programmzustand wurde während des Casts verändert; GM-Prüfung erforderlich.');
   if(result?.message&&current.status==='paid'){entry={...current,status:'ready',lastCastAt:current.paidAt,lastMessageId:result.message.id};}
   else entry={...current,status:current.status==='paid'||result?.message?'review':'ready'};
   await persist(actor,entry);return result;
  }catch(error){await persist(actor,{...entries(actor).find(e=>e.id===id),status:'review',error:error.message});throw error;}finally{tickets.delete(attempt);}
 }finally{busy.delete(actor);}
}
export async function endProgram(game,actor,id){
 requireActor(game,actor);const entry=entries(actor).find(e=>e.id===id);if(!entry||busy.has(actor)||pending(entry))throw Error('Offenen Cast zuerst abschließen oder vom GM prüfen lassen.');
 if(await foundry.applications.api.DialogV2.confirm({window:{title:'Signature Work beenden'},content:'<p>Die Illusion wurde beschädigt, gebannt oder anderweitig beendet? Das Programm endgültig schließen.</p>',rejectClose:false}))await persist(actor,{...entry,status:'ended',endedAt:game.time.worldTime});
}
export async function resolveProgram(game,actor,id){
 if(!genjutsuEnabled(game)||!game.user.isGM||!actor.isOwner||busy.has(actor))throw Error('GM-Prüfung erforderlich.');const entry=entries(actor).find(e=>e.id===id);if(!pending(entry))throw Error('Kein unterbrochener Programm-Cast.');
 if(await foundry.applications.api.DialogV2.confirm({window:{title:'Programm-Cast manuell prüfen'},content:'<p>Chatkarte, Chakra und Konzentration wurden manuell geprüft und gegebenenfalls korrigiert. Ohne erneuten Cast entsperren; vorsichtshalber beginnt jetzt eine neue Minutensperre.</p>',rejectClose:false}))await persist(actor,{...entry,status:'ready',lastCastAt:game.time.worldTime,resolvedBy:game.user.id});
}
export function installGenjutsuPrograms(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const prepare=p._prepareUsageUpdates,finish=p._finalizeMessageConfig;
  p._prepareUsageUpdates=async function(config,options){
   const ticket=config.n5ese?.programTicket,grant=tickets.get(ticket);let entry;
   if(ticket){
    entry=requireProgram(game,this.actor,grant?.programId);if(grant?.actorUuid!==this.actor.uuid||grant.itemId!==this.item.id||grant.activityId!==this.id||entry.attempt!==ticket||entry.status!=='casting'||!eligible(this.item)||!['e','d'].includes(config.jutsu?.rank??this.item.system.effectiveRank)||config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Ungültiger programmierter Folgecast.');
    if((['mirageTicket','momentTicket','illusionaryInfusion'].some(k=>config.n5ese?.[k])||config.n5ese?.genjutsu?.delayKind))throw Error('Programm-Cast nicht mit einem weiteren Speicher- oder Folgecast kombinieren.');
   }
   const updates=await prepare.call(this,config,options);
   if(grant&&updates&&!Array.isArray(updates)){entry=requireProgram(game,this.actor,grant.programId);if(entry.status!=='casting'||entry.attempt!==ticket)throw Error('Programmzustand wurde verändert.');updates.actor??={};updates.actor['flags.'+MODULE_ID+'.'+PROGRAMS]=entries(this.actor).map(e=>e.id===entry.id?{...e,status:'paid',paidAt:game.time.worldTime}:e);}
   return updates;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finish.call(this,config,message,updates),grant=tickets.get(config.n5ese?.programTicket);if(grant){message.data.flags??={};message.data.flags[MODULE_ID]??={};message.data.flags[MODULE_ID].genjutsuProgramCast={programId:grant.programId,attempt:config.n5ese.programTicket};}return result;};
 }
}
