import {songConcentrations} from './genjutsu-song-concentration.mjs';
import {CHRONICLE} from './genjutsu-rituals.mjs';
import {currentTurnEndDeadline} from '../casting/molding-lifetimes.mjs';
import {isGenjutsu} from '../casting/genjutsu-context.mjs';
import {genjutsuEffectData,prepareGenjutsuConditions} from '../effects/genjutsu-effects.mjs';
import {prepareMirageExtras,prepareMirageActivation} from './genjutsu-mirage-extras.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {MIRAGE_CASTS} from '../casting/genjutsu-mirages.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {castingUsage,mergeCastingMode,castingActorBusy} from './mode-adapter.mjs';
import {chooseChakraDice,applyChakraDieSpend,appendFeatureSpend} from './ninjutsu-resource-utils.mjs';

const tickets=new Map(),busy=new WeakSet(),wrapped=new WeakSet(),journal='genjutsuMirageJournal';
export function mirageCastingGrant(item,config=castingUsage(item)){
 const grant=tickets.get(config?.n5ese?.mirageTicket);if(!grant||grant.actorUuid!==item.actor?.uuid||grant.itemId!==item.id||!globalThis.game||!genjutsuEnabled(game))return null;
 const feature=ownedGenjutsuFeature(item.actor,grant.rule.name,grant.rule.category??'Malleable Mirages');return feature?.id===grant.featureId&&sourceOf(item)===grant.jutsuSource?grant:null;
}
export function ownedCastingMirages(actor){return MIRAGE_CASTS.filter(r=>ownedGenjutsuFeature(actor,r.name,r.category??'Malleable Mirages'));}
export async function castMirage(game,actor,name){
 const rule=ownedCastingMirages(actor).find(r=>r.name===name),feature=ownedGenjutsuFeature(actor,name,rule?.category??'Malleable Mirages');
 if(!genjutsuEnabled(game)||!game.settings.get(MODULE_ID,'dynamicChakraCosts')||!actor?.isOwner||!rule||!feature||busy.has(actor)||castingActorBusy(actor))throw Error('Mirage-Cast nicht verfügbar oder ein anderer Cast ist noch offen.');
 if(rule.keenCredit){const credit=actor.getFlag(MODULE_ID,'genjutsuKeenCredit');if(credit?.status!=='available'||credit.turn!==(game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:null))throw Error('Unmittelbarer Keen-Awareness-Reaktionscast nicht verfügbar.');}
 if(rule.chronicle&&!['str','dex'].includes(actor.getFlag(MODULE_ID,CHRONICLE)?.ability))throw Error('Zuerst das tatsächlich während einer Rast ausgeführte Chronicle-Ritual festlegen.');
 if(['applying','paid','review'].includes(actor.getFlag(MODULE_ID,journal)?.status))throw Error('Vorherigen Mirage-Cast zuerst vom GM prüfen lassen.');
 busy.add(actor);
 try{
  let candidates=rule.jutsus.flatMap(j=>{const owned=[...actor.items].filter(i=>i.type==='spell'&&sourceOf(i)===j.source);return owned.length?owned.map(i=>({item:i,source:j.source,name:i.name})): [{source:j.source,name:j.name}];});
  if(rule.knownAction){candidates=[...actor.items].filter(i=>isGenjutsu(i)&&[...i.system.activities].some(a=>a.activation.type==='action')).map(i=>({item:i,source:sourceOf(i),name:i.name}));if(!candidates.length)throw Error('Kein bekanntes Action-Genjutsu verfügbar.');}
  if(rule.knownGenjutsuRank){candidates=[...actor.items].filter(i=>isGenjutsu(i)&&i.system.effectiveRank===rule.knownGenjutsuRank&&[...i.system.activities].some(a=>a.activation.type==='action')).map(i=>({item:i,source:sourceOf(i),name:i.name}));if(!candidates.length)throw Error('Kein bekanntes passendes D-Rang-Action-Genjutsu verfügbar.');}
  if(rule.dynamicGenjutsuRank){const rank=rule.dynamicGenjutsuRank,known=[...actor.items].filter(i=>isGenjutsu(i)&&i.system.effectiveRank===rank).map(i=>({item:i,source:sourceOf(i),name:i.name})),pack=game.packs.get('n5eb.jutsus'),index=pack?await pack.getIndex({fields:['system.jutsu.type','system.rank']}):[];candidates=[...known,...[...index].filter(i=>i.type==='spell'&&i.system?.jutsu?.type==='genjutsu'&&i.system?.rank===rank&&!known.some(k=>k.source==='Compendium.n5eb.jutsus.Item.'+i._id)).map(i=>({source:'Compendium.n5eb.jutsus.Item.'+i._id,name:i.name}))];if(!candidates.length)throw Error('Keine belegten Genjutsu des geforderten Rangs gefunden.');}
  const div=document.createElement('div'),select=document.createElement('select');select.name='jutsu';candidates.forEach((c,index)=>{const o=document.createElement('option');o.value=String(index);o.textContent=c.name+(c.item?' · Inventar':' · Feature gewährt diesen Cast');select.append(o);});div.append(select);
  const p=document.createElement('p');p.textContent=(rule.chronicle?'Tatsächliche Reaktion auf deinen '+actor.getFlag(MODULE_ID,CHRONICLE).ability.toUpperCase()+'-Save bestätigen. Den betroffenen Save nach dem Reaktionscast ausführen: einmaliger Vorteil bis zum aktuellen Zugende; außerhalb des Kampfes bei Abbruch manuell beenden. ':'')+(rule.dynamicGenjutsuRank?'Mit Bestätigung versicherst du ausdrücklich, dass dein Charakter sämtliche Lernvoraussetzungen des gewählten Genjutsu erfüllt. Keine Lernberechtigung oder Inventaränderung wird gewährt. Full-Turn-Action manuell. Danach 3 Confused + 3 Concussed. ':'')+name+': '+({free:'keine Grund-Wirkkosten',half:'halber ungekürzter Rangpreis, danach erlaubte Rabatte',normal:'normale Jutsu-Kosten'}[rule.price])+'. '+(rule.unlimited?'Keine Feature-Nutzungsgrenze.':feature.system.uses.value+' Feature-Nutzungen verfügbar'+(rule.fallbackDice?'; danach '+rule.fallbackDice+' Chakra Dice.':'.'))+' Unterhalt '+(rule.noUpkeep?'ausdrücklich kostenlos.':'normal.')+' Aktionsökonomie und besondere narrative Voraussetzungen bestätigen.';div.append(p);
  const index=await foundry.applications.api.DialogV2.wait({window:{title:name},content:div.innerHTML,buttons:[{action:'cast',label:'Feature-Cast konfigurieren',callback:(_e,b)=>Number(b.form.elements.jutsu.value)}],rejectClose:false});if(index===null||index===undefined)return;
  const candidate=candidates[index];if(!candidate)throw Error('Ungültige Mirage-Jutsu-Auswahl.');
  let die;if(!rule.unlimited&&feature.system.uses.value<1){if(!rule.fallbackDice)throw Error('Keine Mirage-Nutzung verfügbar.');die=await chooseChakraDice(actor,rule.fallbackDice);if(!die)return;}
  let item=candidate.item;
  if(!item){const original=await fromUuid(candidate.source);if(original?.type!=='spell')throw Error('Belegte Jutsu-Quelle nicht verfügbar.');const data=original.toObject();data._id=foundry.utils.randomID();delete data.folder;data._stats??={};data._stats.compendiumSource=candidate.source;data.flags??={};data.flags.core??={};data.flags.core.sourceId=candidate.source;item=new CONFIG.Item.documentClass(data,{parent:actor});}
  if(rule.phantomPain){const data=item.toObject(),level=actor.system.details.level??actor.system.details.genjutsuLevel??1,dice=1+[5,11,17].filter(n=>level>=n).length;for(const a of Object.values(data.system.activities)){a.type='attack';a.attack={ability:actor.system.attributes.jutsu.genjutsu.ability,bonus:'',flat:false,type:{value:'ranged',classification:'spell'}};a.damage={includeBase:false,parts:[],critical:{bonus:''}};delete a.roll;}data.flags??={};data.flags[MODULE_ID]??={};data.flags[MODULE_ID].genjutsuPhantomPain={dice,formula:dice+'d4'};item=new CONFIG.Item.documentClass(data,{parent:actor});}
  const activities=[...item.system.activities].filter(a=>typeof a.use==='function'&&(!(rule.chronicle||rule.knownAction)||a.activation.type==='action'));if(!activities.length)throw Error('Keine unterstützte native Castingaktivität vorhanden.');
  let activity=activities[0];if(activities.length>1){const content=document.createElement('select');content.name='activity';for(const a of activities){const o=document.createElement('option');o.value=a.id;o.textContent=a.name;content.append(o);}const id=await foundry.applications.api.DialogV2.wait({window:{title:'Jutsu-Aktivität'},content:content.outerHTML,buttons:[{action:'choose',label:'Aktivität wählen',callback:(_e,b)=>b.form.elements.activity.value}],rejectClose:false});if(!id)return;activity=activities.find(a=>a.id===id);if(!activity)throw Error('Jutsu-Aktivität nicht verfügbar.');}
  const id=foundry.utils.randomID(),state={id,name,status:'applying',featureId:feature.id,jutsuSource:candidate.source,createdAt:game.time.worldTime},grant={actorUuid:actor.uuid,itemId:item.id,featureId:feature.id,jutsuSource:candidate.source,rule,die,journalId:id};
  tickets.set(id,grant);await actor.setFlag(MODULE_ID,journal,state);
  try{
   const highest=rule.fixedRank??(rule.highestRank?actor.system.attributes.jutsu.known.maxRank:undefined);
   const result=await activity.use({consume:{chakra:true,resources:false,action:false},...(rule.name==='Blade Song'?{subsequentActions:false}:{}),...(highest?{jutsu:{rank:highest}}:{}),n5ese:{mirageTicket:id}},{configure:true},{create:true});
   const current=actor.getFlag(MODULE_ID,journal);if(result?.message&&current?.status==='paid'&&rule.chronicle)await actor.createEmbeddedDocuments('ActiveEffect',[genjutsuEffectData({name:rule.name+' · Reaktions-Save',id:id+':save',actor,feature,lifetime:{deadline:currentTurnEndDeadline(game.combat)},payload:{ruleId:'mirage:chronicle',rolls:[{kind:'save',ability:actor.getFlag(MODULE_ID,CHRONICLE).ability,mode:'advantage',once:true,endsEffect:true}],note:'Nur für den tatsächlich auslösenden eigenen Save. Außerhalb des Kampfes bei Abbruch manuell beenden.'}})]);if(result?.message&&current?.status==='paid'&&rule.selfConditions?.length)await actor.createEmbeddedDocuments('ActiveEffect',[genjutsuEffectData({name:rule.name+' · Folge',id:id+':self',actor,feature,lifetime:{},payload:{ruleId:'mirage:'+rule.name,messageId:result.message.id,conditions:prepareGenjutsuConditions(game,actor,rule.selfConditions)}})]);state.status=result?.message?'applied':current?.status==='paid'?'review':'cancelled';state.messageId=result?.message?.id;await actor.setFlag(MODULE_ID,journal,state);return result;
  }catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,journal,state);throw error;}finally{tickets.delete(id);}
 }finally{busy.delete(actor);}
}
export async function resolveMirage(game,actor){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');const state=actor.getFlag(MODULE_ID,journal);if(!['applying','paid','review'].includes(state?.status))throw Error('Kein unterbrochener Mirage-Cast.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Mirage-Cast prüfen'},content:'<p>Chatkarte, Chakra, Feature-Nutzung und Chakra Dice manuell geprüft/korrigiert? Ohne erneutes Wirken abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,journal,{...state,status:'resolved'});
}
export function installMirageCasting(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageScaling'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const scale=p._prepareUsageScaling,prepare=p._prepareUsageUpdates,finish=p._finalizeMessageConfig;
  p._prepareUsageScaling=async function(config,message,item){
   const grant=mirageCastingGrant(item,config);if(config.n5ese?.mirageTicket&&!grant)throw Error('Mirage-Cast-Zusage ungültig.');
   if(grant){const rule=grant.rule,patch={};if(rule.genjutsu){patch['system.jutsu.type']='genjutsu';patch['system.jutsu.keywords']=[...new Set([...item.system.jutsu.keywords].filter(k=>k!=='ninjutsu').concat(['genjutsu','visual']))];}if(rule.components)patch['system.jutsu.components']=rule.components;if(Object.keys(patch).length){item.updateSource(patch);item.prepareFinalAttributes?.();}}
   if(grant)prepareMirageActivation(item,grant);
   const result=await scale.call(this,config,message,item);
   if(grant)prepareMirageExtras(item,grant,config);
   if(grant)item.updateSource({['flags.'+MODULE_ID+'.genjutsuMirageCast']:{id:grant.journalId,name:grant.rule.name,source:grant.jutsuSource,featureId:grant.featureId,price:grant.rule.price,noUpkeep:!!grant.rule.noUpkeep,chakraDice:grant.die?.count??0}});return result;
  };
  p._prepareUsageUpdates=async function(config,options){
   const grant=mirageCastingGrant(this.item,config);if(config.n5ese?.mirageTicket&&!grant)throw Error('Mirage-Cast-Zusage ungültig.');
   if(grant){if(grant.rule.keenCredit){const credit=this.actor.getFlag(MODULE_ID,'genjutsuKeenCredit');if(credit?.status!=='available'||credit.turn!==(game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:null))throw Error('Keen-Awareness-Reaktion inzwischen nicht mehr verfügbar.');}
   if(grant.rule.fixedRank&&(config.jutsu?.rank??this.item.system.effectiveRank)!==grant.rule.fixedRank)throw Error('Dieser Feature-Cast muss im festgelegten Rang erfolgen.');if(config.cause||!(config.consume===true||config.consume?.chakra===true))throw Error('Mirage verlangt einen bestätigten normalen Cast.');if(grant.rule.highestRank&&(config.jutsu?.rank??this.item.system.effectiveRank)!==this.actor.system.attributes.jutsu.known.maxRank)throw Error('Black Fangs wirkt mit dem höchsten verfügbaren Rang.');if(grant.rule.self&&([...game.user.targets].filter(t=>t.actor).length!==1||![...game.user.targets].some(t=>t.actor?.uuid===this.actor.uuid)))throw Error('Illusionary Brawler: ausschließlich dich selbst als Ziel markieren.');if(grant.rule.price==='free'&&config.n5ese?.chakraRecovery)throw Error('Kostenloser Mirage-Cast benötigt keine Chakra Recovery.');}
   const priorConcentration=config.concentration,song=grant?.rule.name==='Song of the End'&&priorConcentration?.begin&&songConcentrations(game,this.actor).length>0;if(song)config.concentration={...priorConcentration,begin:false,end:null};let updates;try{updates=await prepare.call(this,config,options);}finally{if(song)config.concentration={...priorConcentration,begin:true,end:null};}if(!grant||!updates||Array.isArray(updates))return updates;
   if(grant.rule.keenCredit)updates.actor['flags.'+MODULE_ID+'.genjutsuKeenCredit']={...this.actor.getFlag(MODULE_ID,'genjutsuKeenCredit'),status:'used'};
   if(grant.die)applyChakraDieSpend(this.actor,grant.die,updates);else if(!grant.rule.unlimited)appendFeatureSpend(updates,this.actor.items.get(grant.featureId));
   const rank=config.jutsu?.rank??this.item.system.effectiveRank,api=game.modules.get(MODULE_ID).api,cost=api.previewJutsuCost(this.item,{rank,ignoreMirageGrant:true,ignorePostCostSurcharge:true,ignoreVoidSurcharge:true,ignoreMoldingCost:true,classFeatures:config.n5ese?.classFeatures,pools:config.n5ese?.pools,martialTechnique:config.n5ese?.martialTechnique}).finalCost*(config.n5eb?.shockedCostMultiplier??1);
   mergeCastingMode(this,{upkeepChakraCost:cost,noUpkeep:!!grant.rule.noUpkeep,noUpkeepFeatureUuid:grant.rule.noUpkeep?this.actor.items.get(grant.featureId).uuid:undefined,noUpkeepSetting:'genjutsuClassAutomation'});
   config.chakra??={};config.chakra.maintain=grant.rule.noUpkeep?0:api.previewMaintainCost(this.item,{rank,cost}).finalCost;
   updates.actor['flags.'+MODULE_ID+'.'+journal]={...this.actor.getFlag(MODULE_ID,journal),status:'paid'};return updates;
  };
  p._finalizeMessageConfig=function(config,message,updates){const result=finish.call(this,config,message,updates),record=this.item.getFlag(MODULE_ID,'genjutsuMirageCast');if(record&&genjutsuEnabled(game)){message.data.flags??={};message.data.flags[MODULE_ID]??={};Object.assign(message.data.flags[MODULE_ID],{genjutsuMirageCast:record,castingSnapshot:this.item.toObject()});}return result;};
 }
}
