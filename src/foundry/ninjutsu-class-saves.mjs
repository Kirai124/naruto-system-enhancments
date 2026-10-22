import {MODULE_ID} from '../settings/register.mjs';
import {classFeature} from '../casting/ninjutsu-class-options.mjs';
import {rollMoldingSaves} from './molding-saves.mjs';
import {activeNinjutsuEffect,ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
export async function rollClassSaves(game,message,{targets,ability,dc,event}={}){
 const activity=message.getAssociatedActivity();targets??=[...game.user.targets].filter(t=>t.actor).map(t=>t.actor);
 if(!activity||!targets.length)throw Error('Betroffene Tokens auswählen.');
 if(message.getFlag(MODULE_ID,'moldingCast'))return rollMoldingSaves(game,message,targets,{ability,dc});
 for(const target of targets){if(!target.isOwner)throw Error('Der Zielbesitzer oder GM muss die Saves ausführen.');await target.rollSavingThrow({event,ability:ability??[...activity.save.ability][0],target:dc??activity.save.dc.value},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});}
}
export function installClassSaveRules(game,ActorClass,RollClass){
 const p=ActorClass.prototype,original=p.rollSavingThrow;
 p.rollSavingThrow=async function(config={},dialog={},message={}){
  if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation'))return original.call(this,config,dialog,message);
  const primary=game.messages.get(message.data?.flags?.n5eb?.originatingMessage),record=primary?.getFlag(MODULE_ID,'classCast'),source=primary?.getAssociatedActor(),item=primary?.getAssociatedItem();
  if(!source||item?.type!=='spell')return original.call(this,config,dialog,message);
  const choices=record?.choices??[],keys=item.system.jutsu.keywords,rolls=[...(config.rolls??[])],first={...rolls[0],parts:[...(rolls[0]?.parts??[])],options:{...rolls[0]?.options}};
  if(choices.some(c=>c.name==='Water Release Master'&&c.value==='empower'))Object.assign(first.options,{n5eseThreeLowest:true,advantage:false,disadvantage:true});
  if(keys.has('water')&&classFeature(source,'Water Release Master'))Object.assign(first.options,{advantage:false,n5eseNoAdvantage:true});
  if(choices.some(c=>c.name==='Lightning Release Master'&&c.value==='advantage')&&this.getConditionRank('shocked'))first.options.disadvantage=true;
  const molding=primary.getFlag(MODULE_ID,'moldingCast'),statuses=new Set([...item.effects].flatMap(e=>[...(e.statuses??[])]));
  if(molding?.ids?.includes('crimson'))statuses.add('burned');if(molding?.ids?.includes('gigawatt'))statuses.add('shocked');
  if(keys.has('fire')&&classFeature(source,'Fire Release Master')&&statuses.has('burned'))first.options.disadvantage=true;
  if(keys.has('lightning')&&classFeature(source,'Lightning Release Master')&&statuses.has('shocked'))first.parts.push('-1d4');
  const wards=this.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata.nextJutsuSave);
  const ninGen=['ninjutsu','genjutsu'].includes(item.system.jutsu.type)||keys.has('ninjutsu')||keys.has('genjutsu');
  if(ninGen&&wards.length)first.options.advantage=true;
  rolls[0]=first;const result=await original.call(this,{...config,rolls},dialog,message);
  if(ninGen&&wards.length&&result?.length)await this.deleteEmbeddedDocuments('ActiveEffect',wards.map(e=>e.id));
  return result;
 };
 const rp=RollClass.prototype,configure=rp.configureModifiers;
 rp.configureModifiers=function(...args){const result=configure.apply(this,args);if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!this.validD20Roll)return result;if(this.options.n5eseNoAdvantage&&this.options.advantageMode===RollClass.ADV_MODE.ADVANTAGE){this.options.advantageMode=RollClass.ADV_MODE.NORMAL;this.d20.applyAdvantage(RollClass.ADV_MODE.NORMAL);}if(this.options.n5eseThreeLowest){this.d20.number=3;this.d20.modifiers=this.d20.modifiers.filter(m=>!/^adv|^dis|^kh$|^kl$/.test(m));this.d20.modifiers.push('kl');}this.resetFormula();return result;};
 // Native SaveActivity does not forward its source message. Preserve its controlled-token
 // selection while supplying that context to the public native saving-throw API.
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||message.type!=='usage'||message.getAssociatedItem()?.type!=='spell')return;for(const button of html.querySelectorAll('[data-action="rollSave"]')){if(button.dataset.n5eseClassSave)continue;button.dataset.n5eseClassSave='true';button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();let targets=(globalThis.canvas?.tokens?.controlled??[]).filter(t=>t.actor).map(t=>t.actor);if(!targets.length&&game.user.character)targets=[game.user.character];const dc=Number.parseInt(button.dataset.dc);rollClassSaves(game,message,{targets,event,ability:button.dataset.ability,dc:Number.isFinite(dc)?dc:undefined}).catch(e=>ui.notifications.warn(e.message));});}});
}
