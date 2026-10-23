import {isMoldingPrimary} from '../casting/molding-record.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {ALL_MOLDINGS as MOLDINGS,availableMoldings} from '../casting/efficient-molding.mjs';
import {runMoldingAction} from '../foundry/molding-actions.mjs';
import {runMoldingEcho,echoWindow} from '../foundry/molding-echo.mjs';
import {rollMoldingSaves} from '../foundry/molding-saves.mjs';
import {SIMPLE_SUBCLASS_TARGETS,subclassTargetWorkflow,requestSubclassTargets} from '../foundry/subclass-molding-targets.mjs';
import {generationalProtection} from '../casting/generational-protection.mjs';
import {addSolarFinishers} from './solar-finishers.mjs';
/** Ready hooks run after the initial chat render; refresh only already mounted own cards. */
export async function refreshMountedMoldingChat(game,chat){
  for(const element of chat?.element?.querySelectorAll('.message[data-message-id]')??[]){
    const message=game.messages.get(element.dataset.messageId);
    if(message?.getFlag(MODULE_ID,'moldingCast'))await chat.updateMessage(message);
  }
}
export function installMoldingChat(game){
  const targetsManager=subclassTargetWorkflow(game);
  Hooks.on('updateActor',actor=>{for(const request of targetsManager.list(actor)){const message=game.messages.get(request.messageId);if(message)ui.chat.updateMessage(message);}});
  for(const hook of ['updateCombat','deleteCombat'])Hooks.on(hook,()=>{for(const message of game.messages)if(isMoldingPrimary(message)&&message.getFlag(MODULE_ID,'moldingCast')?.ids?.includes('generational'))ui.chat.updateMessage(message);});
  Hooks.on('preUpdateChatMessage',(message,changes)=>{
    const cast=message.getFlag(MODULE_ID,'moldingCast');
    if(cast&&message.system.deltas&&((Object.hasOwn(changes,'system.deltas')&&changes['system.deltas']===null)||changes.system?.deltas===null))changes[`flags.${MODULE_ID}.moldingCast`]={...cast,refunded:true,ended:true};
  });
  Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
    html.querySelectorAll('.n5ese-efficient-molding-chat').forEach(e=>e.remove());
    if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!isMoldingPrimary(message))return;
    const record=message.getFlag(MODULE_ID,'moldingCast'),actor=message.getAssociatedActor(),activity=message.getAssociatedActivity();
    if(!record||!activity)return;
    const panel=document.createElement('section');panel.className='n5ese-molding-chat n5ese-efficient-molding-chat';
    const title=document.createElement('strong');title.textContent='Efficient Molding';panel.append(title);
    const details=document.createElement('p');details.textContent=record.ids.map(id=>MOLDINGS.find(m=>m.id===id)?.name??id).join(' · ')||'Spätere Auslöser verfügbar';panel.append(details);
    if(record.ids.includes('gigawatt')){const note=document.createElement('p');note.textContent='Gigawatt: Zusatzwürfel beim tatsächlichen Schadenswurf; gegen Aberration/Celestial/Mutant vor Verteidigungen eingerechnet. Reaktionen manuell beachten.';panel.append(note);}
    if(record.ids.some(id=>['combination','synchronization'].includes(id))){const note=document.createElement('p');const bonus=record.ids.includes('synchronization')?3:1;note.textContent=`Combination: CHA-Modifikator ${actor.system.abilities.cha.mod} + ${bonus} = ${actor.system.abilities.cha.mod+bonus}. Helfer/Reichweite bestätigt; weitere Combination-Berechnung manuell.`;panel.append(note);}
    if(record.ids.includes('generational')){const note=document.createElement('p');note.textContent=generationalProtection(record,game)?'Generational aktiv: Dieses Jutsu kann bis zum Ende deines nächsten Zuges nicht unterbrochen, negiert oder gebannt werden. Externe Counter-/Dispel-Abläufe können den Schutz über die API abfragen.':'Generational: Schutz beendet.';panel.append(note);}
    if(record.ids.includes('lightning-breaker')){const note=document.createElement('p');note.textContent='Lightning Breaker: Immunität und Resistenz werden ignoriert. Abfangen durch Konstrukte verhindert diese Wirkung nicht; die tatsächliche Zielauswahl bestätigen.';panel.append(note);}
    const targets=document.createElement('p');targets.textContent=Object.entries(record.targets??{}).map(([id,list])=>`${MOLDINGS.find(m=>m.id===id)?.name}: ${list.map(t=>t.name).join(', ')}`).join(' · ');if(targets.textContent)panel.append(targets);
    const run=async(button,operation)=>{button.disabled=true;try{await operation();}catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}};
    if(game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&record.ids.includes('imbuement-master'))for(const button of html.querySelectorAll('[data-action="rollAttack"],[data-action="rollDamage"]')){button.disabled=true;button.title='Imbuement Master ersetzt die Angriffe durch einen CON-Save über Zielwirkungen.';}
    if(record.refunded){details.textContent='Cast erstattet — Molding-Wirkungen beendet';html.querySelector('.card-content,.message-content')?.append(panel);return;}
    if(actor?.isOwner&&(message.isAuthor||game.user.isGM)){
      addSolarFinishers(game,actor,panel,message.id);
      const infusionClaim=message.getFlag(MODULE_ID,'infusionDamageClaim');
      if(game.user.isGM&&['rolling','review'].includes(infusionClaim?.status)){
        const review=document.createElement('button');review.type='button';review.textContent='GM: Infusion-Zusatzschaden geprüft';
        review.addEventListener('click',()=>run(review,async()=>{
          if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Infusion prüfen'},content:'<p>Bereits gewürfelte bzw. angewendete Zusatzwürfel manuell geprüft und korrigiert? Den Zusatz für diesen Cast ohne erneuten Wurf abschließen. Der Grundschaden bleibt verfügbar.</p>',rejectClose:false}))return;
          const damage=game.messages.get(infusionClaim.messageId);if(damage&&damage.id!==message.id)await damage.update({[`flags.${MODULE_ID}.infusionDamageState`]:'ready',[`flags.${MODULE_ID}.infusionDamageBonus`]:[]});
          await message.setFlag(MODULE_ID,'infusionDamageClaim',{...infusionClaim,status:'resolved',resolvedBy:game.user.id});
        }));panel.append(review);
      }
      for(const id of record.ids.filter(id=>game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&SIMPLE_SUBCLASS_TARGETS.includes(id)&&(id!=='chakra-infusion'||!activity.damage?.parts?.length))){
        const existing=targetsManager.list(actor).filter(r=>r.messageId===message.id&&r.ruleId===id);
        if(!existing.some(r=>r.status!=='cancelled'&&(!['sanguine-master','talent-voider'].includes(id)||r.status!=='applied'))){
          const request=document.createElement('button');request.type='button';request.textContent=`${MOLDINGS.find(m=>m.id===id)?.name}: Zielwirkungen`;
          request.addEventListener('click',()=>run(request,()=>requestSubclassTargets(game,targetsManager,message,id)));panel.append(request);
        }
        for(const r of existing){
          const state=document.createElement('p');state.textContent=`${MOLDINGS.find(m=>m.id===id)?.name}: ${r.status} · ${r.targets.map(t=>t.name).join(', ')}`;panel.append(state);
          const add=(label,operation)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>run(button,operation));panel.append(button);};
          if(r.status==='pending'){if(game.user.isGM)add('GM: Zielwirkungen anwenden',()=>targetsManager.apply(actor,r.id));add('Zielanfrage verwerfen',()=>targetsManager.cancel(actor,r.id));}
          if(game.user.isGM&&['applying','review'].includes(r.status))add('GM: Zielvorgang geprüft',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Unterbrochenen Molding-Vorgang prüfen'},content:'<p>Wirkungen wurden geprüft und nötigenfalls manuell korrigiert. Ohne erneute Anwendung abschließen?</p>',rejectClose:false}))await targetsManager.resolve(actor,r.id);});
        }
      }
      if(record.ids.includes('echoing')){
        const state=message.getFlag(MODULE_ID,'echoState')?.state??'pending';
        const status=document.createElement('p');status.textContent=`Echo: ${state} · ${echoWindow(record,actor,game.combat)}`;panel.append(status);
        if(state==='pending')for(const discard of [false,true]){
          const button=document.createElement('button');button.type='button';button.textContent=discard?'Echo verwerfen':'Echo im folgenden Zug wirken';
          button.addEventListener('click',()=>run(button,()=>runMoldingEcho(game,message,{discard})));panel.append(button);
        }
        if(game.user.isGM&&['review','applying'].includes(state)){
          const resolve=document.createElement('button');resolve.type='button';resolve.textContent='GM: Echo geprüft / verwerfen';resolve.addEventListener('click',()=>run(resolve,async()=>{
            if(await foundry.applications.api.DialogV2.confirm({window:{title:'Echo prüfen'},content:'<p>Nach Prüfung vorhandener Folgecasts das Echo abschließen. Es wird nichts erneut gewirkt.</p>',rejectClose:false}))await message.setFlag(MODULE_ID,'echoState',{state:'discarded',resolvedBy:game.user.id});
          }));panel.append(resolve);
        }
      }
      for(const phase of ['concentration','miss','clash'])for(const rule of availableMoldings(activity,{phase})){
        const button=document.createElement('button');button.type='button';button.textContent=rule.name;button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();run(button,()=>runMoldingAction(game,message,rule.id));});panel.append(button);
      }
      if(record.ids.some(id=>['potent','piercing','elitist','generational'].includes(id))&&!record.timing){
        const end=document.createElement('button');end.type='button';end.textContent='Wirkung am Zugende beenden';end.disabled=!!record.ended;
        end.addEventListener('click',()=>run(end,()=>message.setFlag(MODULE_ID,'moldingCast',{...message.getFlag(MODULE_ID,'moldingCast'),ended:true})));panel.append(end);
      }
      if(game.user.isGM&&['review','applying'].includes(message.getFlag(MODULE_ID,'moldingAction')?.state)){
        const review=document.createElement('button');review.type='button';review.textContent='GM: Vorgang geprüft';review.addEventListener('click',()=>run(review,async()=>{
          if(await foundry.applications.api.DialogV2.confirm({window:{title:'Molding-Vorgang prüfen'},content:'<p>Ressourcen und Ergebnis wurden manuell geprüft und nötigenfalls korrigiert. Der Vorgang wird freigegeben, ohne eine Wirkung erneut anzuwenden.</p>',rejectClose:false}))await message.setFlag(MODULE_ID,'moldingAction',{...message.getFlag(MODULE_ID,'moldingAction'),state:'resolved'});
        }));panel.append(review);
      }
    }
    if(message.getFlag(MODULE_ID,'tenaciousDC')){const note=document.createElement('p');note.textContent='Tenacious: Counter-/Dispel-/Interrupt-SG +3 (Clash-Bonus im zugehörigen Wurf).';panel.append(note);}
    html.querySelector('.card-content,.message-content')?.append(panel);
    if(record.ids.some(id=>['careful','heightened','crimson','elitist'].includes(id)))for(const button of html.querySelectorAll('[data-action="rollSave"]')){
      button.addEventListener('click',event=>{
        event.preventDefault();event.stopImmediatePropagation();
        run(button,async()=>{
          const targets=[...new Map([...game.user.targets].filter(t=>t.actor).map(t=>[t.actor.uuid,t.actor])).values()];
          await rollMoldingSaves(game,message,targets,{ability:button.dataset.ability,dc:Number(button.dataset.dc)||activity.save.dc.value});
        });
      },{capture:true});
    }
  });
}
