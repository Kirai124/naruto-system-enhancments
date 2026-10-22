import {requireDelayedTarget} from '../casting/genjutsu-delay-state.mjs';
import {requireInfusionTarget} from './genjutsu-weapon-casting.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,isGenjutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {classifyGenjutsuSave} from '../casting/genjutsu-rules.mjs';
import {ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {genjutsuEffects,genjutsuPayload} from '../effects/genjutsu-effects.mjs';

const busy=new WeakSet();
export async function rollGenjutsuSaves(game,message,{targets,ability,dc,event}={}){
 const activity=message.getAssociatedActivity();targets??=[...game.user.targets].filter(t=>t.actor).map(t=>t.actor);
 if(!activity||!targets.length)throw Error('Tatsächlich betroffene Tokens auswählen.');
 for(const target of targets){if(!target.isOwner)throw Error('Zielbesitzer oder GM muss den Rettungswurf ausführen.');await target.rollSavingThrow({event,ability:ability??[...activity.save.ability][0],target:dc??activity.save.dc.value},{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});}
}

export function installGenjutsuSaves(game,ActorClass,RollClass){
 const p=ActorClass.prototype,save=p.rollSavingThrow;
 p.rollSavingThrow=async function(config={},dialog={},message={}){
  const id=message.data?.flags?.n5eb?.originatingMessage,origin=game.messages.get(id),primary=origin?.type==='usage'?origin:origin?.getOriginatingMessage?.(),record=primary?.getFlag(MODULE_ID,'genjutsuCast');
  const delayed=genjutsuEnabled(game)&&requireDelayedTarget(game,primary,this.uuid,{save:true}),infusion=genjutsuEnabled(game)&&requireInfusionTarget(game,primary,this.uuid,{save:true});
  const paidReroll=config.n5eseGenjutsuOutcomeReroll&&primary?.getAssociatedActor()?.getFlag(MODULE_ID,'genjutsuOutcomeRequests')?.some(r=>r.id===config.n5eseGenjutsuOutcomeReroll&&r.targetUuid===this.uuid&&['Critical Confusion','Chakra Distortion'].includes(r.ruleId)&&r.status==='applying'&&r.payment==='paid');
  if(delayed?.initial&&!paidReroll&&(this.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]).some(r=>r.messageId===primary.id))throw Error('Speicherungssave bereits vorhanden; vorhandenes Ergebnis bestätigen oder GM-Korrektur durchführen.');
  if(delayed?.initial&&delayed.entry.kind==='brain')config={...config,disadvantage:true};
  if(delayed&&!delayed.initial&&delayed.entry.kind==='remote'&&this.uuid!==delayed.entry.host.uuid&&!(this.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]).some(r=>r.messageId===primary.id))config={...config,ability:'cha'};
  if(!genjutsuEnabled(game)||!record||!isGenjutsu(primary.getAssociatedItem())){if(infusion){const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],parts:[...(rolls[0]?.parts??[]),'-1d4']};config={...config,rolls};}return save.call(this,config,dialog,message);}
  if(busy.has(this))throw Error('Genjutsu-Save für diese Kreatur ist bereits offen.');busy.add(this);
  try{
   const effects=genjutsuEffects(game,this).filter(e=>genjutsuPayload(e).messageId===primary.id);
   if(effects.some(e=>genjutsuPayload(e).noRepeatSaves)&&(this.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]).some(r=>r.messageId===primary.id))throw Error('Beguiling Influence: kein wiederholter Rettungswurf gegen dieses Genjutsu.');
   const sensed=genjutsuEffects(game,this).some(e=>genjutsuPayload(e).sensing&&ninjutsuEffect(e).sourceActorUuid===primary.getAssociatedActor()?.uuid);
   let dc=Number(config.target??primary.getAssociatedActivity()?.save?.dc?.value);if(!Number.isFinite(dc))throw Error('Genjutsu-SG fehlt.');if(sensed&&!config.n5eseGenjutsuAdjustedDC&&ownedGenjutsuFeature(primary.getAssociatedActor(),'Sensory Expertise','Sensory Type')){dc+=1+Number(genjutsuLevel(primary.getAssociatedActor())>=10)+Number(genjutsuLevel(primary.getAssociatedActor())>=19);config={...config,target:dc};}
   if(record.prestigeTarget===this.uuid){
    const entries=structuredClone(this.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]);if(!entries.some(r=>r.castId===record.id&&r.automatic)){const receipt={id:foundry.utils.randomID(),messageId:primary.id,castId:record.id,sourceActorUuid:primary.getAssociatedActor().uuid,targetUuid:this.uuid,total:null,dc,ability:config.ability,penalty:0,outcome:'critical-failure',automatic:'The Prestige',createdAt:game.time.worldTime};await this.setFlag(MODULE_ID,'genjutsuSaveReceipts',[...entries,receipt]);}ui.notifications.info('The Prestige: automatischer kritischer Fehlschlag; konkrete Jutsu-Wirkung entsprechend anwenden.');return [];
   }
   if(primary.getAssociatedItem().getFlag(MODULE_ID,'genjutsuEchoFear')?.targets?.includes(this.uuid))config={...config,disadvantage:true};
   if(primary.getAssociatedItem().getFlag(MODULE_ID,'genjutsuAugmentation')?.insignia?.targets?.includes(this.uuid))config={...config,disadvantage:true};
   const retargetId=config.n5eseGenjutsuRetarget,retarget=retargetId&&primary.getAssociatedActor().getFlag(MODULE_ID,'genjutsuRetargets')?.find(e=>e.id===retargetId&&e.messageId===primary.id&&e.newUuid===this.uuid&&e.status==='pending'),validRetarget=!!retarget&&primary.getAssociatedActor().getFlag(MODULE_ID,'genjutsuRetargetRequests')?.some(r=>r.ruleId===retargetId&&r.status==='pending');if(retargetId&&!validRetarget)throw Error('Reality-Marble-Zielwechsel nicht gültig.');
   const penalty=record.targets?.includes(this.uuid)||validRetarget?record.choice.saveDice:0,rolls=[...(config.rolls??[])];
   rolls[0]={...rolls[0],parts:[...(rolls[0]?.parts??[]),...(penalty?[String(-penalty)]:[]),...(infusion?['-1d4']:[])],options:{...rolls[0]?.options,n5eseGenjutsuSave:true,n5eseGenjutsuNoAdvantage:!!ownedGenjutsuFeature(primary.getAssociatedActor(),'Concealed Unease','Layered Reality')||sensed&&!!ownedGenjutsuFeature(primary.getAssociatedActor(),'Chakra Distortion','Sensory Type')}};
   const beforeMessages=new Set(game.messages.keys());const result=await save.call(this,{...config,rolls},dialog,message);if(!result?.length)return result;
   const receipts=structuredClone(this.getFlag(MODULE_ID,'genjutsuSaveReceipts')??[]);
   for(const roll of result){const rollMessage=[...game.messages].findLast(m=>!beforeMessages.has(m.id)&&m.getAssociatedActor?.()?.uuid===this.uuid&&m.flags?.n5eb?.originatingMessage===primary.id&&m.rolls?.some(r=>r.total===roll.total));receipts.push({rollMessageId:rollMessage?.id,id:foundry.utils.randomID(),messageId:primary.id,castId:record.id,sourceActorUuid:primary.getAssociatedActor().uuid,targetUuid:this.uuid,total:roll.total,dc,ability:config.ability,penalty,infusionPenalty:!!infusion,outcome:(()=>{const result=classifyGenjutsuSave(roll.total,dc,record.mastery);return result==='critical-success'&&(roll.options.n5eseGenjutsuNoCriticalSuccess||genjutsuEffects(game,this).some(e=>genjutsuPayload(e).noCriticalSaveSuccess&&ninjutsuEffect(e).sourceActorUuid===primary.getAssociatedActor()?.uuid))?'success':result;})(),createdAt:game.time.worldTime});}
   await this.setFlag(MODULE_ID,'genjutsuSaveReceipts',receipts);
   return result;
  }finally{busy.delete(this);}
 };
 const rp=RollClass.prototype,configure=rp.configureModifiers;
 rp.configureModifiers=function(...args){const result=configure.apply(this,args);if(genjutsuEnabled(game)&&this.options.n5eseGenjutsuSave&&this.validD20Roll){if(this.options.n5eseGenjutsuNoAdvantage&&this.options.advantageMode===RollClass.ADV_MODE.ADVANTAGE){this.options.advantageMode=RollClass.ADV_MODE.NORMAL;this.d20.applyAdvantage(RollClass.ADV_MODE.NORMAL);this.resetFormula();}this.d20.options.criticalSuccess=null;this.d20.options.criticalFailure=null;}return result;};
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  if(!genjutsuEnabled(game)||message.type!=='usage'||!message.getFlag(MODULE_ID,'genjutsuCast'))return;
  for(const b of html.querySelectorAll('[data-action="rollSave"]')){
   if(b.dataset.n5eseGenjutsuSave||b.dataset.n5eseClassSave)continue;b.dataset.n5eseGenjutsuSave='true';
   b.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();let targets=(globalThis.canvas?.tokens?.controlled??[]).filter(t=>t.actor).map(t=>t.actor);if(!targets.length&&game.user.character)targets=[game.user.character];rollGenjutsuSaves(game,message,{targets,event,ability:b.dataset.ability,dc:Number.isFinite(Number(b.dataset.dc))?Number(b.dataset.dc):undefined}).catch(e=>ui.notifications.warn(e.message));});
  }
 });
}
