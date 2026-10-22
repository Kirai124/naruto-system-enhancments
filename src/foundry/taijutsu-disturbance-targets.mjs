import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {DISTURBANCE_KEY,disturbanceEntries,disturbanceFeature,disturbanceCost,requireDisturbance} from './taijutsu-disturbance.mjs';
import {createSubclassMoldingRequests} from './subclass-molding-requests.mjs';
import {preparedSave} from './preparation-journal.mjs';
import {prepareGenjutsuConditions} from '../effects/genjutsu-effects.mjs';
import {ninjutsuEffectData,upsertNinjutsuEffect,ninjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {interruptJutsu} from './jutsu-interruption.mjs';
const managers=new WeakMap();
const attackCard=m=>m?.getFlag('n5eb','roll.type')==='attack'&&m.rolls?.length;
function groupMessage(game,actor,id,index){return [...game.messages].find(m=>{const g=m.getAssociatedItem?.()?.getFlag(MODULE_ID,'taijutsuDisturbanceGroup');return attackCard(m)&&m.getAssociatedActor()?.uuid===actor.uuid&&g?.id===id&&g.index===index;});}
function context(game,actor,messageId,id){
 const entry=disturbanceEntries(actor).find(e=>e.id===id);if(!entry)throw Error('Bezahlter Disturbance-Vorgang fehlt.');const feature=requireDisturbance(game,actor,entry.kind),message=game.messages.get(messageId);
 if(!['active','paid','ended'].includes(entry.status)||!attackCard(message)||message.getAssociatedActor()?.uuid!==actor.uuid)throw Error('Bezahlter eigener Angriff fehlt oder ist zur GM-Prüfung gesperrt.');
 if(entry.kind==='barrage'){for(const saved of entry.confirmedHits??[]){const m=game.messages.get(saved.id);if(!attackCard(m)||m.getAssociatedActor()?.uuid!==actor.uuid||JSON.stringify(m.rolls.map(r=>r.toJSON()))!==saved.fingerprint)throw Error('Bestätigter Ausgangstreffer inzwischen verändert.');}}
 else{const group=message.getAssociatedItem()?.getFlag(MODULE_ID,'taijutsuDisturbanceGroup');if(group?.id!==entry.id||entry.attacks[group.index]?.status!=='rolled'||entry.attacks.filter(a=>a.status==='rolled').length!==2)throw Error('Die zwei ursprünglichen Angriffe müssen zuerst gewürfelt sein.');}
 const original=entry.kind==='shatter'&&game.messages.get(entry.sourceMessageId);if(entry.kind==='shatter'&&(!original||original.type!=='usage'||original.system?.deltas===null||original.getAssociatedActor()?.uuid!==entry.enemy.uuid))throw Error('Ursprünglicher gegnerischer Cast fehlt oder wurde erstattet.');
 if(original?.getFlag(MODULE_ID,'interruptedJutsu')?.entryId&&original.getFlag(MODULE_ID,'interruptedJutsu').entryId!==entry.id)throw Error('Gegnerischer Cast bereits unterbrochen.');
 return {actor,entry,message,original,record:{castId:entry.id},rule:{source:feature.uuid}};
}
export function disturbanceWorkflow(game){
 if(managers.has(game))return managers.get(game);
 const manager=createSubclassMoldingRequests(game,{storage:'taijutsuDisturbanceRequests',journalPreparation:true,independentTargetSave:true,id:()=>foundry.utils.randomID(),resolve:uuid=>fromUuid(uuid),owner:actor=>{if(!actor.isOwner)throw Error('Eigentümerrechte erforderlich.');},context:(a,m,id)=>context(game,a,m,id),
  async prepare(ctx,request,targets,persist){
   const dc=ctx.actor.system.attributes.jutsu.taijutsu.dc,plans=[];
   for(const target of targets){if(!ctx.entry.confirmedTargets?.some(t=>t.uuid===target.uuid))throw Error('Nur tatsächlich bestätigte getroffene Ziele verwenden.');const saved=await preparedSave(request,persist,target.uuid+':'+ctx.entry.kind,target,{ability:ctx.entry.kind==='core'?'str':'con',target:dc},ctx.message);if(!saved)return null;
    plans.push({dc,total:saved.total,failed:saved.total<dc,conditions:ctx.entry.kind==='core'&&saved.total<dc?prepareGenjutsuConditions(game,target,[{id:'prone',rank:1}]):[]});
   }return plans;
  },
  confirm(ctx,request,plans){const div=document.createElement('div');for(const [i,p]of plans.entries()){const row=document.createElement('p');row.textContent=request.targets[i].name+': '+(ctx.entry.kind==='core'?'STR':'CON')+' '+p.total+' / SG '+p.dc+' · '+(p.failed?'Fehlschlag':'Erfolg');div.append(row);}const p=document.createElement('p');p.textContent=ctx.entry.kind==='shatter'?'Tatsächlich beide Gegenangriffe getroffen und ursprüngliche Jutsu-Wirkung noch nicht angewendet? Bei Fehlschlag diesen Cast als unterbrochen markieren und nur seine verknüpfte Konzentration entfernen. Chakra bleibt bezahlt. Fremdmakros und bereits angewendete Sonderwirkungen muss der GM gegebenenfalls manuell behandeln.':ctx.entry.kind==='core'?'Nach den zwei Angriffen genau ein STR-Save pro tatsächlich getroffener Kreatur. Bei Fehlschlag Prone anwenden; keine zusätzliche Schadensanwendung.':'Beide auslösenden Treffer und ihr vollständiger Schaden bereits abgewickelt? Bei Fehlschlag Verwundbarkeit gegen '+ctx.entry.damageType+' für den nächsten separaten Schaden dieser Art speichern.';div.append(p);return foundry.applications.api.DialogV2.confirm({window:{title:'Disturbance · gespeicherte Zielwirkung'},content:div.innerHTML,rejectClose:false});},
  async apply(target,plan,ctx,request){
   if(!plan.failed)return {saved:true};
   if(ctx.entry.kind==='shatter'){if(target.uuid!==ctx.entry.enemy.uuid)throw Error('Nur den ursprünglichen Wirker unterbrechen.');return {interrupted:await interruptJutsu(game,ctx.original,ctx.actor,ctx.entry)};}
   const data=ctx.entry.kind==='core'?{name:'Unstable Core · Prone',metadata:{genjutsu:{ruleId:'tai-unstable-core',conditions:plan.conditions}}}:{name:'Debilitating Barrage · nächster '+ctx.entry.damageType+'-Schaden',changes:[{key:'system.traits.dv.value',type:'add',value:ctx.entry.damageType,priority:20}],metadata:{taijutsuBarrage:{damageType:ctx.entry.damageType}}};
   if(ctx.entry.kind==='core'&&!plan.conditions.length)return {conditionPrevented:true};const effect=await upsertNinjutsuEffect(target,ninjutsuEffectData({...data,id:'tai-disturbance-'+request.id,sourceActorUuid:ctx.actor.uuid,sourceItemUuid:ctx.rule.source,setting:'taijutsuClassAutomation'}));return {effectId:effect.id};
  },
  async finalize(ctx){const all=disturbanceEntries(ctx.actor),entry=all.find(e=>e.id===ctx.entry.id);entry.targetStatus='applied';await ctx.actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);}
 });managers.set(game,manager);return manager;
}
export async function requestDisturbanceTargets(game,actor,id){return withCastingActorLock(actor,async()=>{
 const all=disturbanceEntries(actor),entry=all.find(e=>e.id===id);if(!entry||!['core','shatter'].includes(entry.kind))throw Error('Passende Angriffsgruppe erforderlich.');requireDisturbance(game,actor,entry.kind);
 if(!['active','ended'].includes(entry.status)||entry.targetStatus||entry.attacks.filter(a=>a.status==='rolled').length!==2)throw Error('Zwei vollständige Angriffe und noch offene Zielwirkung erforderlich.');
 const div=document.createElement('div'),p=document.createElement('p');p.textContent='Die tatsächlichen Treffer bestätigen. Ein fehlgeschlagener Angriff darf nicht ausgewählt werden. Dies verändert keine Angriffswürfe.';div.append(p);
 for(const a of entry.attacks.filter(a=>a.status==='rolled')){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.name='hit'+a.index;label.append(check,document.createTextNode('Angriff '+(a.index+1)+' gegen '+a.target.name+' hat tatsächlich getroffen'));div.append(label);}
 const selected=await foundry.applications.api.DialogV2.wait({window:{title:entry.kind==='core'?'Unstable Core · tatsächliche Treffer':'Shatter · beide Gegenangriffe'},content:div.innerHTML,buttons:[{action:'confirm',label:'Tatsächliche Treffer zur GM-Anwendung speichern',callback:(_e,b)=>entry.attacks.filter(a=>a.status==='rolled'&&b.form.elements['hit'+a.index]?.checked).map(a=>a.index)}],rejectClose:false});if(!selected)return;
 if(!selected.length||entry.kind==='shatter'&&selected.length!==2)throw Error(entry.kind==='shatter'?'Shatter unterbricht nur nach zwei tatsächlichen Treffern.':'Mindestens ein tatsächlicher Treffer erforderlich.');
 const targets=[...new Map(selected.map(i=>[entry.attacks[i].target.uuid,entry.attacks[i].target])).values()],message=groupMessage(game,actor,id,selected[0]);if(!message)throw Error('Ursprüngliche Angriffs-Chatkarte fehlt.');
 entry.confirmedTargets=targets;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);return disturbanceWorkflow(game).request(actor,message.id,entry.id,targets);
 });}
