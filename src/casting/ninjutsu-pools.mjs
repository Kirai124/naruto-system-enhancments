import {refinedDamageChoices} from './refined-ninjutsu.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {ownedTrackers} from '../trackers/ninjutsu-definitions.mjs';
import {liveGroups,removeUnits,readLedger,groupKey} from '../trackers/ledger.mjs';
const releases=['earth','wind','fire','water','lightning'];
export function poolGroups(actor,now){return liveGroups(actor.flags?.[MODULE_ID]?.ninjutsuTracker,now).filter(g=>!g.target&&ownedTrackers(actor).some(d=>d.id===g.kind&&d.item.uuid===g.sourceItemUuid));}
export function poolChoices(activity,kind,now){
 if(!activity?.actor||activity.item?.type!=='spell')return [];
 const keywords=[...(activity.item.system.jutsu?.keywords??[])],nature=releases.some(k=>keywords.includes(k));
 const group=poolGroups(activity.actor,now).find(g=>g.kind===kind);if(!group||activity.item.type!=='spell')return [];
 if(kind==='void-shards'&&(nature||!(activity.item.system.jutsu?.type==='ninjutsu'||keywords.includes('ninjutsu'))))return [];
 if(kind==='lightning-motes'&&!keywords.includes('lightning')||kind==='elemental-motes'&&!nature)return [];
 const nin=activity.item.system.jutsu.type==='ninjutsu'||keywords.includes('ninjutsu');
 if(kind==='blood-vials'&&(!nin||![...(activity.damage?.parts??[])].some(p=>[...(p.types??[])].some(t=>['acid','necrotic','poison'].includes(t)))))return [];
 if(kind==='rain-blades'&&(!nin||!keywords.includes('water')))return [];
 if(kind==='traditional-inertia'&&(!nin||!keywords.includes('hijutsu')))return [];
 if(kind==='solid-gems'&&(!nin||!keywords.includes('earth')))return [];
 if(kind==='ink-sketches'&&(!nin||!/beast\s+imitating\s+art/i.test(activity.item.name)))return [];
 const choices=[],parts=[...(activity.damage?.parts??[])];
 for(let count=1;count<=group.entries.length;count++){
  const add=(mode,label,index=0)=>choices.push({value:`${mode}:${count}:${index}`,label:`${count} ${kind==='void-shards'?'Shards':'Motes'}: ${label}`,kind,mode,count,index,key:group.key});
  if(kind==='blood-vials'){
   parts.forEach((_p,index)=>add('vial-dice','Schadensformel '+(index+1)+' +'+count+'d8',index));
   if(count>=2){add('vial-cost','Wirkkosten −'+Math.floor(count/2));if(Number.isFinite(activity.save?.dc?.value))add('save','SG +'+Math.floor(count/2));}
  }
  if(kind==='ink-sketches')for(const p of refinedDamageChoices(activity))add('sketch-dice','Schadensformel '+(p.index+1)+' +'+count+'d'+p.die,p.index);
  if(kind==='rain-blades'){if(count>=2&&parts.length)add('rain-chill','Bestätigte betroffene Ziele: Chilled +'+Math.floor(count/2));if(activity.activation?.type==='reaction')add('rain-dr','DR +'+count*4+' außer Earth/Psychic bis Zugende');if(parts.some(p=>[...(p.types??[])].includes('cold')))add('rain-move','Bestätigte Verschiebung '+count*5+' Fuß; Tokenbewegung manuell');}
  if(kind==='solid-gems'){add('gem-temp','+'+count*4+' temporäre HP');add('gem-construct','Konstrukt: +'+Math.min(8,count*2)+' DR; konkretes Konstrukt bestätigen');}
  if(kind==='traditional-inertia'){add('inertia-clan','Begrenzte Clan-Funktion anschließend ausdrücklich nutzen');if(count>=2)add('inertia-components','Bis '+Math.floor(count/2)+' Komponenten ignorieren');}
  if(kind==='ink-sketches'){add('ink-help','Ink Summon: Help bestätigen');add('ink-dodge','Ink Summon: Dodge / ab Stufe 6 Disengage');}
  if(kind==='traditional-inertia'&&count>=2&&activity.duration?.concentration)add('inertia-maintain','Unterhalt −'+Math.floor(count/2)+' (Minimum 1)');
  if(kind==='void-shards'){
   if(count<=3)add('cost',`Wirkkosten −${count*2} Chakra`);
   if(count===1&&parts.length)add('chakra','gesamten Schaden in Chakra-Schaden umwandeln');
   add('next-cost',`nächstes Jutsu einer bestätigten Kreatur +${count*5} Chakra (GM-Anfrage)`);
  }
  if(kind==='elemental-motes'){
   if(count>=2&&Number.isFinite(activity.save?.dc?.value))add('save',`effektiver SG +${Math.floor(count/2)}`);
   parts.forEach((_p,index)=>add('dice',`Schadensformel ${index+1} +${count}d6`,index));
   add('temp',`+${count*2} temporäre Professor-Chakra (Pool maximal 10)`);
  }
  if(kind==='lightning-motes'){
   parts.forEach((_p,index)=>add('damage',`Schadensformel ${index+1} +${count*3}; bei kritischem Treffer doppelt`,index));
   if(count>=2&&activity.duration?.concentration)add('maintain',`Unterhalt −${Math.floor(count/2)} Chakra; stärkste Reduktion gilt`);
   if(!parts.length&&![...(activity.item.system.activities??[])].some(a=>a.damage?.parts?.length))add('zap',`${count}d8 Lightning auf ausdrücklich bestätigte betroffene Ziele (GM-Anfrage)`);
  }
 }
 return choices;
}
export function selectedPools(activity,selections,now){
 const result=[];
 for(const [kind,value] of Object.entries(selections??{})){
  if(!value||value==='none')continue;
  if(!['void-shards','lightning-motes','elemental-motes','blood-vials','rain-blades','traditional-inertia','solid-gems','ink-sketches'].includes(kind))throw Error('Unbekannter Casting-Pool.');
  const choice=poolChoices(activity,kind,now).find(c=>c.value===value);
  if(!choice)throw Error('Ausgewählter Shard-/Mote-Verbrauch nicht mehr verfügbar.');
  result.push(choice);
 }
 return result;
}
export function spendPools(actor,plans,now,updates,turn=''){
 let state=readLedger(actor.flags?.[MODULE_ID]?.ninjutsuTracker);
 if(plans.length&&(Object.hasOwn(updates.actor,`flags.${MODULE_ID}.ninjutsuTracker`)||updates.actor.flags?.[MODULE_ID]?.ninjutsuTracker))throw Error('Konkurrierende Tracker-Änderung.');
 for(const plan of plans){
  if(state.requests?.some(r=>r.key===plan.key&&['pending','applying','review'].includes(r.status)))throw Error('Offene Pool-Auslösung zuerst abschließen.');
  state=removeUnits(state,{key:plan.key,count:plan.count,now});if(turn){state.limits??={};state.limits[plan.kind]={...state.limits[plan.kind],spendTurn:turn};}
 }
 if(plans.length)updates.actor[`flags.${MODULE_ID}.ninjutsuTracker`]=state;
 return updates;
}
export function poolCost(item,selections,now,cost){
 const vials=selections?.['blood-vials'];if(vials&&/^vial-cost:[2-5]:0$/.test(vials)){const c=Number(vials.split(':')[1]),g=poolGroups(item.actor,now).find(g=>g.kind==='blood-vials');if(g?.entries.length>=c)cost=Math.max(0,cost-Math.floor(c/2));}
 const value=selections?.['void-shards'];if(!value||value==='none')return cost;
 if(!/^cost:[1-3]:0$/.test(value))return cost;
 const count=Number(value.split(':')[1]),group=poolGroups(item.actor,now).find(g=>g.key===groupKey('void-shards'));
 const keywords=[...(item.system.jutsu?.keywords??[])];
 if(!group||group.entries.length<count||releases.some(k=>keywords.includes(k))||!(item.system.jutsu?.type==='ninjutsu'||keywords.includes('ninjutsu')))return cost;
 return Math.max(0,cost-count*2);
}
/** Professor contribution is consumed first; unrelated temporary Chakra remains additive. */
export function professorAfterSpend(previous,totalBefore,totalAfter){
 if(!Number.isInteger(previous)||previous<0||previous>10)return 0;
 return Math.min(totalAfter,Math.max(0,Math.min(previous,totalBefore)-Math.max(0,totalBefore-totalAfter)));
}
export function professorGrant(previous,totalBefore,totalAfterPayment,count){
 if(!Number.isInteger(count)||count<1||count>5)throw Error('Ungültiger Professor-Verbrauch.');
 const remaining=professorAfterSpend(previous,totalBefore,totalAfterPayment),added=Math.min(count*2,10-remaining);
 return {temporary:totalAfterPayment+added,professor:remaining+added,added};
}
