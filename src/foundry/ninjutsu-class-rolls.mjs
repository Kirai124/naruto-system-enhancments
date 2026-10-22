import {MODULE_ID} from '../settings/register.mjs';
import {classCast} from './ninjutsu-class-casting.mjs';
import {ninjutsuEffect,activeNinjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {linkedSummoning} from './ninjutsu-links.mjs';
import {ninjutsuLevel} from '../casting/ninjutsu-resources.mjs';
const wrapped=new WeakSet(),busy=new WeakSet();
export function installNinjutsuClassRolls(game,types){
 for(const {documentClass} of Object.values(types)){
  const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.rollAttack!=='function')continue;wrapped.add(p);const original=p.rollAttack;
  p.rollAttack=async function(config={},dialog={},message={}){
   if((!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&!game.settings.get(MODULE_ID,'ninjutsuTrackers'))||!this.actor?.isOwner)return original.call(this,config,dialog,message);
   const record=game.settings.get(MODULE_ID,'ninjutsuClassAutomation')?classCast(this.item):null,choices=record?.choices??[],rolls=[...(config.rolls??[])],first={...rolls[0],options:{...rolls[0]?.options},parts:[...(rolls[0]?.parts??[])]};
   const primary=record?game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,'classCast')?.id===record.id):[...game.messages].findLast(m=>m.type==='usage'&&m.getAssociatedActor()?.uuid===this.actor.uuid&&m.getAssociatedActivity()?.id===this.id&&m.getAssociatedItem()?.id===this.item.id);
   if(primary&&busy.has(primary))throw Error('Ein Angriff dieser Chatkarte ist noch offen.');if(primary)busy.add(primary);
   try{
    if(choices.some(c=>c.name==='Wrathful Jolts'&&c.value==='critical'))first.options.criticalSuccess=18;
    const targets=[...game.user.targets].filter(t=>t.actor).map(t=>t.actor),target=targets.length===1?targets[0]:null;
    const effects=this.actor.effects.filter(e=>activeNinjutsuEffect(game,e));
    const help=effects.find(e=>ninjutsuEffect(e).metadata.help);let useHelp=false;if(help)useHelp=await foundry.applications.api.DialogV2.confirm({window:{title:'Ink Help'},content:'<p>Help für diesen ersten passenden Angriff verwenden?</p>',rejectClose:false});if(useHelp)first.options.advantage=true;
    if(target?.effects.some(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata.dodge)&&await foundry.applications.api.DialogV2.confirm({window:{title:'Ink Dodge'},content:'<p>Das ausweichende Ziel sieht den Angreifer: Angriff mit Nachteil?</p>',rejectClose:false}))first.options.disadvantage=true;const linkedAttack=effects.reduce((n,e)=>n+(Number(ninjutsuEffect(e).metadata.attack)||0),0);if(linkedAttack)first.parts.push(String(linkedAttack));
    if(choices.some(c=>c.name==='Lightning Release Master'&&c.value==='advantage')&&target?.getConditionRank('shocked'))first.options.advantage=true;
    const counters=structuredClone(primary?.getFlag(MODULE_ID,'classAttackCounts')??{}),used=[];
    const optional=[];if(primary&&choices.some(c=>c.name==='Taijutsu Incorporation'&&c.value==='attack')&&!counters.incorporation)optional.push({id:'incorporation',bonus:'1d4',label:'Taijutsu Incorporation +1d4'});
    for(const name of ['Lightning Release','Versatile Release'])if(primary&&choices.some(c=>c.name===name&&c.value==='attack')&&(counters[name]??0)<2&&target&&(name==='Lightning Release'?target.getConditionRank('shocked')>0:Object.entries(CONFIG.DND5E.conditionTypes).some(([k,v])=>v.category==='elemental'&&target.getConditionRank(k)>0))){const n=1+Number(record.level>=10)+Number(record.level>=18);optional.push({id:name,bonus:String(n),label:name+' +'+n+' ('+(2-(counters[name]??0))+' verfügbar)'});}
    const summon=linkedSummoning(this.actor);if(primary&&this.isSpell&&summon&&(counters.summon??0)<2){const level=ninjutsuLevel(summon.source),n=1+Number(level>=10)+Number(level>=18);optional.push({id:'summon',bonus:String(n),label:'Empowered Summoning +'+n});}
    for(const opt of optional)if(await foundry.applications.api.DialogV2.confirm({window:{title:'Angriffsbonus'},content:'<p>'+opt.label+' für diesen passenden Angriff verwenden?</p>',rejectClose:false})){first.parts.push(opt.bonus);used.push(opt.id);}
    rolls[0]=first;const result=await original.call(this,{...config,rolls},dialog,message);if(result?.length&&useHelp&&help?.parent?.isOwner)await help.delete();if(result?.length&&primary&&used.length){for(const id of used)counters[id]=(counters[id]??0)+1;await primary.setFlag(MODULE_ID,'classAttackCounts',counters);}return result;
   }finally{if(primary)busy.delete(primary);}
  };
 }
 Hooks.on('dnd5e.preCalculateDamage',(actor,damages,options)=>{
  if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation'))return;const conditional=options.originatingMessage?.getFlag?.(MODULE_ID,'castingSnapshot')?.flags?.[MODULE_ID]?.conditionalClassDamage;if(conditional&&!conditional.targets.includes(actor.uuid))return false;
  const msg=options.originatingMessage,primary=msg?.type==='usage'?msg:msg?.getOriginatingMessage?.(),record=primary?.getFlag(MODULE_ID,'classCast'),targets=primary?.getFlag(MODULE_ID,'classDamageTargets')??{};
  const resistance=actor.effects.filter(e=>activeNinjutsuEffect(game,e)).flatMap(e=>ninjutsuEffect(e).metadata.removeResistance??[]);if(resistance.length&&options.ignore!==true)options.ignore={...options.ignore,resistance:options.ignore?.resistance===true?true:new Set([...(options.ignore?.resistance??[]),...resistance])};if(!record)return;
  if(targets['Unstoppable Gale:flying']?.includes(actor.uuid)||targets['Inferno Fury:plant']?.includes(actor.uuid))for(const d of damages)if(!actor.system.traits.dv.value.has(d.type)&&!actor.system.traits.dv.value.has('ALL'))d.value*=2;
  if(targets['Wind Release Master:empower']?.includes(actor.uuid))for(const d of damages)d.value*=2;
  if(targets['Pure Skill:damage']?.includes(actor.uuid)&&damages[0])damages[0].value+=2*record.prof;
  if(record.choices.some(c=>c.name==='Hijutsu Master'&&['empower','area'].includes(c.value))&&options.ignore!==true)options.ignore={...options.ignore,resistance:true};
 });
}
export function addLinkedDamage(game,activity,result){if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!result.rolls?.length)return;const bonus=activity.actor.effects.filter(e=>activeNinjutsuEffect(game,e)).reduce((n,e)=>n+(Number(ninjutsuEffect(e).metadata.damage)||0),0);if(bonus)result.rolls[0].parts.push(String(bonus));}