export async function beginBarrage(game,actor){const feature=requireDisturbance(game,actor,'barrage');return withCastingActorLock(actor,async()=>{
 const all=disturbanceEntries(actor);if(all.some(e=>['paying','review'].includes(e.status)||e.attackPending))throw Error('Unterbrochenen Vorgang vom GM prüfen lassen.');
 const targets=[...game.user.targets].filter(t=>t.actor);if(targets.length!==1)throw Error('Genau die tatsächlich zweimal getroffene Kreatur markieren.');
 const cards=[...game.messages].filter(m=>attackCard(m)&&m.getAssociatedActor()?.uuid===actor.uuid).slice(-30).reverse();if(cards.length<2)throw Error('Zwei ursprüngliche native Angriffs-Chatkarten erforderlich.');
 const div=document.createElement('div'),p=document.createElement('p');p.textContent='Mindestens zwei tatsächlich erfolgreiche Angriffe derselben Aktion gegen '+targets[0].name+' bestätigen. Ihr vollständiger Schaden muss bereits abgewickelt sein. Anschließend eine tatsächliche Schadensart für den nächsten separaten Schaden wählen.';div.append(p);
 for(const m of cards){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.name='hit'+m.id;label.append(check,document.createTextNode(m.getAssociatedItem()?.name+' · '+m.rolls[0].total+' · '+m.id));div.append(label);}
 const type=document.createElement('select');type.name='type';for(const id of Object.keys(CONFIG.DND5E.damageTypes)){const o=document.createElement('option');o.value=id;o.textContent=id;type.append(o);}div.append(type);
 const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Debilitating Barrage'},content:div.innerHTML,buttons:[{action:'pay',label:'Gleiche Aktion, getroffene Kreatur, abgewickelten Schaden und Zahlung bestätigen',callback:(_e,b)=>({ids:cards.filter(m=>b.form.elements['hit'+m.id]?.checked).map(m=>m.id),type:b.form.elements.type.value})}],rejectClose:false});if(!choice)return;
 if(choice.ids.length<2||!CONFIG.DND5E.damageTypes[choice.type])throw Error('Zwei tatsächliche Treffer und gültige Schadensart erforderlich.');
 if(all.some(e=>e.kind==='barrage'&&e.confirmedHits?.some(h=>choice.ids.includes(h.id))&&e.status!=='cancelled'))throw Error('Diese Treffer wurden bereits für Barrage verwendet; Korrektur durch GM prüfen.');
 const cost=disturbanceCost(actor,2),pool=taijutsuFeature(actor,'Martial Adept');if(!pool||pool.system.uses.value<cost||feature.system.uses.value<1)throw Error('Martial Dice oder native Barrage-Nutzung fehlt.');
 const entry={id:foundry.utils.randomID(),kind:'barrage',name:feature.name,sourceUuid:feature.uuid,status:'paying',cost,at:game.time.worldTime,damageType:choice.type,confirmedHits:choice.ids.map(id=>({id,fingerprint:JSON.stringify(game.messages.get(id).rolls.map(r=>r.toJSON()))})),confirmedTargets:[{uuid:targets[0].actor.uuid,tokenUuid:targets[0].document.uuid,name:targets[0].name}]};all.push(entry);await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);
 try{await actor.updateEmbeddedDocuments('Item',[{_id:pool.id,'system.uses.spent':pool.system.uses.spent+cost},{_id:feature.id,'system.uses.spent':feature.system.uses.spent+1}]);entry.status='paid';await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);return disturbanceWorkflow(game).request(actor,choice.ids[0],entry.id,entry.confirmedTargets);}catch(error){entry.status='review';entry.error=error.message;await actor.setFlag(MODULE_ID,DISTURBANCE_KEY,all);throw error;}
 });}
