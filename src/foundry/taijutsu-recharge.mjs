import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
export const TAI_RECHARGES=Object.freeze({
 'Talented Technique':{dice:2,minutes:10},
 'Focused Strike':{dice:5,minutes:60},
 'Focused Technique':{dice:8,minutes:480},
 'Flaming Finishers':{variable:true,minutes:10},
 'Nin-Tai Technique':{dice:4}
});
/** Native feature uses are authoritative; this stores only how a variable-cost recharge was paid. */
export function appendTaijutsuFeatureSpend(actor,updates,name,dice){
 const feature=taijutsuFeature(actor,name);if(!feature||feature.system.uses.value<1)throw Error(name+': keine tatsächliche Nutzung verfügbar.');
 updates.item??=[];let item=updates.item.find(u=>u._id===feature.id);if(!item){item={_id:feature.id};updates.item.push(item);}if(item['system.uses.spent']!==undefined||item.system?.uses?.spent!==undefined)throw Error('Konkurrierender Feature-Verbrauch.');item['system.uses.spent']=feature.system.uses.spent+1;
 updates.actor??={};updates.actor['flags.'+MODULE_ID+'.taijutsuRechargeCosts.'+feature.id]=dice;
}
export async function rechargeTaijutsuFeature(game,actor,name,rest=false){
 const rule=TAI_RECHARGES[name],feature=taijutsuFeature(actor,name);if(!taijutsuEnabled(game)||!actor.isOwner||!rule||!feature)throw Error('Tatsächliches eigenes Feature erforderlich.');return withCastingActorLock(actor,async()=>{
  if(feature.system.uses.spent<1)throw Error('Dieses Feature hat bereits alle Nutzungen.');const journal=structuredClone(actor.getFlag(MODULE_ID,'taijutsuRechargePayments')??[]);if(journal.some(e=>['paying','paid','review'].includes(e.status)))throw Error('Unterbrochene Aufladung zuerst vom GM prüfen.');if(rest&&!rule.minutes)throw Error('Keine Ruhe-Aufladung laut Feature.');if(!rest&&game.combat?.started&&game.combat.combatant?.actor?.uuid!==actor.uuid)throw Error('Aufladung mit Dice nur zu Beginn des eigenen Zuges.');const cost=rest?0:rule.dice??actor.getFlag(MODULE_ID,'taijutsuRechargeCosts')?.[feature.id],pool=taijutsuFeature(actor,'Martial Adept');if(!Number.isSafeInteger(cost)||cost<0||!rest&&cost<1)throw Error('Tatsächlich zuvor bezahlter Aufladebetrag fehlt; GM muss den Ursprung prüfen.');if(cost&&(!pool||pool.system.uses.value<cost))throw Error('Nicht genügend Martial Dice für die Aufladung.');const p=document.createElement('p');p.textContent=rest?'Tatsächlich '+rule.minutes+' Minuten für diese Fähigkeit geruht? Eine verbrauchte native Nutzung auffüllen; keine Rast/Erholung für andere Ressourcen auslösen.':'Tatsächlich Beginn des eigenen Zuges, bevor weitere Aktionen ausgeführt wurden? '+cost+' Martial Dice zum Auffüllen einer verbrauchten nativen Nutzung ausgeben. Aktionsökonomie manuell.';if(!await foundry.applications.api.DialogV2.confirm({window:{title:name+' aufladen'},content:p.outerHTML,rejectClose:false}))return;const entry={id:foundry.utils.randomID(),name,status:'paying',cost,rest,at:game.time.worldTime};journal.push(entry);await actor.setFlag(MODULE_ID,'taijutsuRechargePayments',journal);try{if(cost)await pool.update({'system.uses.spent':pool.system.uses.spent+cost});entry.status='paid';await actor.setFlag(MODULE_ID,'taijutsuRechargePayments',journal);await feature.update({'system.uses.spent':Math.max(0,feature.system.uses.spent-1)});entry.status='applied';await actor.setFlag(MODULE_ID,'taijutsuRechargePayments',journal);return entry;}catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,'taijutsuRechargePayments',journal);throw error;}
 });
}
export async function resolveTaijutsuRecharge(game,actor,id){if(!actor.isOwner||!game.user.isGM)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{const entries=structuredClone(actor.getFlag(MODULE_ID,'taijutsuRechargePayments')??[]),entry=entries.find(e=>e.id===id);if(!entry)throw Error('Aufladung fehlt.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Aufladung prüfen'},content:'<p>Feature-Nutzung, Ruhe und Martial-Dice-Zahlung tatsächlich geprüft/korrigiert? Ohne erneute Aufladung schließen.</p>',rejectClose:false})){entry.status='resolved';await actor.setFlag(MODULE_ID,'taijutsuRechargePayments',entries);}});}
