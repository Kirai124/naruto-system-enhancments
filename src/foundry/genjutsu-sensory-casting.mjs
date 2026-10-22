import {MODULE_ID} from '../settings/register.mjs';
import {sensoryDefinition} from '../casting/genjutsu-sensory.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
import {genjutsuPayload} from '../effects/genjutsu-effects.mjs';
export function prepareSensoryCast(game,item,config){
 if(!genjutsuEnabled(game))return;const definition=sensoryDefinition(item);if(!definition)return;
 const rank=config.jutsu?.rank??item.system.effectiveRank,patch={},record={kind:definition.kind,rank};
 for(const activity of item.system.activities){const base='system.activities.'+activity.id+'.';
  if(definition.kind==='sensing'){const steps=Math.max(0,CONFIG.DND5E.jutsuRankOrder.indexOf(rank)-CONFIG.DND5E.jutsuRankOrder.indexOf('d'));record.rangeFeet=30*2**steps;patch[base+'target.template']={...foundry.utils.deepClone(activity.target.template),type:activity.target.template.type||'sphere',size:String(record.rangeFeet),units:'ft'};patch[base+'target.override']=true;}
  if(definition.kind==='kagura'){
   const advanced=['a','s'].includes(rank);record.rangeFeet=advanced?5280:120;patch[base+'target.template']={...foundry.utils.deepClone(activity.target.template),type:activity.target.template.type||'sphere',size:String(record.rangeFeet),units:'ft'};patch[base+'target.override']=true;
   if(advanced)patch[base+'duration']={...foundry.utils.deepClone(activity.duration),value:'10',units:'minute',concentration:rank!=='s',override:true};
  }
 }
 if(definition.kind==='kagura'&&rank==='s'){patch['system.properties']=[...item.system.properties].filter(p=>p!=='concentration');config.concentration={...config.concentration,begin:false,end:null};}
 patch['flags.'+MODULE_ID+'.genjutsuSensoryCast']=record;item.updateSource(patch);item.prepareFinalAttributes?.();
}
export function installSensoryCleanup(game){
 const cleanup=async actor=>{if(!genjutsuEnabled(game)||!actor?.isOwner||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;const zero=actor.getChakraAvailable()<=0,incapacitated=[...(CONFIG.DND5E.conditionEffects.incapacitated??[])].some(id=>actor.statuses.has(id));if(!zero&&!incapacitated)return;const ids=actor.effects.filter(e=>{const p=genjutsuPayload(e);return p?.sensing&&zero||p?.cloakAura&&(zero||incapacitated);}).map(e=>e.id);if(ids.length)await actor.deleteEmbeddedDocuments('ActiveEffect',ids);};
 Hooks.on('updateActor',actor=>cleanup(actor).catch(console.error));
 for(const event of ['createActiveEffect','updateActiveEffect','deleteActiveEffect'])Hooks.on(event,effect=>cleanup(effect.parent?.documentName==='Actor'?effect.parent:effect.parent?.actor).catch(console.error));
 for(const actor of [...game.actors,...(globalThis.canvas?.scene?.tokens??[])].map(x=>x.actor??x))cleanup(actor).catch(console.error);
}
