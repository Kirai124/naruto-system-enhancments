import {appendEchoFearSpend} from './genjutsu-echo-fear.mjs';
import {addFearFields,prepareFearCast} from './genjutsu-fear.mjs';
import {prepareSensoryCast} from './genjutsu-sensory-casting.mjs';
import {appendGenjutsuAugmentationSpend,prepareGenjutsuAugmentation} from './genjutsu-cast-augmentations.mjs';
import {addGenjutsuSourceFields,prepareGenjutsuSourceCast} from './genjutsu-source-casting.mjs';
import {powerEffects} from './genjutsu-power.mjs';
import {activeMistyKit,mistyKitCharges} from '../casting/genjutsu-kits.mjs';
import {appendMistyKitSpend} from './genjutsu-kits.mjs';
import {genjutsuRestrictionActive} from './genjutsu-targets.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {actualizationDie,actualizationPool,genjutsuEnabled,isGenjutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {genjutsuDCBonuses,genjutsuMastery,validateGenjutsuCast} from '../casting/genjutsu-rules.mjs';
import {appendActualizationSpend} from '../casting/genjutsu-resources.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';

function perfectionChoices(activity){const choices=refinedDamageChoices(activity).map(p=>({value:'damage:'+p.index,label:p.formula})),heal=activity.healing;if(heal?.formula&&(heal.number>0||/\bd\d+/i.test(heal.custom?.formula??'')))choices.push({value:'healing:0',label:'Heilung / temporäre HP: '+heal.formula});if(activity.roll?.formula&&/\bd\d+|\b\d+d\d+/i.test(activity.roll.formula))choices.push({value:'utility:0',label:'Ursprünglicher Utility-Wurf (nur Schaden, Heilung, DR oder temporäre HP): '+activity.roll.formula});return choices;}
const wrapped=new WeakSet(),augmented=new WeakSet(),damageBusy=new WeakSet(),damageRecords=new WeakMap();
export function applyGenjutsuSave(item){
 const record=item?.getFlag?.(MODULE_ID,'genjutsuCast');if(!record||!globalThis.game||!genjutsuEnabled(game))return item;
 const activity=item.system.activities.get(record.activityId);if(activity?.save?.dc&&Number.isFinite(record.baseDC)){activity.save.dc.value=record.baseDC+record.dcBonuses.reduce((n,b)=>n+b.value,0);if(activity.labels)activity.labels.save='SG '+activity.save.dc.value;}
 return item;
}
export function addGenjutsuCastingFields(activity,config,result){
 if(!isGenjutsu(activity.item)||!actualizationPool(activity.actor))return;
 addGenjutsuSourceFields(game,activity,config,result);addFearFields(game,activity,config,result);
 if(activeMistyKit(activity.actor)&&['d','c','b','a','s'].includes(config.jutsu?.rank??activity.item.system.effectiveRank))result.fields.push({name:'n5ese.genjutsu.physicalImitations',value:!!config.n5ese?.genjutsu?.physicalImitations,field:new foundry.data.fields.BooleanField({label:'Physical Imitations: Inhaled hinzufügen',hint:'D/C: 1; B/A: 2; S: 3 Kit-Charges. Abbau je Charge; eine bestätigte Verwendung wirkt auch bei vorzeitig leerem Kit vollständig.'}),input:result.inputs.createCheckboxInput});
 const selected=config.n5ese?.genjutsu??{},pool=actualizationPool(activity.actor),select=options=>(_f,c)=>foundry.applications.fields.createSelectInput({...c,options});
 result.fields.push({name:'n5ese.genjutsu.damageDice',value:String(selected.damageDice??0),field:new foundry.data.fields.StringField({label:'Actualization: zusätzlicher Psychic-Schaden auf bestätigte feindliche Ziele'}),input:select(Array.from({length:pool.remaining+1},(_,n)=>({value:String(n),label:n?n+' Dice: 3 × Ergebnis Psychic':'Nicht verwenden'})))});
 if(Number.isFinite(activity.save?.dc?.value))result.fields.push({name:'n5ese.genjutsu.saveDice',value:String(selected.saveDice??0),field:new foundry.data.fields.StringField({label:'Actualization: −1 je Die auf bestätigte feindliche Saves'}),input:select(Array.from({length:Math.min(5,pool.remaining)+1},(_,n)=>({value:String(n),label:n?n+' Dice: −'+n+' Save':'Nicht verwenden'})))});
 if(ownedGenjutsuFeature(activity.actor,'Actualized Alteration','Real World Conversions')&&activity.save?.ability?.size)result.fields.push({name:'n5ese.genjutsu.alteration',value:selected.alteration??'',field:new foundry.data.fields.StringField({label:'Actualized Alteration: 1 Die und eigene Nutzung'}),input:select([{value:'',label:'Unverändert'},...['int','wis','cha'].map(value=>({value,label:value.toUpperCase()}))])});
 if(ownedGenjutsuFeature(activity.actor,'Actualized Perfection','Real World Conversions')&&['e','d','c'].includes(config.jutsu?.rank??activity.item.system.effectiveRank))result.fields.push({name:'n5ese.genjutsu.perfection',value:selected.perfection??'',field:new foundry.data.fields.StringField({label:'Actualized Perfection: 1 Die zum gewählten ursprünglichen Wurf'}),input:select([{value:'',label:'Nicht verwenden'},...perfectionChoices(activity)])});
 if(ownedGenjutsuFeature(activity.actor,'Actualized Power','Real World Conversions')&&powerEffects(activity).length)result.fields.push({name:'n5ese.genjutsu.power',value:!!selected.power,field:new foundry.data.fields.BooleanField({label:'Actualized Power: Condition-Verteidigungen dieses Einzelziels ignorieren',hint:'1 Actualization Die; danach die tatsächliche native Condition-Wirkung auf der Chatkarte bestätigen.'}),input:result.inputs.createCheckboxInput});
 if(ownedGenjutsuFeature(activity.actor,'The Prestige')&&activity.save?.ability?.size)result.fields.push({name:'n5ese.genjutsu.prestige',value:!!selected.prestige,field:new foundry.data.fields.BooleanField({label:'The Prestige: eine Kreatur scheitert automatisch kritisch',hint:'Genau ein tatsächlich betroffenes Ziel markieren. Verbraucht eine Feature-Nutzung.'}),input:result.inputs.createCheckboxInput});
 const bonuses=genjutsuDCBonuses(activity);if(bonuses.length)result.notes.push({type:'info',message:bonuses.map(b=>b.label+': SG +'+b.value).join(' · ')});
 result.hasConsumption=true;
}

