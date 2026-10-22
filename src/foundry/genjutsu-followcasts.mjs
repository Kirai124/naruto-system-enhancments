import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,isGenjutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {castingActorBusy} from './mode-adapter.mjs';

export const FOLLOWCASTS='genjutsuFollowcasts';
const busy=new WeakSet(),tickets=new Map(),wrapped=new WeakSet(),read=actor=>actor.getFlag(MODULE_ID,FOLLOWCASTS)??[];
const feature=actor=>ownedGenjutsuFeature(actor,'Master Of Reality','Layered Reality');
const eligible=a=>!!a&&isGenjutsu(a.item)&&a.activation.type==='action'&&a.duration.concentration;
async function write(actor,entry){const all=read(actor);await actor.setFlag(MODULE_ID,FOLLOWCASTS,all.some(e=>e.id===entry.id)?all.map(e=>e.id===entry.id?entry:e):[...all,entry]);}
function context(game,actor,messageId){
 const message=game.messages.get(messageId),activity=message?.getAssociatedActivity();if(!genjutsuEnabled(game)||!actor?.isOwner||!feature(actor)||message?.getAssociatedActor()?.uuid!==actor.uuid||message.type!=='usage'||message.system.deltas===null||!eligible(activity)||message.getFlag(MODULE_ID,'genjutsuRealityFollowcast'))throw Error('Eigener ursprünglicher Action-Genjutsu-Cast mit Konzentration erforderlich.');
 if(message.getFlag(MODULE_ID,'genjutsuDelayedCast')||message.getAssociatedItem()?.getFlag(MODULE_ID,'genjutsuWeaponCasting')?.infusion)throw Error('Gespeicherte Genjutsu sind kein unmittelbarer Folgecast-Auslöser.');
 return {message,activity};
}
function confirmTargets(game,actor){const refs=[...game.user.targets].filter(t=>t.actor);if(!refs.some(t=>t.actor.uuid!==actor.uuid))throw Error('Mindestens eine tatsächlich betroffene andere Kreatur markieren.');return refs.map(t=>({uuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}));}
export async function castMasterReality(game,actor,messageId){
 context(game,actor,messageId);if(busy.has(actor)||castingActorBusy(actor)||read(actor).some(e=>['casting','paid','review'].includes(e.status)))throw Error('Offenen Folgecast zuerst abschließen oder vom GM prüfen lassen.');busy.add(actor);
 try{
  if(read(actor).some(e=>e.messageId===messageId&&e.status!=='cancelled'))throw Error('Für diesen ursprünglichen Cast wurde bereits ein Folgecast bestätigt.');
  const candidates=[...actor.items].filter(isGenjutsu).flatMap(item=>[...item.system.activities].filter(eligible).map(activity=>({item,activity})));if(!candidates.length)throw Error('Kein bekanntes Action-Genjutsu mit Konzentration verfügbar.');
  const div=document.createElement('div'),p=document.createElement('p');p.textContent='Unmittelbar nach dem ursprünglichen Action-Cast bestätigen: Beide Jutsu betreffen andere Kreaturen als dich. Jetzt die tatsächlichen Folgecast-Ziele markieren. Folgejutsu kostet normal Chakra und 1 Master-of-Reality-Nutzung. Kein zusätzlicher Konzentrationsplatz wird gewährt. Aktionen bleiben manuell.';div.append(p);
  const select=document.createElement('select');select.name='jutsu';candidates.forEach((c,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=c.item.name+' · '+c.activity.name;select.append(o);});div.append(select);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Master Of Reality · Folgecast'},content:div.innerHTML,buttons:[{action:'cast',label:'Voraussetzungen bestätigen und konfigurieren',callback:(_e,b)=>Number(b.form.elements.jutsu.value)}],rejectClose:false});if(choice===null||choice===undefined)return;
  const selected=candidates[choice];if(!selected)throw Error('Ungültige Folgecast-Auswahl.');context(game,actor,messageId);const targets=confirmTargets(game,actor),entry={id:foundry.utils.randomID(),messageId,itemId:selected.item.id,activityId:selected.activity.id,targets,status:'casting',createdAt:game.time.worldTime};await write(actor,entry);tickets.set(entry.id,{actorUuid:actor.uuid,...entry});
  try{
   const result=await selected.activity.use({consume:{chakra:true,resources:false,action:false},n5ese:{realityFollowcast:entry.id}},{configure:true},{create:true}),current=read(actor).find(e=>e.id===entry.id);
   await write(actor,{...current,status:result?.message&&current?.status==='paid'?'applied':current?.status==='paid'||result?.message?'review':'cancelled',followupMessageId:result?.message?.id});return result;
  }catch(error){await write(actor,{...read(actor).find(e=>e.id===entry.id),status:'review',error:error.message});throw error;}finally{tickets.delete(entry.id);}
 }finally{busy.delete(actor);}
}
export async function resolveRealityFollowcast(game,actor,id){
 if(!game.user.isGM||!actor.isOwner||busy.has(actor))throw Error('GM-Prüfung erforderlich.');const entry=read(actor).find(e=>e.id===id);if(!['casting','paid','review'].includes(entry?.status))throw Error('Kein unterbrochener Folgecast.');
 if(await foundry.applications.api.DialogV2.confirm({window:{title:'Folgecast prüfen'},content:'<p>Chakra, Feature-Nutzung, Chatkarte und Konzentration manuell geprüft/korrigiert? Vorgang ohne erneuten Cast abschließen.</p>',rejectClose:false}))await write(actor,{...entry,status:'resolved',resolvedBy:game.user.id});
}
export function installGenjutsuFollowcasts(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const prepare=p._prepareUsageUpdates,finish=p._finalizeMessageConfig;
  p._prepareUsageUpdates=async function(config,options){
   const id=config.n5ese?.realityFollowcast,grant=tickets.get(id);if(id){context(game,this.actor,grant?.messageId);if(grant?.actorUuid!==this.actor.uuid||grant.itemId!==this.item.id||grant.activityId!==this.id||read(this.actor).find(e=>e.id===id)?.status!=='casting'||!eligible(this)||config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Ungültiger Master-of-Reality-Folgecast.');if(config.n5ese?.genjutsu?.delayKind||config.n5ese?.illusionaryInfusion)throw Error('Der unmittelbare Folgecast darf nicht erst gespeichert werden.');confirmTargets(game,this.actor);}
   const updates=await prepare.call(this,config,options);if(grant&&updates&&!Array.isArray(updates)){appendFeatureSpend(updates,feature(this.actor));updates.actor['flags.'+MODULE_ID+'.'+FOLLOWCASTS]=read(this.actor).map(e=>e.id===id?{...e,status:'paid'}:e);}return updates;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finish.call(this,config,message,updates),grant=tickets.get(config.n5ese?.realityFollowcast);if(grant){message.data.flags??={};message.data.flags[MODULE_ID]??={};message.data.flags[MODULE_ID].genjutsuRealityFollowcast={id:grant.id,originalMessageId:grant.messageId};}return result;};
 }
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-reality-followcast')?.remove();if(!genjutsuEnabled(game))return;const actor=message.getAssociatedActor?.();if(!actor)return;try{context(game,actor,message.id);}catch{return;}
  const div=document.createElement('section');div.className='n5ese-molding-chat n5ese-reality-followcast';const button=(label,fn,enabled)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{ui.chat.updateMessage(message);}});div.append(b);};const entries=read(actor).filter(e=>e.messageId===message.id);
  if(!entries.some(e=>e.status!=='cancelled'))button('Master Of Reality · weiteren Konzentrations-Cast bestätigen',()=>castMasterReality(game,actor,message.id),actor.isOwner);
  for(const entry of entries.filter(e=>['casting','paid','review'].includes(e.status)))button('GM: Folgecast prüfen',()=>resolveRealityFollowcast(game,actor,entry.id),actor.isOwner&&game.user.isGM);if(div.children.length)html.append(div);
 });
 Hooks.on('updateActor',(actor,changes)=>{if(changes['flags.'+MODULE_ID+'.'+FOLLOWCASTS]===undefined&&changes.flags?.[MODULE_ID]?.[FOLLOWCASTS]===undefined)return;for(const id of new Set(read(actor).map(e=>e.messageId))){const message=game.messages.get(id);if(message)ui.chat.updateMessage(message);}});
}
