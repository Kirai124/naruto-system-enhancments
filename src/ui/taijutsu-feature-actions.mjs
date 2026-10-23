import {registerClassSheetPanel} from './class-window.mjs';
import {castMartialSpecial,rollMartialDefense} from '../foundry/taijutsu-special-casts.mjs';
import {applyMartialAftermath} from '../foundry/taijutsu-aftermath.mjs';
import {castVersatility} from '../foundry/taijutsu-versatility.mjs';
import {chooseUltraSign} from '../foundry/taijutsu-ultra-instinct.mjs';
import {chooseDragonSoul} from '../foundry/taijutsu-dragon-soul.mjs';
import {chooseMasterFocus} from '../foundry/taijutsu-martial-focus.mjs';
import {shortCircuitCatalyst} from '../foundry/taijutsu-catalyst.mjs';
import {chooseNinTaiNature} from '../foundry/taijutsu-nin-tai.mjs';
import {reviewMartialLearning} from '../foundry/taijutsu-learning-review.mjs';
import {learnLegacyTechnique} from '../foundry/taijutsu-technique-learning.mjs';
import {activeSoul} from '../foundry/taijutsu-soul.mjs';
import {configureMartialAbilities} from '../foundry/taijutsu-alternate-ability.mjs';
import {chooseTyphoon} from '../foundry/taijutsu-tempest.mjs';
import {rollMartialFeatureAttack,confirmMartialFeatureHits} from '../foundry/taijutsu-feature-attacks.mjs';
import {martialTargetWorkflow,requestMartialTarget} from '../foundry/taijutsu-action-targets.mjs';
import {featureActionDefinition} from '../foundry/taijutsu-feature-actions.mjs';
import {learnStancerStance} from '../foundry/taijutsu-stancer-learning.mjs';
import {configureRuinKeywords} from '../foundry/taijutsu-buff-actions.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled,taijutsuLevel,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {availableFeatureActions,performFeatureAction,endFeatureAction,featureActions,activeFeatureAction} from '../foundry/taijutsu-feature-actions.mjs';
import {activeStances,selectPrimaryStance} from '../foundry/taijutsu-stancer.mjs';
export function installFeatureActionUI(game){registerClassSheetPanel(game,'taijutsu','.n5ese-martial-actions','Unterklassen & aktive Wirkungen',(sheet,html)=>{
 const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;root?.querySelector('.n5ese-martial-actions')?.remove();if(!taijutsuEnabled(game)||!taijutsuLevel(actor))return;
 const host=root?.querySelector('section[data-tab="features"]');if(!host)return;const panel=document.createElement('section');panel.className='n5ese-ninjutsu-card n5ese-martial-actions';
 const button=(label,fn,enabled=actor.isOwner)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!enabled;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=!enabled;actor.sheet?.render(false);}});panel.append(b);};
 if(taijutsuFeature(actor,'Talented Legacy','Talent & Focus'))button('Talented Legacy · zusätzliche Martial Technique lernen / erfassen',()=>learnLegacyTechnique(game,actor));
 if(taijutsuFeature(actor,'The Prophecy','Matrix')||activeSoul(game,actor))button('Taijutsu · freiwillige CHA/WIS-Attributsoptionen',()=>configureMartialAbilities(game,actor));
 if(taijutsuFeature(actor,'Nature Enhanced Combat','Nin-Tai'))button('Nature Enhanced Combat · feste Release wählen',()=>chooseNinTaiNature(game,actor));
 if(taijutsuFeature(actor,'Master of Combat','Martial Combat'))button('Master of Combat · dauerhaften Focus wählen',()=>chooseMasterFocus(game,actor));
 if(taijutsuFeature(actor,'Dragon Soul','Ultimate Battle'))button('Dragon Soul · tatsächliche Jutsu-Lernwahl speichern',()=>chooseDragonSoul(game,actor));
 if(taijutsuFeature(actor,'Autonomous Ultra Instinct','Ultimate Battle'))button('Ultra Instinct · feste Sign-Wahl speichern',()=>chooseUltraSign(game,actor));
 if(taijutsuFeature(actor,'Typhoon','Tempest'))button('Typhoon · dauerhaften Cyclone-Vorteil wählen',()=>chooseTyphoon(game,actor));
 if(taijutsuFeature(actor,'Anti-Chakra Wavelength','Ruin'))button('Anti-Chakra Wavelength · feste Keywords',()=>configureRuinKeywords(game,actor));
 for(const key of ['taijutsuLegacyLearning','taijutsuStanceLearning'])if((actor.getFlag(MODULE_ID,key)??[]).some(e=>e.status==='creating'))button('GM: unterbrochene Lernwahl prüfen',()=>reviewMartialLearning(game,actor,key),game.user.isGM&&actor.isOwner);
 if(activeFeatureAction(game,actor,'ruin-overdrive')&&!taijutsuFeature(actor,'Unbreakable Catalyst','Ruin'))button('Catalyst · nicht gespeicherten Kurzschluss bestätigen',()=>shortCircuitCatalyst(game,actor,true));
 const actions=availableFeatureActions(actor);if(!actions.length&&!panel.childNodes.length)return;const h=document.createElement('h3');h.textContent='Martial-Unterklassen · gespeicherte Wirkungen';panel.append(h);
 if(taijutsuFeature(actor,'Mixed Martial Arts','Stancer'))button('Stancer · Lernwahl erfassen / Stance lernen',()=>learnStancerStance(game,actor));
 if(taijutsuFeature(actor,'Mixed Martial Arts','Stancer'))button('Stancer · Grundstance: '+(activeStances(game,actor).map(s=>s.item.name).join(' + ')||'keine'),()=>selectPrimaryStance(game,actor));
 for(const action of actions)if(!(action.id==='tempest-free-flurry'&&taijutsuFeature(actor,'Flurry Of Blows'))&&(action.unique===false||!activeFeatureAction(game,actor,action.id)))button(action.name+' · Voraussetzungen / Kosten',()=>performFeatureAction(game,actor,action.id));
 for(const entry of featureActions(actor)){if(!['active','paying','applying','review'].includes(entry.status))continue;const p=document.createElement('p');p.textContent=entry.name+' · '+entry.status+' · '+entry.dice+' Martial Dice'+(entry.chakra?' + '+entry.chakra+' Chakra':'')+(entry.chakraDice?' + '+entry.chakraDice.count+' Chakra Dice':'');panel.append(p);if(entry.status==='active'&&entry.data.specialCast&&entry.data.castState==='ready')button(entry.name+' · vorbereiteten Cast öffnen',()=>castMartialSpecial(game,actor,entry.id));if(entry.status==='active'&&entry.ruleId==='instinctual-inversion'&&entry.data.castState==='applied'&&!entry.preparation?.defense)button('Inversion · Abwehrschaden würfeln',()=>rollMartialDefense(game,actor,entry.id));if(entry.status==='active'&&entry.ruleId==='combat-versatility'&&(!entry.data.castState||entry.data.castState==='ready'))button('Combat Versatility · vorbereiteten Finisher wirken',()=>castVersatility(game,actor,entry.id));if(entry.status==='active'&&entry.data.attacks&&(!entry.data.requiresGuardApplied||entry.data.guardApplied)){if(entry.data.attacks.some(a=>a.status==='pending'))button(entry.name+' · bezahlten Gegenangriff würfeln',()=>rollMartialFeatureAttack(game,actor,entry.id),actor.isOwner&&!entry.attackPending);else if(!entry.data.hitsConfirmed)button(entry.name+' · abgewickelte Treffer bestätigen',()=>confirmMartialFeatureHits(game,actor,entry.id));}button(entry.name+' · beenden / prüfen',()=>endFeatureAction(game,actor,entry.id),actor.isOwner&&(!['paying','applying','review'].includes(entry.status)&&!entry.attackPending||game.user.isGM));}
 for(const entry of featureActions(actor))if(['applied','active'].includes(entry.status)&&featureActionDefinition(entry.ruleId).target&&entry.data.messageId&&(!entry.data.specialCast||entry.data.castState==='applied')&&(entry.ruleId!=='instinctual-inversion'||entry.preparation?.defense?.status==='done')&&(!entry.data.targets||entry.data.targets.length>0)&&!martialTargetWorkflow(game).list(actor).some(r=>r.ruleId===entry.id&&!['cancelled','resolved'].includes(r.status)))button(entry.name+' · bezahlte Zielwirkung speichern',()=>requestMartialTarget(game,actor,entry.id));
 for(const request of martialTargetWorkflow(game).list(actor)){if(['applied','resolved','cancelled'].includes(request.status))continue;const p=document.createElement('p');p.textContent='Zielanfrage · '+request.targets.map(t=>t.name).join(', ')+' · '+request.status;panel.append(p);if(request.status==='pending'){button('GM: gespeicherte Zielwirkung anwenden',()=>martialTargetWorkflow(game).apply(actor,request.id),actor.isOwner&&game.user.isGM);button('Zielanfrage verwerfen',()=>martialTargetWorkflow(game).cancel(actor,request.id));}else button('GM: unterbrochene Zielwirkung nach Prüfung schließen',async()=>{if(await foundry.applications.api.DialogV2.confirm({window:{title:'Martial-Zielwirkung prüfen'},content:'<p>Zahlung, Würfe und alle bereits erfolgten Änderungen manuell geprüft/korrigiert? Ohne Wiederholung schließen.</p>',rejectClose:false}))await martialTargetWorkflow(game).resolve(actor,request.id);},actor.isOwner&&game.user.isGM);}
 for(const entry of featureActions(actor))if(entry.data.aftermath?.status==='pending'&&['active','applied','ended'].includes(entry.status))button(entry.name+' · tatsächliches Minutenende / Nachwirkung bestätigen',()=>applyMartialAftermath(game,actor,entry.id,{manual:true}));
 host.prepend(panel);
 });}
