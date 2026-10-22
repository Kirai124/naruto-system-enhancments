import {MODULE_ID} from '../settings/register.mjs';
import {classFeature} from '../casting/ninjutsu-class-options.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {poolGroups,spendPools} from '../casting/ninjutsu-pools.mjs';
import {reservePoolRequests} from '../trackers/pool-targets.mjs';
import {ninjutsuLevel} from '../casting/ninjutsu-resources.mjs';

export async function regainTraditionalInertia(game,message){
 const actor=message.getAssociatedActor(),record=message.getFlag(MODULE_ID,'classCast');
 if(!actor?.isOwner||!game.settings.get(MODULE_ID,'ninjutsuTrackers')||!classFeature(actor,'Generational Greatness')||!record?.choices.some(c=>c.name==='Generational Greatness'&&c.value==='inertia'))throw Error('Passender eigener Cast und aktive Tracker erforderlich.');
 return withCastingActorLock(actor,async()=>{
  const round=game.combat?.started?game.combat.id+':'+game.combat.round:'manual',old=actor.getFlag(MODULE_ID,'generationalInertia')??{},count=old.round===round?old.count:0;
  if(count>=2&&round!=='manual')throw Error('Bereits zwei zusätzliche Inertia in dieser Runde erhalten.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Generational Greatness'},content:'<p>Eine tatsächlich betroffene Kreatur hat den Save dieses Jutsu um mindestens 5 verfehlt. Außerhalb des Kampfes die Grenze von zwei pro Runde selbst beachten.</p>',rejectClose:false}))return;
  await game.modules.get(MODULE_ID).api.addNinjutsuTrackerEntry(actor,'traditional-inertia');
  await actor.setFlag(MODULE_ID,'generationalInertia',{round,count:count+1});
 });
}

export async function rollNinjutsuClassClash(game,message,choice,opposingRank){
 const actor=message.getAssociatedActor();if(!actor?.isOwner||!classFeature(actor,choice.name))throw Error('Klassenfeature fehlt.');
 return withCastingActorLock(actor,async()=>{
  const record=message.getFlag(MODULE_ID,'classCast');if(!record?.choices.some(c=>c.name===choice.name&&c.value===choice.value))throw Error('Ursprünglicher Klassen-Cast fehlt.');
  let group;if(choice.name==='Destructive Ichor'){group=poolGroups(actor,game.time.worldTime).find(g=>g.kind==='blood-vials');if(!group?.entries.length)throw Error('Ein Blood Vial erforderlich.');}
  if(choice.name==='Force Of Nature'&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Force of Nature'},content:'<p>Verlorenen Clash und erlaubte Reaktion bestätigen. Genau einen d20 neu würfeln und den vorherigen Wurf damit ersetzen.</p>',rejectClose:false}))return;
  const key='classClashJournal',prior=message.getFlag(MODULE_ID,key);if(['applying','review'].includes(prior?.status))throw Error('Vorherigen Clash zuerst vom GM prüfen lassen.');
  await message.setFlag(MODULE_ID,key,{status:'applying',name:choice.name});
  try{
   const rolls=await actor.rollClash({item:message.getAssociatedItem(),messageId:message.id,rank:record.rank,opposingRank,rounds:choice.name==='Force Of Nature'?1:'auto',rollMode:['Pure Chakra','Generational Greatness','Battle Tendency','Realized Scroll','Destructive Ichor','Pure Skill'].includes(choice.name)?'advantage':'',skill:choice.name==='Battle Tendency'?'mar':'nsh',ability:actor.system.attributes.jutsu.ninjutsu.ability});
   if(rolls?.length&&group){const updates={actor:{},item:[]};spendPools(actor,[{kind:'blood-vials',key:group.key,count:1}],game.time.worldTime,updates);await actor.update(updates.actor);}
   await message.setFlag(MODULE_ID,key,{status:rolls?.length?'applied':'cancelled',name:choice.name});return rolls;
  }catch(error){await message.setFlag(MODULE_ID,key,{status:'review',name:choice.name,error:error.message});throw error;}
 });
}

/** The selected finite clan counter is real inventory data; clan-specific effects stay native/manual. */
export async function useInertiaClanResource(game,message){
 const actor=message.getAssociatedActor(),plans=message.getAssociatedItem()?.getFlag(MODULE_ID,'castingAugmentation')?.pools;
 if(!actor?.isOwner||!game.settings.get(MODULE_ID,'ninjutsuTrackers')||!plans?.some(p=>p.mode==='inertia-clan'))throw Error('Bezahlter Inertia-Cast fehlt.');
 return withCastingActorLock(actor,async()=>{
  const status=message.getFlag(MODULE_ID,'inertiaClanState');if(status&&status!=='cancelled')throw Error('Clan-Ressource bereits verwendet oder zur Prüfung gesperrt.');
  const candidates=[...actor.items].filter(i=>i.type==='feat'&&Number.isInteger(i.system.uses.max)&&i.system.uses.max>0&&i.system.uses.value>0),div=document.createElement('div'),hint=document.createElement('p'),select=document.createElement('select');
  hint.textContent='Die tatsächlich begrenzte Clan-Ressource bestätigen. Eine Nutzung wird verbraucht; ihre konkrete Featurewirkung im nativen Ablauf ausführen. Andere Ressourcen sind nicht berechtigt.';select.name='item';div.append(hint,select);
  for(const item of candidates){const o=document.createElement('option');o.value=item.id;o.textContent=item.name+' · '+item.system.uses.value+'/'+item.system.uses.max;select.append(o);}
  const id=await foundry.applications.api.DialogV2.wait({window:{title:'Traditional Inertia – Clan-Ressource'},content:div.innerHTML,buttons:[{action:'use',label:'Clan-Zugehörigkeit bestätigen und 1 verbrauchen',callback:(_e,b)=>b.form.elements.item.value}],rejectClose:false});if(!id)return;
  const item=actor.items.get(id);if(!candidates.some(i=>i.id===id)||item.system.uses.value<1)throw Error('Ressource nicht mehr verfügbar.');
  await message.setFlag(MODULE_ID,'inertiaClanState','applying');
  try{await item.update({'system.uses.spent':item.system.uses.spent+1});await message.setFlag(MODULE_ID,'inertiaClanResource',{itemId:id,name:item.name});await message.setFlag(MODULE_ID,'inertiaClanState','applied');ui.notifications.info(item.name+': eine Nutzung verbraucht. Konkrete Wirkung ohne erneuten Verbrauch ausführen.');}catch(error){await message.setFlag(MODULE_ID,'inertiaClanState','review');throw error;}
 });
}

export async function commandInkSummon(game,actor,mode){
 if(!actor.isOwner||!game.settings.get(MODULE_ID,'ninjutsuTrackers')||!['ink-help','ink-dodge','ink-command-dice'].includes(mode))throw Error('Ink-Befehl nicht verfügbar.');
 return withCastingActorLock(actor,async()=>{
  const group=poolGroups(actor,game.time.worldTime).find(g=>g.kind==='ink-sketches'),tokens=[...game.user.targets].filter(t=>t.actor),maximum=mode==='ink-command-dice'?1:ninjutsuLevel(actor)>=14?2:1;
  if(!group?.entries.length||!tokens.length||tokens.length>maximum)throw Error('Ein Sketch und ein / ab Stufe 14 bis zu zwei eigene Ink Summons erforderlich.');
  const refs=tokens.map(t=>({actorUuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}));
  if(tokens.some(t=>{const link=t.actor.getFlag(MODULE_ID,'ninjutsuLink');return link?.kind!=='ink'||link.sourceActorUuid!==actor.uuid;}))throw Error('Zuerst tatsächlich eigene Ink Summons verknüpfen.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Ink Summon kommandieren'},content:'<p>Passenden Befehl und Reichweite bestätigen. Einen Sketch verbrauchen und Help bzw. Dodge als GM-Anfrage speichern? Help gilt bis 30 Fuß, ab Stufe 6 bis 60 Fuß. Im Verbrauchszug keinen Sketch erzeugen. Aktionsökonomie bleibt manuell.</p>',rejectClose:false}))return;
  let count=1;if(mode==='ink-command-dice'){count=await foundry.applications.api.DialogV2.wait({window:{title:'Ink Sketches – Zusatzwürfel'},content:'<select name="count">'+group.entries.map((_e,i)=>'<option>'+(i+1)+'</option>').join('')+'</select>',buttons:[{action:'spend',label:'Anzahl bestätigen',callback:(_e,b)=>Number(b.form.elements.count.value)}],rejectClose:false});if(!count)return;}const plan={kind:'ink-sketches',mode,count,key:group.key},updates={actor:{},item:[]},turn=game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:'';
  spendPools(actor,[plan],game.time.worldTime,updates,turn);reservePoolRequests(actor,[plan],{'ink-sketches':refs},game.time.worldTime,updates,()=>foundry.utils.randomID(),game.user.id);await actor.update(updates.actor);
 });
}

