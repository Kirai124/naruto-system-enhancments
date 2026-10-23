import {medicalFeatureOrigin} from './medical-companions.mjs';
import {applyCombatProwess} from './medical-combat.mjs';
import {addWarriorBenefitFields,warriorBenefitChoice,validateWarriorBenefits,removeWarriorBenefits} from './medical-warrior-benefits.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalLevel,medicalFeature,isMedical,medicalRankValue,medicalTurn,medicalModifier} from '../casting/medical-context.mjs';
import {channeledHealing,healingBonuses,healingDice,healingDieLimits,preserveAllocation,rejuvenatingDice,medicalSelfHealing} from '../casting/medical-rules.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {grantMedicalTempHP} from './medical-temp-hp.mjs';
import {groupRolledDamage} from '../casting/genjutsu-damage.mjs';
import {medicalTakeLifeAmount} from '../casting/medical-rules.mjs';

export const MEDICAL_ACTIONS='medicalActions';
const managers=new WeakMap(),entries=actor=>structuredClone(actor.getFlag(MODULE_ID,MEDICAL_ACTIONS)??[]);
const requireOwner=(game,actor)=>{if(!medicalEnabled(game)||!actor?.isOwner||!medicalLevel(actor))throw Error('Medical-Nin-Automation und Quellenberechtigung erforderlich.');};
const title={cast:'Medical-Jutsu-Heilung',rest:'Rejuvenating Rest',natural:'Natural Healing',preserve:'Preserve Life',take:'Take Life'};
const featureName={cast:'Medical Ninjutsu',rest:'Rejuvenating Rest',natural:'Natural Healing',preserve:'Preserve/Take Life',take:'Preserve/Take Life'};
function context(game,actor,id){
 requireOwner(game,actor);const entry=entries(actor).find(e=>e.id===id),feature=entry&&medicalFeature(actor,featureName[entry.kind]);
 if(!entry||entry.status!=='paid'||!feature)throw Error('Bestätigter Medical-Vorgang fehlt oder ist zur Prüfung gesperrt.');
 const message=entry.messageId&&game.messages.get(entry.messageId);
 if(['cast','take'].includes(entry.kind)&&(!message||JSON.stringify(message.rolls.map(r=>r.toJSON()))!==entry.rollFingerprint||message.getAssociatedActor()?.uuid!==actor.uuid))throw Error('Ursprünglicher Wurf wurde entfernt oder verändert.');
 const usageId=message?.getFlag('n5eb','originatingMessage'),usage=usageId&&game.messages.get(usageId);
 if(usage?.system?.deltas===null)throw Error('Ursprünglicher Cast wurde erstattet.');
 return {entry,feature,message,record:{castId:entry.id},rule:{source:feature.uuid}};
}
export async function applyMedicalHealing(target,amount,options={}){
 const marker=foundry.utils.randomID();let applied=false,effectiveAmount=0;
 const hook=Hooks.on('dnd5e.applyDamage',(actor,_amount,opts)=>{if(actor===target&&opts.n5eseMedicalReceipt===marker){applied=true;effectiveAmount=Math.max(0,-_amount);}});
 const before=target.system.attributes.hp.value;
 try{await target.applyDamage([{type:'healing',value:Math.max(0,amount),properties:new Set()}],{...options,n5eseMedicalReceipt:marker});}finally{Hooks.off('dnd5e.applyDamage',hook);}
 if(!applied)throw Error('Native Heilungsanwendung wurde unterbrochen; GM-Prüfung erforderlich.');
 return {effectiveAmount,before,after:target.system.attributes.hp.value,restored:Math.max(0,target.system.attributes.hp.value-before)};
}
export function medicalHealingWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{
  storage:'medicalRequests',id:()=>foundry.utils.randomID(),resolve:uuid=>fromUuid(uuid),owner:actor=>requireOwner(game,actor),
  context:(actor,_messageId,id)=>context(game,actor,id),
  allowOwnerApply:(_ctx,targets)=>targets.every(t=>t.isOwner),
  prepare(ctx,request,targets){
   if(JSON.stringify(request.targets.map(t=>t.uuid))!==JSON.stringify(ctx.entry.targets.map(t=>t.uuid)))throw Error('Bestätigte Medical-Ziele verändert.');
   const allocation=ctx.entry.kind==='preserve'?preserveAllocation(ctx.feature.actor,targets,ctx.entry.amounts,{stoneWill:!!medicalFeature(ctx.feature.actor,'Stone Will','Diamond Heart')}):null;
   if(ctx.entry.kind==='take')validateWarriorBenefits(ctx.feature.actor,targets[0],ctx.entry.warrior);
   return targets.map((target,i)=>({targetUuid:target.uuid,amount:allocation?.[i].amount??ctx.entry.amount,resetDeathSaves:!!allocation,deathFailure:target.system.attributes.death?.failure??0}));
  },
  confirm(ctx,_request,plans){
   if(ctx.entry.kind==='take'){const p=document.createElement('p');p.textContent='Ursprünglichen Treffer und '+ctx.entry.amount+' zusätzlichen '+ctx.entry.damageType+'-Schaden gemeinsam anwenden? Der Originaltreffer darf noch nicht angewendet worden sein. Native Verteidigungen und DR werden einmal berechnet.';return foundry.applications.api.DialogV2.confirm({window:{title:'Take Life · gemeinsamen Treffer anwenden'},content:p.outerHTML,rejectClose:false});}
   const div=document.createElement('div'),p=document.createElement('p');p.textContent=title[ctx.entry.kind]+': '+plans.map(p=>p.amount+' HP').join(', ')+'. Auf ausschließlich tatsächlich betroffene Ziele anwenden? Reichweite, Berührung und Auslöser bestätigen. Der ursprüngliche Heilungswurf darf noch nicht separat angewendet worden sein.';div.append(p);
   if(ctx.entry.breakdown?.length){const b=document.createElement('p');b.textContent=ctx.entry.breakdown.join(' · ');div.append(b);}
   return foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Heilung bestätigen'},content:div.innerHTML,rejectClose:false});
  },
  async apply(target,plan,ctx,request){
   const source=ctx.feature.actor,entry=ctx.entry,hp=target.system.attributes.hp;
   if(entry.kind==='take'){
    await removeWarriorBenefits(source,target,entry.warrior);
    const parts=structuredClone(entry.damage),part=parts.find(p=>p.type===entry.damageType);part.value+=entry.amount;
    let applied=false;const hook=Hooks.on('dnd5e.applyDamage',(a,_n,opts)=>{if(a===target&&opts.n5eseMedicalRequest===request.id)applied=true;});
    const before=hp.value;try{await target.applyDamage(parts.map(p=>({...p,properties:new Set(p.properties)})),{n5eseMedicalRequest:request.id,n5eseMedicalSource:source.uuid,n5eseMedicalBonusesHandled:true,originatingMessage:ctx.message});}finally{Hooks.off('dnd5e.applyDamage',hook);}
    if(!applied)throw Error('Native Trefferanwendung unterbrochen; GM-Prüfung erforderlich.');await applyCombatProwess(game,target,source,{...entry,choices:{take:true}});return {before,after:target.system.attributes.hp.value,bonus:entry.amount};
   }
   if(entry.kind==='preserve'&&plan.amount>Math.max(0,Math.floor(hp.effectiveMax/2)-hp.value))throw Error('Ziel-HP seit der Bestätigung verändert; GM muss die Verteilung prüfen.');
   const receipt=await applyMedicalHealing(target,plan.amount,{n5eseMedicalRequest:request.id,originatingMessage:ctx.message});
   if(plan.resetDeathSaves)await target.update({'system.attributes.death.failure':0});
   const temp=(amount,rule,mode='normal')=>grantMedicalTempHP(target,{sourceActorUuid:source.uuid,rule,amount,mode,itemUuid:ctx.message?.getAssociatedItem()?.uuid});
   if(entry.kind==='natural')await temp(3*entry.dice,'natural-healing');
   if(entry.kind==='rest'&&medicalFeature(source,'Consolation','Counselor-Nin'))await temp(Math.max(0,Math.floor(plan.amount/2)+medicalModifier(source)),'consolation');
   if(entry.consolation)await temp(entry.consolation,'consolation');
   if(entry.doctrine&&receipt.restored>0&&medicalRankValue(entry.rank)>0){
    const state=target.getFlag(MODULE_ID,'medicalRecipientUses')??{};
    if((state.longLife??0)<2){const granted=await temp(5*medicalRankValue(entry.rank),'long-life');if(granted)await target.setFlag(MODULE_ID,'medicalRecipientUses',{...state,longLife:(state.longLife??0)+1});}
   }
   if(medicalLevel(source)>=9&&medicalFeature(source,'Talented Healer','Adept Medic')&&receipt.restored>0)await temp(Math.floor(receipt.restored/2),'talented-healer');
   if(medicalFeature(source,'Over Heal','Adept Medic')&&receipt.effectiveAmount>receipt.restored&&target.system.attributes.hp.value===target.system.attributes.hp.effectiveMax){
    const state=target.getFlag(MODULE_ID,'medicalRecipientUses')??{};
    if(!(state.overHealUntil>game.time.worldTime)){
     const bonus=Math.floor((receipt.effectiveAmount-receipt.restored)/2);
     if(bonus){const granted=await temp(bonus,'over-heal','same-source');if(granted)await target.setFlag(MODULE_ID,'medicalRecipientUses',{...state,overHealUntil:game.time.worldTime+60});}
    }
   }
   return receipt;
  },
  async finalize(ctx,request,_plans,targets){
   const source=ctx.feature.actor,entry=ctx.entry,self=entry.kind==='cast'&&targets.some(t=>t.uuid!==source.uuid)?medicalSelfHealing(source,entry.rank):0;
   if(self)await applyMedicalHealing(source,self,{n5eseMedicalRequest:request.id});
   const list=entries(source),fresh=list.find(e=>e.id===entry.id);fresh.status='applied';await source.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);
  }
 });managers.set(game,manager);return manager;
}
function targetRefs(game){return [...new Map([...game.user.targets].filter(t=>t.actor).map(t=>[t.actor.uuid,{uuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}])).values()];}
function diceSelector(host,dice,name,label,limit){
 if(!limit)return;const p=document.createElement('p');p.textContent=label+' · höchstens '+limit+' ursprüngliche Würfel';host.append(p);
 for(const die of dice){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name=name;input.value=die.id;l.append(input,document.createTextNode('d'+die.faces+': '+die.value));host.append(l,document.createElement('br'));}
}
export async function requestMedicalHealing(game,actor,kind,{messageId}={}){
 requireOwner(game,actor);return withCastingActorLock(actor,async()=>{
  const feature=medicalFeature(actor,featureName[kind]);if(!feature)throw Error('Passendes tatsächlich besessenes Medical-Feature fehlt.');
  const targets=targetRefs(game);if(!targets.length||kind==='natural'&&targets.length!==1)throw Error('Tatsächlich betroffene Ziele markieren; Natural Healing benötigt genau eines.');
  const list=entries(actor);if(list.some(e=>['paying','rolling','review'].includes(e.status)))throw Error('Unterbrochenen Medical-Vorgang zuerst vom GM prüfen lassen.');
  const message=messageId&&game.messages.get(messageId),item=message?.getAssociatedItem?.(),snapshot=message?.getFlag(MODULE_ID,'medicalHealingRoll');
  if(kind==='cast'&&(!snapshot||item?.type!=='spell'||message.getAssociatedActor()?.uuid!==actor.uuid||!message.rolls?.length))throw Error('Eigener ursprünglicher Medical-Heilungswurf erforderlich.');
  if(kind==='cast'&&list.some(e=>e.messageId===messageId&&e.status!=='cancelled'))throw Error('Dieser Heilungswurf hat bereits einen Vorgang. Offene Anfrage im Sheet fortsetzen.');
  const rank=snapshot?.rank,dice=kind==='cast'?healingDice(message):[],limits=kind==='cast'?healingDieLimits(actor,item,rank):{reroll:0,maximize:0};
  const div=document.createElement('div'),note=document.createElement('p');note.textContent=targets.map(t=>t.name).join(', ')+'. Auslöser, Reichweite und tatsächliche Wirkung bestätigen. Nach Bestätigung werden Ressourcen bezahlt; fremde Ziele erhalten eine gespeicherte GM-Anfrage.';div.append(note);
  if(kind==='preserve'){
   const mending=medicalFeature(actor,'Preserve Life: Mending Presence','Adept Medic');if(mending){const select=document.createElement('select');select.name='preservePool';for(const [value,label]of [['shared','Gemeinsamer Preserve-/Take-Life-Pool: '+feature.system.uses.value],['mending','Mending Presence (nur Heilung, lange Rast): '+mending.system.uses.value]]){const option=document.createElement('option');option.value=value;option.textContent=label;if(value==='mending'&&feature.system.uses.value<1)option.setAttribute('selected','');select.append(option);}div.append(select);}
   note.append(document.createTextNode(' Budget: '+5*medicalLevel(actor)+' HP; bis zur halben maximalen HP.'));
   for(const ref of targets){const label=document.createElement('label'),input=document.createElement('input');input.type='number';input.name='allocation';input.dataset.uuid=ref.uuid;input.min='0';input.step='1';input.value='0';label.append(document.createTextNode(ref.name+' · Heilung '),input);div.append(label,document.createElement('br'));}
  }
  if(kind==='natural'){const input=document.createElement('input');input.type='number';input.name='dice';input.min='1';input.max=String(feature.system.uses.value);input.step='1';input.value='1';div.append(input);}
  const turn=medicalTurn(game),channel=kind==='cast'&&isMedical(item)&&medicalFeature(actor,'Channeled Healing')&&medicalRankValue(rank)>0&&!list.some(e=>e.channel&&e.turn===turn&&turn!==null&&!['cancelled','resolved'].includes(e.status));
  if(channel){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='channel';input.setAttribute('checked','');l.append(input,document.createTextNode('Channeled Healing: +'+channeledHealing(medicalLevel(actor))+(medicalFeature(actor,'Consolation','Counselor-Nin')?' temporäre HP':' Heilung')+' auf alle Ziele dieses Vorgangs. Außerhalb des Kampfes Zuggrenze selbst bestätigen.'));div.append(l);}
  diceSelector(div,dice,'maximize','Supreme Healer',limits.maximize);diceSelector(div,dice,'reroll','Gifted Healer',limits.reroll);
  const selected=await foundry.applications.api.DialogV2.wait({window:{title:title[kind]},content:div.innerHTML,buttons:[{action:'confirm',label:'Vorgang bestätigen',callback:(_e,b)=>({preservePool:b.form.elements.preservePool?.value??'shared',amounts:[...b.form.querySelectorAll('[name="allocation"]')].map(i=>Number(i.value)),dice:Number(b.form.elements.dice?.value??0),channel:!!b.form.elements.channel?.checked,maximize:[...b.form.querySelectorAll('[name="maximize"]:checked')].map(i=>i.value),reroll:[...b.form.querySelectorAll('[name="reroll"]:checked')].map(i=>i.value)})}],rejectClose:false});if(!selected)return;
  if(selected.maximize.length>limits.maximize||selected.reroll.length>limits.reroll||[...selected.maximize,...selected.reroll].some(id=>!dice.some(d=>d.id===id))||selected.maximize.some(id=>selected.reroll.includes(id)))throw Error('Würfelgrenzen beachten; Gifted und Supreme bearbeiten verschiedene ursprüngliche Würfel.');
  const actualTargets=await Promise.all(targets.map(async t=>(await fromUuid(t.tokenUuid))?.actor));if(actualTargets.some((t,i)=>!t||t.uuid!==targets[i].uuid))throw Error('Zielzuordnung verändert.');
  if(kind==='preserve')preserveAllocation(actor,actualTargets,selected.amounts,{stoneWill:!!medicalFeature(actor,'Stone Will','Diamond Heart')});
  const paymentFeature=kind==='preserve'&&selected.preservePool==='mending'?medicalFeature(actor,'Preserve Life: Mending Presence','Adept Medic'):feature;if(!paymentFeature)throw Error('Gewählter Medical-Ressourcenpool fehlt.');
  const spend=kind==='preserve'?1:kind==='natural'?selected.dice:0;
  if((kind==='natural'||spend)&&(!Number.isSafeInteger(spend)||spend<1||paymentFeature.system.uses.value<spend))throw Error('Nicht genügend Medical-Nutzungen oder Heilwürfel.');
  const entry={origin:medicalFeatureOrigin(actor),id:foundry.utils.randomID(),kind,messageId,targets,rank,turn,at:game.time.worldTime,status:'paying',paymentFeatureId:paymentFeature.id,dice:selected.dice,amounts:selected.amounts,channel:channel&&selected.channel,doctrine:kind==='cast'&&!!medicalFeature(actor,'Long Life, Short Death'),rollFingerprint:message&&JSON.stringify(message.rolls.map(r=>r.toJSON())),breakdown:[],rolls:[]};
  list.push(entry);await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);
  try{
   if(spend){const updates={item:[]};if(kind==='preserve')appendFeatureSpend(updates,paymentFeature);else updates.item.push({_id:feature.id,'system.uses.spent':feature.system.uses.spent+spend});await actor.updateEmbeddedDocuments('Item',updates.item);}
   entry.status='rolling';await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);
   let amount=kind==='cast'?message.rolls.reduce((n,r)=>n+r.total,0):0;
   if(kind==='rest'||kind==='natural'){
    const formula=(kind==='rest'?rejuvenatingDice(medicalLevel(actor)):selected.dice)+'d6',roll=await new Roll(formula).evaluate();entry.rolls.push(roll.toJSON());amount=roll.total;
   }
   for(const id of selected.maximize){const die=dice.find(d=>d.id===id);amount+=die.faces-die.value;entry.breakdown.push('Supreme: '+die.value+' → '+die.faces);}
   for(const id of selected.reroll){const die=dice.find(d=>d.id===id),roll=await new Roll('1d'+die.faces).evaluate();entry.rolls.push(roll.toJSON());amount+=Math.max(0,roll.total-die.value);entry.breakdown.push('Gifted: '+die.value+' → '+Math.max(roll.total,die.value));}
   if(kind==='cast')for(const bonus of snapshot.bonuses??[]){amount+=bonus.value;entry.breakdown.push(bonus.name+': '+bonus.value);}
   if(entry.channel){const bonus=channeledHealing(medicalLevel(actor));if(medicalFeature(actor,'Consolation','Counselor-Nin'))entry.consolation=bonus;else amount+=bonus;entry.breakdown.push('Channeled Healing: '+bonus);}
   entry.amount=Math.max(0,amount);entry.status='paid';await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);
   await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:'<p>'+title[kind]+' · bestätigter Medical-Vorgang. Zielanwendung im Medical-Nin-Tracker.</p>',flags:{[MODULE_ID]:{medicalAction:{actorUuid:actor.uuid,entryId:entry.id}}}});
   return medicalHealingWorkflow(game).request(actor,messageId??'',entry.id,targets);
  }catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);throw error;}
 });
}
export async function resumeMedicalHealing(game,actor,id){requireOwner(game,actor);const ctx=context(game,actor,id);return medicalHealingWorkflow(game).request(actor,ctx.entry.messageId??'',id,ctx.entry.targets);}
export async function requestMedicalTakeLife(game,message){
 const actor=message.getAssociatedActor();requireOwner(game,actor);
 return withCastingActorLock(actor,async()=>{
  const feature=medicalFeature(actor,'Preserve/Take Life'),item=message.getAssociatedItem(),targets=targetRefs(game);
  if(item?.getFlag(MODULE_ID,'medicalCast')?.elementalPower)throw Error('Take Life wurde für diesen Cast bereits durch Elemental Power bezahlt und im Schadenswurf berücksichtigt.');
  if(!feature||!isMedical(item)||message.getFlag('n5eb','roll.type')!=='damage'||!message.rolls.length||targets.length!==1)throw Error('Eigener Medical-Jutsu-Schadenswurf und genau ein tatsächlich getroffenes Ziel erforderlich.');
  if((actor.getFlag(MODULE_ID,'medicalHitPayments')??[]).some(e=>e.messageId===message.id&&!['cancelled','resolved'].includes(e.status)))throw Error('Dieser Originaltreffer besitzt bereits eine Medical-Trefferanfrage.');
  const list=entries(actor);if(list.some(e=>e.messageId===message.id&&e.kind==='take'&&!['cancelled','resolved'].includes(e.status))||list.some(e=>['paying','rolling','review'].includes(e.status)))throw Error('Take-Life-Vorgang bereits vorhanden oder eine Medical-Zahlung unterbrochen.');
  if(feature.system.uses.value<1)throw Error('Gemeinsamer Preserve-/Take-Life-Pool erschöpft.');
  const damage=groupRolledDamage(message.rolls).filter(p=>p.value>0&&!['healing','temphp','chakra','chakratemp'].includes(p.type));if(!damage.length)throw Error('Keine vorhandene HP-Schadensart auslesbar.');
  const div=document.createElement('div'),p=document.createElement('p'),s=document.createElement('select');s.name='type';p.textContent='Tatsächlichen Treffer auf '+targets[0].name+' bestätigen. Originalschaden darf noch NICHT angewendet worden sein. Eine gemeinsame Preserve-/Take-Life-Nutzung bezahlen; +'+medicalTakeLifeAmount(actor)+' in genau einer vorhandenen Schadensart gemeinsam mit dem Originaltreffer anwenden. DR wird einmal berechnet.';div.append(p,s);addWarriorBenefitFields(actor,(await fromUuid(targets[0].tokenUuid)).actor,div);for(const type of new Set(damage.map(p=>p.type))){const o=document.createElement('option');o.value=type;o.textContent=type;s.append(o);}
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Take Life · gemeinsamer Treffer'},content:div.innerHTML,buttons:[{action:'pay',label:'Treffer bestätigen und Nutzung bezahlen',callback:(_e,b)=>({type:b.form.elements.type.value,warrior:warriorBenefitChoice(actor,fromUuidSync(targets[0].uuid),b.form)})}],rejectClose:false});if(!choice)return;const {type,warrior}=choice;if(!damage.some(p=>p.type===type))throw Error('Ungültige Schadensart.');
  const entry={id:foundry.utils.randomID(),kind:'take',warrior,targets,messageId:message.id,rollFingerprint:JSON.stringify(message.rolls.map(r=>r.toJSON())),amount:medicalTakeLifeAmount(actor),damageType:type,damage:[...damage,...groupRolledDamage(message.rolls).filter(p=>p.value>0&&p.type==='chakra')],at:game.time.worldTime,status:'paying'};list.push(entry);await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);
  try{const updates={item:[]};appendFeatureSpend(updates,feature);await actor.updateEmbeddedDocuments('Item',updates.item);entry.status='paid';await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);return medicalHealingWorkflow(game).request(actor,message.id,entry.id,targets);}catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);throw error;}
 });
}
export async function resolveMedicalAction(game,actor,id){
 requireOwner(game,actor);if(!game.user.isGM)throw Error('GM-Prüfung erforderlich.');
 if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Medical-Unterbrechung prüfen'},content:'<p>Ressourcen, gespeicherte Würfe und ausgeführte Zielschritte manuell geprüft und nötigenfalls korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))return;
 const list=entries(actor),entry=list.find(e=>e.id===id);if(!entry)throw Error('Vorgang fehlt.');entry.status='resolved';await actor.setFlag(MODULE_ID,MEDICAL_ACTIONS,list);
}
export function installMedicalHealing(game,types,ActorClass){
 const Heal=types.heal?.documentClass,p=Heal?.prototype;if(!p)return;const original=p.rollDamage;
 p.rollDamage=function(config={},dialog={},message={}){
  if(!medicalEnabled(game)||this.item.type!=='spell'||!medicalFeature(this.actor,'Medical Ninjutsu'))return original.call(this,config,dialog,message);
  const type=[...(this.healing?.types??[])];if(type.length!==1||type[0]!=='healing')return original.call(this,config,dialog,message);
  const copy=foundry.utils.mergeObject(message,{data:{flags:{[MODULE_ID]:{medicalHealingRoll:{id:foundry.utils.randomID(),rank:this.item.system.effectiveRank,bonuses:healingBonuses(game,this.actor,this.item)},castingSnapshot:this.item.toObject()}}}},{inplace:false});
  return original.call(this,config,dialog,copy);
 };
 const apply=ActorClass.prototype.applyDamage;
 ActorClass.prototype.applyDamage=function(damage,options={}){
  const message=options.originatingMessage,source=message?.getAssociatedActor?.();
  if(medicalEnabled(game)&&!options.n5eseMedicalRequest&&message?.getFlag(MODULE_ID,'medicalHealingRoll'))throw Error('Diesen Medical-Heilungswurf über die bestätigte Medical-Zielanwendung verwenden.');
  if(medicalEnabled(game)&&!options.n5eseMedicalRequest&&source&&(source.getFlag(MODULE_ID,MEDICAL_ACTIONS)??[]).some(e=>e.kind==='take'&&e.messageId===message.id&&!['cancelled','resolved'].includes(e.status)&&e.targets.some(t=>t.uuid===this.uuid)))throw Error('Diesen Treffer mit Take Life gemeinsam über die gespeicherte Medical-Anfrage anwenden.');
  return apply.call(this,damage,options);
 };
 Hooks.on('dnd5e.restCompleted',async(actor,_result,config)=>{if(!medicalEnabled(game)||!actor.isOwner||!['short','long','full'].includes(config.type))return;const state=actor.getFlag(MODULE_ID,'medicalRecipientUses');if(state)await actor.setFlag(MODULE_ID,'medicalRecipientUses',{...state,longLife:0});});
}
