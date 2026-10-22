import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuFeature,taijutsuLevel,martialDie,isTaijutsu} from '../casting/taijutsu-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {attackUnarmedTechnique,unarmedContext} from './taijutsu-unarmed.mjs';
export const DISTURBANCE_KEY='taijutsuDisturbanceActions';
export const disturbanceEntries=actor=>structuredClone(actor?.getFlag(MODULE_ID,DISTURBANCE_KEY)??[]);
export const disturbanceTurn=game=>game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:null;
export function disturbanceFeature(actor,kind){
 const name={shatter:'Shatter',core:'Unstable Core',flurry:'Disturbance Flurry',reflexes:'Unmatched Reflexes',barrage:'Debilitating Barrage'}[kind];
 return name&&(taijutsuFeature(actor,name,'Disturbance')??(['shatter','core'].includes(kind)?taijutsuFeature(actor,'Blinding Speed','Disturbance'):null));
}
export function disturbanceCost(actor,base){if(!Number.isSafeInteger(base)||base<1)throw Error('Belegter Martial-Dice-Preis erforderlich.');return base>1&&taijutsuFeature(actor,'Disturbing Endurance','Disturbance')?base-1:base;}
export function requireDisturbance(game,actor,kind){const feature=disturbanceFeature(actor,kind);if(!taijutsuEnabled(game)||!actor?.isOwner||!feature)throw Error('Eigenes tatsächliches Disturbance-Feature erforderlich.');return feature;}
function sourceCards(game,actor,kind,target){return [...game.messages].filter(m=>m.type==='usage'&&!m.getFlag(MODULE_ID,'interruptedJutsu')&&m.system?.deltas!==null&&m.getAssociatedItem?.()?.type==='spell'&&(kind==='shatter'?m.getAssociatedActor?.()?.uuid===target?.uuid:m.getAssociatedActor?.()?.uuid===actor.uuid&&isTaijutsu(m.getAssociatedItem()))).slice(-30).reverse();}
function addSelect(host,name,options){const select=document.createElement('select');select.name=name;for(const [value,label]of options){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);}host.append(select);}
export async function beginDisturbance(game,actor,kind){
 const feature=requireDisturbance(game,actor,kind);if(!['shatter','core','flurry','reflexes'].includes(kind))throw Error('Unbekannter Ressourcenablauf.');
 return withCastingActorLock(actor,async()=>{
  const all=disturbanceEntries(actor);if(all.some(e=>['paying','review'].includes(e.status)||e.attackPending))throw Error('Unterbrochene Zahlung/Angriffe zuerst vom GM prüfen.');
  if(all.some(e=>e.kind===kind&&e.status==='active'))throw Error('Vorherigen Ablauf dieser Fähigkeit zuerst beenden.');
  const turn=disturbanceTurn(game),targets=[...game.user.targets].filter(t=>t.actor);if(kind==='shatter'&&targets.length!==1)throw Error('Genau den tatsächlich zaubernden Gegner markieren.');
  if(kind==='reflexes'&&game.combat?.started&&game.combat.combatant?.actor?.uuid!==actor.uuid)throw Error('Tatsächlich eigener Zugbeginn erforderlich.');
  if(['flurry','reflexes'].includes(kind)&&turn&&all.some(e=>e.kind===kind&&e.turn===turn&&!['cancelled'].includes(e.status))&&!game.user.isGM)throw Error('Diese Fähigkeit in diesem Zug bereits bezahlt.');
  const cards=['shatter','core'].includes(kind)?sourceCards(game,actor,kind,targets[0]?.actor):[];if(['shatter','core'].includes(kind)&&!cards.length)throw Error('Passende ursprüngliche Jutsu-Chatkarte fehlt.');
  const div=document.createElement('div'),p=document.createElement('p');
  p.textContent=kind==='shatter'?'Tatsächlich versuchter Jutsu-Cast innerhalb von 15 Fuß, noch keine Wirkung abgewickelt. Bewegung bis zur halben Geschwindigkeit (aufgerundet) und Endposition innerhalb von 5 Fuß selbst bestätigen. Zwei native unbewaffnete Angriffe gegen den ausgewählten Wirker; nur bei zwei bestätigten Treffern CON-Save zur Unterbrechung. Chakra des ursprünglichen Casts bleibt bezahlt.':kind==='core'?'Tatsächlich gerade mit deiner Aktion das gewählte Taijutsu gewirkt. Zwei unbewaffnete Angriffe als Bonusaktion; jeder addiert einen Martial-Schadenswürfel. Nach den beiden Angriffen tatsächlich getroffene Kreaturen für je einen STR-Save gegen Prone bestätigen.':kind==='flurry'?'Einmal pro Zug eine zusätzliche Bonusaktion bestätigen. Normale Variante: 1 Martial Die, Taijutsu oder ein unbewaffneter Angriff mit einem zusätzlichen Martial-Schadenswürfel. Ab Stufe17 alternativ ein Finisher für3 Dice, mit Disturbing Endurance2. Die Bonusaktion und die zulässige Jutsuwahl verwaltet die Gruppe.':'Tatsächlich Beginn deines eigenen Zuges: 1 Martial Die für eine zusätzliche Reaktion, ausschließlich für Taijutsu. Reaktionsverbrauch manuell.';
  div.append(p);if(cards.length)addSelect(div,'source',cards.map(m=>[m.id,m.getAssociatedItem().name+' · '+m.id]));
  if(kind==='flurry')addSelect(div,'mode',[['unarmed','1 Die · ein unbewaffneter Angriff'],['taijutsu','1 Die · zusätzliche Bonusaktion für Taijutsu'],...(taijutsuLevel(actor)>=17?[['finisher',disturbanceCost(actor,3)+' Dice · zusätzliche Bonusaktion für Finisher']]:[])]);
  const chosen=await foundry.applications.api.DialogV2.wait({window:{title:feature.name},content:div.innerHTML,buttons:[{action:'pay',label:'Auslöser, Reichweite und Ressourcen bestätigen',callback:(_e,b)=>({sourceId:b.form.elements.source?.value,mode:b.form.elements.mode?.value})}],rejectClose:false});if(!chosen)return;
  if(kind==='flurry'&&!['unarmed','taijutsu','finisher'].includes(chosen.mode)||chosen.mode==='finisher'&&taijutsuLevel(actor)<17)throw Error('Ungültige Flurry-Variante.');
  const source=chosen.sourceId&&cards.find(m=>m.id===chosen.sourceId);if(cards.length&&!source)throw Error('Tatsächliche ursprüngliche Jutsu-Chatkarte bestätigen.');
  const attacks=['shatter','core'].includes(kind)?2:kind==='flurry'&&chosen.mode==='unarmed'?1:0;
  if(attacks&&!unarmedContext(game,actor))throw Error('Zuerst tatsächlichen Unarmed-Kontext bestätigen.');
  const cost=disturbanceCost(actor,chosen.mode==='finisher'?3:1),pool=taijutsuFeature(actor,'Martial Adept');if(!pool||pool.system.uses.value<cost)throw Error('Nicht genügend Martial Dice.');
  if(['flurry','reflexes'].includes(kind)&&(!turn||all.some(e=>e.kind===kind&&e.turn===turn))&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Tatsächliche Nutzung dieses Zuges'},content:'<p>Tatsächlich einmalige Nutzung im aktuellen Zug oder ausdrücklich erforderliche GM-Korrektur bestätigen.</p>',rejectClose:false}))return;
  const entry={id:foundry.utils.randomID(),kind,name:feature.name,sourceUuid:feature.uuid,status:'paying',turn,at:game.time.worldTime,cost,mode:chosen.mode,sourceMessageId:source?.id,sourceItemUuid:source?.getAssociatedItem()?.uuid,enemy:kind==='shatter'?{uuid:targets[0].actor.uuid,tokenUuid:targets[0].document.uuid,name:targets[0].name}:null,maxAttacks:attacks,attacks:[],die:martialDie(taijutsuLevel(actor))};
  all.push(entry);await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);
  try{await pool.update({'system.uses.spent':pool.system.uses.spent+cost});entry.status='active';await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);return entry;}catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);throw error;}
 });
}
export async function disturbanceAttack(game,actor,id){
 let index,entry;await withCastingActorLock(actor,async()=>{
  const all=disturbanceEntries(actor);entry=all.find(e=>e.id===id);if(!entry)throw Error('Bezahlte Angriffsgruppe fehlt.');requireDisturbance(game,actor,entry.kind);
  if(entry.status!=='active'||entry.attackPending||entry.turn!==disturbanceTurn(game)||entry.attacks.filter(a=>a.status==='rolled').length>=entry.maxAttacks)throw Error('Kein verbleibender bezahlter Angriff dieses Zuges.');
  const targets=[...game.user.targets].filter(t=>t.actor);if(targets.length!==1||entry.enemy&&targets[0].actor.uuid!==entry.enemy.uuid)throw Error('Genau das tatsächliche Angriffsziel wählen; bei Shatter den gespeicherten Wirker.');
  index=entry.attacks.length;entry.attacks.push({index,status:'rolling',target:{uuid:targets[0].actor.uuid,tokenUuid:targets[0].document.uuid,name:targets[0].name}});entry.attackPending=true;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);
 });
 try{
  const result=await attackUnarmedTechnique(game,actor,{martialGroup:{id,index},bonusDice:entry.kind==='core'||entry.kind==='flurry'?{number:1,faces:entry.die}:null,activation:entry.kind==='shatter'?'reaction':'bonus'});
  await withCastingActorLock(actor,async()=>{const all=disturbanceEntries(actor),current=all.find(e=>e.id===id),attack=current?.attacks[index];if(current?.status!=='active'||!current.attackPending||attack?.status!=='rolling')throw Error('Angriffsjournal inzwischen verändert.');attack.status=result?.length?'rolled':'cancelled';attack.rolls=result?.map(r=>r.toJSON())??[];current.attackPending=false;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);});return result;
 }catch(error){const all=disturbanceEntries(actor),current=all.find(e=>e.id===id);if(current){current.status='review';current.error=error.message;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);}throw error;}
}
export async function endDisturbance(game,actor,id){if(!actor.isOwner)throw Error('Eigentümerrechte erforderlich.');return withCastingActorLock(actor,async()=>{const all=disturbanceEntries(actor),entry=all.find(e=>e.id===id);if(!entry)throw Error('Ablauf fehlt.');if((entry.attackPending||['paying','review'].includes(entry.status))&&!game.user.isGM)throw Error('Unterbrechung vom GM prüfen lassen.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Disturbance · beenden/prüfen'},content:'<p>Tatsächlichen Ablauf abgeschlossen bzw. Zahlung und vorhandene Angriffe vom GM geprüft? Bereits bezahlte Ressourcen bleiben verbraucht. Gespeicherte Zielanfragen nicht erneut ausführen.</p>',rejectClose:false})){entry.status='ended';entry.attackPending=false;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);}});}
