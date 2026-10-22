import {addEchoFearField,prepareEchoFear} from './genjutsu-echo-fear.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,isGenjutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {managedGenjutsuConditionData} from '../effects/genjutsu-effects.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {subclassCastExpiry} from '../casting/subclass-cast-lifetime.mjs';
import {moldingLifetimeExpired} from '../casting/molding-lifetimes.mjs';
import {requireInfusionTarget} from './genjutsu-weapon-casting.mjs';

const managers=new WeakMap();
const has=(actor,name)=>ownedGenjutsuFeature(actor,name,'Nightmare Keeper');
export function pureTerrorChoices(game,activity){
 return [...(activity.effects??[])].flatMap(ref=>{const effect=ref.effect??activity.item.effects.get(ref._id);return effect?[...effect.statuses].filter(id=>['mental','sensory'].includes(game.n5eb.conditions.getConditionConfig(id)?.category)).map(id=>({value:effect.id+'|'+id,label:effect.name+' · '+id})):[];});
}
export function addFearFields(game,activity,config,result){
 if(!genjutsuEnabled(game)||!isGenjutsu(activity.item))return;const selected=config.n5ese?.genjutsu??{};
 addEchoFearField(game,activity,config,result);
 if(has(activity.actor,'Pure Terror')&&pureTerrorChoices(game,activity).length){
  result.fields.push({name:'n5ese.genjutsu.pureTerror',value:selected.pureTerror??'',field:new foundry.data.fields.StringField({label:'Pure Terror: eine Condition bei genau einer Kreatur durch Fear ersetzen'}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options:[{value:'',label:'Nicht ersetzen'},...pureTerrorChoices(game,activity)]})});
  result.fields.push({name:'n5ese.genjutsu.pureTerrorTarget',value:selected.pureTerrorTarget??'',field:new foundry.data.fields.StringField({label:'Pure Terror: ausdrücklich ausgewählte Kreatur'}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options:[{value:'',label:'Vor Öffnen des Dialogs tatsächliche Ziele markieren'},...[...game.user.targets].filter(t=>t.actor).map(t=>({value:t.actor.uuid,label:t.name}))]})});
 }
 if(has(activity.actor,'Overwhelming Fear'))result.fields.push({name:'n5ese.genjutsu.overwhelmingFear',value:!!selected.overwhelmingFear,field:new foundry.data.fields.BooleanField({label:'Overwhelming Fear: +1 Fear-Rang nach einer etwaigen Fury-Verdopplung'}),input:result.inputs.createCheckboxInput});
}
export function prepareFearCast(game,item,config){
 if(!genjutsuEnabled(game)||!isGenjutsu(item))return;const choice=config.n5ese?.genjutsu??{},activity=item.system.activities.get(config.n5ese?.moldingActivityId),marker={};
 // The caller supplies the active activity ID even when molding automation is disabled.
 if(choice.pureTerror){
  if(!has(item.actor,'Pure Terror')||!activity||!pureTerrorChoices(game,activity).some(c=>c.value===choice.pureTerror))throw Error('Pure Terror benötigt eine tatsächlich vorhandene mentale/sensorische Condition.');
  const [effectId,conditionId]=choice.pureTerror.split('|'),target=[...game.user.targets].find(t=>t.actor?.uuid===choice.pureTerrorTarget);if(!target)throw Error('Genau die tatsächlich betroffene Pure-Terror-Kreatur auswählen.');
  const effect=item.effects.get(effectId);if(effect.system.changes?.length)throw Error('Diese kombinierte Condition enthält weitere Datenänderungen; ihre Ersetzung vorerst manuell anwenden.');
  marker.pureTerror={effectId,conditionId,targetUuid:target.actor.uuid};
 }
 if(choice.overwhelmingFear){if(!has(item.actor,'Overwhelming Fear'))throw Error('Overwhelming Fear nicht vorhanden.');marker.overwhelmingFear=true;}
 if(has(item.actor,'Overwhelming Fear')&&(marker.pureTerror||activity?.effects?.some(ref=>[...(ref.effect??item.effects.get(ref._id))?.statuses??[]].includes('frightened'))))marker.overwhelmingEligible=true;
 if(Object.keys(marker).length)item.updateSource({['flags.'+MODULE_ID+'.genjutsuFearCast']:marker});
 prepareEchoFear(game,item,activity,config);
}
function transformContext(game,message,effectId){
 const actor=message?.getAssociatedActor(),item=message?.getAssociatedItem(),activity=message?.getAssociatedActivity(),marker=item?.getFlag(MODULE_ID,'genjutsuFearCast')??{},ref=activity?.effects?.find(r=>r._id===effectId),effect=ref&&(ref.effect??item.effects.get(effectId));
 if(!genjutsuEnabled(game)||!isGenjutsu(item)||!effect||!marker||message.system.deltas===null)throw Error('Eigener belegter Genjutsu-Condition-Cast fehlt oder wurde erstattet.');
 const permeatingFeature=item.system.jutsu.keywords.has('inhaled')&&[...effect.statuses].some(id=>game.n5eb.conditions.canonicalizeConditionId(id)==='envenomed')&&ownedGenjutsuFeature(actor,'Permeating Intoxicant','Misty Distortionist'),permeating=!!permeatingFeature;
 const pure=marker.pureTerror?.effectId===effectId&&has(actor,'Pure Terror'),overwhelming=marker.overwhelmingFear&&has(actor,'Overwhelming Fear'),aura=marker.overwhelmingEligible&&has(actor,'Overwhelming Fear');if(!pure&&!overwhelming&&!aura&&!permeating)throw Error('Keine passende Fear-Umwandlung vorhanden.');
 requireInfusionTarget(game,message);return {actor,item,message,effect,marker,pure:!!pure,overwhelming:!!overwhelming,aura:!!aura,permeating,permeatingFeature};
}
export function fearWorkflow(game){
 if(managers.has(game))return managers.get(game);const manager=createSubclassMoldingRequests(game,{
  storage:'genjutsuConditionRequests',id:()=>foundry.utils.randomID(),resolve:async uuid=>{const doc=await fromUuid(uuid);return doc?.documentName==='Actor'?{actor:doc}:doc;},
  owner(actor){if(!actor?.isOwner||!genjutsuEnabled(game))throw Error('Eigener Genjutsu-Cast und Berechtigung erforderlich.');},
  context(actor,messageId,ruleId){const [effectId,targetUuid]=ruleId.split('|'),ctx=transformContext(game,game.messages.get(messageId),effectId);if(ctx.actor.uuid!==actor.uuid)throw Error('Quellenberechtigung fehlt.');return {...ctx,targetUuid,record:{castId:messageId},rule:{id:ruleId,source:(ctx.pure?has(actor,'Pure Terror'):ctx.overwhelming||ctx.aura?has(actor,'Overwhelming Fear'):ctx.permeatingFeature).uuid}};},
  async prepare(ctx,request,targets){
   if(targets.length!==1||targets[0].uuid!==ctx.targetUuid)throw Error('Genau die bestätigte Kreatur verwenden.');const target=targets[0];requireInfusionTarget(game,ctx.message,target.uuid);
   const record=ctx.message.getFlag(MODULE_ID,'genjutsuCast');if(record?.choice.power&&record.powerTarget?.uuid!==target.uuid)throw Error('Actualized Power erlaubt nur das beim Cast bestätigte Einzelziel.');const native=ctx.effect.toObject(),pure=ctx.pure&&ctx.marker.pureTerror.targetUuid===target.uuid;let ignoreFear=false;
   if(ctx.aura&&game.n5eb.conditions.hasConditionImmunity(target,'frightened'))ignoreFear=await foundry.applications.api.DialogV2.confirm({window:{title:'Overwhelming Fear · Immunität'},content:'<p>GM bestätigt: Eine von dir durch Genjutsu in Fear versetzte Kreatur befindet sich tatsächlich innerhalb 30 Fuß dieses Ziels. Dessen Fear-Immunität nur für diese Anwendung ignorieren?</p>',rejectClose:false});
   const power=record?.choice.power&&record.powerTarget?.uuid===target.uuid,expires=[subclassCastExpiry(ctx.message.getAssociatedActivity().duration,record?.createdAt??request.createdAt),native.duration?.seconds>0?(record?.createdAt??request.createdAt)+native.duration.seconds:undefined].filter(Number.isFinite),lifetime={expiresAt:expires[1]??expires[0]},feature=ctx.pure?has(ctx.actor,'Pure Terror'):ctx.overwhelming||ctx.aura?has(ctx.actor,'Overwhelming Fear'):ctx.permeatingFeature;
   const data=managedGenjutsuConditionData(game,{native,target,actor:ctx.actor,feature,id:request.id,lifetime,payload:{ruleId:'jutsu-condition:'+String(sourceOf(ctx.item)??ctx.item.uuid)+':'+ctx.effect.id,messageId:ctx.message.id,concentrationId:ctx.message.system.concentration,overwhelmingBypass:ignoreFear&&!power,note:ignoreFear&&!power?'Fear-Immunität hier aufgrund der bestätigten Overwhelming-Fear-Aura ignoriert. Wenn die Voraussetzung nicht mehr besteht, Immunität wieder beachten.':undefined},ignoreDefense:!!power,ignoreResistance:ctx.permeating?['envenomed']:[],ignoreImmunity:ignoreFear?['frightened']:[],transformConditions:conditions=>conditions.map(c=>{
    let next=pure&&c.id===ctx.marker.pureTerror.conditionId?{id:'frightened',rank:ctx.item.getFlag(MODULE_ID,'genjutsuAugmentation')?.fury?.benefit==='conditions'?2:1}:c;
    if(ctx.overwhelming&&next.id==='frightened')next={...next,rank:next.rank+1};return next;
   })});
   return [{targetUuid:target.uuid,data,lifetime,pure,power}];
  },
  confirm(ctx,_request,prepared){const p=document.createElement('p');p.textContent=ctx.effect.name+': '+prepared[0].data.flags[MODULE_ID].ninjutsuEffect.metadata.genjutsu.conditions.map(c=>c.id+' '+c.rank).join(', ')+'. Tatsächliches Jutsu-/Save-Ergebnis und richtige native Effektzeile bestätigt? Diese Anwendung ersetzt die normale Effektanwendung.';return foundry.applications.api.DialogV2.confirm({window:{title:'Genjutsu-Conditions bestätigen'},content:p.outerHTML,rejectClose:false});},
  async apply(target,plan,ctx,request){
   requireInfusionTarget(game,ctx.message,target.uuid);if(moldingLifetimeExpired(plan.lifetime,{combat:game.combat,worldTime:game.time.worldTime}))throw Error('Ursprüngliche Condition-Dauer abgelaufen.');if(ctx.message.system.concentration&&!ctx.actor.effects.has(ctx.message.system.concentration))throw Error('Ursprüngliche Konzentration beendet.');
   if(plan.power&&ctx.message.getFlag(MODULE_ID,'genjutsuCast').powerTarget.uuid!==target.uuid)throw Error('Falsches Actualized-Power-Ziel.');const data=structuredClone(plan.data);if(Number.isFinite(plan.lifetime.expiresAt))data.duration={...data.duration,seconds:plan.lifetime.expiresAt-game.time.worldTime,startTime:game.time.worldTime};
   if(target.effects.some(e=>e.getFlag(MODULE_ID,'ninjutsuEffect')?.id===request.id))throw Error('Condition-Wirkung bereits vorhanden; GM-Prüfung erforderlich.');const [effect]=await target.createEmbeddedDocuments('ActiveEffect',[data]);if(!effect)throw Error('Genjutsu-Condition nicht erstellt.');return {effectId:effect.id};
  }
 });managers.set(game,manager);return manager;
}
export async function requestFearEffect(game,message,effectId,target){
 const ctx=transformContext(game,message,effectId);if(!ctx.actor.isOwner)throw Error('Wirker oder GM muss diese Condition-Anfrage vormerken.');return fearWorkflow(game).request(ctx.actor,message.id,effectId+'|'+target.uuid,[{uuid:target.uuid,tokenUuid:target.token?.uuid??target.uuid,name:target.name}]);
}
export function handlesFearEffect(game,message,effect,targetUuid){try{const ctx=transformContext(game,message,effect.id);return ctx.permeating||ctx.pure&&ctx.marker.pureTerror.targetUuid===targetUuid||(ctx.overwhelming||ctx.aura)&&[...effect.statuses].some(id=>game.n5eb.conditions.canonicalizeConditionId(id)==='frightened');}catch{return false;}}
export function installGenjutsuFear(game){
 const p=globalThis.customElements?.get('effect-application')?.prototype;if(p){const apply=p._applyEffectToActor;p._applyEffectToActor=function(effect,actor){let ctx;try{ctx=transformContext(game,this.chatMessage,effect.id);}catch{return apply.call(this,effect,actor);}const hasFear=[...effect.statuses].some(id=>game.n5eb.conditions.canonicalizeConditionId(id)==='frightened');if(ctx.permeating||ctx.pure&&ctx.marker.pureTerror.targetUuid===actor.uuid||(ctx.overwhelming||ctx.aura)&&hasFear)return requestFearEffect(game,this.chatMessage,effect.id,actor);return apply.call(this,effect,actor);};}
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-genjutsu-conditions')?.remove();if(!genjutsuEnabled(game)||message.type!=='usage')return;const actor=message.getAssociatedActor();if(!actor)return;const entries=fearWorkflow(game).list(actor).filter(r=>r.messageId===message.id),div=document.createElement('section');div.className='n5ese-molding-chat n5ese-genjutsu-conditions';
  for(const entry of entries){const p=document.createElement('p');p.textContent='Condition-Anfrage · '+entry.status;div.append(p);const add=(label,fn,enabled)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){ui.notifications.warn(error.message);}finally{ui.chat.updateMessage(message);}});div.append(b);};if(entry.status==='pending'){add('GM: Condition bestätigen und anwenden',()=>fearWorkflow(game).apply(actor,entry.id),actor.isOwner&&game.user.isGM);add('Anfrage verwerfen',()=>fearWorkflow(game).cancel(actor,entry.id),actor.isOwner);}if(['applying','review'].includes(entry.status))add('GM: manuell geprüft abschließen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Condition-Vorgang prüfen'},content:'<p>Bereits ausgeführte Condition-Anwendung manuell geprüft/korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))await fearWorkflow(game).resolve(actor,entry.id);},actor.isOwner&&game.user.isGM);}
  if(div.children.length)html.append(div);
 });
 Hooks.on('updateActor',(actor,changes)=>{if(changes['flags.'+MODULE_ID+'.genjutsuConditionRequests']===undefined&&changes.flags?.[MODULE_ID]?.genjutsuConditionRequests===undefined)return;for(const id of new Set(fearWorkflow(game).list(actor).map(r=>r.messageId))){const m=game.messages.get(id);if(m)ui.chat.updateMessage(m);}});
}
