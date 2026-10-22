import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel} from '../casting/medical-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {appendFeatureSpend,appendItemSpend} from './ninjutsu-resource-utils.mjs';
import {ninjutsuEffect,ninjutsuEffectData,upsertNinjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {nextActorTurnDeadline} from '../casting/molding-lifetimes.mjs';
export const unarmedMedicalHit=message=>!!medicalFeature(message?.getAssociatedActor?.(),'Competent Combatant','Combat Medic')&&(message.getAssociatedActivity?.()?.attack?.type?.classification==='unarmed'||message.getAssociatedItem?.()?.getFlag(MODULE_ID,'medicalCast')?.unarmed===true);
export function addCombatHitFields(actor,message,host){
 if(!unarmedMedicalHit(message)||!medicalFeature(actor,'Competent Combatant','Combat Medic'))return;
 const select=document.createElement('select');select.name='combatMode';for(const [value,label]of [['','Ohne Competent Combatant'],['combat','Competent Combatant · 5 Chakra + Nutzung; Attribut ×'+(medicalLevel(actor)>=9?3:2)],...(medicalFeature(actor,'Yin Seal: Release','Combat Medic')?[['release','Yin Seal: Release · 5 Chakra + Nutzung + 7 Motes; Attribut ×4, Würfel ×3']]:[])]){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);}host.append(select);
 const label=document.createElement('label'),input=document.createElement('input');input.type='number';input.name='combatModifier';input.step='1';input.value=String(message.rolls[0]?.data?.mod??0);label.append(document.createTextNode('Tatsächlich bereits enthaltener relevanter Attributbeitrag: '),input);host.append(label);
}
export const combatHitChoice=form=>({mode:form.elements.combatMode?.value??'',modifier:Number(form.elements.combatModifier?.value??0)});
export function combatHitPayment(actor,message,choice){
 if(!choice?.mode)return {chakra:0,items:[]};
 if(!unarmedMedicalHit(message)||!medicalFeature(actor,'Competent Combatant','Combat Medic')||!['combat','release'].includes(choice.mode)||!Number.isSafeInteger(choice.modifier))throw Error('Bestätigter unbewaffneter Treffer und gültiger Attributbeitrag erforderlich.');
 const feature=medicalFeature(actor,'Competent Combatant','Combat Medic'),items=[{feature,amount:1}];
 if(choice.mode==='release'){if(!medicalFeature(actor,'Yin Seal: Release','Combat Medic'))throw Error('Yin Seal: Release nicht verfügbar.');items.push({feature:medicalFeature(actor,'Yin Seal: Charge','Combat Medic'),amount:7});}
 if(actor.getChakraAvailable()<5||items.some(p=>!p.feature||p.feature.system.uses.value<p.amount))throw Error('Nicht genügend Chakra, Competent-Combatant-Nutzungen oder Yin Motes. Release benötigt tatsächlich 7 Motes; der Pool wird nicht automatisch vergrößert.');
 return {chakra:5,items};
}
export async function addCombatHitDamage(actor,message,entry,selectedType){
 const choice=entry.combat;if(!choice?.mode)return;
 const part=entry.parts.find(p=>p.type===selectedType),factor=choice.mode==='release'?4:medicalLevel(actor)>=9?3:2;
 part.value=Math.max(0,part.value+(factor-1)*choice.modifier);
 if(choice.mode==='release'){
  const original=message.rolls.find(r=>r.options.type===selectedType&&r.dice.length),die=original?.dice[0];if(!die)throw Error('Ursprüngliche unbewaffnete Schadenswürfel nicht auslesbar.');
  const current=original.options.n5eseYinDice?.multiplier??1,active=die.results.filter(r=>r.active!==false&&!r.discarded).length,count=active/current*(3-current);
  if(!Number.isSafeInteger(count)||count<0)throw Error('Vorhandene Würfelverstärkung kann nicht sicher auf Release umgestellt werden.');
  if(count){const roll=await new Roll(count+'d'+die.faces).evaluate();entry.rolls.push(roll.toJSON());part.value+=roll.total;}
 }
}
export async function activateYinAttackAction(game,actor){
 if(!medicalEnabled(game)||!actor.isOwner||!medicalFeature(actor,'Yin Seal: Charge','Combat Medic'))throw Error('Eigener Combat Medic mit Yin Seal: Charge erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const prior=actor.getFlag(MODULE_ID,'medicalYinAction');if(prior?.status==='active'||['paying','review'].includes(prior?.status))throw Error('Vorherige Angriffsaktion beenden bzw. prüfen.');
  const feature=medicalFeature(actor,'Yin Seal: Charge','Combat Medic');if(feature.system.uses.value<2)throw Error('Zwei Yin Motes erforderlich.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Yin Seal · eine Angriffsaktion'},content:'<p>Zwei Motes bezahlen, um die unbewaffneten Schadenswürfel aller Angriffe dieser einen Angriffsaktion zu verdoppeln? Das tatsächliche Ende der Angriffsaktion danach manuell bestätigen.</p>',rejectClose:false}))return;
  const state={id:foundry.utils.randomID(),status:'paying',at:game.time.worldTime};await actor.setFlag(MODULE_ID,'medicalYinAction',state);try{const updates={item:[]};appendItemSpend(updates,feature,'uses.spent',2);await actor.updateEmbeddedDocuments('Item',updates.item);state.status='active';await actor.setFlag(MODULE_ID,'medicalYinAction',state);}catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,'medicalYinAction',state);throw error;}
 });
}
export async function endYinAttackAction(game,actor){if(!actor.isOwner)throw Error('Eigentümer erforderlich.');const state=actor.getFlag(MODULE_ID,'medicalYinAction');if(!state)return;if(state.status!=='active'&&!game.user.isGM)throw Error('GM-Prüfung erforderlich.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Yin-Angriffsaktion beenden'},content:'<p>Angriffsaktion abgeschlossen bzw. unterbrochenen Verbrauch vom GM geprüft? Die Motes bleiben verbraucht.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'medicalYinAction',{...state,status:'ended'});}
export async function applyCombatProwess(game,target,source,entry){
 if(!entry.choices?.take||!medicalFeature(source,'Take Life: Combat Prowess','Combat Medic'))return;
 await upsertNinjutsuEffect(target,ninjutsuEffectData({name:'Take Life · Combat Prowess',id:entry.id,sourceActorUuid:source.uuid,sourceItemUuid:medicalFeature(source,'Take Life: Combat Prowess','Combat Medic').uuid,lifetime:{deadline:nextActorTurnDeadline(game.combat,target.uuid,'start')},changes:[{key:'system.traits.dv.value',type:'add',value:'ALL',priority:20}],setting:'medicalClassAutomation',metadata:{genjutsu:{medical:true,ruleId:'medical.combat-prowess',conditions:[],nextDamageVulnerability:true}}}));
}
export function addCombatCastingFields(activity,config,result){
 if(activity.item?.system.jutsu?.type!=='taijutsu'||!medicalFeature(activity.actor,'Competent Combatant','Combat Medic'))return;
 result.fields.push({name:'n5ese.medicalUnarmed',value:!!config.n5ese?.medicalUnarmed,field:new foundry.data.fields.BooleanField({label:'Combat Medic · dieses Taijutsu verursacht tatsächlich unbewaffneten Schaden'})});
 if(medicalFeature(activity.actor,'Yin Seal: Charge','Combat Medic'))result.fields.push({name:'n5ese.medicalYinUpcast',value:!!config.n5ese?.medicalYinUpcast,field:new foundry.data.fields.BooleanField({label:'Yin Seal · 3 Motes für eine kostenlose zusätzliche Rangstufe'})});result.hasConsumption=true;
}
export function prepareCombatCast(game,activity,config,item,message){
 if(!config.n5ese?.medicalUnarmed&&!config.n5ese?.medicalYinUpcast)return;
 if(item.system.jutsu.type!=='taijutsu'||!medicalFeature(item.actor,'Competent Combatant','Combat Medic'))throw Error('Unbewaffnetes Taijutsu eines Combat Medic erforderlich.');
 const record=item.getFlag(MODULE_ID,'medicalCast')??{id:foundry.utils.randomID(),rank:config.jutsu.rank,at:game.time.worldTime};record.unarmed=!!config.n5ese.medicalUnarmed;
 if(config.n5ese.medicalYinUpcast){if(!record.unarmed||!medicalFeature(item.actor,'Yin Seal: Charge','Combat Medic'))throw Error('Yin-Upcast benötigt bestätigten unbewaffneten Schaden.');const ranks=['e','d','c','b','a','s'],next=ranks[ranks.indexOf(config.jutsu.rank)+1];if(!next)throw Error('Keine weitere Rangstufe verfügbar.');const delta=item.system.getRankDelta(next);config.scaling=delta;item.updateSource({'flags.n5eb.scaling':delta});item.prepareFinalAttributes?.();record.paidRank??=record.rank;record.rank=next;record.effectRank=next;record.yinUpcast=true;config.chakra??={};config.chakra.maintain=item.system.getMaintainCost({rank:next,cost:item.system.getChakraCost({rank:next})});foundry.utils.setProperty(message,'data.system.maintainCost',config.chakra.maintain);foundry.utils.setProperty(message,'data.system.scaling',delta);foundry.utils.setProperty(message,'data.system.jutsuRank',next);}
 item.updateSource({['flags.'+MODULE_ID+'.medicalCast']:record});
}
export function installMedicalCombat(game,types,ActorClass){
 const prepared=new WeakSet(),wrapped=new WeakSet();for(const {documentClass}of Object.values(types)){const p=documentClass?.prototype;if(p&&!wrapped.has(p)&&typeof p.getDamageConfig==='function'){wrapped.add(p);const get=p.getDamageConfig;p.getDamageConfig=function(...args){const result=get.apply(this,args);if(prepared.has(result)||!medicalEnabled(game))return result;prepared.add(result);const unarmed=this.attack?.type?.classification==='unarmed'||this.item.getFlag(MODULE_ID,'medicalCast')?.unarmed;if(unarmed&&this.actor.getFlag(MODULE_ID,'medicalYinAction')?.status==='active'&&result.rolls?.[0])result.rolls[0].options={...result.rolls[0].options,n5eseYinDice:{multiplier:2}};return result;};}}
 const damage=CONFIG.Dice.DamageRoll.prototype,configure=damage.configureDamage;damage.configureDamage=function(...args){const multiplier=this.options.n5eseYinDice?.multiplier;if(multiplier&&this.dice[0]){const die=this.dice[0];die.options.n5eseYinBase??=die.options.baseNumber??die.number;die.options.baseNumber=die.options.n5eseYinBase*multiplier;}return configure.apply(this,args);};
 const updatesWrapped=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);if(!p||updatesWrapped.has(p))continue;updatesWrapped.add(p);const original=p._prepareUsageUpdates;p._prepareUsageUpdates=async function(config,options){const updates=await original.call(this,config,options);if(medicalEnabled(game)&&config.n5ese?.medicalYinUpcast&&updates&&!Array.isArray(updates)){if(!config.n5ese.medicalUnarmed||this.item.system.jutsu.type!=='taijutsu')throw Error('Ungültiger Yin-Upcast.');const feature=medicalFeature(this.actor,'Yin Seal: Charge','Combat Medic');if(!feature||feature.system.uses.value<3)throw Error('Drei Yin Motes erforderlich.');appendItemSpend(updates,feature,'uses.spent',3);const rank=this.item.getFlag(MODULE_ID,'medicalCast')?.effectRank;if(rank){config.chakra??={};config.chakra.maintain=this.item.system.getMaintainCost({rank,cost:this.item.system.getChakraCost({rank})});}}return updates;};}
 const calculate=ActorClass.prototype.calculateDamage;ActorClass.prototype.calculateDamage=function(parts,options={}){const result=calculate.call(this,parts,options);if(result&&(result.amount>0||result.chakraAmount>0))options.n5eseCombatProwess=this.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata?.genjutsu?.nextDamageVulnerability).map(e=>e.id);return result;};
 Hooks.on('dnd5e.applyDamage',async(actor,_amount,options)=>{const origin=options.originatingMessage,item=origin?.getAssociatedItem?.(),source=origin?.getAssociatedActor?.();if(medicalEnabled(game)&&actor.isOwner&&!options.n5eseMedicalRequest&&!options.n5eseSecondaryMedical&&item?.getFlag(MODULE_ID,'medicalCast')?.elementalPower&&source)await applyCombatProwess(game,actor,source,{id:origin.id+'-'+actor.id,choices:{take:true}});if(actor.isOwner&&options.n5eseCombatProwess?.length){const ids=options.n5eseCombatProwess.filter(id=>actor.effects.has(id));if(ids.length)await actor.deleteEmbeddedDocuments('ActiveEffect',ids);}});
}
