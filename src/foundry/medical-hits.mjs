import {unarmedMedicalHit,addCombatHitFields,combatHitChoice,combatHitPayment,addCombatHitDamage,applyCombatProwess} from './medical-combat.mjs';
import {applyMedicalHealing} from './medical-healing.mjs';
import {addWarriorBenefitFields,warriorBenefitChoice,validateWarriorBenefits,removeWarriorBenefits} from './medical-warrior-benefits.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,medicalTurn,isMedical} from '../casting/medical-context.mjs';
import {medicalTakeLifeAmount} from '../casting/medical-rules.mjs';
import {medicalEffects,medicalPayload} from './medical-clinical.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {groupRolledDamage} from '../casting/genjutsu-damage.mjs';
import {appendFeatureSpend,appendItemSpend} from './ninjutsu-resource-utils.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {applyMedicalDamage} from './medical-receipts.mjs';
export const medicalSpiritualHit=item=>item?.getFlag(MODULE_ID,'medicalSpiritualWeapon')??item?.getFlag(MODULE_ID,'medicalCast')?.spiritualWeapon;
export const MEDICAL_HITS='medicalHitPayments';
export const medicalFuujutsuHit=message=>{const item=message?.getAssociatedItem?.();return isMedical(item)&&item.system.jutsu.keywords.has('fuinjutsu')&&medicalLevel(item.actor)>=5&&!!medicalFeature(item.actor,'Fortifying Scripture','Spiritual Scribe');};
export const medicalBlackHit=message=>!!medicalFeature(message?.getAssociatedActor?.(),'Child of Venom','Black Medicine')&&message?.rolls?.some(r=>['acid','poison'].includes(r.options.type));
export const medicalMeleeHit=message=>{const item=message.getAssociatedItem?.(),activity=message.getAssociatedActivity?.();return isMedical(item)&&activity?.type==='attack'&&activity.attack.type.value==='melee'&&!!medicalFeature(item.actor,"Shaman's Hex",'Shaman');};
const managers=new WeakMap(),read=actor=>structuredClone(actor.getFlag(MODULE_ID,MEDICAL_HITS)??[]);
function owner(game,actor){if(!medicalEnabled(game)||!actor?.isOwner||!medicalLevel(actor))throw Error('Eigener Medical-Nin und aktive Automation erforderlich.');}
function context(game,actor,messageId,id){
 owner(game,actor);const entry=read(actor).find(e=>e.id===id),message=game.messages.get(messageId),item=message?.getAssociatedItem?.(),spiritual=medicalSpiritualHit(item),scalpel=item?.getFlag(MODULE_ID,'medicalScalpelWeapon')??(spiritual?{spiritual:true,sabre:false}:(medicalMeleeHit(message)||unarmedMedicalHit(message)||medicalBlackHit(message)||medicalFuujutsuHit(message))?{medical:true,sabre:false}:null);
 if(entry?.status!=='paid'||!message||message.getAssociatedActor()?.uuid!==actor.uuid||!scalpel||!(spiritual?medicalFeature(actor,'Spiritual Weapons','Shaman'):scalpel.medical?medicalFeature(actor,'Medical Ninjutsu'):medicalFeature(actor,'Chakra Scalpel'))||JSON.stringify(message.rolls.map(r=>r.toJSON()))!==entry.fingerprint)throw Error('Gespeicherter Medical-Waffentreffer fehlt oder wurde verändert.');
 if(message.getOriginatingMessage?.()?.system?.deltas===null)throw Error('Ursprünglicher Cast wurde erstattet.');
 const counter=spiritual?.counterId&&(actor.getFlag(MODULE_ID,'medicalClinicalActions')??[]).find(e=>e.id===spiritual.counterId);if(spiritual?.counterId&&(!counter||counter.ruleId!=='medical.draining-counter'||!['paid','applied'].includes(counter.status)||counter.counterResolved||!medicalFeature(actor,'Draining Hexes','Shaman')))throw Error('Bezahlter Draining-Gegenangriff fehlt oder ist bereits abgeschlossen.');
 return {entry,message,item,scalpel,counter,record:{castId:entry.id},rule:{source:(spiritual?medicalFeature(actor,'Spiritual Weapons','Shaman'):scalpel.medical?medicalFeature(actor,'Medical Ninjutsu'):medicalFeature(actor,'Chakra Scalpel')).uuid}};
}
function splitHit(parts){
 const total=parts.reduce((n,p)=>n+p.value,0);let extra=Math.ceil(total/2)-parts.reduce((n,p)=>n+Math.floor(p.value/2),0);
 const hp=parts.map(p=>{const odd=p.value%2&&extra>0?1:0;extra-=odd;return {...p,value:Math.floor(p.value/2)+odd};});
 return [...hp,{type:'chakra',value:Math.floor(total/2),properties:[]}];
}
export function medicalHitWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{
  storage:'medicalHitRequests',id:()=>foundry.utils.randomID(),resolve:uuid=>fromUuid(uuid),owner:actor=>owner(game,actor),context:(actor,messageId,id)=>context(game,actor,messageId,id),allowOwnerApply:(_ctx,targets)=>targets.every(t=>t.isOwner),
  prepare(ctx,request,targets){if(targets.length!==1||targets[0].uuid!==ctx.entry.target.uuid||request.targets[0].tokenUuid!==ctx.entry.target.tokenUuid)throw Error('Nur das bestätigte getroffene Ziel verwenden.');const target=targets[0];if(ctx.entry.choices.take)validateWarriorBenefits(ctx.item.actor,target,ctx.entry.warrior);const cp=target.system.attributes.chakra?.value??0,raw=structuredClone(ctx.entry.parts),double=!ctx.scalpel.spiritual&&!ctx.scalpel.medical&&medicalLevel(ctx.item.actor)>=5&&medicalFeature(ctx.item.actor,'Chakra Point Degradation','Chakra Scalpel Specialist')&&cp===0;for(const p of raw)if(double)p.value*=2;const parts=[...(ctx.entry.choices.split?splitHit(raw):raw),...(ctx.entry.originalChakra??[])];return [{parts,cp,zeroChakraDouble:!!double}];},
  confirm(ctx,_request,plans){const p=document.createElement('p');p.textContent='Bestätigten Medical-Waffentreffer auf '+ctx.entry.target.name+' anwenden: '+plans[0].parts.map(d=>d.value+' '+d.type).join(' + ')+(plans[0].zeroChakraDouble?' · Schaden wegen 0 Chakra verdoppelt':'')+'. Originaltreffer darf noch nicht angewendet worden sein. HP-/Chakra-Verteidigungen werden nativ berechnet; Action Economy bleibt manuell.';return foundry.applications.api.DialogV2.confirm({window:{title:'Chakra Scalpel · Treffer anwenden'},content:p.outerHTML,rejectClose:false});},
  async apply(target,plan,ctx,request){
   if((target.system.attributes.chakra?.value??0)!==plan.cp)throw Error('Chakra-Stand seit der bestätigten Vorbereitung verändert; GM-Prüfung erforderlich.');
   if(ctx.entry.choices.take)await removeWarriorBenefits(ctx.item.actor,target,ctx.entry.warrior);
   const receipt=await applyMedicalDamage(target,plan.parts.map(p=>({...p,properties:new Set(p.properties)})),{originatingMessage:ctx.message,n5eseMedicalRequest:request.id,n5eseMedicalHit:{sourceActorUuid:ctx.item.actor.uuid,sabre:ctx.scalpel.sabre,precision:!!ctx.entry.choices.precision,bypassTemp:!ctx.scalpel.spiritual&&!ctx.scalpel.medical&&medicalLevel(ctx.item.actor)>=11,combatScalpel:!ctx.scalpel.spiritual&&!ctx.scalpel.medical&&!!medicalFeature(ctx.item.actor,'Combat Scalpel','Chakra Scalpel Specialist')}});
   let chakraReceipt;
   if(ctx.scalpel.sabre&&receipt.hpDamageBeforeTemp>0)chakraReceipt=await applyMedicalDamage(target,[{type:'chakra',value:receipt.hpDamageBeforeTemp,properties:new Set()}],{n5eseMedicalRequest:request.id,n5eseSecondaryMedical:true});
   let drainingHealing;if(ctx.counter){drainingHealing=await applyMedicalHealing(ctx.item.actor,receipt.hpDamageBeforeTemp,{n5eseMedicalRequest:request.id});const actions=structuredClone(ctx.item.actor.getFlag(MODULE_ID,'medicalClinicalActions')??[]),counter=actions.find(e=>e.id===ctx.counter.id);counter.counterResolved=true;counter.counterHealing=drainingHealing;await ctx.item.actor.setFlag(MODULE_ID,'medicalClinicalActions',actions);}
   await applyCombatProwess(game,target,ctx.item.actor,{...ctx.entry,choices:{...ctx.entry.choices,take:ctx.entry.choices.take||!!ctx.item.getFlag(MODULE_ID,'medicalCast')?.elementalPower}});return {receipt,chakraReceipt,drainingHealing};
  },
  async finalize(ctx){const entries=read(ctx.item.actor),entry=entries.find(e=>e.id===ctx.entry.id);entry.status='applied';await ctx.item.actor.setFlag(MODULE_ID,MEDICAL_HITS,entries);}
 });managers.set(game,manager);return manager;
}
export async function requestMedicalScalpelHit(game,message){
 if((message.getAssociatedActor()?.getFlag(MODULE_ID,'taijutsuHitPayments')??[]).some(e=>e.messageId===message.id&&!['cancelled','resolved'].includes(e.status)))throw Error('Dieser Treffer ist bereits im Taijutsu-Ablauf gespeichert; nicht zweimal anwenden.');
 const actor=message.getAssociatedActor();owner(game,actor);return withCastingActorLock(actor,async()=>{
  const item=message.getAssociatedItem(),spiritual=medicalSpiritualHit(item),scalpel=item?.getFlag(MODULE_ID,'medicalScalpelWeapon')??(spiritual?{spiritual:true,sabre:false}:(medicalMeleeHit(message)||unarmedMedicalHit(message)||medicalBlackHit(message)||medicalFuujutsuHit(message))?{medical:true,sabre:false}:null),tokens=[...game.user.targets].filter(t=>t.actor);
  if(!scalpel||message.getFlag('n5eb','roll.type')!=='damage'||!message.rolls?.length||tokens.length!==1)throw Error('Eigener Scalpel-Schadenswurf und genau ein tatsächlich getroffenes Ziel erforderlich.');
  const target={uuid:tokens[0].actor.uuid,tokenUuid:tokens[0].document.uuid,name:tokens[0].name},entries=read(actor),turn=medicalTurn(game);
  if(entries.some(e=>e.messageId===message.id&&!['cancelled','resolved'].includes(e.status))||entries.some(e=>['paying','rolling','review'].includes(e.status)))throw Error('Treffervorgang bereits vorhanden oder eine Zahlung/Würfelstufe unterbrochen.');
  if((actor.getFlag(MODULE_ID,'medicalActions')??[]).some(e=>e.kind==='take'&&e.messageId===message.id&&!['cancelled','resolved'].includes(e.status)))throw Error('Dieser Originaltreffer besitzt bereits eine Take-Life-Anfrage.');
  const counterId=spiritual?.counterId;if(counterId&&entries.some(e=>e.counterId===counterId&&!['cancelled','resolved'].includes(e.status)))throw Error('Dieser Draining-Gegenangriff besitzt bereits einen Treffervorgang.');
  const original=groupRolledDamage(message.rolls).filter(d=>d.value>0&&!['healing','temphp','chakra','tempcp'].includes(d.type));if(!original.length)throw Error('Kein positiver ursprünglicher HP-Schaden.');
  const study=actor.getFlag(MODULE_ID,'medicalStudies')?.[target.uuid],studied=study&&study.sourceFeatureId===medicalFeature(actor,'Biological Knowledge','Chakra Scalpel Specialist')?.id;
  const hex=medicalEffects(game,tokens[0].actor).some(e=>medicalPayload(e).hex&&ninjutsuEffect(e).sourceActorUuid===actor.uuid),ownTurn=!game.combat?.started||game.combat.combatant?.actor?.uuid===actor.uuid;
  const eligible={split:medicalFuujutsuHit(message)||!!studied&&!scalpel.medical&&!spiritual&&!!medicalFeature(actor,'Chakra Point Degradation','Chakra Scalpel Specialist'),precision:!spiritual&&!scalpel.medical&&!!medicalFeature(actor,'Surgical Precision','Chakra Scalpel Specialist'),take:!spiritual&&!item.getFlag(MODULE_ID,'medicalCast')?.elementalPower&&(isMedical(item)||!scalpel.medical||unarmedMedicalHit(message)&&!!medicalFeature(actor,'Take Life: Combat Prowess','Combat Medic'))&&!!medicalFeature(actor,'Preserve/Take Life'),hex:hex&&ownTurn&&message.getAssociatedActivity()?.attack?.type?.value==='melee'&&!entries.some(e=>turn&&e.turn===turn&&e.choices?.hex&&!['cancelled','resolved'].includes(e.status)),transmuter:!spiritual&&!scalpel.medical&&!!medicalFeature(actor,'Transmuter','Transmuter')&&!entries.some(e=>turn&&e.turn===turn&&e.choices?.transmuter&&!['cancelled','resolved'].includes(e.status)),master:!!spiritual&&hex&&!!medicalFeature(actor,'Master Of Hexes','Shaman')&&!entries.some(e=>turn&&e.turn===turn&&e.choices?.master&&!['cancelled','resolved'].includes(e.status)),maximum:!!medicalFeature(actor,'Child of Venom','Black Medicine')&&original.some(p=>['acid','poison'].includes(p.type))};
  const labels={master:'Master Of Hexes: einmal pro Zug Medical-Nin-Stufe als Zusatzschaden gegen die eigene Hex',split:'Bestätigte Chakra-Point-Degradation-/Fortifying-Scripture-Wirkung: vor Verteidigungen hälftig HP/Chakra; ungerader Rest auf HP',precision:'Surgical Precision wurde nach Angriffswurf, aber VOR Ergebnisfeststellung erklärt: eine Nutzung bezahlen; Ziel als verwundbar behandeln',take:'Take Life: eine gemeinsame Nutzung bezahlen; +'+medicalTakeLifeAmount(actor)+' Schaden',hex:'Shaman-Hex: tatsächlich eigener Zug und Nahkampftreffer; einmaligen PB-Zusatzschaden anwenden',transmuter:'Transmuter: einmal pro Zug PB als zusätzlichen Necrotic-Schaden',maximum:'Child of Venom: eine Scalpel-Charge bezahlen; Acid-/Poison-Schadenswürfe maximieren'};
  const div=document.createElement('div'),note=document.createElement('p');note.textContent='Treffer auf '+target.name+' bestätigen. Originalschaden wurde noch nicht angewendet. Ressourcen werden erst nach dieser Bestätigung verbraucht; fremde Ziele erhalten eine gespeicherte GM-Anfrage. Außerhalb des Kampfes Zuggrenzen selbst bestätigen.';div.append(note);if(eligible.take)addWarriorBenefitFields(actor,tokens[0].actor,div);
  for(const [key,available]of Object.entries(eligible))if(available){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.name=key;if(['hex','transmuter'].includes(key))c.setAttribute('checked','');l.append(c,document.createTextNode(labels[key]));div.append(l,document.createElement('br'));}
  const s=document.createElement('select');s.name='damageType';for(const type of new Set(original.map(p=>p.type))){const o=document.createElement('option');o.value=type;o.textContent='Schadensart für Trefferzusätze: '+type;s.append(o);}div.append(s);addCombatHitFields(actor,message,div);
  const selected=await foundry.applications.api.DialogV2.wait({window:{title:'Medical-Waffentreffer · Zusätze und Anwendung'},content:div.innerHTML,buttons:[{action:'confirm',label:'Treffer bestätigen und gewählte Ressourcen bezahlen',callback:(_e,b)=>({combat:combatHitChoice(b.form),warrior:warriorBenefitChoice(actor,tokens[0].actor,b.form),choices:Object.fromEntries(Object.keys(eligible).map(k=>[k,!!b.form.elements[k]?.checked])),damageType:b.form.elements.damageType.value})}],rejectClose:false});if(!selected)return;
  if(Object.entries(selected.choices).some(([k,on])=>on&&!eligible[k])||!original.some(p=>p.type===selected.damageType))throw Error('Ungültige Trefferoption.');
  const combatPayment=combatHitPayment(actor,message,selected.combat);const spend=[];if(selected.choices.take)spend.push(medicalFeature(actor,'Preserve/Take Life'));if(selected.choices.precision)spend.push(medicalFeature(actor,'Surgical Precision','Chakra Scalpel Specialist'));if(selected.choices.maximum)spend.push(medicalFeature(actor,'Chakra Scalpel'));
  for(const feature of spend)if(!feature||feature.system.uses.value<1)throw Error('Eine gewählte Trefferressource fehlt.');
  const entry={id:foundry.utils.randomID(),messageId:message.id,counterId,target,combat:selected.combat,choices:selected.choices,warrior:selected.choices.take?selected.warrior:null,at:game.time.worldTime,turn,status:'paying',fingerprint:JSON.stringify(message.rolls.map(r=>r.toJSON())),parts:original,originalChakra:groupRolledDamage(message.rolls).filter(p=>p.value>0&&p.type==='chakra'),rolls:[]};entries.push(entry);await actor.setFlag(MODULE_ID,MEDICAL_HITS,entries);
  try{
   const updates={item:[]};for(const f of spend)appendFeatureSpend(updates,f);for(const p of combatPayment.items)appendItemSpend(updates,p.feature,'uses.spent',p.amount);if(combatPayment.chakra)await actor.update(actor.getChakraSpendUpdates(combatPayment.chakra));if(updates.item.length)await actor.updateEmbeddedDocuments('Item',updates.item);
   entry.status='rolling';await actor.setFlag(MODULE_ID,MEDICAL_HITS,entries);
   if(selected.choices.maximum){const rolls=message.rolls.map(r=>['acid','poison'].includes(r.options.type)?new CONFIG.Dice.DamageRoll(r.formula,r.data,{...r.options,configured:true,preprocessed:true}).evaluateSync({maximize:true}):r);entry.parts=groupRolledDamage(rolls).filter(p=>p.value>0&&!['healing','temphp','chakra','tempcp'].includes(p.type));}
   if(selected.choices.master)entry.parts.find(p=>p.type===selected.damageType).value+=medicalLevel(actor);
   if(selected.choices.take)entry.parts.find(p=>p.type===selected.damageType).value+=medicalTakeLifeAmount(actor);
   const necrotic=amount=>{const part=entry.parts.find(p=>p.type==='necrotic');if(part)part.value+=amount;else entry.parts.push({type:'necrotic',value:amount,properties:[]});};
   if(selected.choices.hex)necrotic(actor.system.attributes.prof);if(selected.choices.transmuter)necrotic(actor.system.attributes.prof);
   if(!spiritual&&!scalpel.medical&&medicalFeature(actor,'Chakra Sabre','Chakra Scalpel Specialist')&&message.rolls.some(r=>r.isCritical))for(const roll of message.rolls)for(const die of roll.dice){const count=die.results.filter(r=>r.active!==false&&!r.discarded&&r.result===die.faces).length;if(count){const extra=await new Roll(count+'d'+die.faces).evaluate();entry.rolls.push(extra.toJSON());const part=entry.parts.find(p=>p.type===roll.options.type);if(part)part.value+=extra.total;}}
   await addCombatHitDamage(actor,message,entry,selected.damageType);entry.status='paid';await actor.setFlag(MODULE_ID,MEDICAL_HITS,entries);return medicalHitWorkflow(game).request(actor,message.id,entry.id,[target]);
  }catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,MEDICAL_HITS,entries);throw error;}
 });
}
export async function resumeMedicalHit(game,actor,id){const entry=read(actor).find(e=>e.id===id);if(!entry)throw Error('Treffer fehlt.');context(game,actor,entry.messageId,id);return medicalHitWorkflow(game).request(actor,entry.messageId,id,[entry.target]);}
export async function resolveMedicalHit(game,actor,id){owner(game,actor);if(!game.user.isGM)throw Error('GM-Prüfung erforderlich.');if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Scalpel-Unterbrechung prüfen'},content:'<p>Ressourcen, Würfe, HP und Chakra-Zielschritte manuell geprüft/korrigiert? Ohne erneute Anwendung abschließen.</p>',rejectClose:false}))return;const entries=read(actor),entry=entries.find(e=>e.id===id);if(!entry)throw Error('Treffer fehlt.');entry.status='resolved';await actor.setFlag(MODULE_ID,MEDICAL_HITS,entries);}
export function installMedicalHitDefenses(game,ActorClass){
 const calculate=ActorClass.prototype.calculateDamage;
 ActorClass.prototype.calculateDamage=function(parts,options={}){
  const hit=medicalEnabled(game)&&options.n5eseMedicalHit;if(!hit)return calculate.call(this,parts,options);
  const traits=this.system.traits,before={di:traits.di.value,dr:traits.dr.value,dv:traits.dv.value};
  const types=parts.filter(p=>p.value>0).map(p=>p.type),di=new Set(before.di),dr=new Set(before.dr),dv=new Set(before.dv);
  const withoutAll=(set,except)=>{if(set.has('ALL')){set.delete('ALL');for(const type of Object.keys(CONFIG.DND5E.damageTypes))if(type!==except)set.add(type);}set.delete(except);};
  if(hit.combatScalpel&&!hit.sabre&&types.includes('slashing')){const immune=di.has('ALL')||di.has('slashing');withoutAll(di,'slashing');withoutAll(dr,'slashing');if(immune)dr.add('slashing');}
  if(hit.sabre&&types.includes('necrotic')){withoutAll(di,'necrotic');withoutAll(dr,'necrotic');}
  if(hit.precision)for(const type of types)dv.add(type);
  traits.di.value=di;traits.dr.value=dr;traits.dv.value=dv;
  try{return calculate.call(this,parts,options);}finally{if(traits.di.value===di)traits.di.value=before.di;if(traits.dr.value===dr)traits.dr.value=before.dr;if(traits.dv.value===dv)traits.dv.value=before.dv;}
 };
 const apply=ActorClass.prototype.applyDamage;
 ActorClass.prototype.applyDamage=function(parts,options={}){const origin=options.originatingMessage,source=origin?.getAssociatedActor?.();if(medicalEnabled(game)&&!options.n5eseMedicalRequest&&source&&(source.getFlag(MODULE_ID,MEDICAL_HITS)??[]).some(e=>e.messageId===origin.id&&e.target.uuid===this.uuid&&!['cancelled','resolved'].includes(e.status)))throw Error('Diesen Originaltreffer über seine gespeicherte Medical-Anfrage anwenden.');if(medicalEnabled(game)&&!options.n5eseMedicalRequest&&(options.originatingMessage?.getAssociatedItem?.()?.getFlag(MODULE_ID,'medicalScalpelWeapon')||options.originatingMessage?.getAssociatedItem?.()?.getFlag(MODULE_ID,'medicalSpiritualWeapon')))throw Error('Scalpel-Schaden über die bestätigte Medical-Trefferanfrage anwenden.');return apply.call(this,parts,options);};
 Hooks.on('dnd5e.preApplyDamage',(actor,amount,updates,options)=>{if(medicalEnabled(game)&&options.n5eseMedicalHit?.bypassTemp&&amount>0){updates['system.attributes.hp.temp']=actor.system.attributes.hp.temp;updates['system.attributes.hp.value']=Math.max(0,actor.system.attributes.hp.value-amount);}});
}
