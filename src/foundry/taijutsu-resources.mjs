import {ultraInstinct,prepareUltraTurn} from './taijutsu-ultra-instinct.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {MARTIAL} from '../casting/casting-modes.mjs';
import {taijutsuEnabled,taijutsuFeature,taijutsuLevel,martialPoolMaximum} from '../casting/taijutsu-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {prepareManualNatureTurn} from './taijutsu-nin-tai.mjs';
export function installTaijutsuResources(game,FeatModel){
 const original=FeatModel.prototype.prepareFinalData,previous=new WeakMap();
 FeatModel.prototype.prepareFinalData=function(...args){const before=previous.get(this);if(before?.uses===this.uses&&this.uses.max===before.applied)this.uses.max=before.base;previous.delete(this);const result=original.apply(this,args),item=this.parent;if(taijutsuEnabled(game)&&taijutsuFeature(item.actor,'Instinctual Defiance','Ultimate Battle')?.id===item.id&&this._source.uses.max==='1'&&taijutsuLevel(item.actor)>=14&&item.overrides?.['system.uses.max']===undefined&&item.overrides?.system?.uses?.max===undefined){previous.set(this,{uses:this.uses,base:this.uses.max,applied:2});this.uses.max=2;this.uses.value=Math.max(0,2-this.uses.spent);}if(!taijutsuEnabled(game)||sourceOf(item)!==MARTIAL||!taijutsuFeature(item.actor,'Martial Adept'))return result;
  // Respect explicit GM/custom effect maxima; only correct the shipped class formula.
  if(this._source.uses.max!=='@scale.tai-spec.martial-die-uses'||item.overrides?.['system.uses.max']!==undefined||item.overrides?.system?.uses?.max!==undefined)return result;
  const applied=martialPoolMaximum(item.actor)+Number(!!ultraInstinct(game,item.actor,'offensive'));previous.set(this,{uses:this.uses,base:this.uses.max,applied});this.uses.max=applied;this.uses.value=Math.max(0,applied-this.uses.spent);return result;
 };
}
export async function renewMartialPool(game,actor){
 if(!taijutsuEnabled(game)||!actor?.isOwner||!taijutsuFeature(actor,'Martial Adept'))throw Error('Eigener Taijutsu Specialist mit Martial Adept erforderlich.');if(game.combat?.started)throw Error('Im Kampf erfolgt die Erneuerung am tatsächlichen eigenen Zugbeginn.');
 return withCastingActorLock(actor,async()=>{
  const previous=actor.getFlag(MODULE_ID,'taijutsuManualTurn');if(['applying','review'].includes(previous?.status))throw Error('Unterbrochenen manuellen Zugbeginn zuerst vom GM prüfen.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Martial Dice · neuer eigener Zug'},content:'<p>Tatsächlich neuer eigener Zug begonnen? Nicht verbrauchte Martial Dice verfallen; der vorhandene Pool wird vollständig erneuert. Aktive Elemental Armor bezahlt anschließend ihren Unterhalt, Earth gewährt die zugehörigen normalen temporären HP. Dies gewährt keine zusätzlichen Aktionen.</p>',rejectClose:false}))return;
  const feature=taijutsuFeature(actor,'Martial Adept'),turn='manual:'+foundry.utils.randomID(),results={actor:{},delete:[],item:[{_id:feature.id,'system.uses.spent':0,['flags.'+MODULE_ID+'.martialRecoveryTurn']:turn}]};prepareManualNatureTurn(game,actor,turn,results);prepareUltraTurn(game,actor,results);
  await actor.setFlag(MODULE_ID,'taijutsuManualTurn',{turn,status:'applying'});
  try{await actor.updateEmbeddedDocuments('Item',results.item);await actor.update({...results.actor,['flags.'+MODULE_ID+'.taijutsuManualTurn']:{turn,status:'applied'}});}catch(error){await actor.setFlag(MODULE_ID,'taijutsuManualTurn',{turn,status:'review',error:error.message});throw error;}
 });
}
export async function reviewManualMartialTurn(game,actor){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{const previous=actor.getFlag(MODULE_ID,'taijutsuManualTurn');if(!['applying','review'].includes(previous?.status))return;if(await foundry.applications.api.DialogV2.confirm({window:{title:'Unterbrochenen Zugbeginn prüfen'},content:'<p>Martial-Pool, Armor-Unterhalt, Formzustand und Earth-THP tatsächlich geprüft und gegebenenfalls manuell korrigiert? Ohne Wiederholung oder automatische Rückzahlung schließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'taijutsuManualTurn',{...previous,status:'resolved'});});
}
