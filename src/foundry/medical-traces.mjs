import {MODULE_ID} from '../settings/register.mjs';
import {medicalFeature,isMedical} from '../casting/medical-context.mjs';
import {medicalReleases} from './medical-elemental.mjs';
import {nextActorTurnDeadline} from '../casting/molding-lifetimes.mjs';
import {ninjutsuEffect,ninjutsuEffectData,upsertNinjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {grantMedicalTempHP} from './medical-temp-hp.mjs';

export function traceChoices(actor,item){
 if(!medicalFeature(actor,'Elemental Traces','Elemental Medic')||!isMedical(item))return [];
 const keywords=item.system.jutsu.keywords,natures=['earth','wind','fire','water','lightning'];
 return medicalReleases(actor).filter(nature=>!natures.some(k=>keywords.has(k))||keywords.has(nature));
}
export function traceRank(item){return item?.getFlag(MODULE_ID,'medicalCast')?.rank??item?.system.effectiveRank??item?.system.rank;}
export function dominantMedicalTrace(game,effect){
 if(!effect)return true;const nature=ninjutsuEffect(effect)?.metadata?.genjutsu?.traceNature;
 if(!nature||nature==='earth')return true;
 const candidates=effect.parent.effects.filter(e=>ninjutsuEffect(e)?.metadata?.genjutsu?.traceNature===nature&&activeNinjutsuEffect(game,e));
 candidates.sort((a,b)=>(ninjutsuEffect(b).metadata.genjutsu.traceWaterRemaining??0)-(ninjutsuEffect(a).metadata.genjutsu.traceWaterRemaining??0)||(ninjutsuEffect(b).metadata.genjutsu.traceAt??0)-(ninjutsuEffect(a).metadata.genjutsu.traceAt??0)||a.id.localeCompare(b.id));
 return candidates[0]?.id===effect.id;
}
export function installMedicalTraceStacking(game,EffectClass){
 const apply=EffectClass.applyChange;
 EffectClass.applyChange=function(actor,change,options){if(!dominantMedicalTrace(game,change.effect))return {};return apply.call(this,actor,change,options);};
}
export async function applyMedicalTrace(game,target,source,entry,feature){
 const rank=['d','c','b','a','s'].indexOf(entry.rank)+1,nature=entry.elementalNature;
 if(!rank||!medicalReleases(source).includes(nature))throw Error('Bestätigter Elemental-Traces-Rang oder Release fehlt.');
 const lifetime={deadline:nextActorTurnDeadline(game.combat,target.uuid,nature==='water'?'start':'end',nature==='water'?rank+1:1)};
 const payload={medical:true,ruleId:'medical.elemental-traces.'+nature,traceNature:nature,traceAt:entry.at,conditions:[]},changes=[];
 if(nature==='wind'){changes.push({key:'system.attributes.movement.bonus',type:'add',value:10,priority:20});payload.rolls=[{kind:'save',ability:'dex',bonus:2}];}
 if(nature==='fire'){changes.push({key:'system.traits.dr.value',type:'add',value:'fire',priority:20});payload.traceFireAvailable=true;}
 if(nature==='lightning')changes.push({key:'system.attributes.ac.bonus',type:'add',value:2,priority:20});
 if(nature==='water')payload.traceWaterRemaining=rank;
 const data=ninjutsuEffectData({name:'Elemental Traces · '+nature,id:entry.id,sourceActorUuid:source.uuid,sourceItemUuid:feature.uuid,lifetime,setting:'medicalClassAutomation',changes,metadata:{genjutsu:payload}});
 const effect=await upsertNinjutsuEffect(target,data);
 if(nature==='earth'){
  const id=await grantMedicalTempHP(target,{sourceActorUuid:source.uuid,rule:'elemental-traces-earth',amount:[4,8,12,16,25][rank-1],mode:'add',lifetime,itemUuid:game.messages.get(entry.messageId)?.getAssociatedItem?.()?.uuid});
  if(id){const marker=structuredClone(effect.getFlag(MODULE_ID,'ninjutsuEffect'));marker.metadata.genjutsu.medicalTempGrantId=id;await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}
 }
 return {nature,rank,effectId:effect.id};
}
