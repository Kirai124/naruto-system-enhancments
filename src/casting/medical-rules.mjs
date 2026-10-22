import {medicalFeature,medicalLevel,medicalModifier,ninjutsuModifier,isMedical,medicalRankValue,scalpelState} from './medical-context.mjs';

// User-confirmed: the visible installed class table overrides conflicting scale data.
const at=(level,table)=>table.filter(([n])=>level>=n).at(-1)?.[1]??0;
export const channeledHealing=level=>at(level,[[2,2],[5,4],[9,5],[10,6],[11,8],[16,12]]);
export const scalpelCharges=level=>at(level,[[3,3],[4,4],[7,5],[11,6],[13,7],[16,8],[19,9]]);
export const scalpelDice=level=>at(level,[[3,1],[6,2],[11,3],[16,4],[19,5]]);
export const preserveLifeUses=level=>at(level,[[5,2],[9,3],[13,4],[17,5]]);
export const rejuvenatingDice=level=>1+[7,11,17].filter(n=>level>=n).length;
export function medicalResourceMaximum(actor,name){
 const level=medicalLevel(actor),prof=actor.system.attributes.prof;
 if(!level)return null;
 switch(name){
  case 'Chakra Scalpel':return scalpelCharges(level);
  case 'Preserve/Take Life':return preserveLifeUses(level);
  case 'Channeled Healing':case "Shaman's Hex":return prof;
  case 'Natural Healing':return level;
  case 'Competent Combatant':return 2+[5,9,13,17].filter(n=>level>=n).length;
  case 'Healing Ascension':return Math.max(0,ninjutsuModifier(actor));
  case 'Preserve Life: Mending Presence':return Math.floor(prof/2);
  case 'Psyche Healer':return level>=17?2:1;
  case 'Biological Knowledge':return Math.max(0,actor.system.abilities.int.mod);
  default:return null;
 }
}
export function healingBonuses(game,actor,item){
 const result=[];
 if(!isMedical(item))return result;
 if(scalpelState(game,actor))result.push({name:'Chakra Scalpel',value:medicalModifier(actor)});
 if(medicalFeature(actor,'Breath Of Life','Adept Medic'))result.push({name:'Breath Of Life',value:ninjutsuModifier(actor)});
 return result;
}
export function healingDieLimits(actor,item,rank){
 return {reroll:medicalFeature(actor,'Gifted Healer')&&['e','d','c'].includes(rank)?medicalLevel(actor)>=14?4:2:0,
 maximize:medicalFeature(actor,'Supreme Healer')&&isMedical(item)&&['e','d','c','b'].includes(rank)&&rank===item.system.rank?4:0};
}
export function healingDice(message){
 return (message.rolls??[]).flatMap((roll,r)=>{const dice=roll.dice.flatMap((die,d)=>die.results.flatMap((result,i)=>result.active===false||result.discarded?[]:[{id:r+':'+d+':'+i,faces:die.faces,value:result.result}]));const extra=roll.options?.n5eseMedicalExtraHealing;let remaining=extra?.count??0;for(let i=dice.length-1;i>=0&&remaining>0;i--)if(dice[i].faces===extra.faces){dice.splice(i,1);remaining--;}return dice;});
}
export function preserveAllocation(actor,targets,amounts,{stoneWill=false}={}){
 const budget=5*medicalLevel(actor);let total=0;
 const result=targets.map((target,i)=>{
  const amount=Number(amounts[i]),hp=target.system.attributes.hp,type=target.system.details?.type?.value;
  if(!Number.isSafeInteger(amount)||amount<0)throw Error('Ganze nichtnegative Heilbeträge erforderlich.');
  if(type==='undead'||type==='construct'&&!stoneWill)throw Error('Preserve Life kann dieses Kreaturenprofil nicht heilen.');
  const cap=Math.max(0,Math.floor(hp.effectiveMax/2)-hp.value);
  if(amount>cap)throw Error(target.name+': maximal '+cap+' HP bis zur halben HP-Grenze.');
  total+=amount;return {amount,resetDeathSaves:true};
 });
 if(total>budget)throw Error('Preserve-Life-Budget überschritten: '+total+'/'+budget+'.');
 if(!total&&!targets.some(t=>t.system.attributes.death?.failure>0))throw Error('Kein Ziel benötigt die gewählte Heilung oder entfernbare fehlgeschlagene Todessaves.');
 return result;
}
export function medicalTakeLifeAmount(actor){return 5+2*medicalLevel(actor);}
export function medicalSelfHealing(actor,rank){return medicalFeature(actor,'Talented Healer','Adept Medic')&&medicalRankValue(rank)>0?4+medicalRankValue(rank):0;}
