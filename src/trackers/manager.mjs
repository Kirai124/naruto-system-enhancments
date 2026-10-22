import {nextActorTurnDeadline} from '../casting/molding-lifetimes.mjs';
import {ninjutsuLevel} from '../casting/ninjutsu-resources.mjs';
import {ninjutsuEffectData} from '../effects/ninjutsu-effects.mjs';
import {applyEmberReduction} from '../foundry/ember-reduction.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {readLedger,liveGroups, addUnit, removeUnits} from './ledger.mjs';
import {ownedTrackers} from './ninjutsu-definitions.mjs';
import {markPlan} from './mark-plan.mjs';
import {poolTargetEffect,readVoidSurcharges} from './pool-targets.mjs';
const path = `flags.${MODULE_ID}.ninjutsuTracker`;
const targetQueues=new WeakMap();
function serializeTarget(target,operation){
  const next=(targetQueues.get(target)??Promise.resolve()).catch(()=>{}).then(operation);targetQueues.set(target,next);
  next.finally(()=>{if(targetQueues.get(target)===next)targetQueues.delete(target);}).catch(()=>{});return next;
}
export function createNinjutsuTracker(game, randomId = () => foundry.utils.randomID(), runtime = {}) {
  const queues = new WeakMap();
  const raw = actor => actor.flags?.[MODULE_ID]?.ninjutsuTracker;
  const now = () => game.time.worldTime;
  const turnKey = actor => game.combat?.started && [...(game.combat.combatants??[])].some(c=>c.actor?.uuid===actor.uuid)
    ? `${game.combat.id}:${game.combat.round}:${game.combat.turn}` : '';
  const warnings = (actor,kind,phase='gain') => {
    if(!ownedTrackers(actor).some(d=>d.id===kind&&(phase==='trigger'||d.gainPerTurn)))return [];
    const key=turnKey(actor);
    const limit=readLedger(raw(actor)).limits?.[kind];
    if(!key)return [];
    if(phase==='trigger')return limit?.triggerTurn===key?['Für dieses Feature wurde im aktuellen Zug bereits ausgelöst. Bitte Ausnahme oder GM-Korrektur bestätigen.']:[];
    const result=limit?.gainTurn===key?['Für dieses Feature wurde im aktuellen Zug bereits ein Eintrag erzeugt. Bitte Ausnahme oder GM-Korrektur bestätigen.']:[];
    if(kind==='ember-marks'&&limit?.triggerTurn===key)result.push('Nach Ember-Mark-Auslösung dürfen im selben Zug keine neuen Ember Marks entstehen. Bitte Ausnahme oder GM-Korrektur bestätigen.');
    if(['lightning-motes','elemental-motes','rain-blades','traditional-inertia','ink-sketches'].includes(kind)&&limit?.spendTurn===key)result.push('Im Zug eines Mote-Verbrauchs dürfen keine neuen Motes entstehen. Bitte Ausnahme oder GM-Korrektur bestätigen.');
    return result;
  };
  function serialize(actor, operation) {
    const result = (queues.get(actor) ?? Promise.resolve()).catch(() => {}).then(operation);
    queues.set(actor, result);
    result.finally(() => {if (queues.get(actor) === result) queues.delete(actor);}).catch(() => {});
    return result;
  }
  function owner(actor) {
    if (!game.settings.get(MODULE_ID,'ninjutsuTrackers') || !actor?.isOwner || actor.type !== 'character') throw Error('Tracker unavailable or permission denied');
  }
  const records=actor=>readLedger(raw(actor)).requests??[];
  const busy=(actor,key)=>records(actor).some(r=>r.key===key&&['pending','applying','review'].includes(r.status));
  function checkBusy(actor,key){if(busy(actor,key))throw Error('Für diese Gruppe liegt eine offene Auslösung vor. Erst anwenden oder abbrechen.');}
  function bladeType(actor, options) {
    const weapon=[...actor.items].find(i=>i.uuid===options.weaponUuid&&i.type==='weapon');
    if(!weapon || ![...(weapon.system?.damage?.base?.types??[])].includes(options.damageType))throw Error('Bitte eine besessene Waffe und ihre tatsächliche Schadensart wählen.');
    return options.damageType;
  }
  function plan(actor,key,options={}) {
    const group=liveGroups(raw(actor),now()).find(g=>g.key===key);
    if(!group?.target || !ownedTrackers(actor).some(d=>d.id===group.kind))throw Error('Aktive eigene Zielmarkierung fehlt.');
    const damageType=group.kind==='blade-marks'?bladeType(actor,options):undefined;
    return {...markPlan(group.kind,group.entries.length,{count:options.count??group.entries.length,damageType,mode:options.mode}),target:group.target,sourceItemUuid:group.sourceItemUuid};
  }
  async function applyDamage(target,damages,id) {
    if(runtime.applyDamage)return runtime.applyDamage(target,damages,id);
    let applied=false,amount;
    const listener=Hooks.on('dnd5e.applyDamage',(actor,value,options)=>{if(actor.uuid===target.uuid&&options.n5eseMarkRequest===id){applied=true;amount=value;}});
    try{await target.applyDamage(damages,{n5eseMarkRequest:id});if(!applied)throw Error('Das System hat die Schadensanwendung abgebrochen.');return {amount};}
    finally{Hooks.off('dnd5e.applyDamage',listener);}
  }
  return Object.freeze({
    list(actor) {
      const groups = liveGroups(raw(actor), now());
      return ownedTrackers(actor).map(definition => ({...definition, groups: groups.filter(g => g.kind === definition.id)}));
    },
    warnings,
    previewTrigger:plan,
    requests:records,
    requestTrigger(actor,key,options={}) {
      return serialize(actor,async()=>{
        owner(actor);checkBusy(actor,key);
        const effect=plan(actor,key,options), state=readLedger(raw(actor));
        const group=state.groups.find(g=>g.key===key);
        const entries=group.entries.filter(e=>e.expiresAt>now()).slice(0,effect.count);
        const next=removeUnits(state,{key,count:effect.count,now:now()});
        const request={id:randomId(),key,effect,entries,weaponUuid:options.weaponUuid??null,status:'pending',createdAt:now(),requestedBy:game.user.id,steps:[]};
        next.requests??=[];next.requests.push(request);
        const turn=turnKey(actor);
        if(turn){request.turn=turn;request.previousTriggerTurn=next.limits?.[effect.kind]?.triggerTurn??null;next.limits??={};next.limits[effect.kind]={...next.limits[effect.kind],triggerTurn:turn};}
        await actor.update({[path]:next});
        return request;
      });
    },
    cancelTrigger(actor,id) {
      return serialize(actor,async()=>{
        owner(actor);
        const state=readLedger(raw(actor)), request=state.requests?.find(r=>r.id===id);
        if(request?.status!=='pending')throw Error('Nur unbearbeitete Anfragen können abgebrochen werden.');
        let group=state.groups.find(g=>g.key===request.key);
        const existing=group?.entries.filter(e=>e.expiresAt>now())??[];
        const restored=request.entries.filter(e=>e.expiresAt>now()&&!existing.some(x=>x.id===e.id));
        if(existing.length+restored.length>5)throw Error('Rückgabe würde das Maximum überschreiten; GM-Korrektur erforderlich.');
        if(restored.length){
          if(!group){group={key:request.key,kind:request.effect.kind,sourceItemUuid:request.effect.sourceItemUuid,target:Object.hasOwn(request,'groupTarget')?request.groupTarget:request.effect.target,entries:[]};state.groups.push(group);}
          group.entries=[...existing,...restored];
        }
        if(request.turn&&state.limits?.[request.effect.kind]?.triggerTurn===request.turn)state.limits[request.effect.kind].triggerTurn=request.previousTriggerTurn;
        request.status='cancelled';await actor.update({[path]:state});return request;
      });
    },
    applyTrigger(actor,id) {
      return serialize(actor,async()=>{
        owner(actor);
        if(!game.user.isGM)throw Error('Auslöse-Anfragen werden vom GM angewendet.');
        if(game.users?.activeGM&&game.users.activeGM.id!==game.user.id)throw Error('Nur der aktive GM wendet Anfragen an, damit mehrere GM-Clients keine Wirkung doppelt ausführen.');
        const state=readLedger(raw(actor)), request=state.requests?.find(r=>r.id===id);
        if(request?.status!=='pending')throw Error('Anfrage bereits bearbeitet oder zur manuellen Prüfung gesperrt.');
        const effect=request.effect;
        if(!ownedTrackers(actor).some(d=>d.id===effect.kind&&d.item.uuid===effect.sourceItemUuid))throw Error('Das ursprüngliche Feature ist nicht mehr vorhanden.');
        const pool=['next-cost','zap','rain-chill','gem-construct','ink-help','ink-dodge','ink-command-dice'].includes(effect.mode);
        const expected=pool?poolTargetEffect(effect,effect.targets??[effect.target],effect.sourceItemUuid):markPlan(effect.kind,request.entries.length,{count:effect.count,mode:effect.mode,damageType:effect.kind==='blade-marks'?bladeType(actor,{weaponUuid:request.weaponUuid,damageType:effect.damageType}):undefined});
        if(expected.label!==effect.label || request.entries.length!==effect.count)throw Error('Anfragedaten passen nicht zur Regeldefinition.');
        const resolve=runtime.resolve??(uuid=>fromUuid(uuid));
        const targets=[];
        for(const reference of effect.targets??[effect.target]){
          const token=await resolve(reference.tokenUuid),target=token?.actor;
          if(!target?.isOwner || target.uuid!==reference.actorUuid)throw Error('Zieltoken fehlt oder seine Actor-Zuordnung hat sich geändert.');
          if(expected.formula&&typeof target.applyDamage!=='function' || expected.condition&&typeof target.applyCondition!=='function')throw Error('Native Ziel-API fehlt.');
          targets.push(target);
        }
        const target=targets[0];
        // Persist before any target mutation. An interrupted operation is never replayed automatically.
        request.status='applying';await actor.update({[path]:state});
        try{
          if(expected.mode==='next-cost'){
            await serializeTarget(target,async()=>{
              const entries=readVoidSurcharges(target);
              if(entries.some(e=>e.id===request.id))throw Error('Dieser Zuschlag wurde bereits gespeichert.');
              await target.update({[`flags.${MODULE_ID}.voidSurcharges`]:[...entries,{id:request.id,sourceActorUuid:actor.uuid,sourceItemUuid:effect.sourceItemUuid,amount:expected.amount}]});
            });
            request.steps.push('surcharge');
          }
          if(expected.mode==='dr'){await applyEmberReduction(game,target,actor,effect.sourceItemUuid);request.steps.push('ember-dr');}
          if(expected.formula){
            const roll=await (runtime.roll??(async formula=>{const r=await new Roll(formula).evaluate();return {total:r.total,json:r.toJSON()};}))(expected.formula);
            if(!Number.isFinite(roll.total)||roll.total<effect.count||roll.total>effect.count*(effect.mode==='zap'?8:effect.kind==='ember-marks'?12:6))throw Error('Ungültiges Würfelergebnis.');
            request.roll=roll;await actor.update({[path]:state});
            request.damageReceipts=[];
            for(const recipient of targets){
              const damage=await serializeTarget(recipient,()=>applyDamage(recipient,[{value:roll.total,type:expected.damageType}],request.id));
              if(Number.isFinite(damage?.amount))request.appliedDamage=damage.amount;
              request.damageReceipts.push({actorUuid:recipient.uuid,amount:damage?.amount});
              request.steps.push(pool?`damage:${recipient.uuid}`:'damage');await actor.update({[path]:state});
            }
          }
          if(expected.condition){for(const recipient of targets)await recipient.applyCondition(expected.condition.id,{...expected.condition,origin:effect.sourceItemUuid});request.steps.push('condition');}
          if(['ink-help','ink-dodge','ink-command-dice'].includes(expected.mode)){if(targets.length>(ninjutsuLevel(actor)>=14?2:1))throw Error('Zu viele Ink Summons.');for(const recipient of targets)await recipient.createEmbeddedDocuments('ActiveEffect',[ninjutsuEffectData({name:expected.label,id:request.id,sourceActorUuid:actor.uuid,sourceItemUuid:effect.sourceItemUuid,setting:'ninjutsuTrackers',lifetime:{deadline:nextActorTurnDeadline(game.combat,recipient.uuid)},metadata:{inkCommandDice:expected.mode==='ink-command-dice'?expected.count:0,dodge:expected.mode==='ink-dodge',help:expected.mode==='ink-help',disengage:expected.mode==='ink-dodge'&&ninjutsuLevel(actor)>=6}})]);request.steps.push('ink-assistance');}
          if(expected.mode==='gem-construct'){await target.createEmbeddedDocuments('ActiveEffect',[ninjutsuEffectData({name:expected.label,id:request.id,sourceActorUuid:actor.uuid,sourceItemUuid:effect.sourceItemUuid,setting:'ninjutsuTrackers',metadata:{reduction:expected.reduction,construct:true}})]);request.steps.push('construct-dr');}
          request.status='applied';request.appliedAt=now();await actor.update({[path]:state});return request;
        }catch(error){request.status='review';request.error=String(error.message);await actor.update({[path]:state});throw Error(`Auslösung zur GM-Prüfung gesperrt: ${error.message}`);}
      });
    },
    resolveReview(actor,id) {
      return serialize(actor,async()=>{
        owner(actor);
        if(!game.user.isGM)throw Error('Manuelle Prüfung erfordert einen GM.');
        const state=readLedger(raw(actor)),request=state.requests?.find(r=>r.id===id);
        if(!['review','applying'].includes(request?.status))throw Error('Keine offene manuelle Prüfung.');
        request.status='resolved';request.resolvedBy=game.user.id;request.resolvedAt=now();
        await actor.update({[path]:state});return request;
      });
    },
    add(actor, kind, target = null) {
      return serialize(actor, async () => {
        owner(actor);
        const definition = ownedTrackers(actor).find(d => d.id === kind);
        if (!definition || definition.targeted !== Boolean(target)) throw Error('Owned feature and matching target required');
        const reference = target ? {actorUuid:target.actorUuid, tokenUuid:target.tokenUuid, name:String(target.name ?? '')} : null;
        checkBusy(actor,JSON.stringify([kind,reference?.actorUuid??null,reference?.tokenUuid??null]));
        const next = addUnit(raw(actor), {kind, sourceItemUuid:definition.item.uuid, target:reference, id:randomId(), now:now()});
        const key=turnKey(actor);
        if(key){next.limits??={};next.limits[kind]={...next.limits[kind],gainTurn:key};}
        await actor.update({[path]:next});
        return next;
      });
    },
    remove(actor, key, count) {
      return serialize(actor, async () => {
        owner(actor);
        checkBusy(actor,key);
        const next = removeUnits(raw(actor), {key, count, now:now()});
        await actor.update({[path]:next});
        return next;
      });
    }
  });
}
