import {withCastingActorLock} from './mode-adapter.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalFeature,medicalLevel,ninjutsuModifier,medicalEnabled,medicalTurn} from '../casting/medical-context.mjs';
import {ninjutsuEffect,activeNinjutsuEffect,ninjutsuEffectData,upsertNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {hasMedicalTempHP} from './medical-temp-hp.mjs';
import {refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';
const payload=e=>e?ninjutsuEffect(e)?.metadata?.genjutsu:undefined;
const actors=game=>[...new Set([...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(x=>x.actor??x))];
export const alterations=(game,actor)=>actor.effects.filter(e=>activeNinjutsuEffect(game,e)&&payload(e)?.ruleId==='medical.altered-strength');
const ownInstances=(game,source)=>actors(game).flatMap(a=>alterations(game,a).filter(e=>ninjutsuEffect(e).sourceActorUuid===source.uuid));
function select(host,name,choices,label){const l=document.createElement('label'),s=document.createElement('select');s.name=name;l.append(document.createTextNode(label+' '),s);for(const [value,text]of choices){const o=document.createElement('option');o.value=value;o.textContent=text;s.append(o);}host.append(l,document.createElement('br'));}

export function alterationFields(game,source,target,host){
 if(!target)throw Error('Genau ein vorhandenes Ziel erforderlich.');
 const self=source.uuid===target.uuid,capstone=self&&!!medicalFeature(source,'Transmogrified Biology','Transmuter');
 for(const [value,label]of [['damage','Einmal pro Zug Ninjutsu-Modifikator auf Schaden'],['temporary','Je eigenem Zugbeginn 10 temporäre HP mit gewählter Resistenz'],['save','1d4 auf einen untrainierten Rettungswurf'],['skills','1d4 auf untrainierte Skillchecks']]){
  const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.name='alteredBenefit';c.value=value;l.append(c,document.createTextNode(label));host.append(l,document.createElement('br'));
 }
 const p=document.createElement('p');p.textContent=capstone?'Bis zu drei Vorteile kostenlos.':medicalLevel(source)>=5?'Ein Vorteil kostenlos oder zwei Vorteile für einen gewählten Chakra Die.':'Genau ein Vorteil.';host.append(p);
 select(host,'alteredSave',Object.entries(CONFIG.DND5E.abilities).filter(([id])=>!target.system.abilities[id].proficient).map(([id])=>[id,id.toUpperCase()]),'Untrainierter Save');
 select(host,'alteredResistance',Object.keys(CONFIG.DND5E.damageTypes).map(id=>[id,id]),'Resistenz während eigener temporärer HP');
 if(!self&&medicalFeature(source,'Rebuilt Fortitude','Transmuter'))select(host,'alteredUpgrade',[['attack','Einmal pro Zug Ninjutsu-Modifikator auf Angriff'],['dice','Einmal pro Zug zwei Jutsu-Schadenswürfel'],['ac','AC +2']],'Zusätzlicher Rebuilt-Fortitude-Vorteil');
 const previous=ownInstances(game,source).filter(e=>e.parent.uuid!==target.uuid);
 if(previous.length>=2)select(host,'alteredReplace',previous.map(e=>[e.uuid,e.parent.name+' · '+e.name]),'Eine bisherige eigene Instanz ersetzen');
}
export function validateAlteration(game,source,target,choice){
 const self=source.uuid===target.uuid,freeThree=self&&medicalFeature(source,'Transmogrified Biology','Transmuter'),max=freeThree?3:medicalLevel(source)>=5?2:1;
 if(!Array.isArray(choice.benefits)||!choice.benefits.length||choice.benefits.length>max||new Set(choice.benefits).size!==choice.benefits.length||choice.benefits.some(k=>!['damage','temporary','save','skills'].includes(k)))throw Error('Ungültige Altered-Strength-Auswahl.');
 if(!self&&(target.getFlag(MODULE_ID,'medicalRecipientUses')?.alteredStrength??0)>=2)throw Error('Dieses Ziel hat seine zwei Anwendungen bis zur eigenen langen Rast erhalten.');
 if(choice.benefits.includes('save')&&(!target.system.abilities[choice.save]||target.system.abilities[choice.save].proficient))throw Error('Tatsächlich untrainierten Save wählen.');
 if(choice.benefits.includes('temporary')&&!Object.hasOwn(CONFIG.DND5E.damageTypes,choice.resistance))throw Error('Vorhandene Schadensart wählen.');
 if(choice.upgrade&&(!['attack','dice','ac'].includes(choice.upgrade)||self||!medicalFeature(source,'Rebuilt Fortitude','Transmuter')))throw Error('Rebuilt Fortitude nicht verfügbar.');
 const previous=ownInstances(game,source).filter(e=>e.parent.uuid!==target.uuid);
 if(previous.length>=2&&!previous.some(e=>e.uuid===choice.replace))throw Error('Eine bisherige eigene Instanz zum Ersetzen bestätigen.');
 return {needsDie:choice.benefits.length>1&&!freeThree};
}
export async function applyAlteration(game,source,target,entry,feature){
 return withCastingActorLock(source,()=>source===target?applyLocked():withCastingActorLock(target,applyLocked));
 async function applyLocked(){
 validateAlteration(game,source,target,entry.altered);
 const choice=entry.altered,remove=[...alterations(game,target)];
 if(choice.replace){const old=await fromUuid(choice.replace);if(!old||!activeNinjutsuEffect(game,old)||payload(old)?.ruleId!=='medical.altered-strength'||ninjutsuEffect(old).sourceActorUuid!==source.uuid)throw Error('Bestätigte zu ersetzende Instanz verändert.');remove.push(old);}
 if(remove.some(e=>!e.parent.isOwner))throw Error('Vorherige fremde Instanz muss der GM ersetzen.');
 for(const effect of new Set(remove))await effect.delete();
 const rolls=[],changes=[],data={medical:true,ruleId:'medical.altered-strength',conditions:[],rolls};
 if(choice.benefits.includes('damage'))rolls.push({kind:'damage',bonus:ninjutsuModifier(source),oncePerTurn:true});
 if(choice.benefits.includes('skills'))rolls.push({kind:'skill',bonus:'1d4',unproficient:true});
 if(choice.benefits.includes('save'))rolls.push({kind:'save',ability:choice.save,bonus:'1d4',unproficient:true});
 if(choice.benefits.includes('temporary')){data.alteredTemporaryHP=true;changes.push({key:'system.traits.dr.value',type:'add',value:choice.resistance,priority:20});}
 if(choice.upgrade==='attack')rolls.push({kind:'attack',bonus:ninjutsuModifier(source),oncePerTurn:true});
 if(choice.upgrade==='dice')data.medicalRebuiltDice={count:2};
 if(choice.upgrade==='ac')changes.push({key:'system.attributes.ac.bonus',type:'add',value:2,priority:20});
 const effect=await upsertNinjutsuEffect(target,ninjutsuEffectData({name:'Altered Strength',id:entry.id,sourceActorUuid:source.uuid,sourceItemUuid:feature.uuid,lifetime:{expiresAt:entry.at+60},setting:'medicalClassAutomation',metadata:{genjutsu:data},changes}));
 if(source.uuid!==target.uuid){const uses=target.getFlag(MODULE_ID,'medicalRecipientUses')??{};await target.setFlag(MODULE_ID,'medicalRecipientUses',{...uses,alteredStrength:(uses.alteredStrength??0)+1});}
 return {effectId:effect.id,benefits:choice.benefits,upgrade:choice.upgrade};
 }
}

export function installMedicalAlteration(game,EffectClass,types){
 const apply=EffectClass.applyChange;
 EffectClass.applyChange=function(actor,change,options){const effect=change.effect;if(payload(effect)?.alteredTemporaryHP&&change.key==='system.traits.dr.value'&&!hasMedicalTempHP(effect.parent,'altered-strength:'+effect.id))return {};return apply.call(this,actor,change,options);};
 const wrapped=new WeakSet(),busy=new WeakSet(),prepared=new WeakSet();
 for(const {documentClass}of Object.values(types)){
  const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.rollDamage!=='function')continue;wrapped.add(p);const damage=p.rollDamage;
  p.rollDamage=async function(config={},dialog={},message={}){
   if(busy.has(this)||!this.actor||!medicalEnabled(game))return damage.call(this,config,dialog,message);
   const turn=medicalTurn(game),effect=this.isSpell&&alterations(game,this.actor).find(e=>payload(e).medicalRebuiltDice&&payload(e).medicalRebuiltDice.usedTurn!==(turn??'manual'));
   if(!effect)return damage.call(this,config,dialog,message);
   busy.add(this);try{
    const choices=refinedDamageChoices(this);if(!choices.length)return damage.call(this,config,dialog,message);
    const div=document.createElement('div');select(div,'formula',[['','Ohne Rebuilt-Fortitude-Zusatz'],...choices.map(c=>[String(c.index),c.formula+' · +2d'+c.die])],'Einmal pro Zug');
    const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Rebuilt Fortitude · Schadensformel'},content:div.innerHTML,buttons:[{action:'roll',label:'Auswahl bestätigen',callback:(_event,b)=>b.form.elements.formula.value}],rejectClose:false});if(choice===null||choice===undefined)return null;
    const selected=choices.find(c=>String(c.index)===choice);
    const result=await damage.call(this,{...config,...(selected?{n5eseRebuiltDice:{index:selected.index,die:selected.die}}:{})},dialog,message);
    if(result?.length&&selected){const marker=structuredClone(ninjutsuEffect(effect));marker.metadata.genjutsu.medicalRebuiltDice.usedTurn=turn??'manual';await effect.setFlag(MODULE_ID,'ninjutsuEffect',marker);}return result;
   }finally{busy.delete(this);}
  };
  const get=p.getDamageConfig;if(typeof get==='function')p.getDamageConfig=function(config={},...args){const result=get.call(this,config,...args),extra=config.n5eseRebuiltDice;if(extra&&!prepared.has(result)&&result.rolls?.[extra.index]){prepared.add(result);result.rolls[extra.index].parts.push('2d'+extra.die);}return result;};
 }
}
