import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature,taijutsuLevel,martialDie,unarmedDie,isTaijutsu} from '../casting/taijutsu-context.mjs';
import {registerFeatureAction,activeFeatureAction,featureActions} from './taijutsu-feature-actions.mjs';
import {martialDialog} from '../ui/martial-dialog.mjs';
import {currentTurnEndDeadline} from '../casting/molding-lifetimes.mjs';
const releases={earth:'earth',wind:'wind',fire:'fire',water:'cold',lightning:'lightning'};
const change=(key,value)=>({key,value,type:'add',priority:20});
export function natureForm(game,actor){return actor&&activeFeatureAction(game,actor,'nin-tai-nature');}
export function natureActionAvailable(game,actor,nature,armor=false){const form=game&&natureForm(game,actor);return !!form&&actor.getFlag(MODULE_ID,'taijutsuNature')===nature&&form.data.nature===nature&&(!armor||!!form.data.armor);}
export function prepareNatureCastingClone(game,activity){const item=activity.item,form=natureForm(game,item.actor);if(!form||!isTaijutsu(item)||!taijutsuFeature(item.actor,'Elemental Combat','Nin-Tai'))return;if(item===item.actor.items.get(item.id))throw Error('Nature Release benötigt einen nativen Casting-Klon.');item.updateSource({'system.jutsu.keywords':[...new Set([...item.system.jutsu.keywords,form.data.nature])],['flags.'+MODULE_ID+'.taijutsuNatureCast']:{nature:form.data.nature,armor:form.data.armor}});item.prepareFinalAttributes?.();}
/** Append upkeep after native recovery to the same update batch. No document writes in this hook. */
export function prepareNatureTurn(game,combatant,periods,results){
 const actor=combatant.actor,combat=combatant.combat,form=natureForm(game,actor);
 if(!form||!periods.includes('turnStart')||!combat?.started||combat.combatant?.id!==combatant.id)return;
 appendNatureTurn(game,actor,form,[combat.id,combat.round,combat.turn,combatant.id].join(':'),results);
}
export function prepareManualNatureTurn(game,actor,turn,results){const form=natureForm(game,actor);if(form)appendNatureTurn(game,actor,form,turn,results);}
function appendNatureTurn(game,actor,form,turn,results){
 if(form.data.armor&&actor.getFlag(MODULE_ID,'taijutsuArmorUpkeepTurn')!==turn){
  const pool=taijutsuFeature(actor,'Martial Adept');let update=pool&&results.item.find(u=>u._id===pool.id);
  const spent=pool&&(update?.['system.uses.spent']??update?.system?.uses?.spent??update?.['system.uses']?.spent??pool.system.uses.spent);
  results.actor['flags.'+MODULE_ID+'.taijutsuArmorUpkeepTurn']=turn;
  if(!pool||!Number.isSafeInteger(spent)||!Number.isSafeInteger(pool.system.uses.max)||results.delete.includes(pool.id)||pool.system.uses.max-spent<1){
   const entries=featureActions(actor),entry=entries.find(e=>e.id===form.id);if(entry){entry.status='ended';entry.reason='insufficient-armor-upkeep';entry.endedAt=game.time.worldTime;results.actor['flags.'+MODULE_ID+'.taijutsuFeatureActions']=entries;}return;
  }
  if(!update){update={_id:pool.id};results.item.push(update);}if(update.system?.uses)delete update.system.uses.spent;if(update['system.uses'])delete update['system.uses'].spent;update['system.uses.spent']=spent+1;
 }
 if(form.data.nature==='earth'){const amount=Math.ceil(actor.system.details.level/2)*(form.data.armor?2:1),pending=results.actor['system.attributes.hp.temp']??results.actor.system?.attributes?.hp?.temp??actor.system.attributes.hp.temp??0;results.actor['system.attributes.hp.temp']=Math.max(pending,amount);}
}
export async function chooseNinTaiNature(game,actor){
 if(!taijutsuEnabled(game)||!actor.isOwner||!taijutsuFeature(actor,'Nature Enhanced Combat','Nin-Tai'))throw Error('Eigenes Nature Enhanced Combat erforderlich.');
 if(natureForm(game,actor))throw Error('Vor einer Korrektur die aktive Form beenden.');
 if(actor.getFlag(MODULE_ID,'taijutsuNature')&&!game.user.isGM)throw Error('Die feste Nature-Wahl darf nur der GM korrigieren.');
 const choice=await martialDialog('Nature Enhanced Combat · feste Natur','Die tatsächliche Klassenwahl speichern. Dies erzeugt keine Jutsu und verändert keine ursprünglichen Items.',[{name:'nature',label:'Nature Release',options:Object.keys(releases).map(value=>({value,label:value+' Release'}))}]);
 if(!choice)return;if(!Object.hasOwn(releases,choice.nature))throw Error('Ungültige Natur.');await actor.setFlag(MODULE_ID,'taijutsuNature',choice.nature);
}
export function registerNinTaiActions(){
 registerFeatureAction({id:'nin-tai-crush-recharge',name:'Elemental Crush · wiederaufladen',feature:'Elemental Combat',category:'Nin-Tai',unique:false,async plan({actor}){const debt=actor.getFlag(MODULE_ID,'taijutsuCrushDebt');if(!Number.isSafeInteger(debt?.dice)||debt.dice<1)throw Error('Kein bezahlter Elemental Crush zum Wiederaufladen.');if(!await martialDialog('Elemental Crush · wiederaufladen',debt.dice+' Martial Dice zum Wiederaufladen bezahlen. Unterbrochene ursprüngliche Treffer zuerst vom GM prüfen.',[]))return;const hit=(actor.getFlag(MODULE_ID,'taijutsuHitPayments')??[]).find(e=>e.id===debt.paymentId);if(!hit||!['paid','applied','resolved'].includes(hit.status))throw Error('Ursprünglichen Treffer zuerst prüfen.');return {dice:debt.dice,data:{debt}};},async apply({actor,entry}){if(actor.getFlag(MODULE_ID,'taijutsuCrushDebt')?.paymentId!==entry.data.debt.paymentId)throw Error('Gespeicherter Crush wurde verändert.');await actor.unsetFlag(MODULE_ID,'taijutsuCrushDebt');}});
 for(const [id,name,feature,count,text]of [
  ['rush','Elemental Rush','Elemental Combat',2,'Tatsächlich mindestens zwei Nahkampf-Taijutsu-Treffer erzielt; zwei unbewaffnete Reaktionsangriffe.'],
  ['dash','Lightning Cloak · Dash-Angriff','Elemental Cloak',1,'Tatsächlich Dash mit aktivem Lightning Cloak: ein unbewaffneter Angriff als Teil derselben Action.']
 ])registerFeatureAction({id:'nin-tai-'+id,name,feature,category:'Nin-Tai',available:({game,actor})=>id==='dash'?natureActionAvailable(game,actor,'lightning'):!!game&&!!natureForm(game,actor),async plan({game,actor}){const form=natureForm(game,actor);if(!form||id==='dash'&&form.data.nature!=='lightning')throw Error('Passende aktive Nature-Form erforderlich.');if(!await martialDialog(name,text+' Aktionsökonomie manuell; Ziele für die bezahlten Angriffe einzeln markieren.',[]))return;return {dice:id==='rush'?1:0,data:{activation:id==='rush'?'reaction':'action',attacks:Array.from({length:count},(_,index)=>({index,status:'pending',chooseTarget:true}))},lifetime:{deadline:currentTurnEndDeadline(game.combat)},effects:[{}]};}});
 registerFeatureAction({id:'nin-tai-nature',name:'Nature Enhanced Combat / Elemental Armor',feature:'Nature Enhanced Combat',category:'Nin-Tai',async plan({game,actor}){
  const nature=actor.getFlag(MODULE_ID,'taijutsuNature');if(!Object.hasOwn(releases,nature))throw Error('Zuerst die feste Nature Release wählen.');
  const armor=!!taijutsuFeature(actor,'Elemental Armor','Nin-Tai'),choice=await martialDialog('Nature Enhanced Combat','1 Martial Die. Normale Form: eine Minute. Elemental Armor: ohne feste Höchstdauer, 1 Martial Die am eigenen Zugbeginn; ausdrückliches Beenden als Bonusaktion manuell verwalten.',[{name:'convert',type:'checkbox',label:'Unarmed-Schaden in '+releases[nature]+' konvertieren',value:true},...(armor?[{name:'armor',type:'checkbox',label:'Elemental Armor mit laufendem Unterhalt',value:false}]:[])]);if(!choice)return;
  const changes=[],cloak=!!taijutsuFeature(actor,'Elemental Cloak','Nin-Tai');if(cloak)changes.push(change('system.traits.dr.value',releases[nature]));
  if(cloak&&nature==='earth')for(const type of Object.keys(CONFIG.DND5E.damageTypes).filter(t=>t!=='psychic'))changes.push(change('system.traits.dm.amount.'+type,'-4'));
  if(choice.armor&&nature==='wind')for(const type of ['grappled','restrained'])changes.push(change('system.traits.ci.value',type));
  return {dice:1,data:{nature,type:releases[nature],convert:!!choice.convert,armor:!!choice.armor},lifetime:choice.armor?undefined:{expiresAt:game.time.worldTime+60},effects:[{changes}]};
 }});
 registerFeatureAction({id:'nin-tai-recharge',name:'Elemental Recharge',feature:'Elemental Recharge',category:'Nin-Tai',unique:false,async plan({actor}){
  const nature=actor.getFlag(MODULE_ID,'taijutsuNature');if(!Object.hasOwn(releases,nature))throw Error('Feste Nature Release erforderlich.');
  const c=await martialDialog('Elemental Recharge','Tatsächlich Schaden vom zugehörigen Typ '+releases[nature]+' durch ein Jutsu erlitten. Tatsächlichen Rang bestätigen; Reaktion manuell. Eine native Nutzung pro langer Rast bezahlen.',[{name:'rank',label:'Rang des auslösenden Jutsu',options:['D','C','B','A','S'].map(value=>({value,label:value}))}]);if(!c)return;
  const table={D:[10,1],C:[15,2],B:[20,3],A:[30,4],S:[40,5]},values=table[c.rank];if(!values)throw Error('Belegter Rang erforderlich.');return {nativeUse:1,data:{rank:c.rank,hp:values[0],dice:values[1]}};
 },async apply({actor,entry}){const pool=taijutsuFeature(actor,'Martial Adept');if(!pool)throw Error('Martial-Pool fehlt; GM-Prüfung erforderlich.');await actor.update({'system.attributes.hp.value':Math.min(actor.system.attributes.hp.max,actor.system.attributes.hp.value+entry.data.hp)});await pool.update({'system.uses.spent':Math.max(0,pool.system.uses.spent-entry.data.dice)});return {healing:entry.data.hp,recoveredDice:entry.data.dice};}});
}
export function installNinTai(game,types){registerNinTaiActions();const messages=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_finalizeMessageConfig'))p=Object.getPrototypeOf(p);if(!p||messages.has(p))continue;messages.add(p);const original=p._finalizeMessageConfig;p._finalizeMessageConfig=function(config,message,updates){const result=original.call(this,config,message,updates);if(taijutsuEnabled(game)&&this.item.getFlag(MODULE_ID,'taijutsuNatureCast')){message.data.flags??={};message.data.flags[MODULE_ID]??={};message.data.flags[MODULE_ID].castingSnapshot=this.item.toObject();}return result;};}
 const attacks=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||attacks.has(p))continue;attacks.add(p);const original=p.rollAttack;p.rollAttack=function(config={},...args){const r=taijutsuEnabled(game)&&this.item?.getFlag(MODULE_ID,'taijutsuCast');if(r?.ninTai)config={...config,rolls:(config.rolls?.length?config.rolls:[{}]).map((roll,i)=>i?roll:{...roll,options:{...roll.options,criticalSuccess:Math.min(10,this.criticalThreshold,roll.options?.criticalSuccess??20)}})};return original.call(this,config,...args);};}
 const seen=new WeakSet(),done=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'getDamageConfig'))p=Object.getPrototypeOf(p);if(!p||seen.has(p))continue;seen.add(p);const original=p.getDamageConfig;p.getDamageConfig=function(...args){const result=original.apply(this,args),form=natureForm(game,this.actor);if(!form||done.has(result))return result;done.add(result);const record=this.item?.getFlag(MODULE_ID,'taijutsuCast'),unarmed=this.attack?.type?.classification==='unarmed',tai=isTaijutsu(this.item)&&taijutsuFeature(this.actor,'Elemental Combat','Nin-Tai');
  const part=unarmed?result.rolls?.find(r=>r.base)??result.rolls?.[0]:record?.actualUnarmed?result.rolls?.[record.part]:null;
  if(form.data.armor&&form.data.nature==='lightning'&&taijutsuFeature(this.actor,'Wrath Of Nature','Nin-Tai')&&(tai||unarmed&&this.attack?.type?.value==='melee'))for(const roll of result.rolls??[]){roll.options??={};roll.options.n5eseLightningWrath=true;}if(tai){for(const roll of result.rolls??[])if(!CONFIG.DND5E.healingTypes[roll.options?.type]&&roll.options?.type!=='chakra'){roll.options??={};roll.options.type=form.data.type;roll.options.types=[form.data.type];}}
  else if(part&&form.data.convert){part.options??={};part.options.type=form.data.type;part.options.types=[form.data.type];}
  if(part&&form.data.nature==='fire'){part.parts.push('1d'+martialDie(taijutsuLevel(this.actor)));if(form.data.armor)part.parts.push('1d'+unarmedDie(taijutsuLevel(this.actor)));}
  return result;};}}
