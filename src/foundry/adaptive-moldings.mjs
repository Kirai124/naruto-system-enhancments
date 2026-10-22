import {MODULE_ID} from '../settings/register.mjs';
import {ownedSubclassMoldings} from '../casting/subclass-moldings.mjs';
import {ninjutsuLevel} from '../casting/ninjutsu-resources.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {nextActorTurnDeadline} from '../casting/molding-lifetimes.mjs';
import {moldingEffectData} from '../effects/molding-effects.mjs';
const path=`flags.${MODULE_ID}.adaptiveMoldingJournal`;
export async function useAdaptiveMolding(game,actor,id){
 const rule=ownedSubclassMoldings(actor).find(r=>r.id===id&&r.phase==='self');
 if(!rule||!actor.isOwner||(!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!game.settings.get(MODULE_ID,'subclassMoldingAutomation')))throw Error('Eigenes Adaptive Molding fehlt.');
 return withCastingActorLock(actor,async()=>{
  const previous=actor.getFlag(MODULE_ID,'adaptiveMoldingJournal');if(['applying','review'].includes(previous?.status))throw Error('Der vorherige Adaptive-Vorgang benötigt eine GM-Prüfung.');
  const combat=game.combat?.combatants?.some(c=>c.actor?.uuid===actor.uuid)?game.combat:null,turn=combat?.started?`${combat.id}:${combat.round}:${combat.turn}`:'',onOwnTurn=combat?.combatant?.actor?.uuid===actor.uuid;
  const uses=turn&&previous?.turn===turn?previous.turnUses??0:0;
  if(turn&&!onOwnTurn&&id!=='tactical')throw Error('Dieses Adaptive Molding ist nur im eigenen Zug verfügbar.');
  if(onOwnTurn&&uses>=2&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Adaptive-Molding-Limit'},content:'<p>In diesem Zug wurden bereits zwei Adaptive Moldings benutzt. Nur eine mit dem GM geklärte Ausnahme bestätigen.</p>',rejectClose:false}))return null;
  let cls;
  if(id==='rejuvenating'){
   const classes=[...(actor.system.attributes.hd.classes??[])].filter(c=>c.system.hd.value>0);
   if(!classes.length)throw Error('Kein Hit Die verfügbar.');
   const selected=await foundry.applications.api.DialogV2.wait({window:{title:'Rejuvenating: Hit Die'},content:`<label>Hit Die <select name="die">${classes.map((c,i)=>`<option value="${i}">${c.system.hd.denomination} · ${c.system.hd.value} verfügbar</option>`).join('')}</select></label>`,buttons:[{action:'select',label:'Auswählen',callback:(_e,b)=>Number(b.form.elements.die.value)}],rejectClose:false});
   if(selected===null||selected===undefined)return null;cls=classes[selected];if(!cls)throw Error('Ungültige Hit-Die-Auswahl.');
  }
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:rule.name},content:`<p>5 Chakra bezahlen${cls?`, einen ${cls.system.hd.denomination} verbrauchen und 1${cls.system.hd.denomination} + ${ninjutsuLevel(actor)} HP heilen`:''}? Temporäre Boni dauern bis zum Beginn des nächsten eigenen Zuges; außerhalb des Kampfes manuell beenden. Dash/Disengage und Aktionsökonomie bleiben manuell.</p>`,rejectClose:false}))return null;
  if(actor.getChakraAvailable()<5||cls&&cls.system.hd.value<1)throw Error('Ressource nicht mehr verfügbar.');
  const journal={id:foundry.utils.randomID(),ruleId:id,status:'applying',turn,turnUses:uses+1};await actor.update({[path]:journal});
  try{
   const updates=actor.getChakraSpendUpdates(5);
   if(cls){
    const roll=await new Roll(`1${cls.system.hd.denomination} + ${ninjutsuLevel(actor)}`).evaluate();await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'Rejuvenating Molding'});
    const healing=actor.calculateDamage([{type:'healing',value:roll.total}],{invertHealing:false});if(!healing)throw Error('Heilung vom System abgebrochen.');
    updates['system.attributes.hp.value']=Math.min(actor.system.attributes.hp.effectiveMax,actor.system.attributes.hp.value+Math.max(0,healing.amount));
    journal.roll=roll.toJSON();await actor.update(updates);await cls.update({'system.hd.spent':cls.system.hd.spent+1});
   }else{
    await actor.update(updates);
    const changes=id==='overdrive'?[{key:'system.attributes.movement.walk',type:'add',value:'10'}]:id==='survival'?[{key:'system.attributes.ac.bonus',type:'add',value:'1'}]:['str','dex','con'].map(a=>({key:`system.abilities.${a}.bonuses.save`,type:'add',value:'2'}));
    const data=moldingEffectData({name:rule.name,sourceActorUuid:actor.uuid,sourceItemUuid:rule.source,transactionId:journal.id,lifetime:{deadline:nextActorTurnDeadline(combat,actor.uuid)},changes,metadata:{adaptive:id,reduction:id==='survival'?actor.system.abilities.int.mod:0}});
    const duplicate=actor.effects.filter(e=>e.getFlag(MODULE_ID,'moldingEffect')?.metadata.adaptive===id&&e.getFlag(MODULE_ID,'moldingEffect')?.sourceActorUuid===actor.uuid);
    if(duplicate.length)await actor.deleteEmbeddedDocuments('ActiveEffect',duplicate.map(e=>e.id));
    const [effect]=await actor.createEmbeddedDocuments('ActiveEffect',[data]);journal.effectId=effect.id;
   }
   journal.status='applied';await actor.update({[path]:journal});actor.sheet?.render(false);return journal;
  }catch(error){journal.status='review';journal.error=error.message;await actor.update({[path]:journal});throw Error(`Adaptive Molding zur GM-Prüfung gesperrt: ${error.message}`);}
 });
}
