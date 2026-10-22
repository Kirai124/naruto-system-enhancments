import {MODULE_ID} from '../settings/register.mjs';
import {groupRolledDamage} from '../casting/genjutsu-damage.mjs';
import {genjutsuEnabled,genjutsuLevel,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {commitFeaturePayment} from './ninjutsu-resource-utils.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

const storage='genjutsuSmitePayments',managers=new WeakMap();
const payments=actor=>structuredClone(actor.getFlag(MODULE_ID,storage)??[]);
const turn=game=>game.combat?.started?{combatId:game.combat.id,round:game.combat.round,turn:game.combat.turn}:null;
const sameTurn=(a,b)=>a&&b&&a.combatId===b.combatId&&a.round===b.round&&a.turn===b.turn;
function combinedDamage(plan){
 const damage=structuredClone(plan.weaponDamage),psychic=damage.find(p=>p.type==='psychic');
 // Extra dice belong to this same weapon hit; combine the Psychic component
 // before native resistance rounding and the shared modification budget.
 if(psychic)psychic.value+=plan.amount;else damage.push({type:'psychic',value:plan.amount,properties:[]});
 return damage.map(p=>({...p,properties:new Set(p.properties)}));
}
function context(game,actor,messageId){
 const message=game.messages.get(messageId),attack=message?.getFlag(MODULE_ID,'genjutsuWeaponAttack'),feature=ownedGenjutsuFeature(actor,'Illusionary Smite','Malleable Mirages');
 if(!genjutsuEnabled(game)||!actor?.isOwner||!feature||!attack||message.getAssociatedActor()?.uuid!==actor.uuid||attack.sourceActorUuid!==actor.uuid)throw Error('Eigener Illusionary-Weapon-Angriff und Illusionary Smite erforderlich.');
 return {message,attack,feature};
}
export function smiteWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{
  storage:'genjutsuSmiteRequests',id:()=>foundry.utils.randomID(),resolve:uuid=>fromUuid(uuid),
  owner(actor){if(!genjutsuEnabled(game)||!actor?.isOwner)throw Error('Genjutsu-Automation und Quellenberechtigung erforderlich.');},
  context(actor,messageId,ruleId){
   const ctx=context(game,actor,messageId),payment=payments(actor).find(p=>p.id===ruleId);
   if(payment?.status!=='paid'||payment.messageId!==messageId||payment.attackId!==ctx.attack.id)throw Error('Bestätigte Smite-Zahlung fehlt.');
   return {...ctx,payment,record:{castId:payment.id},rule:{id:ruleId,source:ctx.feature.uuid}};
  },
  prepare(ctx,_request,targets){if(targets.length!==1||targets[0].uuid!==ctx.payment.targetUuid)throw Error('Nur das bestätigte getroffene Ziel verwenden.');const message=game.messages.get(ctx.payment.weaponDamageMessageId);if(!message||JSON.stringify(message.rolls.map(r=>r.toJSON()))!==JSON.stringify(ctx.payment.weaponDamageRolls))throw Error('Ursprünglicher Waffenschadenswurf fehlt oder wurde verändert; GM-Prüfung erforderlich.');return [{amount:ctx.payment.total,weaponDamage:ctx.payment.weaponDamage,targetUuid:targets[0].uuid}];},
  confirm(ctx,_request,prepared){const weapon=prepared[0].weaponDamage.reduce((n,p)=>n+p.value,0);return foundry.applications.api.DialogV2.confirm({window:{title:'Waffentreffer und Smite gemeinsam anwenden'},content:'<p>'+weapon+' ursprünglicher Waffenschaden plus '+prepared[0].amount+' Psychic durch Smite gemeinsam anwenden? Der Waffenschaden darf noch nicht separat angewendet worden sein. Native Zielverteidigungen/DR werden einmal für diesen gesamten Treffer berechnet. '+ctx.payment.dice+'d8'+(ctx.payment.critical?' (kritisch verdoppelt)':'')+'; '+ctx.payment.chakra+' Chakra bereits bezahlt.</p>',rejectClose:false});},
  async apply(target,plan,ctx,request){await target.applyDamage(combinedDamage(plan),{n5eseGenjutsuRequest:request.id,n5eseSmiteCombinedPayment:ctx.payment.id,originatingMessage:game.messages.get(ctx.payment.weaponDamageMessageId)});return {weaponDamage:plan.weaponDamage,smiteDamage:plan.amount};}
 });managers.set(game,manager);return manager;
}
export async function requestIllusionarySmite(game,message){
 const actor=message.getAssociatedActor();context(game,actor,message.id);
 return withCastingActorLock(actor,async()=>{
  const entries=payments(actor),ctx=context(game,actor,message.id),tokens=[...game.user.targets].filter(t=>t.actor);
  if(tokens.length!==1)throw Error('Genau eine tatsächlich getroffene Kreatur markieren.');
  if(entries.some(p=>['applying','paid-unrolled','review'].includes(p.status)))throw Error('Offenen Smite-Vorgang zuerst fortsetzen bzw. vom GM prüfen lassen.');
  if(entries.some(p=>p.attackId===ctx.attack.id&&p.status!=='cancelled'))throw Error('Dieser Angriff hat bereits einen Smite-Vorgang.');
  const currentTurn=turn(game),used=entries.some(p=>sameTurn(p.turn,currentTurn)&&p.status!=='cancelled'),maximum=3+[5,9,13,17].filter(level=>genjutsuLevel(actor)>=level).length;
  if(used&&!game.user.isGM)throw Error('Illusionary Smite wurde in diesem Zug bereits benutzt. Eine GM-Korrektur ist erforderlich.');
  const damageMessages=game.messages.filter(m=>m.getFlag('n5eb','roll.type')==='damage'&&m.getAssociatedActor()?.uuid===actor.uuid&&m.getFlag(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.genjutsuWeapon?.instanceId===ctx.attack.instanceId&&m.isContentVisible!==false&&m.rolls?.length&&!entries.some(p=>p.weaponDamageMessageId===m.id&&p.status!=='cancelled'));
  if(!damageMessages.length)throw Error('Zuerst den nativen Waffenschaden dieses Treffers würfeln, aber noch nicht anwenden. Danach Smite bestätigen.');
  const div=document.createElement('div'),note=document.createElement('p');note.textContent='Treffer auf '+tokens[0].name+' bestätigen. Einmal pro Zug; außerhalb eines Kampfes ausdrücklich bestätigen. Chakra-Verbrauch erfolgt nach dieser Bestätigung. '+(used?'GM: weitere Nutzung in demselben Zug ausdrücklich als Korrektur bestätigen.':'');div.append(note);
  const select=document.createElement('select');select.name='dice';for(let dice=2;dice<=maximum;dice++){const o=document.createElement('option');o.value=String(dice);o.textContent=dice+'d8 · '+(3+2*(dice-2))+' Chakra';select.append(o);}div.append(select);
  const damageSelect=document.createElement('select');damageSelect.name='weaponDamage';for(const m of [...damageMessages].reverse()){const o=document.createElement('option');o.value=m.id;o.textContent='Waffenschaden '+m.rolls.map(r=>r.total+' '+r.options.type).join(' + ')+' · Karte '+m.id;damageSelect.append(o);}div.append(damageSelect);
  const damageNote=document.createElement('p');damageNote.textContent='Den tatsächlichen Schadenswurf genau dieses Angriffs wählen. Er wurde noch nicht separat angewendet. Waffen- und Smite-Schaden werden gemeinsam über die gespeicherte GM-Anfrage angewendet; keine doppelte DR.';div.append(damageNote);
  for(const [name,label] of [['critical','Kritischer Treffer: Smite-Würfel verdoppeln'],['confirmed','Tatsächlich getroffen; Nutzung pro Zug und Aktionsökonomie geprüft']]){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.name=name;if(name==='critical'&&message.rolls?.[0]?.isCritical)i.setAttribute('checked','');l.append(i,document.createTextNode(label));div.append(l,document.createElement('br'));}
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Illusionary Smite'},content:div.innerHTML,buttons:[{action:'pay',label:'Treffer und unbenutzten Schadenswurf bestätigen; Chakra bezahlen',callback:(_e,b)=>({dice:Number(b.form.elements.dice.value),critical:b.form.elements.critical.checked,confirmed:b.form.elements.confirmed.checked,weaponDamageMessageId:b.form.elements.weaponDamage.value})}],rejectClose:false});if(!choice)return;
  context(game,actor,message.id);if(!choice.confirmed||!Number.isInteger(choice.dice)||choice.dice<2||choice.dice>maximum||JSON.stringify(turn(game))!==JSON.stringify(currentTurn))throw Error('Auswahl unbestätigt/ungültig oder Zug während des Dialogs gewechselt.');
  const chakra=3+2*(choice.dice-2);if(actor.getChakraAvailable()<chakra)throw Error('Nicht genügend Chakra.');
  const damageMessage=damageMessages.find(m=>m.id===choice.weaponDamageMessageId);if(!damageMessage)throw Error('Unbekannter Waffenschadenswurf.');
  const damage=groupRolledDamage(damageMessage.rolls);if(!damage.length||damage.some(p=>!Number.isFinite(p.value)||!(p.type in CONFIG.DND5E.damageTypes)))throw Error('Waffenschaden enthält nicht unterstützte Schadens-/Heilanteile.');
  const payment={id:foundry.utils.randomID(),status:'applying',messageId:message.id,attackId:ctx.attack.id,targetUuid:tokens[0].actor.uuid,targetTokenUuid:tokens[0].document.uuid,turn:currentTurn,dice:choice.dice,critical:choice.critical,chakra,gmOverride:!!used,createdAt:game.time.worldTime,weaponDamageMessageId:damageMessage.id,weaponDamageRolls:damageMessage.rolls.map(r=>r.toJSON()),weaponDamage:damage};entries.push(payment);await actor.setFlag(MODULE_ID,storage,entries);
  try{
   await commitFeaturePayment(actor,{chakra});payment.status='paid-unrolled';await actor.setFlag(MODULE_ID,storage,entries);
   const roll=await new Roll((choice.dice*(choice.critical?2:1))+'d8').evaluate();payment.roll=roll.toJSON();payment.total=roll.total;payment.status='paid';await actor.setFlag(MODULE_ID,storage,entries);
   await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'Illusionary Smite · '+chakra+' Chakra · Psychic-Zusatzschaden'});
   return await resumeSmiteRequest(game,actor,payment.id);
  }catch(error){payment.status='review';payment.error=error.message;await actor.setFlag(MODULE_ID,storage,entries);throw error;}
 });
}
export async function resumeSmiteRequest(game,actor,id){
 const payment=payments(actor).find(p=>p.id===id);if(payment?.status!=='paid'||!Number.isFinite(payment.total))throw Error('Gespeicherter bezahlter Smite-Schaden fehlt.');context(game,actor,payment.messageId);
 const token=await fromUuid(payment.targetTokenUuid);if(token?.actor?.uuid!==payment.targetUuid)throw Error('Ursprüngliches Zieltoken fehlt.');
 return smiteWorkflow(game).request(actor,payment.messageId,id,[{uuid:payment.targetUuid,tokenUuid:payment.targetTokenUuid,name:token.name}]);
}
export async function resolveSmitePayment(game,actor,id){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{
  const entries=payments(actor),payment=entries.find(p=>p.id===id);if(!['applying','paid-unrolled','review'].includes(payment?.status))throw Error('Keine unterbrochene Smite-Zahlung.');
  const result=await foundry.applications.api.DialogV2.wait({window:{title:'Smite-Zahlung prüfen'},content:'<p>Chakra-Verbrauch, gespeicherten Schadenswurf und vorhandene Zielanfrage manuell prüfen/korrigieren. Keine automatische Erstattung und kein erneuter Wurf.</p>',buttons:[...(Number.isFinite(payment.total)?[{action:'paid',label:'Zahlung/Wurf bestätigt; Zielanfrage freigeben',callback:()=>'paid'}]:[]),{action:'resolved',label:'Manuell abgeschlossen',callback:()=>'resolved'}],rejectClose:false});if(result){payment.status=result;payment.reviewedBy=game.user.id;await actor.setFlag(MODULE_ID,storage,entries);}
 });
}
export function installSmiteDamageGuard(game){
 Hooks.on('dnd5e.preApplyDamage',(target,_amount,_updates,options)=>{
  if(!genjutsuEnabled(game))return;
  const message=options.originatingMessage,actor=message?.getAssociatedActor?.();if(!actor)return;
  const reserved=payments(actor).find(p=>p.weaponDamageMessageId===message.id&&p.targetUuid===target.uuid&&p.status!=='cancelled');
  if(reserved&&options.n5eseSmiteCombinedPayment!==reserved.id){ui.notifications.warn('Dieser Waffenschaden gehört zur gemeinsamen Smite-Anfrage. Dort gemeinsam anwenden; keine separate doppelte Anwendung.');return false;}
 });
}
