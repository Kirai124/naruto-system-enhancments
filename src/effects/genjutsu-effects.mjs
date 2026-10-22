import {MODULE_ID} from '../settings/register.mjs';
import {ninjutsuEffect,ninjutsuEffectData,activeNinjutsuEffect} from './ninjutsu-effects.mjs';

export const genjutsuPayload=effect=>effect?ninjutsuEffect(effect)?.metadata?.genjutsu:undefined;
export function activeGenjutsuEffect(game,effect){
 if(!genjutsuPayload(effect)||!activeNinjutsuEffect(game,effect))return false;
 const data=genjutsuPayload(effect);if(data.grappleAnchorId){const anchor=effect.parent?.effects.get(data.grappleAnchorId);if(!anchor||anchor===effect||anchor.disabled)return false;const managed=ninjutsuEffect(anchor);if(managed?!activeNinjutsuEffect(game,anchor)||!managed.metadata?.genjutsu?.conditions?.some(c=>c.id==='grappled'&&c.rank>0):![...anchor.statuses].some(id=>game.n5eb.conditions.canonicalizeConditionId(id)==='grappled'))return false;}if(data.sensingParentEffectId){const parent=effect.parent?.effects.get(data.sensingParentEffectId);if(!parent||parent===effect||!activeGenjutsuEffect(game,parent))return false;}if(data.cloakAura&&((effect.parent?.getChakraAvailable?.()??0)<=0||[...(CONFIG.DND5E.conditionEffects.incapacitated??[])].some(id=>effect.parent.statuses.has(id))))return false;if(data.sensing&&(effect.parent?.getChakraAvailable?.()??0)<=0)return false;const message=data.messageId&&game.messages.get(data.messageId);
 if(data.messageId&&(!message||message.system.deltas===null))return false;
 if(data.concentrationId){const source=fromUuidSync(ninjutsuEffect(effect).sourceActorUuid),concentration=source?.effects.get(data.concentrationId);if(!concentration||concentration.disabled)return false;}
 return true;
}
export const genjutsuEffects=(game,actor)=>actor.effects.filter(e=>activeGenjutsuEffect(game,e));
export function genjutsuEffectData({name,id,actor,feature,lifetime,payload,changes=[]}){
 return ninjutsuEffectData({name,id,sourceActorUuid:actor.uuid,sourceItemUuid:feature.uuid,lifetime,changes,setting:'genjutsuClassAutomation',metadata:{genjutsu:payload}});
}
export function prepareGenjutsuConditions(game,target,conditions,{ignoreDefense=false,ignoreResistance=[],ignoreImmunity=[]}={}){
 const normalized=new Map();for(const c of conditions){const id=game.n5eb.conditions.canonicalizeConditionId(c.id);normalized.set(id,{id,rank:Math.max(normalized.get(id)?.rank??0,c.rank)});}
 return [...normalized.values()].flatMap(condition=>{
  const id=game.n5eb.conditions.canonicalizeConditionId(condition.id),config=game.n5eb.conditions.getConditionConfig(id);
  if(!config||config.overflow||id==='exhaustion')throw Error('Diese Condition benötigt ihren eigenen nativen Ablauf: '+condition.id);
  const incoming=Math.max(0,Math.floor(Number(condition.rank)||0));if(!incoming)return [];condition={...condition,rank:config.ranked?Math.min(config.maxRank??Infinity,incoming):1};
  const bypassImmunity=ignoreImmunity.includes(id),rank=ignoreDefense||bypassImmunity?condition.rank:ignoreResistance.includes(id)&&!game.n5eb.conditions.hasConditionImmunity(target,id)?condition.rank:game.n5eb.conditions.adjustConditionApplicationRank(target,id,condition.rank);
  return rank>0?[{id,rank,ignoreImmunity:ignoreDefense||bypassImmunity}]:[];
 });
}
/** Keep native non-condition changes, while owning condition contributions separately. */
export function managedGenjutsuConditionData(game,{native,target,actor,feature,id,lifetime,payload,ignoreDefense=false,ignoreResistance=[],ignoreImmunity=[],transformConditions=conditions=>conditions}){
 const primary=game.n5eb.conditions.getEffectConditionId(native),ids=[...new Set((native.statuses??[]).map(s=>game.n5eb.conditions.canonicalizeConditionId(s)).filter(s=>game.n5eb.conditions.getConditionConfig(s)))];
 const conditions=prepareGenjutsuConditions(game,target,transformConditions(ids.map(id=>({id,rank:id===primary?game.n5eb.conditions.getEffectConditionRank(native):1}))),{ignoreDefense,ignoreResistance,ignoreImmunity});
 const data=genjutsuEffectData({name:native.name,id,actor,feature,lifetime,payload:{...payload,conditions},changes:native.system?.changes??native.changes??[]});
 data.img=native.img;data.origin=native.origin??feature.uuid;data.duration=native.duration;data.flags.n5eb=structuredClone(native.flags?.n5eb??{});delete data.flags.n5eb.condition;delete data.flags.n5eb.exhaustionLevel;return data;
}
const baseReads=new WeakSet();
function nativeRead(actor,fn){const nested=baseReads.has(actor);baseReads.add(actor);try{return fn();}finally{if(!nested)baseReads.delete(actor);}}
export function installGenjutsuEffectConditions(game,ActorClass,EffectClass){
 const applyChange=EffectClass.applyChange;
 EffectClass.applyChange=function(model,change,options){
  const effect=change.effect,payload=genjutsuPayload(effect),actual=ninjutsuEffect(effect)?.changes?.find(c=>c.key===change.key&&c.type===change.type);
  if(payload?.ruleId&&actual&&Number.isFinite(Number(actual.value))){
   if(!activeGenjutsuEffect(game,effect))return {};
   const matching=genjutsuEffects(game,model).filter(e=>genjutsuPayload(e).ruleId===payload.ruleId).map(e=>({effect:e,change:ninjutsuEffect(e).changes?.find(c=>c.key===change.key&&c.type===change.type)})).filter(e=>e.change&&Number.isFinite(Number(e.change.value))).sort((a,b)=>Math.abs(Number(b.change.value))-Math.abs(Number(a.change.value))||a.effect.id.localeCompare(b.effect.id));
   if(!matching.slice(0,payload.stackMax??1).some(e=>e.effect.id===effect.id))return {};
  }
  return applyChange.call(this,model,change,options);
 };
 const p=ActorClass.prototype,get=p.getConditionRank,getEffect=p.getConditionEffect,apply=p.applyCondition,update=p.updateConditionRank,has=p.hasConditionEffect;
 const own=(actor,id)=>genjutsuEffects(game,actor).flatMap(e=>(genjutsuPayload(e).conditions??[]).filter(c=>c.id===id).map(c=>({effect:e,...c})));
 p.getConditionEffect=function(id){const found=getEffect.call(this,id);if(!genjutsuPayload(found)?.conditions)return found;const canonical=game.n5eb.conditions.canonicalizeConditionId(id);return this.effects.find(e=>!genjutsuPayload(e)?.conditions&&game.n5eb.conditions.getEffectConditionId(e)===canonical)??null;};
 p.getConditionRank=function(id){
  const native=get.call(this,id);if(baseReads.has(this))return native;
  id=game.n5eb.conditions.canonicalizeConditionId(id);const contributions=own(this,id);if(!contributions.length)return native;
  const config=game.n5eb.conditions.getConditionConfig(id);if(!config||config.overflow||id==='exhaustion')return native;
  const immune=game.n5eb.conditions.hasConditionImmunity(this,id),groups=new Map();
  for(const c of contributions){if(immune&&!c.ignoreImmunity)continue;const key=genjutsuPayload(c.effect).ruleId;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
  const extra=[...groups.values()].reduce((sum,group)=>sum+group.sort((a,b)=>b.rank-a.rank).slice(0,genjutsuPayload(group[0].effect).stackMax??1).reduce((n,c)=>n+c.rank,0),0);
  return config.ranked?Math.min(config.maxRank??Infinity,native+extra):Math.min(1,native+extra);
 };
 // Limit the raw read scope to the synchronous native calculation. Holding it
 // over awaited writes would hide managed conditions during Actor preparation.
 p.applyCondition=function(...args){return nativeRead(this,()=>apply.apply(this,args));};
 p.updateConditionRank=async function(id,rank,options={}){
  const canonical=game.n5eb.conditions.canonicalizeConditionId(id),contributions=own(this,canonical);
  if(!baseReads.has(this)&&contributions.length){
   const base=get.call(this,canonical),total=this.getConditionRank(canonical),sum=contributions.reduce((n,c)=>n+c.rank,0);
   if(rank>=total)return nativeRead(this,()=>update.call(this,canonical,base+rank-total,options));
   let allocation;if(rank===0)allocation=[0,...contributions.map(()=>0)];
   else{
    const div=document.createElement('div'),note=document.createElement('p');note.textContent='Condition-Ränge aus mehreren Quellen: Wähle, welche Anteile erhalten bleiben. Zielgesamtwert '+rank+'. Dadurch werden keine anderen Bedingungen entfernt.';div.append(note);
    for(const [index,label,value] of [[0,'Native / andere Quellen',base],...contributions.map((c,i)=>[i+1,c.effect.name,c.rank])]){const l=document.createElement('label'),input=document.createElement('input');input.type='number';input.name='rank'+index;input.min='0';input.max=String(value);input.step='1';input.value=String(value);l.append(document.createTextNode(label),input);div.append(l);}
    allocation=await foundry.applications.api.DialogV2.wait({window:{title:'Condition-Anteile reduzieren'},content:div.innerHTML,buttons:[{action:'apply',label:'Erhaltene Anteile bestätigen',callback:(_e,b)=>Array.from({length:contributions.length+1},(_,i)=>Number(b.form.elements['rank'+i].value))}],rejectClose:false});if(!allocation)return null;
    if(allocation.some((v,i)=>!Number.isInteger(v)||v<0||v>(i?contributions[i-1].rank:base))||allocation.reduce((n,v)=>n+v,0)!==rank)throw Error('Anteile müssen genau den gewählten Gesamtwert ergeben.');
    if(get.call(this,canonical)!==base||own(this,canonical).reduce((n,c)=>n+c.rank,0)!==sum)throw Error('Condition während der Auswahl verändert.');
   }
   for(let i=0;i<contributions.length;i++){const {effect}=contributions[i],data=structuredClone(ninjutsuEffect(effect));data.metadata.genjutsu.conditions=data.metadata.genjutsu.conditions.flatMap(c=>c.id!==canonical?[c]:allocation[i+1]>0?[{...c,rank:allocation[i+1]}]:[]);await effect.setFlag(MODULE_ID,'ninjutsuEffect',data);}
   return nativeRead(this,()=>update.call(this,canonical,allocation[0],options));
  }
  return nativeRead(this,()=>update.call(this,id,rank,options));
 };
 p.hasConditionEffect=function(key){if(has.call(this,key))return true;const mapped=CONFIG.DND5E.conditionEffects[key]??new Set();return genjutsuEffects(game,this).some(e=>(genjutsuPayload(e).conditions??[]).some(c=>c.ignoreImmunity&&[c.id,...(game.n5eb.conditions.getConditionConfig(c.id)?.statuses??[])].some(id=>mapped.has(id))));};
 const prepare=EffectClass.prototype.prepareBaseData;
 EffectClass.prototype.prepareBaseData=function(...args){const result=prepare.apply(this,args),payload=genjutsuPayload(this);if(payload){this.statuses=new Set(this._source.statuses??[]);if(activeGenjutsuEffect(game,this))for(const status of payload.extraStatuses??[])this.statuses.add(status);if(activeGenjutsuEffect(game,this))for(const c of payload.conditions??[]){if(!c.ignoreImmunity&&game.n5eb.conditions.hasConditionImmunity(this.parent,c.id))continue;this.statuses.add(c.id);for(const status of game.n5eb.conditions.getConditionConfig(c.id)?.statuses??[])this.statuses.add(status);}}return result;};
}
