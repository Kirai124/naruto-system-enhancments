import {taijutsuFeature,isTaijutsu} from '../casting/taijutsu-context.mjs';
function select(result,name,value,label,options){result.fields.push({name:'n5ese.taijutsu.'+name,value,field:new foundry.data.fields.StringField({label}),input:(_f,c)=>foundry.applications.fields.createSelectInput({...c,options})});result.hasConsumption=true;}
export function addPassionFields(activity,config,result){
 const actor=activity.actor,chosen=config.n5ese?.taijutsu??{},type=activity.activation?.type;
 if(taijutsuFeature(actor,'Enhanced Flurry','Passionate Flame')&&activity.type==='attack'&&activity.attack?.type?.value==='melee')result.fields.push({name:'n5ese.taijutsu.enhancedBlows',value:chosen.enhancedBlows??false,field:new foundry.data.fields.BooleanField({label:'Chakra Enhanced Blows · 1 Martial Die; erste zwei bestätigte Treffer dieses Casts: STR-Save gegen Bruised'})});
 if(taijutsuFeature(actor,'Sheer Will','Passionate Flame')&&['action','bonus'].includes(type))select(result,'sheerWill',chosen.sheerWill??'','Sheer Will · eine native Nutzung; Aktionsökonomie manuell',[{value:'',label:'Normale Wirkzeit'},{value:type==='action'?'bonus':'reaction',label:type==='action'?'Als Bonusaktion wirken':'Als Reaktion wirken'}]);
 if(taijutsuFeature(actor,'Indignation','Passionate Flame')&&type==='reaction')result.fields.push({name:'n5ese.taijutsu.indignation',value:chosen.indignation??false,field:new foundry.data.fields.BooleanField({label:'Indignation · tatsächlichen eingehenden Nahkampfangriff bestätigen; 3 Martial Dice, Reaktion nicht verbrauchen'})});
 if(taijutsuFeature(actor,'Passinate Flame Technique','Passionate Flame'))select(result,'passionKeyword',chosen.passionKeyword??'','Passinate Flame · bestätigtes feindliches Ziel, 3 Martial Dice',[{value:'',label:'Kein zusätzliches Keyword'},{value:'combo',label:'Combo für diesen Cast · feindliche Kreatur betroffen'},{value:'finisher',label:'Finisher für diesen Cast · feindliche Kreatur betroffen'}]);
}
/** Applies only to the transient cast clone. It never changes an inventory jutsu. */
export function preparePassion(activity,config){
 const s=config.n5ese?.taijutsu??{},actor=activity.actor,keyword=String(s.passionKeyword??''),sheerWill=String(s.sheerWill??''),indignation=!!s.indignation;
 if(!keyword&&!sheerWill&&!indignation)return null;
 if(!isTaijutsu(activity.item))throw Error('Passionate-Flame-Option benötigt ein tatsächliches Taijutsu.');
 if(keyword&&(!['combo','finisher'].includes(keyword)||!taijutsuFeature(actor,'Passinate Flame Technique','Passionate Flame')))throw Error('Keine passende Passinate Flame Technique.');
 if(sheerWill){const expected=activity.activation?.type==='action'?'bonus':activity.activation?.type==='bonus'?'reaction':null,feature=taijutsuFeature(actor,'Sheer Will','Passionate Flame');if(sheerWill!==expected||!feature||feature.system.uses.value<1)throw Error('Keine passende Sheer-Will-Nutzung.');}
 if(indignation&&(!taijutsuFeature(actor,'Indignation','Passionate Flame')||activity.activation?.type!=='reaction'||sheerWill))throw Error('Indignation benötigt ein ursprünglich als Reaktion wirkbares Taijutsu und einen bestätigten eingehenden Nahkampfangriff.');
 if(config.consume===false)throw Error('Bezahlte Passionate-Flame-Optionen erfordern Verbrauchsabwicklung.');
 if(keyword){activity.item.updateSource({'system.jutsu.keywords':[...new Set([...activity.item.system.jutsu.keywords,keyword])]});activity.item.prepareFinalAttributes?.();}
 return {passionKeyword:keyword,sheerWill,indignation,passionCost:3*Number(!!keyword)+3*Number(indignation),passionUse:sheerWill?'Sheer Will':null};
}
export function effectivePassionActivation(activity,config){
 const chosen=config?.n5ese?.taijutsu?.sheerWill;
 if(chosen==='reaction'&&activity.activation?.type==='bonus'&&taijutsuFeature(activity.actor,'Sheer Will','Passionate Flame'))return 'reaction';
 return activity.activation?.type;
}
