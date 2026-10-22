import {requireDelayedTarget} from '../casting/genjutsu-delay-state.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuAbility,isGenjutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {ILLUSIONARY_WEAPONS,illusionaryWeaponAvailable,illusionaryWeaponStage} from '../casting/genjutsu-weapons.mjs';
import {illusionaryWeapons} from './genjutsu-weapons.mjs';
import {subclassCastExpiry} from '../casting/subclass-cast-lifetime.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export const INFUSION_HITS='genjutsuInfusionHits';
const marker='genjutsuWeaponCasting',wrapped=new WeakSet(),actionWrapped=new WeakSet(),rollWrapped=new WeakSet();
const available=(game,actor)=>illusionaryWeapons(actor).filter(w=>illusionaryWeaponAvailable(game,actor,w));
function choice(game,activity,config){
 const weaponId=config.n5ese?.illusionaryInfusion||config.n5ese?.illusionaryBukijutsu;if(!weaponId)return null;
 const infusion=!!config.n5ese?.illusionaryInfusion,actor=activity.actor,weapon=available(game,actor).find(w=>w.id===weaponId),rank=config.jutsu?.rank??activity.item.system.effectiveRank;
 if(!genjutsuEnabled(game)||!actor.isOwner||!weapon||illusionaryWeaponStage(actor)<2||config.n5ese?.illusionaryInfusion&&config.n5ese?.illusionaryBukijutsu)throw Error('Aktive eigene Supreme Illusionary Weapon und genau eine passende Waffenoption erforderlich.');
 if(infusion&&!isGenjutsu(activity.item))throw Error('Nur Genjutsu in die Waffenform infundieren.');
 if(!infusion&&(!ownedGenjutsuFeature(actor,'Illusionary Bukijutsu','Malleable Mirages')||activity.item.system.jutsu.type!=='bukijutsu'||!['e','d','c'].includes(rank)))throw Error('Illusionary Bukijutsu erlaubt nur tatsächlich gewirkte Bukijutsu bis C-Rang.');
 return {weapon,infusion,ability:genjutsuAbility(actor),rank};
}
export function addWeaponCastingFields(game,activity,config,result){
 if(!genjutsuEnabled(game)||illusionaryWeaponStage(activity.actor)<2)return;
 const weapons=available(game,activity.actor);if(!weapons.length)return;
 let name,label;if(isGenjutsu(activity.item)){name='illusionaryInfusion';label='Supreme Illusionary Weapon: Genjutsu in Waffenform speichern';}
 else if(activity.item.system.jutsu?.type==='bukijutsu'&&['e','d','c'].includes(config.jutsu?.rank??activity.item.system.effectiveRank)&&ownedGenjutsuFeature(activity.actor,'Illusionary Bukijutsu','Malleable Mirages')){name='illusionaryBukijutsu';label='Illusionary Bukijutsu: Genjutsu-Attribut für Angriff, Schaden und SG';}
 else return;
 result.fields.push({name:'n5ese.'+name,value:config.n5ese?.[name]??'',field:new foundry.data.fields.StringField({label,hint:'Tatsächlich mit dieser Waffenform wirken. Infusion ersetzt eine vorhandene gespeicherte Infusion; eigene Jutsudauer/Konzentration beginnt jetzt und läuft weiter.'}),input:(_field,options)=>foundry.applications.fields.createSelectInput({...options,options:[{value:'',label:'Nicht verwenden'},...weapons.map(w=>({value:w.id,label:w.profile.name+(w.infusion?' · gespeicherte Infusion ersetzen':'')}))]})});result.hasConsumption=true;
}
export function infusionMessage(game,message){
 const data=message?.getFlag(MODULE_ID,marker)??message?.getFlag(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.[marker];if(!data?.infusion)return null;
 return message.type==='usage'?message:game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,marker)?.id===data.id)??null;
}
export function infusionHit(game,message){
 message=infusionMessage(game,message);if(!message)return null;
 const infusion=message?.getFlag(MODULE_ID,marker);if(!infusion?.infusion)return null;
 return message.getAssociatedActor()?.getFlag(MODULE_ID,INFUSION_HITS)?.find(h=>h.infusionId===infusion.id&&h.status==='released')??null;
}
export function requireInfusionTarget(game,message,targetUuid,options={}){
 requireDelayedTarget(game,message,targetUuid,options);
 const supplied=message?.getFlag(MODULE_ID,marker)??message?.getFlag(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.[marker];if(!genjutsuEnabled(game)||!supplied?.infusion)return null;
 message=infusionMessage(game,message);if(!message)throw Error('Ursprüngliche Infusions-Castkarte fehlt.');const data=message.getFlag(MODULE_ID,marker);
 const actor=message.getAssociatedActor(),hit=infusionHit(game,message);
 if(message.system.deltas===null||!hit||targetUuid&&hit.targetUuid!==targetUuid||Number.isFinite(data.expiresAt)&&game.time.worldTime>=data.expiresAt||message.system.concentration&&!actor.effects.has(message.system.concentration))throw Error('Infusion noch nicht durch Treffer freigegeben, falsches Ziel, erstattet oder ursprüngliche Wirkung beendet.');
 return hit;
}
export async function releaseWeaponInfusion(game,message){
 const actor=message.getAssociatedActor(),attack=message.getFlag(MODULE_ID,'genjutsuWeaponAttack');if(!genjutsuEnabled(game)||!actor?.isOwner||!attack)throw Error('Eigener Illusionary-Weapon-Angriff erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const weapons=illusionaryWeapons(actor),weapon=weapons.find(w=>w.id===attack.instanceId),stored=weapon?.infusion;
  if(!weapon||!illusionaryWeaponAvailable(game,actor,weapon)||!stored||illusionaryWeaponStage(actor)<2)throw Error('Keine aktive gespeicherte Infusion in dieser Waffenform.');
  const cast=game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,marker)?.id===stored.id);if(!cast||cast.system.deltas===null||Number.isFinite(stored.expiresAt)&&game.time.worldTime>=stored.expiresAt||cast.system.concentration&&!actor.effects.has(cast.system.concentration))throw Error('Ursprünglicher bezahlter Genjutsu-Cast fehlt, ist erstattet oder beendet.');
  const targets=[...game.user.targets].filter(t=>t.actor);if(targets.length!==1)throw Error('Genau die tatsächlich getroffene Kreatur markieren.');
  const gen=cast.getFlag(MODULE_ID,'genjutsuCast'),targetUuid=targets[0].actor.uuid;if(gen&&(gen.powerTarget&&gen.powerTarget.uuid!==targetUuid||gen.prestigeTarget&&gen.prestigeTarget!==targetUuid||gen.targets?.length&&!gen.targets.includes(targetUuid)||gen.damageTargets?.length&&!gen.damageTargets.includes(targetUuid)))throw Error('Bezahlte Actualization-/Power-/Prestige-Optionen dieses Casts sind bereits an andere bestätigte Ziele gebunden.');
  const p=document.createElement('p');p.textContent=weapon.profile.name+' trifft tatsächlich '+targets[0].name+'. '+cast.getAssociatedItem().name+' auf genau diese Kreatur freigeben? Gespeicherte Infusion wird verbraucht; keine weiteren Chakra. Ursprüngliche Dauer läuft weiter. Saves erhalten zusätzlich −1d4.';
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Infusion · erfolgreichen Treffer bestätigen'},content:p.outerHTML,rejectClose:false}))return;
  if(!illusionaryWeaponAvailable(game,actor,weapon)||Number.isFinite(stored.expiresAt)&&game.time.worldTime>=stored.expiresAt||cast.system.deltas===null||cast.system.concentration&&!actor.effects.has(cast.system.concentration))throw Error('Infusion während der Bestätigung beendet.');
  const hits=structuredClone(actor.getFlag(MODULE_ID,INFUSION_HITS)??[]);if(hits.some(h=>h.infusionId===stored.id))throw Error('Infusion bereits freigegeben.');
  hits.push({id:foundry.utils.randomID(),infusionId:stored.id,castMessageId:cast.id,attackMessageId:message.id,targetUuid:targets[0].actor.uuid,targetTokenUuid:targets[0].document.uuid,status:'released',releasedAt:game.time.worldTime});delete weapon.infusion;
  await actor.update({['flags.'+MODULE_ID+'.'+ILLUSIONARY_WEAPONS]:weapons,['flags.'+MODULE_ID+'.'+INFUSION_HITS]:hits});ui.chat.updateMessage(cast);return cast;
 });
}
export function installWeaponCasting(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageScaling'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const scale=p._prepareUsageScaling,prepare=p._prepareUsageUpdates,finalize=p._finalizeMessageConfig;
  p._prepareUsageScaling=async function(config,message,item){
   if(this.item.getFlag(MODULE_ID,marker))throw Error('Einen neuen Waffen-Cast über das ursprüngliche Jutsu im Inventar starten. Die alte Castingkarte bleibt der gespeicherte Beleg ihres eigenen Casts.');
   const selected=choice(game,this,config);
   if(selected?.infusion){config.create={...config.create,measuredTemplate:false};item.updateSource({['system.activities.'+this.id+'.target.template.type']:'',['system.activities.'+this.id+'.target.affects.count']:'1',['system.activities.'+this.id+'.target.affects.type']:'creature'});item.prepareFinalAttributes?.();}
   if(selected&&!selected.infusion){
    const casting=this.item.system.jutsuCastingType;if(!casting||!this.actor.system.attributes.jutsu[casting])throw Error('Ursprüngliches Bukijutsu-Attribut nicht auslesbar.');
    const patch={'system.ability':selected.ability,'system.jutsu.ability':selected.ability};
    for(const activity of item.system.activities){
     if(activity.attack){patch['system.activities.'+activity.id+'.attack.ability']=selected.ability;if(!activity.attack.flat)patch['system.activities.'+activity.id+'.attack.bonus']='('+String(activity.attack.bonus||0)+') + @abilities.'+selected.ability+'.mod - @attributes.jutsu.'+casting+'.mod';}
     if(activity.save?.dc?.calculation){patch['system.activities.'+activity.id+'.save.dc.calculation']='';patch['system.activities.'+activity.id+'.save.dc.formula']='@attributes.jutsu.'+casting+'.dc - @attributes.jutsu.'+casting+'.mod + @abilities.'+selected.ability+'.mod';}
    }
    item.updateSource(patch);item.prepareFinalAttributes?.();
   }
   const result=await scale.call(this,config,message,item);if(selected){const activity=item.system.activities.get(this.id),data={id:foundry.utils.randomID(),weaponId:selected.weapon.id,infusion:selected.infusion,ability:selected.ability,createdAt:game.time.worldTime,expiresAt:subclassCastExpiry(activity.duration,game.time.worldTime),activityId:this.id};item.updateSource({['flags.'+MODULE_ID+'.'+marker]:data});item.prepareFinalAttributes?.();}return result;
  };
  p._prepareUsageUpdates=async function(config,options){
   const selected=choice(game,this,config),record=this.item.getFlag(MODULE_ID,marker);
   if(selected&&(!record||record.weaponId!==selected.weapon.id||record.infusion!==selected.infusion||record.ability!==selected.ability))throw Error('Waffen-Casting-Auswahl nach Skalierung verändert.');
   const updates=await prepare.call(this,config,options);if(!selected||!updates||Array.isArray(updates))return updates;
   if(selected.infusion){
    if(config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Infusion benötigt einen bestätigten normalen Jutsu-Cast.');
    const weapons=illusionaryWeapons(this.actor),weapon=weapons.find(w=>w.id===selected.weapon.id);if(!weapon||!illusionaryWeaponAvailable(game,this.actor,weapon))throw Error('Waffenform nicht mehr verfügbar.');
    if(weapon.infusion&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Gespeicherte Infusion ersetzen'},content:'<p>Diese Waffenform enthält bereits ein bezahltes Genjutsu. Durch die neue Infusion ersetzen? Der frühere Cast wird nicht erstattet; seine gegebenenfalls noch laufende Konzentration selbst beenden.</p>',rejectClose:false}))throw Error('Ersetzen abgebrochen; keine neue Infusion bezahlt.');
    if(!illusionaryWeaponAvailable(game,this.actor,weapon))throw Error('Waffenform während der Bestätigung beendet.');
    const path='flags.'+MODULE_ID+'.'+ILLUSIONARY_WEAPONS;if(updates.actor[path]!==undefined)throw Error('Konkurrierende Änderung der Waffenformen.');weapon.infusion=structuredClone(record);updates.actor[path]=weapons;
   }return updates;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finalize.call(this,config,message,updates),data=this.item.getFlag(MODULE_ID,marker);if(genjutsuEnabled(game)&&data){message.data.flags??={};message.data.flags[MODULE_ID]??={};Object.assign(message.data.flags[MODULE_ID],{[marker]:data,castingSnapshot:this.item.toObject()});}return result;};
 }
 for(const {documentClass} of Object.values(types)){
  const p=documentClass?.prototype;if(!p||actionWrapped.has(p))continue;actionWrapped.add(p);
  const follow=p._triggerSubsequentActions;if(typeof follow==='function')p._triggerSubsequentActions=function(...args){if(genjutsuEnabled(game)&&this.item.getFlag(MODULE_ID,marker)?.infusion)return;return follow.apply(this,args);};
 }
 for(const {documentClass} of Object.values(types)){
  const p=documentClass?.prototype;if(!p||rollWrapped.has(p))continue;rollWrapped.add(p);
  const attack=p.rollAttack;if(typeof attack==='function')p.rollAttack=function(...args){if(genjutsuEnabled(game)&&this.item.getFlag(MODULE_ID,marker)?.infusion)throw Error('Dieses Genjutsu wurde infundiert. Statt eines weiteren Genjutsu-Angriffs den Treffer mit der gespeicherten Waffenform bestätigen.');return attack.apply(this,args);};
  const damage=p.rollDamage;if(typeof damage==='function')p.rollDamage=function(config={},dialog={},message={}){
   const data=this.item.getFlag(MODULE_ID,marker);if(!genjutsuEnabled(game)||!data?.infusion)return damage.call(this,config,dialog,message);
   const cast=game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,marker)?.id===data.id);requireInfusionTarget(game,cast);
   if(!cast)throw Error('Ursprüngliche Infusionskarte fehlt.');
   return damage.call(this,{...config,isCritical:false},dialog,{...message,data:{...message.data,flags:{...message.data?.flags,n5eb:{...message.data?.flags?.n5eb,originatingMessage:cast.id},[MODULE_ID]:{...message.data?.flags?.[MODULE_ID],[marker]:data,castingSnapshot:this.item.toObject()}}}});
  };
  const damageConfig=p.getDamageConfig;if(typeof damageConfig==='function')p.getDamageConfig=function(...args){const result=damageConfig.apply(this,args);if(genjutsuEnabled(game)&&this.item.getFlag(MODULE_ID,marker)?.infusion){result.isCritical=false;result.critical={...result.critical,allow:false};for(const roll of result.rolls??[]){roll.options??={};roll.options.n5eseInfusionNormalDamage=true;roll.options.isCritical=false;}}return result;};
 }
 const damageRoll=CONFIG.Dice.DamageRoll.prototype,configureDamage=damageRoll.configureDamage;
 damageRoll.configureDamage=function(...args){if(this.options.n5eseInfusionNormalDamage)this.options.isCritical=false;return configureDamage.apply(this,args);};
 Hooks.on('dnd5e.preCalculateDamage',(target,_damage,options)=>{try{requireInfusionTarget(game,options.originatingMessage,target.uuid);}catch(error){ui.notifications.warn(error.message);return false;}});
}