export function installNinjutsuClassActions(game){
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-class-actions')?.remove();if(message.type!=='usage')return;
  const actor=message.getAssociatedActor();if(!actor?.isOwner)return;
  const div=document.createElement('section');div.className='n5ese-molding-chat n5ese-class-actions';
  const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();ui.chat.updateMessage(message);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});div.append(b);};
  const plans=message.getAssociatedItem()?.getFlag(MODULE_ID,'castingAugmentation')?.pools??[];
  if(game.settings.get(MODULE_ID,'ninjutsuTrackers')){
   if(plans.some(p=>p.mode==='inertia-clan'))button('Inertia – Clan-Ressource nutzen',()=>useInertiaClanResource(game,message));
   const rain=plans.find(p=>p.mode==='rain-move');if(rain){const hint=document.createElement('p');hint.textContent='Rain Blades: bestätigte Ziele bis zu '+rain.count*5+' Fuß verschieben; Position und Bewegung manuell.';div.append(hint);}
  }
  if(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')){
   if(message.getFlag(MODULE_ID,'classCast')?.choices.some(c=>c.name==='Generational Greatness'&&c.value==='inertia'))button('Save um 5 verfehlt – Inertia +1',()=>regainTraditionalInertia(game,message));
   for(const key of ['classSelfState','classClashJournal','conditionalClassDamage','enhancementFinisher','inertiaClanState','poolRainState','imbuementState']){const state=message.getFlag(MODULE_ID,key),status=typeof state==='string'?state:state?.status;if(game.user.isGM&&['review','applying'].includes(status))button('GM: '+key+' prüfen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Unterbrochenen Vorgang abschließen'},content:'<p>Bereits ausgeführte Wirkungen und Ressourcen manuell geprüft/korrigiert? Ohne erneute Ausführung abschließen.</p>',rejectClose:false}))await message.setFlag(MODULE_ID,key,typeof state==='string'?'resolved':{...state,status:'resolved'});});}
  }
  if(div.children.length)html.append(div);
 });
}
