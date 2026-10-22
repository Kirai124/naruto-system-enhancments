import {MODULE_ID} from '../settings/register.mjs';
import {ninjutsuEffect,activeNinjutsuEffect,ninjutsuEffectData,upsertNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {currentTurnEndDeadline} from '../casting/molding-lifetimes.mjs';
import {rankNumber} from '../casting/ninjutsu-class-options.mjs';
export async function applyEmberReduction(game,target,sourceActor,sourceItemUuid){return upsertNinjutsuEffect(target,ninjutsuEffectData({name:'Ember: DR −4',id:'ember-dr',setting:'ninjutsuTrackers',sourceActorUuid:sourceActor.uuid,sourceItemUuid,lifetime:{deadline:currentTurnEndDeadline(game.combat)},metadata:{emberReduction:4}}));}
const installed=new WeakSet(),physical=new Set(['bludgeoning','piercing','slashing']);
/** Calculate synchronously with transient DR inputs, then restore them even when another hook throws.
 * Native immunity/resistance, armor, thresholds and other modules keep their normal order. */
export function installEmberReduction(game,ActorClass){const p=ActorClass?.prototype;if(!p?.calculateDamage||installed.has(p))return;installed.add(p);const original=p.calculateDamage;p.calculateDamage=function(damages,options={}){
 let penalty=this.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).id==='ember-dr').reduce((n,e)=>n+ninjutsuEffect(e).metadata.emberReduction,0);
 const msg=options.originatingMessage,primary=msg?.type==='usage'?msg:msg?.getOriginatingMessage?.(),record=game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&primary?.getFlag(MODULE_ID,'classCast');
 if(record?.choices.some(c=>c.name==='Versatile Release'&&c.value==='dr'))penalty+=2*rankNumber(record.rank);
 if(!penalty||options.ignore===true)return original.call(this,damages,options);
 const dm=this.system.traits.dm,previous=dm.amount,mods=Object.fromEntries(Object.entries(previous??{}).map(([k,v])=>[k,game.n5eb.utils.simplifyBonus(v,this.getRollData({deterministic:true}))]));
 const ignored=options.ignore?.modification,all=ignored===true||ignored?.has?.('ALL')?0:Math.max(0,-(mods.ALL??0)),allTaken=Math.min(all,penalty),rest=penalty-allTaken;
 const armor=game.n5eb.seals.getEquippedArmor(this),armorData=armor?.system.armor,armorBefore=armorData?.dr,armorBase=armor&&game.n5eb.seals.isArmorProficient(this,armor)&&!options.ignore?.armorDR?Math.max(0,game.n5eb.seals.getArmorDamageReduction(armor)-2*this.getConditionRank('corroded')):0,armorTaken=Math.min(armorBase,rest);
 const changed={...previous};if(allTaken)changed.ALL=String((mods.ALL??0)+allTaken);
 for(const [type,value] of Object.entries(mods))if(type!=='ALL'&&value<0&&ignored!==true&&!ignored?.has?.(type))changed[type]=String(value+Math.min(-value,Math.max(0,rest-(physical.has(type)?armorTaken:0))));
 try{dm.amount=changed;if(armorTaken)armorData.dr=Number(armorBefore)-armorTaken;return original.call(this,damages,options);}finally{dm.amount=previous;if(armorTaken)armorData.dr=armorBefore;}
 };}
