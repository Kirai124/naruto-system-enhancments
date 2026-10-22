import {MODULE_ID} from '../settings/register.mjs';
import {activeNinjutsuEffect,ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';

/** Explicitly match the stored once-per-cast penalty to its actual affected check. */
export function installVoidChecks(game,ActorClass){
 const p=ActorClass.prototype,skill=p.rollSkill,busy=new WeakSet();
 p.rollSkill=async function(config={},...args){
  if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!this.isOwner||busy.has(this))return skill.call(this,config,...args);
  const kind=config.hookNames?.includes('clash')?'clash':config.hookNames?.includes('concentration')?'concentration':null;
  const effects=kind?this.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata.voidPenalty===kind):[];
  if(!effects.length)return skill.call(this,config,...args);
  busy.add(this);try{
   // One pending source is selected per check; no inferred stacking of the same penalty.
   const content=document.createElement('div'),hint=document.createElement('p'),select=document.createElement('select');hint.textContent='Nur den tatsächlich von diesem Cast betroffenen Check zuordnen. Ein bestätigter Malus wird erst nach einem ausgeführten Wurf verbraucht.';select.name='effect';const none=document.createElement('option');none.value='';none.textContent='Keiner dieser gespeicherten Mali';select.append(none);for(const e of effects){const o=document.createElement('option');o.value=e.id;o.textContent=e.name+' · '+ninjutsuEffect(e).metadata.messageId;select.append(o);}content.append(hint,select);
   const id=await foundry.applications.api.DialogV2.wait({window:{title:'Void Specialization −3'},content:content.innerHTML,buttons:[{action:'roll',label:'Check fortsetzen',callback:(_e,b)=>b.form.elements.effect.value}],rejectClose:false});if(id===null||id===undefined)return null;
   const effect=effects.find(e=>e.id===id);if(effect){const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],parts:[...(rolls[0]?.parts??[]),'-3']};config={...config,rolls};}
   const result=await skill.call(this,config,...args);if(effect&&result?.length)await effect.delete();return result;
  }finally{busy.delete(this);}
 };
}