export function resumeBarrageTargets(game,actor,id){const entry=disturbanceEntries(actor).find(e=>e.id===id);if(!entry||entry.kind!=='barrage'||!['paid','ended'].includes(entry.status)||entry.targetStatus)throw Error('Keine bezahlte offene Barrage-Zielwirkung.');requireDisturbance(game,actor,'barrage');return disturbanceWorkflow(game).request(actor,entry.confirmedHits[0].id,entry.id,entry.confirmedTargets);}
export function installBarrageVulnerability(game,ActorClass){
 const calculate=ActorClass.prototype.calculateDamage;ActorClass.prototype.calculateDamage=function(parts,options={}){const result=calculate.call(this,parts,options);options.n5eseConsumedBarrage=[];if(result&&(result.amount>0||result.chakraAmount>0))options.n5eseConsumedBarrage=this.effects.filter(e=>{const m=ninjutsuEffect(e)?.metadata?.taijutsuBarrage;return m&&activeNinjutsuEffect(game,e)&&result.some(p=>p.type===m.damageType&&p.value>0)&&(m.damageType==='chakra'?result.chakraAmount>0:result.amount>0);}).map(e=>e.id);return result;};
 Hooks.on('dnd5e.preApplyDamage',(actor,_amount,updates,options)=>{const ids=options.n5eseConsumedBarrage?.filter(id=>actor.effects.has(id));if(ids?.length)updates['flags.'+MODULE_ID+'.taijutsuConsumedBarrage']=[...new Set([...(actor.getFlag(MODULE_ID,'taijutsuConsumedBarrage')??[]).filter(id=>actor.effects.has(id)),...ids])];});
 Hooks.on('dnd5e.applyDamage',(actor,_amount,options)=>{const ids=options.n5eseConsumedBarrage?.filter(id=>actor.effects.has(id));if(actor.isOwner&&ids?.length)actor.deleteEmbeddedDocuments('ActiveEffect',ids).catch(console.error);});
}
