import {MODULE_ID} from '../settings/register.mjs';
import {ownedTrackers} from '../trackers/ninjutsu-definitions.mjs';
const hints = {
  'blood-vials':'Passenden Ninjutsu-Cast mit Acid/Necrotic/Poison bestätigen; einmal pro Zug.',
  'rain-blades':'Water-Release-Cast bestätigen; im Verbrauchszug keine Rain Blade erzeugen.',
  'traditional-inertia':'Hijutsu mit Ninjutsu-Keyword bestätigen; im Verbrauchszug keine Inertia erzeugen.',
  'solid-gems':'Schaden an dir oder einem tatsächlichen eigenen Konstrukt bestätigen; einmal pro Zug.',
  'ink-sketches':'Beast Imitating Art gewirkt oder Ink Summon kommandiert; im Verbrauchszug keinen Sketch erzeugen.',
  'void-shards':'Bestätige: Schaden durch ein Release-Jutsu erlitten oder ein Ninjutsu ohne Nature Release gewirkt; regulär einmal pro Zug.',
  'lightning-motes':'Bestätige einen passenden Lightning-Release-Cast. Im selben Zug nicht gleichzeitig Motes erzeugen und ausgeben; Sonderfeatures beachten.',
  'elemental-motes':'Bestätige einen passenden Nature-Release-Cast. Im selben Zug nicht gleichzeitig Motes erzeugen und ausgeben; Sonderfeatures beachten.',
  'breeze-marks':'Bestätige einen Wind-Release-Cast und ein tatsächlich betroffenes Ziel; regulär einmal pro Zug.',
  'ember-marks':'Bestätige Schaden durch ein Fire-Release-Jutsu an diesem Ziel; im Zug des Auslösens keine neue Marke.',
  'blade-marks':'Bestätige Treffer oder fehlgeschlagenen Save durch ein berechtigtes Bukijutsu mit Ninjutsu-Keyword.'
};
const icons = {'void-shards':'fa-gem','lightning-motes':'fa-bolt','elemental-motes':'fa-circle-nodes','breeze-marks':'fa-wind','ember-marks':'fa-fire','blade-marks':'fa-khanda'};
function pips(count) {
  const track=document.createElement('div');track.className='n5ese-ninjutsu-pips';
  track.setAttribute('role','img');track.setAttribute('aria-label',`${count} von 5`);
  for(let i=0;i<5;i++){const pip=document.createElement('i');pip.className=i<count?'filled':'';pip.setAttribute('aria-hidden','true');track.append(pip);}
  return track;
}
export function renderNinjutsuTrackers(game,sheet,html,manager) {
  const actor=sheet.actor??sheet.document, root=html instanceof HTMLElement?html:sheet.element;
  if(!root?.querySelector || actor?.type!=='character')return;
  root.querySelectorAll('.n5ese-ninjutsu,.n5ese-tracker-link').forEach(e=>e.remove());
  root.querySelectorAll('[data-n5ese-tracker-managed]').forEach(e=>e.removeAttribute('data-n5ese-tracker-managed'));
  if(!game.settings.get(MODULE_ID,'ninjutsuTrackers'))return;
  const definitions=manager.list(actor), requests=manager.requests(actor), host=root.querySelector('section[data-tab="features"]');
  if(!definitions.length || !host)return;
  const panel=document.createElement('section');panel.className='n5ese-ninjutsu';
  const title=document.createElement('h3');title.textContent='Ninjutsu — Ressourcen & Marks';panel.append(title);
  const note=document.createElement('small');note.textContent='Eigene Pools & Zielmarkierungen · 1 Minute Gruppenlaufzeit';panel.append(note);
  const cards=document.createElement('div');cards.className='n5ese-ninjutsu-cards';panel.append(cards);
  const error=e=>{console.error(`[${MODULE_ID}] Ninjutsu tracker`,e);ui.notifications.error(e.message);};
  const run=async(button,operation)=>{button.disabled=true;try{await operation();sheet.render(false);}catch(e){error(e);}finally{button.disabled=!actor.isOwner;}};
  for(const definition of definitions){
    const card=document.createElement('section');card.className='n5ese-ninjutsu-card';card.dataset.kind=definition.id;
    const row=document.createElement('header');
    const name=document.createElement('strong');
    const icon=document.createElement('i');icon.className=`fa-solid ${icons[definition.id]??'fa-gem'}`;icon.setAttribute('aria-hidden','true');name.append(icon,document.createTextNode(definition.label));row.append(name);
    const count=document.createElement('span');count.className='n5ese-ninjutsu-count';count.textContent=definition.targeted?`${definition.groups.length} ${definition.groups.length===1?'Ziel':'Ziele'}`:`${definition.groups[0]?.entries.length??0} / 5`;row.append(count);card.append(row);
    if(!definition.targeted)card.append(pips(definition.groups[0]?.entries.length??0));
    if(definition.targeted&&!definition.groups.length){const empty=document.createElement('p');empty.className='n5ese-ninjutsu-empty';empty.textContent='Noch kein Ziel markiert';card.append(empty);}
    const add=document.createElement('button');add.type='button';add.textContent=definition.targeted?'+ Marke auf Ziel':'+1';add.disabled=!actor.isOwner;
    add.addEventListener('click',event=>{event.preventDefault();run(add,async()=>{
      let target=null;
      if(definition.targeted){
        const targets=[...(game.user.targets??[])].filter(t=>t.actor);
        if(targets.length!==1)throw Error('Bitte genau einen betroffenen Token als Ziel auswählen.');
        const token=targets[0];target={actorUuid:token.actor.uuid,tokenUuid:token.document?.uuid??token.uuid,name:token.name??token.actor.name};
      }
      const content=document.createElement('p');content.textContent=`${hints[definition.id]} ${target?`Ziel: ${target.name}.`:''} ${manager.warnings(actor,definition.id).join(' ')} Neue Einträge erneuern diese aktive Gruppe auf 1 Minute, auch bei bereits 5 Einträgen.`;
      if(await foundry.applications.api.DialogV2.confirm({window:{title:definition.label},content:content.outerHTML,rejectClose:false}))await manager.add(actor,definition.id,target);
    });});add.className='n5ese-ninjutsu-add';card.append(add);cards.append(card);
    for(const group of definition.groups){
      const detail=document.createElement('div');detail.className='n5ese-ninjutsu-group';
      const label=document.createElement('strong');label.className='n5ese-ninjutsu-target';label.textContent=group.target?.name??'Eigener Pool';detail.append(label);
      const time=document.createElement('span');time.className='n5ese-ninjutsu-time';time.textContent=`${group.entries.length}/5 · ${Math.ceil(Math.max(...group.entries.map(e=>e.expiresAt))-game.time.worldTime)} s`;detail.append(time);
      if(group.target)detail.append(pips(group.entries.length));
      if(group.target){detail.title=`${group.target.actorUuid}\n${group.target.tokenUuid}`;}
      if(group.target){
        const trigger=document.createElement('button');trigger.type='button';trigger.textContent='Auslösen';trigger.disabled=!actor.isOwner;
        trigger.addEventListener('click',event=>{event.preventDefault();run(trigger,async()=>{
          const form=document.createElement('div'),hint=document.createElement('p');
          hint.textContent=definition.id==='breeze-marks'?'Bestätige Wind-Schaden am markierten Ziel. Alle eigenen Breeze Marks werden ausgelöst.':definition.id==='ember-marks'?'Bestätige Fire-Schaden am markierten Ziel. Wähle Fire-Zusatzschaden oder genau eine Marke für DR −4 bis zum aktuellen Zugende.':'Bestätige Treffer oder fehlgeschlagenen Save durch berechtigtes Bukijutsu mit Ninjutsu-Keyword. Alle eigenen Blade Marks werden ausgelöst.';form.append(hint);
          const warning=document.createElement('p');warning.textContent=manager.warnings(actor,definition.id,'trigger').join(' ');form.append(warning);
          if(definition.id==='ember-marks'){
            const mode=document.createElement('select');mode.name='mode';for(const [value,text] of [['damage','Fire-Zusatzschaden'],['dr','Eine Marke: DR −4 bis Zugende']]){const o=document.createElement('option');o.value=value;o.textContent=text;mode.append(o);}form.append(mode);
            const label=document.createElement('label');label.textContent='Anzahl Ember Marks (bei DR immer eine)';
            const select=document.createElement('select');select.name='count';
            for(let i=1;i<=group.entries.length;i++){const option=document.createElement('option');option.value=String(i);option.textContent=`${i} Marks: ${i}d12 Fire`;select.append(option);}label.append(select);form.append(label);
          }
          if(definition.id==='blade-marks'){
            const label=document.createElement('label');label.textContent='Verwendete Waffe und Schadensart';const select=document.createElement('select');select.name='weapon';
            for(const weapon of actor.items)if(weapon.type==='weapon')for(const type of weapon.system?.damage?.base?.types??[]){
              if(!CONFIG.DND5E.damageTypes[type])continue;
              const option=document.createElement('option');option.value=JSON.stringify({weaponUuid:weapon.uuid,damageType:type});option.textContent=`${weapon.name} — ${game.i18n.localize(CONFIG.DND5E.damageTypes[type].label)}`;select.append(option);
            }
            if(!select.children.length)throw Error('Keine besessene Waffe mit belegter Schadensart vorhanden.');label.append(select);form.append(label);
          }
          const info=document.createElement('p');info.textContent=`Ziel: ${group.target.name}. Die bestätigte Anfrage reserviert die Marks und bleibt bis zur GM-Anwendung gespeichert. Ohne Anwendung kannst du sie abbrechen; nur noch nicht abgelaufene Marks werden zurückgegeben.`;form.append(info);
          const options=await foundry.applications.api.DialogV2.wait({window:{title:`${definition.label} auslösen`},content:form.innerHTML,buttons:[
            {action:'request',label:'Anfrage speichern',callback:(_e,b)=>{const values=new FormDataExtended(b.form).object;return {...(values.weapon?JSON.parse(values.weapon):{}),mode:values.mode,count:values.mode==='dr'?1:values.count?Number(values.count):group.entries.length};}},
            {action:'cancel',label:'Abbrechen',callback:()=>null}],rejectClose:false});
          if(options){await manager.requestTrigger(actor,group.key,options);ui.notifications.info('Mark-Auslösung gespeichert. Der GM kann sie im Tracker anwenden.');}
        });});detail.append(trigger);
      }
      const remove=document.createElement('button');remove.type='button';remove.textContent='Einträge korrigieren';remove.disabled=!actor.isOwner;
      remove.addEventListener('click',event=>{event.preventDefault();run(remove,async()=>{
        const form=document.createElement('div'),hint=document.createElement('p');hint.textContent='Nur den gespeicherten Zähler reduzieren. Schaden, Conditions und Kostenmodifikatoren werden dadurch noch nicht angewendet.';form.append(hint);
        const select=document.createElement('select');select.name='count';
        for(let i=1;i<=group.entries.length;i++){const option=document.createElement('option');option.value=String(i);option.textContent=`${i} entfernen`;select.append(option);}form.append(select);
        const choice=await foundry.applications.api.DialogV2.wait({window:{title:definition.label},content:form.innerHTML,buttons:[
          {action:'apply',label:'Entfernen',callback:(_e,b)=>Number(new FormDataExtended(b.form).object.count)},
          {action:'cancel',label:'Abbrechen',callback:()=>null}],rejectClose:false});
        if(choice)await manager.remove(actor,group.key,choice);
      });});remove.className='n5ese-ninjutsu-correct';detail.append(remove);card.append(detail);
    }
    const latest=requests.filter(r=>r.effect.kind===definition.id&&r.status==='applied').at(-1);
    if(latest){const result=document.createElement('p');result.className='n5ese-ninjutsu-result';result.textContent=`Zuletzt angewendet: ${latest.effect.target.name} · ${latest.effect.label}${latest.roll?` · Wurf ${latest.roll.total}`:''}${Number.isFinite(latest.appliedDamage)?` · Schaden ${latest.appliedDamage}`:''}`;card.append(result);}
    for(const request of requests.filter(r=>r.effect.kind===definition.id&&['pending','applying','review'].includes(r.status))){
      const detail=document.createElement('div');detail.className='n5ese-ninjutsu-request';
      const label=document.createElement('p');label.textContent=`${request.effect.target.name}: ${request.effect.label} · ${request.status==='pending'?'GM-Anwendung ausstehend':'GM-Prüfung nötig; keine automatische Wiederholung'}`;detail.append(label);
      if(request.status==='pending'){
        if(game.user.isGM){const apply=document.createElement('button');apply.type='button';apply.textContent='GM: Anwenden';apply.addEventListener('click',()=>run(apply,async()=>{
          const content=document.createElement('p');content.textContent=`${request.effect.target.name}: ${request.effect.label}. Jetzt würfeln (falls nötig) und die native Wirkung anwenden?`;
          if(await foundry.applications.api.DialogV2.confirm({window:{title:'Mark-Wirkung anwenden'},content:content.outerHTML,rejectClose:false}))await manager.applyTrigger(actor,request.id);
        }));detail.append(apply);}
        const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Anfrage abbrechen';cancel.disabled=!actor.isOwner;
        cancel.addEventListener('click',()=>run(cancel,async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Unbearbeitete Anfrage abbrechen'},content:'<p>Ohne Zielwirkung abbrechen und noch aktive reservierte Marks zurückgeben?</p>',rejectClose:false}))await manager.cancelTrigger(actor,request.id);}));detail.append(cancel);
      }else if(game.user.isGM){
        const resolve=document.createElement('button');resolve.type='button';resolve.textContent='Prüfung abschließen';resolve.addEventListener('click',()=>run(resolve,async()=>{
          if(await foundry.applications.api.DialogV2.confirm({window:{title:'Manuelle GM-Prüfung abschließen'},content:'<p>Prüfe und korrigiere Zielzustand und Zähler zuerst manuell. Danach wird nur die Sperre aufgehoben. Es wird keine Wirkung wiederholt und kein Mark zurückgegeben.</p>',rejectClose:false}))await manager.resolveReview(actor,request.id);
        }));detail.append(resolve);
      }
      card.append(detail);
    }
  }
  const status=document.createElement('small');status.className='n5ese-ninjutsu-status';status.textContent='Shards/Motes im Castingdialog ausgeben · Zielwirkungen als gespeicherte GM-Anfrage · Ember-DR noch offen';panel.append(status);
  host.prepend(panel);
  for(const definition of definitions){
    const itemRow=[...host.querySelectorAll('[data-item-id]')].find(e=>e.dataset.itemId===definition.item.id);
    if(!itemRow)continue;
    itemRow.dataset.n5eseTrackerManaged='true';
    const button=document.createElement('button');button.type='button';button.className='n5ese-tracker-link';button.textContent='Tracker';
    button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();panel.scrollIntoView({block:'start'});});
    itemRow.querySelector('.item-row > .item-uses')?.append(button);
  }
}
export function installNinjutsuTrackers(game,manager){
  Hooks.on('renderCharacterActorSheet',(sheet,html)=>renderNinjutsuTrackers(game,sheet,html,manager));
  Hooks.on('dnd5e.preUseActivity',activity=>{
    if(!game.settings.get(MODULE_ID,'ninjutsuTrackers'))return;
    const item=activity.item;
    if(!item?.actor || !ownedTrackers(item.actor).some(d=>d.item.id===item.id))return;
    item.actor.sheet?.render(true);
    ui.notifications.info('Dieses Feature wird im Ninjutsu-Tracker des Features-Tabs verwaltet.');
    return false;
  });
  const actors=()=>[...game.actors,...(globalThis.canvas?.tokens?.placeables??[]).map(t=>t.actor)].filter((actor,index,array)=>actor&&array.indexOf(actor)===index);
  const knownRequests=new Set();
  const notifyPending=actor=>{
    if(!game.user?.isGM)return;
    let requests;
    try{requests=manager.requests(actor);}catch(error){console.warn(`[${MODULE_ID}] Tracker state unavailable`,actor.uuid,error);return;}
    for(const request of requests.filter(r=>r.status==='pending')){
      const key=`${actor.uuid}:${request.id}`;
      if(knownRequests.has(key))continue;
      knownRequests.add(key);ui.notifications.info(`Mark-Auslösung wartet: ${actor.name} → ${request.effect.target.name}. Im Ninjutsu-Tracker des Quellen-Charakters anwenden.`);
    }
  };
  for(const actor of actors())if(actor.flags?.[MODULE_ID]?.ninjutsuTracker)notifyPending(actor);
  Hooks.on('updateActor',actor=>{if(actor.flags?.[MODULE_ID]?.ninjutsuTracker)notifyPending(actor);});
  const refresh=()=>{for(const actor of actors())if(actor.flags?.[MODULE_ID]?.ninjutsuTracker)actor.sheet?.render(false);};
  Hooks.on('updateWorldTime',refresh);
  game.settings.settings.get(`${MODULE_ID}.ninjutsuTrackers`).onChange=()=>{for(const actor of actors())actor.sheet?.render(false);};
}