export function installGenjutsuCasting(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageScaling'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);
  const scale=p._prepareUsageScaling,prepare=p._prepareUsageUpdates,finish=p._finalizeMessageConfig;
  p._prepareUsageScaling=async function(config,message,item){
   await prepareGenjutsuSourceCast(game,this,config,item);
   if(genjutsuEnabled(game)&&isGenjutsu(item)&&actualizationPool(item.actor)){
   if(config.n5ese?.genjutsu?.physicalImitations){if(config.n5ese.genjutsu.wordsDetriment)throw Error('Words Of Detriment entfernt alle anderen Sinneskeywords; nicht zusätzlich Inhaled hinzufügen.');if(!activeMistyKit(item.actor))throw Error('Kein aktives Misty Kit verfügbar.');mistyKitCharges(config.jutsu?.rank??item.system.effectiveRank);item.updateSource({'system.jutsu.keywords':[...new Set([...item.system.jutsu.keywords,'inhaled'])]});item.prepareFinalAttributes?.();}
   }
   const result=await scale.call(this,config,message,item);prepareSensoryCast(game,item,config);prepareGenjutsuAugmentation(game,item.system.activities.get(this.id),config,item);prepareFearCast(game,item,{...config,n5ese:{...config.n5ese,moldingActivityId:this.id}});if(!genjutsuEnabled(game)||!isGenjutsu(item)||!actualizationPool(item.actor))return result;
   const activity=item.system.activities.get(this.id),choice=validateGenjutsuCast(activity,{...config.n5ese?.genjutsu,rank:config.jutsu?.rank??item.system.effectiveRank});
   if(choice.totalDice>actualizationPool(item.actor).remaining)throw Error('Nicht genügend Actualization Dice für alle gewählten Optionen.');
   const dcBonuses=genjutsuDCBonuses(activity),record={id:foundry.utils.randomID(),activityId:this.id,itemId:item.id,createdAt:game.time.worldTime,effectRank:item.system.effectiveRank,rank:config.jutsu?.rank??item.system.effectiveRank,die:actualizationDie(item.actor),choice,dcBonuses,baseDC:activity.save?.dc?.value,mastery:genjutsuMastery(item.actor)};
   if(choice.power){const targets=[...game.user.targets].filter(t=>t.actor);if(targets.length!==1)throw Error('Actualized Power: genau eine tatsächlich betroffene Kreatur markieren.');if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Actualized Power'},content:'<p>Bestätige: Dieses Genjutsu zielt ausschließlich auf die markierte Kreatur und würde ihr eine Condition zufügen, gegen die sie resistent oder immun ist. Einen Actualization Die dafür bezahlen?</p>',rejectClose:false}))throw Error('Actualized Power abgebrochen.');record.powerTarget={uuid:targets[0].actor.uuid,tokenUuid:targets[0].document.uuid,name:targets[0].name};}
   if(choice.prestige){const targets=[...game.user.targets].filter(t=>t.actor);if(targets.length!==1)throw Error('The Prestige: genau eine tatsächlich betroffene Kreatur markieren.');record.prestigeTarget=targets[0].actor.uuid;}
   const patch={['flags.'+MODULE_ID+'.genjutsuCast']:record};
   if(choice.alteration)patch['system.activities.'+this.id+'.save.ability']=[choice.alteration];
   const flow=ownedGenjutsuFeature(item.actor,'Genjutsu Flow','Master of Illusion Features');if(flow){const range=foundry.utils.deepClone(activity.range);if(range.units==='touch')Object.assign(range,{units:'ft',value:30,override:true});else if(Number.isFinite(Number(range.value))&&Number(range.value)>0)Object.assign(range,{value:Number(range.value)*2,override:true});patch['system.activities.'+this.id+'.range']=range;}
   if(choice.perfection){if(!perfectionChoices(activity).some(p=>p.value===choice.perfection))throw Error('Actualized Perfection: Originalformel nicht auslesbar.');if(choice.perfection==='utility:0'&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Actualized Perfection · Utility'},content:'<p>Dieser ursprüngliche Jutsu-Wurf ermittelt tatsächlich Schaden, Heilung, Damage Reduction oder temporäre HP? Nur für diese belegten Wirkungen einen Actualization Die addieren.</p>',rejectClose:false}))throw Error('Perfection-Kontext nicht bestätigt.');}
   if(choice.saveDice){const targets=[...game.user.targets].filter(t=>t.actor);if(!targets.length)throw Error('Tatsächlich betroffene feindliche Ziele als Tokens markieren.');const content=document.createElement('p');content.textContent='Diese tatsächlich vom Genjutsu betroffenen feindlichen Ziele für den Save-Malus bestätigen: '+targets.map(t=>t.name).join(', ');if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Actualization – Save-Ziele'},content:content.outerHTML,rejectClose:false}))throw Error('Actualization abgebrochen.');record.targets=[...new Set(targets.map(t=>t.actor.uuid))];}
   if(choice.damageDice){const targets=[...game.user.targets].filter(t=>t.actor);if(!targets.length)throw Error('Tatsächlich betroffene feindliche Schadensziele markieren.');const hint=document.createElement('p');hint.textContent='Actualization-Schaden auf tatsächlich betroffene feindliche Ziele bestätigen: '+targets.map(t=>t.name).join(', ');if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Actualization – Schadensziele'},content:hint.outerHTML,rejectClose:false}))throw Error('Actualization abgebrochen.');record.damageTargets=[...new Set(targets.map(t=>t.actor.uuid))];}
   item.updateSource(patch);item.prepareFinalAttributes?.();applyGenjutsuSave(item);return result;
  };
  p._prepareUsageUpdates=async function(config,options){
   if(genjutsuEnabled(game)&&this.isSpell&&this.item.system.jutsu?.components?.has?.('cm')){const ranks=CONFIG.DND5E.jutsuRankOrder,rank=config.jutsu?.rank??this.item.system.effectiveRank;for(const effect of this.actor.effects)if(genjutsuRestrictionActive(game,effect)&&ranks.indexOf(rank)<ranks.indexOf(effect.getFlag(MODULE_ID,'ninjutsuEffect').metadata.genjutsuMoldingRank))throw Error('Chakra Disruption sperrt CM-Jutsu dieses niedrigeren Rangs.');}
   const result=await prepare.call(this,config,options);if(!result||Array.isArray(result)||!genjutsuEnabled(game)||!isGenjutsu(this.item))return result;
   const record=this.item.getFlag(MODULE_ID,'genjutsuCast');if(!record)return result;
   const choice=validateGenjutsuCast(this,{...config.n5ese?.genjutsu,rank:config.jutsu?.rank??this.item.system.effectiveRank});
   if(JSON.stringify(choice)!==JSON.stringify(record.choice))throw Error('Genjutsu-Auswahl nach Skalierung verändert.');
   if(choice.prestige){if(config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('The Prestige verlangt einen bestätigten normalen Cast.');appendFeatureSpend(result,ownedGenjutsuFeature(this.actor,'The Prestige'));}
   if(choice.totalDice){if(config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Actualization verlangt einen bestätigten normalen Cast.');appendActualizationSpend(this.actor,choice.totalDice,result);}
   await appendMistyKitSpend(game,this,config,result);
   if(choice.alteration)appendFeatureSpend(result,ownedGenjutsuFeature(this.actor,'Actualized Alteration','Real World Conversions'));
   appendGenjutsuAugmentationSpend(game,this,config,result);
   await appendEchoFearSpend(game,this,result);
   return result;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finish.call(this,config,message,updates);if(genjutsuEnabled(game)&&this.item.getFlag(MODULE_ID,'genjutsuCast')){message.data.flags??={};message.data.flags[MODULE_ID]??={};Object.assign(message.data.flags[MODULE_ID],{genjutsuCast:this.item.getFlag(MODULE_ID,'genjutsuCast'),castingSnapshot:this.item.toObject()});}return result;};
 }
 for(const {documentClass} of Object.values(types)){
  const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.getDamageConfig!=='function')continue;wrapped.add(p);const damage=p.getDamageConfig,rollDamage=p.rollDamage;
  p.getDamageConfig=function(...args){const result=damage.apply(this,args),record=this.item.getFlag(MODULE_ID,'genjutsuCast');if(!genjutsuEnabled(game)||!record||augmented.has(result))return result;const primary=damageRecords.get(this);if(record.choice.perfection&&record.choice.perfection!=='utility:0'&&!primary?.getFlag(MODULE_ID,'genjutsuPerfectionUsed'))result.rolls?.[Number(record.choice.perfection.split(':')[1])]?.parts.push('1d'+record.die);augmented.add(result);return result;};
  if(typeof rollDamage==='function')p.rollDamage=async function(...args){const record=this.item.getFlag(MODULE_ID,'genjutsuCast'),primary=genjutsuEnabled(game)&&record&&game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,'genjutsuCast')?.id===record.id);if(primary&&damageBusy.has(primary))throw Error('Schadenswurf dieses Genjutsu ist bereits offen.');if(primary){damageBusy.add(primary);damageRecords.set(this,primary);}try{const result=await rollDamage.apply(this,args);if(result?.length&&primary&&record.choice.perfection)await primary.setFlag(MODULE_ID,'genjutsuPerfectionUsed',true);return result;}finally{if(primary){damageBusy.delete(primary);damageRecords.delete(this);}}};
 }
}
