import {stancerCostProtection} from './taijutsu-stancer.mjs';
import {pendingCastingSurcharge} from '../casting/pending-costs.mjs';
import {grantTrackedTemp} from './ninjutsu-temp-hp.mjs';
import {ninjutsuLevel} from '../casting/ninjutsu-resources.mjs';
import {ninjutsuEffectData} from '../effects/ninjutsu-effects.mjs';
import {currentTurnEndDeadline} from '../casting/molding-lifetimes.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {selectedPools,spendPools,professorAfterSpend,professorGrant} from '../casting/ninjutsu-pools.mjs';
import {applyAugmentedSave} from './casting-augmentation.mjs';
import {mergeCastingMode} from './mode-adapter.mjs';
import {modeUpkeep} from '../casting/casting-modes.mjs';
import {nativeMaintainCost} from './maintain-adapter.mjs';
import {readVoidSurcharges,reservePoolRequests} from '../trackers/pool-targets.mjs';
const wrapped=new WeakSet(),pendingSurcharges=new WeakMap(),pendingProfessor=new WeakMap();
const professorPath=`flags.${MODULE_ID}.professorChakra`,tempPath='system.attributes.chakra.temp';
const get=(data,path)=>data[path]??foundry.utils.getProperty(data,path);
async function confirmPoolTargets(game,plans){
 const result={};
 for(const plan of plans.filter(p=>['next-cost','zap','rain-chill','gem-construct','ink-help','ink-dodge'].includes(p.mode))){
  const tokens=[...(game.user.targets??[])].filter(t=>t.actor),seen=new Set();
  const references=tokens.map(t=>({actorUuid:t.actor.uuid,tokenUuid:t.document?.uuid??t.uuid,name:t.name??t.actor.name})).filter(t=>{if(seen.has(t.actorUuid))return false;seen.add(t.actorUuid);return true;});
  if(!references.length)throw Error('Bitte tatsächlich betroffene Kreaturen als Ziele markieren.');
  const form=document.createElement('div'),hint=document.createElement('p');
  hint.textContent=plan.mode==='next-cost'?'Genau eine tatsächlich betroffene Kreatur wählen. Der Zuschlag bleibt bis zu ihrem nächsten Jutsu oder einer GM-Korrektur gespeichert.':'Bestätige ausdrücklich alle betroffenen Kreaturen, die Lightning-Schaden erhalten sollen. Der GM wendet den Schaden später an.';form.append(hint);
  references.forEach((ref,index)=>{const label=document.createElement('label'),input=document.createElement('input');input.type=['next-cost','gem-construct'].includes(plan.mode)?'radio':'checkbox';input.name='target';input.value=String(index);label.append(input,document.createTextNode(ref.name));form.append(label,document.createElement('br'));});
  const selected=await foundry.applications.api.DialogV2.wait({window:{title:'Shard-/Mote-Ziele bestätigen'},content:form.innerHTML,buttons:[{action:'confirm',label:'Ziele bestätigen',callback:(_e,b)=>[...b.form.querySelectorAll('input[name="target"]:checked')].map(e=>references[Number(e.value)])},{action:'cancel',label:'Abbrechen',callback:()=>null}],rejectClose:false});
  if(!selected)return null;
  if(!selected.length)throw Error('Keine betroffene Kreatur bestätigt.');
  result[plan.kind]=selected;
 }
 return result;
}
export function installPoolCasting(game,types) {
 for(const {documentClass} of Object.values(types)){
  let prototype=documentClass?.prototype;while(prototype&&!Object.hasOwn(prototype,'_prepareUsageScaling'))prototype=Object.getPrototypeOf(prototype);
  if(!prototype||wrapped.has(prototype))continue;wrapped.add(prototype);
  const scale=prototype._prepareUsageScaling,updates=prototype._prepareUsageUpdates;
  prototype._prepareUsageScaling=async function(config,message,item){
   const result=await scale.call(this,config,message,item);
   if(!game.settings.get(MODULE_ID,'ninjutsuTrackers')||!this.isSpell)return result;
   const activity=item.system.activities.get(this.id),plans=selectedPools(activity,config.n5ese?.pools,game.time.worldTime);
   if(plans.some(p=>p.kind==='traditional-inertia')){
    const sourceTypes=[...new Set([...this.actor.items].filter(i=>i.type==='spell'&&i.system.jutsu.keywords.has('hijutsu')).flatMap(i=>[...i.system.activities].flatMap(a=>[...(a.damage?.parts??[])].flatMap(p=>[...(p.types??[])]))))];
    const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Traditional Inertia – Schadensart'},content:'<select name="type">'+sourceTypes.map(t=>'<option>'+t+'</option>').join('')+'</select>',buttons:[{action:'choose',label:'Schadensart bestätigen',callback:(_e,b)=>b.form.elements.type.value}],rejectClose:false});if(!choice||!sourceTypes.includes(choice))throw Error('Inertia-Schadensart nicht bestätigt.');
    item.updateSource({['flags.'+MODULE_ID+'.inertiaDamageType']:choice});
    const component=plans.find(p=>p.mode==='inertia-components');if(component){const options=[...item.system.jutsu.components];const selected=await foundry.applications.api.DialogV2.wait({window:{title:'Komponenten ignorieren'},content:options.map((k,i)=>'<label><input type="checkbox" name="component" value="'+i+'">'+k+'</label>').join(''),buttons:[{action:'choose',label:'Bestätigen',callback:(_e,b)=>[...b.form.querySelectorAll('input:checked')].map(i=>options[Number(i.value)])}],rejectClose:false});if(!selected||selected.length>Math.floor(component.count/2))throw Error('Ungültige Komponentenauswahl.');item.updateSource({'system.jutsu.components':options.filter(k=>!selected.includes(k))});}
   }
   if(plans.length){
    const data={...item.getFlag(MODULE_ID,'castingAugmentation'),activityId:this.id,pools:plans};
    if(plans.some(p=>p.mode==='save'))data.baseDC??=activity.save.dc.value;
    item.updateSource({[`flags.${MODULE_ID}.castingAugmentation`]:data});item.prepareFinalAttributes?.();applyAugmentedSave(item);
   }
   return result;
  };
  prototype._prepareUsageUpdates=async function(config,options){
   if(!game.settings.get(MODULE_ID,'ninjutsuTrackers')||!this.isSpell)return updates.call(this,config,options);
   let plans,targets,surcharges;
   try{
    plans=selectedPools(this,config.n5ese?.pools,game.time.worldTime);
    surcharges=game.settings.get(MODULE_ID,'dynamicChakraCosts')&&(!config.cause)&&(config.consume===true||config.consume?.chakra===true)?readVoidSurcharges(this.actor):[];
    if(surcharges.length&&config.n5eb?.shockedCostMultiplier&&!stancerCostProtection(game,this.item,config.n5ese?.taijutsu)){
     const surcharge=surcharges.reduce((n,e)=>n+e.amount,0)+pendingCastingSurcharge(game,this.actor,config.jutsu?.rank??this.item.system.effectiveRank),cost=config.chakra?.cost??this.item.system.getChakraCost({rank:config.jutsu?.rank});
     if(this.actor.getChakraAvailable()<(cost-surcharge)*config.n5eb.shockedCostMultiplier+surcharge)throw Error('Nicht genügend Chakra einschließlich Shocked und Void-Zuschlag.');
    }
    if(plans.length&&(config.cause||!(config.consume===true||config.consume?.chakra===true)))throw Error('Shard-/Mote-Verbrauch benötigt einen bestätigten Cast mit Chakra-Verbrauch.');
    if(plans.some(p=>['cost','maintain'].includes(p.mode))&&!game.settings.get(MODULE_ID,'dynamicChakraCosts'))throw Error('Kostenmodifikatoren benötigen dynamische Chakra-Kosten.');
    const combat=game.combat,turn=combat?.started&&[...combat.combatants].some(c=>c.actor?.uuid===this.actor.uuid)?`${combat.id}:${combat.round}:${combat.turn}`:'';
    if(turn&&plans.some(p=>['lightning-motes','elemental-motes'].includes(p.kind)&&this.actor.flags?.[MODULE_ID]?.ninjutsuTracker?.limits?.[p.kind]?.gainTurn===turn)){
     if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Mote-Zugregel'},content:'<p>Im aktuellen Zug wurden bereits Motes erzeugt. Erzeugen und Ausgeben im selben Zug widerspricht der Basisregel. Nur eine mit dem GM geklärte Ausnahme bestätigen.</p>',rejectClose:false}))return false;
    }
    targets=await confirmPoolTargets(game,plans);if(!targets)return false;
   }catch(e){ui.notifications.warn(e.message);return false;}
   const result=await updates.call(this,config,options);if(!result||Array.isArray(result)||(!plans.length&&!surcharges.length))return result;
   try{
    const combat=game.combat,turn=combat?.started&&[...combat.combatants].some(c=>c.actor?.uuid===this.actor.uuid)?`${combat.id}:${combat.round}:${combat.turn}`:'';
    spendPools(this.actor,plans,game.time.worldTime,result,turn);
    if(plans.some(p=>['next-cost','zap','rain-chill','gem-construct','ink-help','ink-dodge'].includes(p.mode)))reservePoolRequests(this.actor,plans,targets,game.time.worldTime,result,()=>foundry.utils.randomID(),game.user.id);
    if(surcharges.length){
     if(JSON.stringify(readVoidSurcharges(this.actor))!==JSON.stringify(surcharges))throw Error('Void-Zuschläge wurden während des Casts verändert; bitte erneut wirken.');
     const surchargePath=`flags.${MODULE_ID}.voidSurcharges`;
     if(get(result.actor,surchargePath)!==undefined)throw Error('Konkurrierende Void-Zuschlagsänderung.');
     result.actor[surchargePath]=[];
     const api=game.modules.get(MODULE_ID).api,rank=config.jutsu?.rank??this.item.system.effectiveRank;
     const cost=api.previewJutsuCost(this.item,{rank,classFeatures:config.n5ese?.classFeatures,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,pools:config.n5ese?.pools,martialTechnique:config.n5ese?.martialTechnique}).finalCost*(config.n5eb?.shockedCostMultiplier??1);
     const mode=mergeCastingMode(this,{upkeepChakraCost:cost});
     config.chakra.maintain=modeUpkeep(nativeMaintainCost(this.item.system,{rank,cost}),api.previewMaintainCost(this.item,{rank,cost}).finalCost,mode);
     if(config.n5eb?.shockedCostMultiplier){
      const amount=stancerCostProtection(game,this.item,config.n5ese?.taijutsu)?0:surcharges.reduce((n,e)=>n+e.amount,0);
      pendingSurcharges.set(config,amount);config.chakra.cost-=amount;
     }
    }
    const lightning=plans.find(p=>['maintain','inertia-maintain'].includes(p.mode));
    if(lightning){
     const rank=config.jutsu?.rank??this.item.system.effectiveRank,cost=config.chakra?.cost??this.item.system.getChakraCost({rank}),mode=mergeCastingMode(this,{lightningReduction:lightning.mode==='maintain'?Math.floor(lightning.count/2):0,inertiaReduction:lightning.mode==='inertia-maintain'?Math.floor(lightning.count/2):0});
     config.chakra??={};config.chakra.maintain=modeUpkeep(nativeMaintainCost(this.item.system,{rank,cost:mode.upkeepChakraCost??cost}),config.chakra.maintain??this.item.system.getMaintainCost({rank,cost}),mode);
    }
    for(const p of plans.filter(p=>p.mode==='gem-temp'))grantTrackedTemp(this.actor,'gems',p.count*4,result.actor);
    const rain=plans.find(p=>p.mode==='rain-dr');
    if(rain){config.n5ese??={};config.n5ese.pendingRain={count:rain.count,deadline:currentTurnEndDeadline(game.combat)};}
    for(const p of plans.filter(p=>p.mode==='temp')){
     const before=this.actor.system.attributes.chakra.temp??0,after=get(result.actor,tempPath)??before;
     const previous=this.actor.getFlag(MODULE_ID,'professorChakra')??0,grant=professorGrant(previous,before,after,p.count);
     result.actor[tempPath]=grant.temporary;result.actor[professorPath]=grant.professor;
     pendingProfessor.set(config,{previous,before,count:p.count,added:grant.added});
    }
    return result;
   }catch(e){ui.notifications.warn(e.message);return false;}
  };
 }
 Hooks.on('dnd5e.postUseActivity',async(activity,config,result)=>{
  const rain=config?.n5ese?.pendingRain;if(!rain||!result||!game.settings.get(MODULE_ID,'ninjutsuTrackers'))return;
  const message=result.message;if(!message||message.getFlag(MODULE_ID,'poolRainState'))return;await message.setFlag(MODULE_ID,'poolRainState','applying');try{
  const existing=activity.actor.effects.filter(e=>e.getFlag(MODULE_ID,'ninjutsuEffect')?.id==='rain-dr'&&e.getFlag(MODULE_ID,'ninjutsuEffect')?.sourceActorUuid===activity.actor.uuid);
  if(existing.length)await activity.actor.deleteEmbeddedDocuments('ActiveEffect',existing.map(e=>e.id));
  await activity.actor.createEmbeddedDocuments('ActiveEffect',[ninjutsuEffectData({name:'Rain Blades: DR +'+rain.count*4,id:'rain-dr',sourceActorUuid:activity.actor.uuid,sourceItemUuid:activity.item.uuid,setting:'ninjutsuTrackers',lifetime:{deadline:rain.deadline},metadata:{reduction:rain.count*4,except:['earth','psychic']}})]);
  await message.setFlag(MODULE_ID,'poolRainState','applied');}catch(error){await message.setFlag(MODULE_ID,'poolRainState','review');ui.notifications.error('Rain-Blade-Wirkung zur GM-Prüfung: '+error.message);}
 });
 // Native Shocked doubles the normal amount; restore the surcharge after that hook.
 // Its resource payment was already included in the native preparation batch.
 Hooks.on('dnd5e.activityConsumption',(_activity,config,message,updates)=>{
  const amount=pendingSurcharges.get(config);
  if(amount){pendingSurcharges.delete(config);config.chakra.cost+=amount;
   foundry.utils.setProperty(message,'data.system.chakraCost',config.chakra.cost);
   foundry.utils.setProperty(message,'data.system.maintainCost',config.chakra.maintain);
  }
  const pending=pendingProfessor.get(config);
  if(pending){
   pendingProfessor.delete(config);
   const afterPayment=Math.max(0,get(updates.actor,tempPath)-pending.added),grant=professorGrant(pending.previous,pending.before,afterPayment,pending.count);
   updates.actor[tempPath]=grant.temporary;updates.actor[professorPath]=grant.professor;
  }
 });
 Hooks.on('preUpdateActor',(actor,data)=>{
  if(!game.settings.get(MODULE_ID,'ninjutsuTrackers'))return;
  const temp=get(data,tempPath),previous=actor.getFlag(MODULE_ID,'professorChakra');
  if(previous===undefined||temp===undefined||get(data,professorPath)!==undefined)return;
  if(Number.isInteger(temp)&&temp>=0)data[professorPath]=professorAfterSpend(previous,actor.system.attributes.chakra.temp??0,temp);
 });
}
