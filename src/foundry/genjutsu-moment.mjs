import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature,isGenjutsu,actualizationPool} from '../casting/genjutsu-context.mjs';
import {appendActualizationSpend} from '../casting/genjutsu-resources.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {withCastingActorLock,castingActorBusy} from './mode-adapter.mjs';
import {ninjutsuEffect,ninjutsuEffectData,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';

const key='genjutsuMomentJournal',tickets=new Map(),busy=new WeakSet(),wrapped=new WeakSet();
const feature=actor=>ownedGenjutsuFeature(actor,'A Moment In Time','Time Slipper');
const effects=actor=>actor.effects.filter(e=>ninjutsuEffect(e)?.metadata.moment&&ninjutsuEffect(e).sourceActorUuid===actor.uuid);
function requireActor(game,actor){if(!genjutsuEnabled(game)||!actor?.isOwner||!feature(actor))throw Error('A Moment In Time nicht verfügbar.');}
function freeConcentration(actor,benefits){if(!benefits.some(b=>['ac','dex'].includes(b)))return;const own=new Set(effects(actor).map(e=>e.id));if(actor.concentration.effects.size-[...actor.concentration.effects].filter(e=>own.has(e.id)).length>=actor.system.attributes.concentration.limit)throw Error('Kein freier Konzentrationsplatz. Nur eine frühere eigene Moment-Wirkung wird ersetzt.');}
function plan(actor,benefits){
 if(!Array.isArray(benefits)||!benefits.length||benefits.length>2||new Set(benefits).size!==benefits.length||benefits.some(b=>!['movement','ac','dex','cast'].includes(b)))throw Error('Ein oder zwei unterschiedliche Moment-Vorteile auswählen.');
 const mastery=benefits.length===2&&ownedGenjutsuFeature(actor,'Temporal Mastery','Time Slipper');if(benefits.length===2&&(!mastery||mastery.system.uses.value<1))throw Error('Zwei Vorteile benötigen eine verfügbare Temporal-Mastery-Nutzung.');
 if(actualizationPool(actor).remaining<benefits.length)throw Error('Nicht genügend Actualization Dice.');freeConcentration(actor,benefits);return {mastery,count:benefits.length,die:actualizationPool(actor).die};
}
function spend(actor,state,updates){const current=plan(actor,state.benefits);appendActualizationSpend(actor,current.count,updates);if(current.mastery)appendFeatureSpend(updates,current.mastery);}
async function finish(game,actor,state){
 const old=effects(actor),current=feature(actor);if(!current)throw Error('Moment-Feature nach Zahlung nicht mehr vorhanden.');freeConcentration(actor,state.benefits);
 let bonus=0;
 if(state.benefits.includes('ac')){const roll=await new Roll('1d'+state.die).evaluate();bonus=Math.ceil(roll.total/2);state.acRoll=roll.toJSON();state.acBonus=bonus;await actor.setFlag(MODULE_ID,key,state);await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'A Moment In Time · AC +'+bonus+' (Hälfte aufgerundet)'});}
 if(state.benefits.some(b=>['ac','dex'].includes(b))){
  const data=ninjutsuEffectData({name:'A Moment In Time',id:state.id,sourceActorUuid:actor.uuid,sourceItemUuid:current.uuid,setting:'genjutsuClassAutomation',changes:bonus?[{key:'system.attributes.ac.bonus',value:bonus,type:'add',priority:20}]:[],metadata:{concentration:true,moment:{dexDie:state.benefits.includes('dex')?state.die:0,acBonus:bonus}}});
  data.flags.n5eb={item:{id:current.id,uuid:current.uuid,type:current.type}};const [created]=await actor.createEmbeddedDocuments('ActiveEffect',[data]);if(!created)throw Error('Gemeinsame Moment-Konzentration wurde nicht erstellt.');state.effectId=created.id;await actor.setFlag(MODULE_ID,key,state);
 }
 if(old.length)await actor.deleteEmbeddedDocuments('ActiveEffect',old.map(e=>e.id));
 if(state.benefits.includes('movement'))await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:'A Moment In Time: '+({dash:'Dash',disengage:'Disengage',hide:'Hide'}[state.movement])+'. Bewegung und Aktionsökonomie selbst ausführen.'});
 state.status='applied';await actor.setFlag(MODULE_ID,key,state);
}
export async function activateMoment(game,actor){
 requireActor(game,actor);if(busy.has(actor)||castingActorBusy(actor)||['applying','paid','review'].includes(actor.getFlag(MODULE_ID,key)?.status))throw Error('Offenen Vorgang zuerst abschließen bzw. vom GM prüfen lassen.');busy.add(actor);
 try{
  const content=document.createElement('div');for(const [value,label] of [['movement','Dash / Disengage / Hide'],['ac','AC: halber gewürfelter Die, aufgerundet'],['dex','1 Actualization Die zu DEX-Saves'],['cast','Ein bekanntes Genjutsu: 1 Action, ohne Konzentration']]){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='benefit';input.value=value;l.append(input,document.createTextNode(label));content.append(l,document.createElement('br'));}
  const select=document.createElement('select');select.name='movement';for(const value of ['dash','disengage','hide']){const o=document.createElement('option');o.value=value;o.textContent=value;select.append(o);}content.append(select);
  const note=document.createElement('p');note.textContent='Ein Vorteil kostet 1 Actualization Die. Mit Temporal Mastery: zwei verschiedene Vorteile, 2 Dice und 1 Mastery-Nutzung. AC/DEX teilen eine normale Konzentration ohne Chakra-Unterhalt. Vorherige eigene Moment-Wirkungen werden ersetzt, andere Konzentrationen bleiben erhalten. Ein gewählter Jutsu-Cast kostet regulär Chakra; dessen Dialogabbruch verbraucht keine Moment-Ressourcen.';content.append(note);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'A Moment In Time'},content:content.innerHTML,buttons:[{action:'activate',label:'Vorteile bestätigen',callback:(_e,b)=>({benefits:[...b.form.querySelectorAll('[name="benefit"]:checked')].map(i=>i.value),movement:b.form.elements.movement.value})}],rejectClose:false});if(!choice)return;
  const initial=plan(actor,choice.benefits);if(!['dash','disengage','hide'].includes(choice.movement))throw Error('Ungültige Bewegungsoption.');
  const state={id:foundry.utils.randomID(),status:'applying',benefits:choice.benefits,movement:choice.movement,die:initial.die,createdAt:game.time.worldTime};
  if(choice.benefits.includes('cast')){
   const candidates=[...actor.items].filter(isGenjutsu).flatMap(item=>[...item.system.activities].filter(a=>a.activation.type==='action'&&!a.duration.concentration).map(activity=>({item,activity})));
   if(!candidates.length)throw Error('Kein bekanntes Genjutsu mit 1 Action ohne Konzentration vorhanden.');
   const select=document.createElement('select');select.name='jutsu';candidates.forEach((c,index)=>{const o=document.createElement('option');o.value=String(index);o.textContent=c.item.name+' · '+c.activity.name;select.append(o);});
   const index=await foundry.applications.api.DialogV2.wait({window:{title:'Moment · Folgejutsu'},content:select.outerHTML,buttons:[{action:'cast',label:'Nativen Castingdialog öffnen',callback:(_e,b)=>Number(b.form.elements.jutsu.value)}],rejectClose:false});if(index===null||index===undefined)return;const selected=candidates[index];if(!selected)throw Error('Ungültiges Folgejutsu.');
   tickets.set(state.id,{actorUuid:actor.uuid,itemId:selected.item.id,activityId:selected.activity.id,state});await actor.setFlag(MODULE_ID,key,state);
   try{const result=await selected.activity.use({consume:{chakra:true,resources:false,action:false},n5ese:{momentTicket:state.id}},{configure:true},{create:true});if(!result?.message){state.status=actor.getFlag(MODULE_ID,key)?.status==='paid'?'review':'cancelled';await actor.setFlag(MODULE_ID,key,state);return;}if(actor.getFlag(MODULE_ID,key)?.status!=='paid')throw Error('Moment-Ressourcen wurden nicht im nativen Cast bestätigt; GM-Prüfung erforderlich.');state.messageId=result.message.id;await finish(game,actor,state);return result;}catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,key,state);throw error;}finally{tickets.delete(state.id);}
  }
  return await withCastingActorLock(actor,async()=>{
   const updates={actor:{},item:[]};spend(actor,state,updates);await actor.setFlag(MODULE_ID,key,state);
   try{await actor.updateEmbeddedDocuments('Item',updates.item);state.status='paid';await actor.setFlag(MODULE_ID,key,state);await finish(game,actor,state);}catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,key,state);throw error;}
  });
 }finally{busy.delete(actor);}
}
export async function resolveMoment(game,actor){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{const state=actor.getFlag(MODULE_ID,key);if(!['applying','paid','review'].includes(state?.status))throw Error('Kein unterbrochener Moment-Vorgang.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Moment prüfen'},content:'<p>Die-Verbrauch, Mastery-Nutzung, Folgejutsu und eigene alte/neue Moment-Konzentration manuell geprüft/korrigiert? Ohne erneutes Würfeln/Wirken abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,key,{...state,status:'resolved'});});
}
export function installMoment(game,ActorClass,types){
 const ap=ActorClass.prototype,save=ap.rollSavingThrow;
 ap.rollSavingThrow=function(config={},...args){if(genjutsuEnabled(game)&&config.ability==='dex'){const die=Math.max(0,...effects(this).filter(e=>activeNinjutsuEffect(game,e)).map(e=>ninjutsuEffect(e).metadata.moment.dexDie));if(die){const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],parts:[...(rolls[0]?.parts??[]),'1d'+die]};config={...config,rolls};}}return save.call(this,config,...args);};
 for(const {documentClass} of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const prepare=p._prepareUsageUpdates,finalize=p._finalizeMessageConfig;
  p._prepareUsageUpdates=async function(config,options){const id=config.n5ese?.momentTicket,grant=id&&tickets.get(id);if(id){requireActor(game,this.actor);if(grant?.actorUuid!==this.actor.uuid||grant.itemId!==this.item.id||grant.activityId!==this.id||!isGenjutsu(this.item)||this.activation.type!=='action'||this.duration.concentration||config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Moment-Folgecast ist nicht berechtigt.');plan(this.actor,grant.state.benefits);}
   const updates=await prepare.call(this,config,options);if(grant&&updates&&!Array.isArray(updates)){spend(this.actor,grant.state,updates);updates.actor['flags.'+MODULE_ID+'.'+key]={...grant.state,status:'paid'};}return updates;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finalize.call(this,config,message,updates),grant=tickets.get(config.n5ese?.momentTicket);if(grant){message.data.flags??={};message.data.flags[MODULE_ID]??={};message.data.flags[MODULE_ID].genjutsuMomentCast={id:grant.state.id,benefits:grant.state.benefits,dice:grant.state.benefits.length};}return result;};
 }
}
