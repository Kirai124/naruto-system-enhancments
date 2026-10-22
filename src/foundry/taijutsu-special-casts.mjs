import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {featureActions,activeFeatureAction,featureActionDefinition} from './taijutsu-feature-actions.mjs';
import {withCastingActorLock,castingUsage,mergeCastingMode} from './mode-adapter.mjs';
import {preparedRandomStep} from './preparation-journal.mjs';
import {groupRolledDamage} from '../casting/genjutsu-damage.mjs';
import {activeSoul} from './taijutsu-soul.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {limitBreakingPrice} from './taijutsu-ultimate-actions.mjs';
const KEY='taijutsuSpecialCast';
export function specialCastGrant(game,item,config=castingUsage(item)){
 const id=config?.n5ese?.martialSpecialCast;if(!id)return null;
 const entry=featureActions(item.actor).find(e=>e.id===id),definition=entry&&featureActionDefinition(entry.ruleId);
 if(!taijutsuEnabled(game)||!entry?.data.specialCast||entry.data.itemId!==item.id||!['casting','paid'].includes(entry.data.castState)||activeFeatureAction(game,item.actor,entry.ruleId)?.id!==id||!taijutsuFeature(item.actor,definition.feature,definition.category))throw Error('Bereiter ursprünglicher Martial-Cast fehlt oder wurde bereits verwendet.');
 if(entry.ruleId==='soul-oppressive-aura'&&(entry.data.half||entry.data.condition)&&!activeSoul(game,item.actor))throw Error('Aura-Zusatz benötigt weiterhin aktive Soul Manifestation.');return {entry,half:entry.data.half!==false,additional:entry.data.condition?3:0};
}
export function prepareSpecialCastClone(game,activity,config){
 const grant=specialCastGrant(game,activity.item,config);if(!grant)return;
 if(activity.item===activity.actor.items.get(activity.item.id))throw Error('Martial-Sondercast benötigt einen nativen Casting-Klon.');
 const entry=grant.entry,patch={['flags.'+MODULE_ID+'.'+KEY]:{entryId:entry.id,ruleId:entry.ruleId}};
 if(entry.ruleId==='soul-oppressive-aura'){
  patch['system.jutsu.type']='taijutsu';patch['system.jutsu.ability']=activity.actor.system.attributes.jutsu.taijutsu.ability;
  patch['system.jutsu.keywords']=[...new Set([...activity.item.system.jutsu.keywords].filter(k=>k!=='ninjutsu').concat('taijutsu'))];
  patch['system.range.value']=15;patch['system.range.units']='ft';patch['effects']=[];for(const a of activity.item.system.activities){patch['system.activities.'+a.id+'.effects']=[];patch['system.activities.'+a.id+'.range']={override:false,value:15,units:'ft'};}
 }
 activity.item.updateSource(patch);activity.item.prepareFinalAttributes?.();
}
export async function castMartialSpecial(game,actor,id){
 let saved;await withCastingActorLock(actor,async()=>{const entries=featureActions(actor),entry=entries.find(e=>e.id===id);if(!actor.isOwner||!entry?.data.specialCast||activeFeatureAction(game,actor,entry.ruleId)?.id!==id||entry.data.castState!=='ready')throw Error('Bereiter eigener Martial-Cast erforderlich.');entry.data.castState='casting';await actor.setFlag(MODULE_ID,'taijutsuFeatureActions',entries);saved=structuredClone(entry);});
 try{
  const activity=actor.items.get(saved.data.itemId)?.system.activities.get(saved.data.activityId);if(!activity)throw Error('Ursprüngliches Jutsu-Profil fehlt.');
  const result=await activity.use({consume:{chakra:true,resources:true,action:false},subsequentActions:false,n5ese:{martialSpecialCast:id,...(saved.data.half?{martialTechnique:false}:{})}},{configure:true},{});
  await withCastingActorLock(actor,async()=>{const entries=featureActions(actor),entry=entries.find(e=>e.id===id);if(!entry)throw Error('Cast-Journal fehlt.');if(result?.message){if(entry.data.castState!=='paid')throw Error('Cast ohne bestätigte gemeinsame Zahlung.');entry.data.castState='applied';entry.data.castMessageId=result.message.id;if(entry.ruleId==='soul-oppressive-aura'){entry.data.messageId=result.message.id;entry.data.concentrationId=result.message.system.concentration;if(!entry.data.concentrationId)throw Error('Aura-Konzentrationsbeleg fehlt.');entry.lifetime={expiresAt:game.time.worldTime+60};await actor.effects.get(entry.data.concentrationId).setFlag(MODULE_ID,'ninjutsuEffect',{id:'tai-aura-concentration-'+entry.id,sourceActorUuid:actor.uuid,sourceItemUuid:entry.sourceUuid,setting:'taijutsuClassAutomation',changes:[],lifetime:entry.lifetime,metadata:{taijutsuActionId:entry.id,oppressiveAuraSource:entry.id}});for(const effect of actor.effects)if(ninjutsuEffect(effect)?.metadata?.taijutsuActionId===entry.id)await effect.setFlag(MODULE_ID,'ninjutsuEffect',{...ninjutsuEffect(effect),lifetime:entry.lifetime});}}else if(entry.data.castState==='casting')entry.data.castState='ready';else throw Error('Zahlung ohne bestätigten Cast; GM-Prüfung.');await actor.setFlag(MODULE_ID,'taijutsuFeatureActions',entries);});
  return result;
 }catch(error){await withCastingActorLock(actor,async()=>{const entries=featureActions(actor),entry=entries.find(e=>e.id===id);if(entry){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,'taijutsuFeatureActions',entries);}});throw error;}
}
export async function rollMartialDefense(game,actor,id){
 return withCastingActorLock(actor,async()=>{const entries=featureActions(actor),entry=entries.find(e=>e.id===id);if(!actor.isOwner||entry?.ruleId!=='instinctual-inversion'||entry.data.castState!=='applied'||activeFeatureAction(game,actor,entry.ruleId)?.id!==id)throw Error('Bezahlter ursprünglicher Inversion-Cast erforderlich.');
  const message=game.messages.get(entry.data.castMessageId),activity=message?.getAssociatedActivity?.();if(!activity)throw Error('Ursprüngliche Casting-Kopie fehlt.');
  const result=await preparedRandomStep(entry,()=>actor.setFlag(MODULE_ID,'taijutsuFeatureActions',entries),'defense',async()=>{const rolls=await activity.rollDamage({},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});if(!rolls?.length)return null;const amount=groupRolledDamage(rolls).filter(p=>p.value>0&&!CONFIG.DND5E.healingTypes[p.type]).reduce((n,p)=>n+p.value,0);return {amount,rolls:rolls.map(r=>r.toJSON())};});return result;
 });
}
export function installSpecialCasts(game,types){
 const seen=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);if(!p||seen.has(p))continue;seen.add(p);const updates=p._prepareUsageUpdates,finish=p._finalizeMessageConfig;
  p._prepareUsageUpdates=async function(config,options){const grant=specialCastGrant(game,this.item,config);if(!grant)return updates.call(this,config,options);if(config.cause||!(config.consume===true||config.consume?.chakra===true)||!game.settings.get(MODULE_ID,'dynamicChakraCosts'))throw Error('Martial-Sondercast benötigt normalen Chakra-Verbrauch und dynamische Kosten.');
   if(grant.entry.ruleId==='soul-oppressive-aura'&&!config.concentration?.begin)throw Error('Oppressive Aura benötigt eine bestätigte native Konzentration.');const result=await updates.call(this,config,options);if(!result||Array.isArray(result))return result;
   const entries=featureActions(this.actor),entry=entries.find(e=>e.id===grant.entry.id);if(entry?.data.castState!=='casting')throw Error('Cast bereits bezahlt oder verändert.');
   if(entry.ruleId==='instinctual-inversion'){const rank=config.jutsu?.rank??this.item.system.effectiveRank,cost=limitBreakingPrice(game,this.actor,({d:1,c:2,b:3,a:4,s:5})[rank]);if(!Number.isSafeInteger(cost)||cost<1)throw Error('Für diesen Rang sind keine Inversion-Kosten belegt.');const pool=taijutsuFeature(this.actor,'Martial Adept');result.item??=[];let row=result.item.find(u=>u._id===pool?.id);if(!row){row={_id:pool?.id};result.item.push(row);}const spent=row['system.uses.spent']??row.system?.uses?.spent??pool?.system.uses.spent;if(!pool||pool.system.uses.max-spent<cost)throw Error('Nicht genügend gemeinsame Martial Dice für Inversion.');if(row.system?.uses)delete row.system.uses.spent;row['system.uses.spent']=spent+cost;entry.dice=cost;}
   if(entry.ruleId==='soul-oppressive-aura'&&entry.data.half){mergeCastingMode(this,{noUpkeep:true,noUpkeepFeatureUuid:entry.sourceUuid,noUpkeepSetting:'taijutsuClassAutomation'});config.chakra??={};config.chakra.maintain=0;}
   entry.data.castState='paid';result.actor??={};const key='flags.'+MODULE_ID+'.taijutsuFeatureActions';if(result.actor[key])throw Error('Konkurrierende Martial-Cast-Zahlung.');result.actor[key]=entries;return result;
  };
  p._finalizeMessageConfig=function(config,message,result){const returned=finish.call(this,config,message,result);if(this.item.getFlag(MODULE_ID,KEY)){message.data.flags??={};message.data.flags[MODULE_ID]??={};message.data.flags[MODULE_ID].castingSnapshot=this.item.toObject();message.data.flags[MODULE_ID][KEY]=this.item.getFlag(MODULE_ID,KEY);}return returned;};
 }
}
