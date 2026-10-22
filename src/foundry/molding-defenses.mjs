import {MODULE_ID} from '../settings/register.mjs';
import {currentMoldingRecord,moldingTurnActive,piercingOptions} from '../casting/molding-damage.mjs';
import {subclassDefenseOptions,prepareMoldingReduction} from '../casting/subclass-molding-damage.mjs';
import {activeMoldingEffect,moldingMarker} from '../effects/molding-effects.mjs';
import {addGigawattBonus} from './gigawatt-molding.mjs';
import {addInfusionDamage} from './infusion-damage.mjs';
const wrapped=new WeakSet();
export function installMoldingDefenses(game){
  const record=options=>currentMoldingRecord(game,options.originatingMessage?.getFlag?.(MODULE_ID,'moldingCast')??options.originatingMessage?.getOriginatingMessage?.()?.getFlag(MODULE_ID,'moldingCast'));
  Hooks.on('dnd5e.preCalculateDamage',(actor,damages,options)=>{
    if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))return;
    const cast=record(options);if(!cast)return;
    if(game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&cast.solarFinisher&&cast.solarFinisher.target.uuid!==actor.uuid)return false;
    if(cast.echo&&!cast.targets?.echoing?.some(t=>t.uuid===actor.uuid))return false;
    if(cast.targets?.careful?.some(t=>t.uuid===actor.uuid))return false;
    if(game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&!options.n5eseSecondaryMolding&&!options.n5eseImbuementDamage&&cast.ids?.includes('chakra-infusion')){
      const message=options.originatingMessage;
      if(message?.getFlag?.(MODULE_ID,'infusionDamageState')!=='ready'){ui.notifications.warn('Chakra-Infusion-Zusatzwurf noch nicht bereit oder zur Prüfung gesperrt.');return false;}
      addInfusionDamage(damages,message.getFlag(MODULE_ID,'infusionDamageBonus'));
    }
    if(game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&!options.n5eseSecondaryMolding&&!options.n5eseImbuementDamage&&cast.ids?.includes('gigawatt')&&['aberration','celestial','mutant'].includes(actor.system.details?.type?.value)){
      const message=options.originatingMessage;
      if(message?.getFlag?.(MODULE_ID,'gigawattBonusState')!=='ready'){ui.notifications.warn('Gigawatt-Zusatzwürfel wird noch vorbereitet oder benötigt eine Prüfung. Schaden danach erneut bestätigen.');return false;}
      addGigawattBonus(damages,message.getFlag(MODULE_ID,'gigawattDamageBonus'),{targetType:actor.system.details?.type?.value});
    }
    if(game.settings.get(MODULE_ID,'subclassMoldingAutomation'))Object.assign(options,subclassDefenseOptions(cast,options));
    if(!options.n5eseNoDamageReduction&&game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&cast.ids?.some(id=>['macabre','sanguine-master'].includes(id))){
      const mods=Object.fromEntries(Object.entries(actor.system.traits.dm?.amount??{}).map(([key,formula])=>[key,game.n5eb.utils.simplifyBonus(formula,actor.getRollData({deterministic:true}))]));
      const immunity=actor.system.traits.di?.value??new Set();
      const eligible=damages.filter(d=>options.ignore===true||options.ignore?.immunity===true||options.ignore?.immunity?.has?.(d.type)||!immunity.has('ALL')&&!immunity.has(d.type));
      Object.assign(options,prepareMoldingReduction(eligible,mods,options,!cast.ids.includes('sanguine-master')));
      if(cast.ids.includes('macabre')&&options.ignore!==true&&!options.ignore?.armorDR){options.n5eseHalfArmor=true;options.ignore={...options.ignore,armorDR:true};}
    }
    if(!options.n5eseNoDamageReduction&&cast.ids?.includes('piercing')&&moldingTurnActive(cast,game.combat))Object.assign(options,piercingOptions(actor,damages,options));
  });
  Hooks.on('dnd5e.calculateDamage',(actor,damages,options)=>{
    if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))return;
    if(options.n5eseHalfArmor&&!options.n5eseNoDamageReduction){
      const armor=game.n5eb.seals.getEquippedArmor(actor);
      const reduction=armor&&game.n5eb.seals.isArmorProficient(actor,armor)?Math.max(0,game.n5eb.seals.getArmorDamageReduction(armor)-2*actor.getConditionRank('corroded')):0;
      for(const d of damages)if(['bludgeoning','piercing','slashing'].includes(d.type)&&d.value>0){const before=d.value;d.value=Math.max(0,d.value-Math.ceil(reduction/2));damages.amount-=before-d.value;}
    }
    if(options.n5eseNoDamageReduction)return;
    const survival=actor.effects.filter(e=>activeMoldingEffect(game,e)&&moldingMarker(e)?.metadata?.adaptive==='survival');
    let budget=Math.max(0,...survival.map(e=>moldingMarker(e).metadata.reduction));
    for(const d of damages)if(budget&&d.value>0&&d.type!=='psychic'&&!CONFIG.DND5E.healingTypes[d.type]){const taken=Math.min(budget,d.value);d.value-=taken;budget-=taken;if(d.type==='chakra')damages.chakraAmount-=taken;else damages.amount-=taken;}
  });
  Hooks.on('dnd5e.preApplyDamage',(actor,amount,updates,options)=>{
    if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation'))return;
    const cast=record(options);if(!cast?.ids?.includes('piercing')||!moldingTurnActive(cast,game.combat)||amount<=0)return;
    const temp=actor.system.attributes.hp.temp??0;
    // Native damage calculation and reduction already ran. Bypass only temporary HP.
    updates['system.attributes.hp.temp']=temp;
    updates['system.attributes.hp.value']=Math.max(0,updates['system.attributes.hp.value']-Math.min(temp,amount));
  });
  const prototype=globalThis.customElements?.get('effect-application')?.prototype;
  if(prototype&&!wrapped.has(prototype)){
    wrapped.add(prototype);const original=prototype._applyEffectToActor;
    prototype._applyEffectToActor=function(effect,actor){
      const cast=this.chatMessage?.getFlag(MODULE_ID,'moldingCast');
      if(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&cast&&!cast.refunded&&(cast.targets?.careful?.some(t=>t.uuid===actor.uuid)||(cast.echo&&!cast.targets?.echoing?.some(t=>t.uuid===actor.uuid)))){
        ui.notifications.info(`${actor.name}: durch Molding von dieser Jutsu-Wirkung ausgeschlossen.`);return null;
      }
      return original.call(this,effect,actor);
    };
  }
}
