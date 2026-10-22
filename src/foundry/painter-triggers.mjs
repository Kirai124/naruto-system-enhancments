import {MODULE_ID} from '../settings/register.mjs';
import {ownedSubclassMoldings} from '../casting/subclass-moldings.mjs';
import {planMoldings} from '../casting/efficient-molding.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function painterRound(game,actor){const c=game.combat;return c?.started&&c.combatants?.some(t=>t.actor?.uuid===actor.uuid)?`${c.id}:${c.round}`:null;}
export async function checkPainterRound(game,actor){
 const round=painterRound(game,actor);if(!round||actor.getFlag(MODULE_ID,'painterRound')!==round)return true;
 if(!game.user.isGM){ui.notifications.warn('Painter wurde in dieser Runde bereits verwendet. Eine Ausnahme benötigt den GM.');return false;}
 return foundry.applications.api.DialogV2.confirm({window:{title:'Painter: Rundenbegrenzung'},content:'<p>Bereits in dieser Runde verwendet. Eine geklärte GM-Ausnahme bestätigen?</p>',rejectClose:false});
}
/** Ink commands/destruction are explicit feature triggers, never another Jutsu cast. */
export async function runPainterTrigger(game,actor){
 if(!actor.isOwner||!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!game.settings.get(MODULE_ID,'subclassMoldingAutomation')||!ownedSubclassMoldings(actor).some(r=>r.id==='painter'))throw Error('Painter-Feature oder Berechtigung fehlt.');
 return withCastingActorLock(actor,async()=>{
  const previous=actor.getFlag(MODULE_ID,'painterJournal');if(['applying','review'].includes(previous?.status))throw Error('Voriger Painter-Vorgang benötigt eine GM-Prüfung.');
  const spells=[...actor.items].filter(i=>i.type==='spell'&&i.system.jutsu?.type==='ninjutsu'&&i.system.activities.size);
  if(!spells.length)throw Error('Ein tatsächliches eigenes Ink-Summon-Jutsu als Ursprung benötigt.');
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Painter: Ink-Summon-Auslöser'},content:`<label>Eigenes Ursprungs-Jutsu <select name="item">${spells.map(i=>`<option value="${i.id}">${esc(i.name)}</option>`).join('')}</select></label><label>Auslöser <select name="trigger"><option value="command">Ink Summon kommandiert · 5 Fuß</option><option value="destroyed">Ink Summon zerstört · 10 Fuß</option></select></label><p>Bestätige: Es handelt sich tatsächlich um deinen Ink Summon. Betroffene Kreaturen innerhalb der genannten Entfernung anschließend über die Chatkarte bestätigen.</p>`,buttons:[{action:'select',label:'Tatsächlichen Ink-Summon-Auslöser bestätigen',callback:(_e,b)=>({itemId:b.form.elements.item.value,trigger:b.form.elements.trigger.value})}],rejectClose:false});
  if(!choice)return null;
  if(!await checkPainterRound(game,actor))return null;
  const item=actor.items.get(choice.itemId),activity=[...item.system.activities][0],plan=planMoldings(item,{ids:['painter'],rank:item.system.effectiveRank});
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Painter bezahlen'},content:`<p>${plan.uses} gemeinsame Molding-Nutzung(en), ${plan.additionalCost} Chakra. Kein weiteres Jutsu wird gewirkt.</p>`,rejectClose:false}))return null;
  if(actor.getChakraAvailable()<plan.additionalCost||plan.feature.system.uses.spent+plan.uses>plan.feature.system.uses.max)throw Error('Molding-Ressource nicht mehr verfügbar.');
  const journal={id:foundry.utils.randomID(),status:'applying',choice};await actor.setFlag(MODULE_ID,'painterJournal',journal);
  try{
   await actor.update({...actor.getChakraSpendUpdates(plan.additionalCost),[`flags.${MODULE_ID}.painterRound`]:painterRound(game,actor)});
   if(plan.uses)await plan.feature.update({'system.uses.spent':plan.feature.system.uses.spent+plan.uses});
   const record={castId:journal.id,itemId:item.id,activityId:activity.id,rank:item.system.effectiveRank,ids:['painter'],options:{painter:{enabled:true,eligibilityConfirmed:true,trigger:choice.trigger}},targets:{},createdAt:game.time.worldTime,uses:plan.uses,additionalCost:plan.additionalCost};
   const message=await ChatMessage.create({content:`<p>Painter · ${choice.trigger==='destroyed'?'Ink Summon zerstört (10 Fuß)':'Ink Summon kommandiert (5 Fuß)'} · ${esc(item.name)}</p>`,speaker:ChatMessage.getSpeaker({actor}),flags:{n5eb:activity.messageFlags,[MODULE_ID]:{moldingPrimary:true,moldingCast:record}}});
   journal.status='applied';journal.messageId=message.id;await actor.setFlag(MODULE_ID,'painterJournal',journal);return message;
  }catch(error){journal.status='review';journal.error=error.message;await actor.setFlag(MODULE_ID,'painterJournal',journal);throw error;}
 });
}
