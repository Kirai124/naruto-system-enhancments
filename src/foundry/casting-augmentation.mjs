import {applyMysticFinisherSave} from './taijutsu-dragon-soul.mjs';
import {applyTaijutsuSave} from './taijutsu-casting.mjs';
import {applyGenjutsuSave} from './genjutsu-casting.mjs';
import {applyMedicalSave} from './medical-elemental.mjs';
import {activeNinjutsuEffect,ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {addLinkedDamage} from './ninjutsu-class-rolls.mjs';
import {applyBreathDamage} from './ninjutsu-breath.mjs';
import {applyConditionalClassDamage} from './ninjutsu-conditional-damage.mjs';
import {classCast,applyClassDamage} from './ninjutsu-class-casting.mjs';
import {isMasterJutsu} from '../casting/ninjutsu-selections.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {refinedDamageChoices,refinedCastingChoice} from '../casting/refined-ninjutsu.mjs';
import {maximizeMoldingFormula,moldingTurnActive,currentMoldingRecord} from '../casting/molding-damage.mjs';
import {applySubclassDamage} from '../casting/subclass-molding-damage.mjs';
const wrapped=new WeakSet(),cached=new WeakMap(),augmentedRolls=new WeakSet(),damageBusy=new WeakSet(),damagePrimary=new WeakMap();
const enabled=game=>game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||game.settings.get(MODULE_ID,'ninjutsuTrackers')||game.settings.get(MODULE_ID,'efficientMoldingAutomation');
function augmentation(item){return item?.getFlag(MODULE_ID,'castingAugmentation');}
export function applyAugmentedSave(item) {
  const data=augmentation(item),activity=item?.system.activities.get(data?.activityId);
  if(activity?.save?.dc&&Number.isFinite(data?.baseDC)){
    activity.save.dc.value=data.baseDC+(data.mode==='save'?data.bonus:0)+(data.pools??[]).filter(p=>p.mode==='save').reduce((sum,p)=>sum+Math.floor(p.count/2),0);
    if(activity.labels)activity.labels.save=`SG ${activity.save.dc.value}`;
  }
  return item;
}
/** Modify only native casting clones; snapshots keep later chat rolls reproducible. */
export function installCastingAugmentation(game,types,ChatClass) {
  for(const {documentClass} of Object.values(types)) {
    let prototype=documentClass?.prototype;
    while(prototype&&!Object.hasOwn(prototype,'_prepareUsageScaling'))prototype=Object.getPrototypeOf(prototype);
    if(!prototype||wrapped.has(prototype))continue;
    wrapped.add(prototype);
    const scale=prototype._prepareUsageScaling,finish=prototype._finalizeMessageConfig,rollDamage=prototype.rollDamage;
    if(typeof rollDamage==='function')prototype.rollDamage=async function(config={},dialog={},message={}){
      const record=classCast(this.item),primary=record&&game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,'classCast')?.id===record.id);
      if(primary&&damageBusy.has(primary))throw Error('Ein Schadenswurf dieses Casts ist noch offen.');
      if(primary){damageBusy.add(primary);damagePrimary.set(this,primary);}
      try{
      const ink=this.actor?.isOwner&&this.actor.effects.find(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata.inkCommandDice);
      let inkChoice;if(ink){const choices=refinedDamageChoices(this);if(!choices.length)throw Error('Ink-Zusatzwürfel: Original-Schadenswürfel nicht auslesbar.');const index=await foundry.applications.api.DialogV2.wait({window:{title:'Ink Sketches – befohlener Schaden'},content:'<p>Tatsächlich befohlener Ink-Summon-Schaden; Zusatzwürfel für genau diesen Wurf bestätigen.</p><select name="part">'+choices.map(p=>'<option value="'+p.index+'">'+p.formula+'</option>').join('')+'</select>',buttons:[{action:'apply',label:'Zusatzwürfel verwenden',callback:(_e,b)=>Number(b.form.elements.part.value)},{action:'skip',label:'Ohne Zusatzwürfel',callback:()=>null}],rejectClose:false});if(index!==null&&index!==undefined){inkChoice=choices.find(p=>p.index===index);config={...config,n5eseInkDice:{index,die:inkChoice.die,count:ninjutsuEffect(ink).metadata.inkCommandDice}};}}
      if((enabled(game)||game.settings.get(MODULE_ID,'genjutsuClassAutomation'))&&(augmentation(this.item)||this.item.getFlag(MODULE_ID,'moldingCast')||this.item.getFlag(MODULE_ID,'genjutsuCast')||this.item.getFlag(MODULE_ID,'genjutsuMirageCast')||this.item.getFlag(MODULE_ID,'genjutsuWeapon')||this.item.getFlag(MODULE_ID,'genjutsuPhantasmal')||this.item.getFlag(MODULE_ID,'genjutsuWeaponCasting')))message={...message,data:{...message.data,flags:{...message.data?.flags,[MODULE_ID]:{...message.data?.flags?.[MODULE_ID],moldingCast:this.item.getFlag(MODULE_ID,'moldingCast'),castingSnapshot:this.item.toObject()}}}};
      if(game.settings.get(MODULE_ID,'medicalClassAutomation')&&(this.item.getFlag(MODULE_ID,'medicalSpiritualWeapon')||this.item.getFlag(MODULE_ID,'medicalScalpelWeapon')))message={...message,data:{...message.data,flags:{...message.data?.flags,[MODULE_ID]:{...message.data?.flags?.[MODULE_ID],castingSnapshot:this.item.toObject()}}}};
      const result=await rollDamage.call(this,config,dialog,message);
      if(result?.length&&inkChoice&&ink?.parent?.isOwner)await ink.delete();
      if(result?.length&&primary&&record?.bonus?.length)await primary.setFlag(MODULE_ID,'classDamageBonusUsed',true);
      return result;
      }finally{if(primary){damageBusy.delete(primary);damagePrimary.delete(this);}}
    };
    prototype._prepareUsageScaling=async function(config,message,item) {
      const result=await scale.call(this,config,message,item);
      if(!enabled(game)||!this.isSpell)return result;
      const activity=item.system.activities.get(this.id),choice=game.settings.get(MODULE_ID,'ninjutsuClassAutomation')?refinedCastingChoice(activity,config.n5ese?.refined):null;
      if(choice||isMasterJutsu(item)){
        const master=isMasterJutsu(item);
        const augmentationChoice={...(choice??{}),activityId:this.id,master};
        if(choice?.mode==='save')augmentationChoice.baseDC=activity.save.dc.value;
        item.updateSource({[`flags.${MODULE_ID}.castingAugmentation`]:augmentationChoice});
        item.prepareFinalAttributes?.();
        applyAugmentedSave(item);
      }
      return result;
    };
    prototype._finalizeMessageConfig=function(config,message,updates) {
      const result=finish.call(this,config,message,updates);
      if(enabled(game)&&augmentation(this.item)){
        message.data.flags??={};message.data.flags[MODULE_ID]??={};
        message.data.flags[MODULE_ID].castingSnapshot=this.item.toObject();
      }
      return result;
    };
  }
  // Each concrete model may override getDamageConfig. Wrap the outermost method once.
  for(const {documentClass} of Object.values(types)) {
    const prototype=documentClass?.prototype;
    if(!prototype||typeof prototype.getDamageConfig!=='function'||Object.hasOwn(prototype,'n5eseDamageAugmented'))continue;
    Object.defineProperty(prototype,'n5eseDamageAugmented',{value:true});
    const original=prototype.getDamageConfig;
    prototype.getDamageConfig=function(...args){
      const result=original.apply(this,args),data=augmentation(this.item);
      const ink=args[0]?.n5eseInkDice;if(ink&&!augmentedRolls.has(result))result.rolls?.[ink.index]?.parts.push(ink.count+'d'+ink.die);
      const molding=currentMoldingRecord(game,this.item.getFlag(MODULE_ID,'moldingCast'));
      if(((game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&data?.master&&data.activityId===this.id)||(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&molding?.activityId===this.id&&molding.ids?.includes('potent')&&moldingTurnActive(molding,game.combat)))&&!augmentedRolls.has(result)){
        // Native _processDamagePart puts original Jutsu dice first; later parts
        // contain actor/item bonuses and must continue to roll normally.
        for(const roll of (result.rolls??[]).slice(0,this.damage?.parts?.length??result.rolls?.length??0))if(roll.parts?.length)roll.parts[0]=maximizeMoldingFormula(roll.parts[0]);
      }
      if(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&data?.followupDice&&data.activityId===this.id&&!augmentedRolls.has(result)){const p=data.followupDice;result.rolls?.[p.index]?.parts.push(p.count+'d'+p.die);}
      if(enabled(game)&&data?.mode==='damage'&&data.activityId===this.id&&result.rolls?.[data.index]&&!augmentedRolls.has(result)){
        result.rolls[data.index].parts.push(`${data.bonus}d${data.die}`);
      }
      if(enabled(game)&&data?.activityId===this.id&&!augmentedRolls.has(result))for(const pool of data.pools??[]){
        const roll=result.rolls?.[pool.index];
        if(pool.mode==='vial-dice'&&roll)roll.parts.push(pool.count+'d8');
        if(pool.mode==='sketch-dice'&&roll){const part=refinedDamageChoices(this).find(p=>p.index===pool.index);if(!part)throw Error('Ink Sketch: unklare Würfelgröße.');roll.parts.push(pool.count+'d'+part.die);}
        if(pool.mode==='dice'&&roll)roll.parts.push(`${pool.count}d6`);
        if(pool.mode==='damage'&&roll)result.rolls.push({data:roll.data,parts:[String(pool.count*3)],options:{type:roll.options?.type,types:roll.options?.types,properties:roll.options?.properties,critical:{multiplier:2,multiplyNumeric:true}}});
        if(pool.mode==='chakra')for(const r of result.rolls??[]){r.options??={};r.options.type='chakra';r.options.types=['chakra'];}
      }
      if(!augmentedRolls.has(result))addLinkedDamage(game,this,result);
      if(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&!augmentedRolls.has(result))applyBreathDamage(game,this,result);
      const inertiaType=game.settings.get(MODULE_ID,'ninjutsuTrackers')&&this.item.getFlag(MODULE_ID,'inertiaDamageType');if(inertiaType&&!augmentedRolls.has(result))for(const roll of result.rolls??[]){roll.options??={};roll.options.type=inertiaType;roll.options.types=[inertiaType];}
      if(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&!augmentedRolls.has(result))applyClassDamage(result,classCast(this.item),!damagePrimary.get(this)?.getFlag(MODULE_ID,'classDamageBonusUsed'));
      if(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&!augmentedRolls.has(result)){
        applySubclassDamage(result,molding,{attack:this.type==='attack'});
        const followup=molding?.solarFinisher,roll=result.rolls?.[followup?.damageIndex];
        if(followup?.isNin&&roll)roll.parts.push(`3d${followup.die}`);
      }
      if(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&molding?.echo&&!augmentedRolls.has(result))for(const roll of result.rolls??[])roll.parts=[`ceil((${roll.parts.join(' + ')}) / 2)`];
      if(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&!augmentedRolls.has(result))applyConditionalClassDamage(result,this.item);
      augmentedRolls.add(result);
      return result;
    };
  }
  const prototype=ChatClass?.prototype;if(!prototype||wrapped.has(prototype))return;
  wrapped.add(prototype);
  const getItem=prototype.getAssociatedItem,getActivity=prototype.getAssociatedActivity;
  function snapshot(message){
    if(!enabled(game)&&!game.settings.get(MODULE_ID,'genjutsuClassAutomation')&&!game.settings.get(MODULE_ID,'medicalClassAutomation')&&!game.settings.get(MODULE_ID,'taijutsuClassAutomation'))return null;
    const data=message.getFlag(MODULE_ID,'castingSnapshot')??message.getOriginatingMessage?.().getFlag(MODULE_ID,'castingSnapshot');
    if(!data?.flags?.[MODULE_ID]?.castingAugmentation&&!data?.flags?.[MODULE_ID]?.moldingCast&&!data?.flags?.[MODULE_ID]?.scrollSeal&&!data?.flags?.[MODULE_ID]?.genjutsuCast&&!data?.flags?.[MODULE_ID]?.genjutsuMirageCast&&!data?.flags?.[MODULE_ID]?.genjutsuWeapon&&!data?.flags?.[MODULE_ID]?.genjutsuPhantasmal&&!data?.flags?.[MODULE_ID]?.genjutsuWeaponCasting&&!data?.flags?.[MODULE_ID]?.medicalAttackBoost&&!data?.flags?.[MODULE_ID]?.medicalCast&&!data?.flags?.[MODULE_ID]?.medicalScalpelWeapon&&!data?.flags?.[MODULE_ID]?.medicalSpiritualWeapon&&!['taijutsuCast','taijutsuUnarmed','taijutsuUnarmedCast','taijutsuRedirectCounter','taijutsuBlowsActionId','taijutsuDisturbanceGroup','taijutsuFeatureGroup','taijutsuDragonSoul','taijutsuMartialCombat','taijutsuVersatility','taijutsuSpecialCast','taijutsuMartialWeapon','taijutsuLeviathan','taijutsuQuarterstaffExpert','taijutsuNatureCast','taijutsuSoulRange','taijutsuFixedFury','interruptedUsageId'].some(key=>data?.flags?.[MODULE_ID]?.[key]))return null;
    const actor=message.getAssociatedActor();if(!actor)return null;
    const prior=cached.get(message);if(prior?.data===data&&prior.actor===actor)return prior.item;
    const item=new Item.implementation(data,{parent:actor});
    item.prepareFinalAttributes?.();
    applyMedicalSave(item);applyAugmentedSave(item);applyGenjutsuSave(item);applyTaijutsuSave(item);applyMysticFinisherSave(item);cached.set(message,{data,actor,item});return item;
  }
  prototype.getAssociatedItem=function(...args){return snapshot(this)??getItem.apply(this,args);};
  prototype.getAssociatedActivity=function(...args){const item=snapshot(this);return item?item.system.activities.get(this.getFlag('n5eb','activity.id')):getActivity.apply(this,args);};
}
