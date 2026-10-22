import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel} from '../casting/medical-context.mjs';
import {currentTurnEndDeadline,moldingLifetimeExpired} from '../casting/molding-lifetimes.mjs';
import {refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
const KEY='medicalElementalEmpowerment';
export const medicalReleases=actor=>(actor?.getFlag(MODULE_ID,'medicalSelections')?.releases??[]).filter(r=>['earth','wind','fire','water','lightning'].includes(r)).slice(0,medicalFeature(actor,'Preserve Life: Elemental Regrowth','Elemental Medic')?2:1);
export const elementalJutsu=item=>item?.type==='spell'&&medicalReleases(item.actor).some(k=>item.system.jutsu?.keywords?.has(k));
export function elementalEmpowerment(game,actor){const state=actor.getFlag(MODULE_ID,KEY);return medicalEnabled(game)&&state?.status==='active'&&!moldingLifetimeExpired(state.lifetime,{combat:game.combat,worldTime:game.time.worldTime})&&medicalFeature(actor,'Elemental Traces','Elemental Medic')?state:null;}
export async function activateElementalEmpowerment(game,actor){
 if(!medicalEnabled(game)||!actor.isOwner||medicalLevel(actor)<5||!medicalFeature(actor,'Elemental Traces','Elemental Medic')||!medicalReleases(actor).length)throw Error('Elemental Traces ab Stufe 5 und gespeichertes Nature Release erforderlich.');
 return withCastingActorLock(actor,async()=>{
  if(elementalEmpowerment(game,actor))throw Error('Elemental Traces bereits bis Zugende aktiv.');
  const feature=medicalFeature(actor,'Chakra Scalpel'),prior=actor.getFlag(MODULE_ID,KEY);if(!feature||feature.system.uses.value<1)throw Error('Eine Chakra-Scalpel-Charge erforderlich.');
  if(['paying','review'].includes(prior?.status))throw Error('Vorherigen Verbrauch zuerst vom GM prüfen lassen.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Elemental Traces · Zugverstärkung'},content:'<p>Eine Scalpel-Charge bezahlen? Bis zum Ende dieses Zuges darfst du bei jedem passenden Nature-Release-Cast zusätzliche Würfel oder einen SG-Bonus wählen. Außerhalb des Kampfes das tatsächliche Zugende manuell bestätigen. Aktionsökonomie bleibt manuell.</p>',rejectClose:false}))return;
  const state={id:foundry.utils.randomID(),status:'paying',at:game.time.worldTime,lifetime:{deadline:currentTurnEndDeadline(game.combat)}};await actor.setFlag(MODULE_ID,KEY,state);
  try{const updates={item:[]};appendFeatureSpend(updates,feature);await actor.updateEmbeddedDocuments('Item',updates.item);state.status='active';await actor.setFlag(MODULE_ID,KEY,state);}catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,KEY,state);throw error;}
 });
}
export async function endElementalEmpowerment(game,actor){if(!actor.isOwner)throw Error('Eigentümer erforderlich.');const state=actor.getFlag(MODULE_ID,KEY);if(!state)return;if(['paying','review'].includes(state.status)&&!game.user.isGM)throw Error('GM-Prüfung erforderlich.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Elemental Traces beenden'},content:'<p>Tatsächliches Zugende bzw. vom GM geprüften Aktivierungsvorgang bestätigen? Ohne weiteren Verbrauch schließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,KEY,{...state,status:'ended'});}
export function elementalBoostChoices(activity){
 const list=refinedDamageChoices(activity).map(p=>({value:'damage:'+p.index,label:'+'+(medicalLevel(activity.actor)>=13?2:1)+'d'+p.die+' · '+p.formula,die:p.die,index:p.index})),heal=activity.healing;
 if(heal?.number>0&&heal.denomination>1)list.push({value:'healing',label:'Zusätzliche Heilwürfel · '+heal.formula,die:heal.denomination});
 else if(heal?.custom?.enabled){const matches=[...String(heal.custom.formula).matchAll(/\b\d+d(\d+)\b/gi)];if(matches.length===1&&!/[{}]|d\d+(?:k|r|x|cs|cf)/i.test(heal.custom.formula))list.push({value:'healing',label:'Zusätzliche Heilwürfel · '+heal.custom.formula,die:Number(matches[0][1])});}
 if(Number.isFinite(activity.save?.dc?.value))list.push({value:'save',label:'Rettungswurf-SG +'+(medicalLevel(activity.actor)>=13?2:1)});return list;
}
export function addElementalCastingFields(game,activity,config,result){
 if(!elementalJutsu(activity.item)||!elementalEmpowerment(game,activity.actor))return;
 result.fields.push({name:'n5ese.medicalElementalBoost',value:config.n5ese?.medicalElementalBoost??'',field:new foundry.data.fields.StringField({label:'Elemental Traces · aktive Zugverstärkung'}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options:[{value:'',label:'Ohne Zusatzbonus'},...elementalBoostChoices(activity)]})});result.hasConsumption=true;
}
export function prepareElementalCast(game,activity,config,item){
 const selected=config.n5ese?.medicalElementalBoost;if(!selected)return;
 const state=elementalEmpowerment(game,item.actor),choice=elementalBoostChoices(activity).find(c=>c.value===selected);
 if(!state||!elementalJutsu(item)||!choice)throw Error('Elemental-Traces-Verstärkung nicht mehr verfügbar oder gewählte Formel nicht eindeutig.');
 const record=item.getFlag(MODULE_ID,'medicalCast')??{id:foundry.utils.randomID(),rank:config.jutsu?.rank??item.system.effectiveRank,at:game.time.worldTime,ability:'native'};
 record.elemental={activationId:state.id,mode:selected,index:choice.index,die:choice.die,bonus:medicalLevel(item.actor)>=13?2:1,activityId:activity.id,...(selected==='save'?{baseDC:activity.save.dc.value}:{})};item.updateSource({['flags.'+MODULE_ID+'.medicalCast']:record});applyMedicalSave(item);
}
export function applyMedicalSave(item){
 const boost=item.getFlag?.(MODULE_ID,'medicalCast')?.elemental;if(!globalThis.game||!medicalEnabled(game)||boost?.mode!=='save')return item;
 const activity=item.system.activities.get(boost.activityId);if(activity?.save?.dc&&Number.isFinite(boost.baseDC)){activity.save.dc.value=boost.baseDC+boost.bonus;if(activity.labels)activity.labels.save='SG '+activity.save.dc.value;}return item;
}
export function installElementalRolls(game,types){
 const wrapped=new WeakSet(),results=new WeakSet();for(const {documentClass}of Object.values(types)){const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.getDamageConfig!=='function')continue;wrapped.add(p);const get=p.getDamageConfig;
 p.getDamageConfig=function(...args){const result=get.apply(this,args),record=this.item.getFlag(MODULE_ID,'medicalCast')?.elemental;if(!medicalEnabled(game)||!record||record.activityId!==this.id||results.has(result))return result;results.add(result);if(record.mode==='healing'&&result.rolls?.[0]){result.rolls[0].parts.push(record.bonus+'d'+record.die);result.rolls[0].options={...result.rolls[0].options,n5eseMedicalExtraHealing:{count:record.bonus,faces:record.die}};}else if(record.mode.startsWith('damage:'))result.rolls?.[record.index]?.parts.push(record.bonus+'d'+record.die);return result;};}
}
