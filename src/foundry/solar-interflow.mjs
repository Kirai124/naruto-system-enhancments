import {MODULE_ID} from '../settings/register.mjs';
import {ownedSubclassMoldings} from '../casting/subclass-moldings.mjs';
import {refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {withFollowupMoldingGrant} from './shared-molding-casts.mjs';
const path=`flags.${MODULE_ID}.solarFinishers`,busy=new WeakSet(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const solarFinishers=actor=>actor.getFlag(MODULE_ID,'solarFinishers')??[];
export function solarFinisherChoices(actor){
 return [...actor.items].filter(i=>i.type==='spell').flatMap(item=>[...item.system.activities].flatMap(activity=>{
  if(item.system.jutsu.type==='taijutsu'&&item.system.jutsu.keywords.has('finisher'))return [{item,activity,isNin:false,label:`${item.name} · ${activity.name}`}];
  if(item.system.jutsu.type==='ninjutsu'&&activity.type==='attack'&&activity.attack.type.value==='melee')return refinedDamageChoices(activity).map(p=>({item,activity,isNin:true,index:p.index,die:p.die,label:`${item.name} · ${activity.name} · +3d${p.die} (${p.formula})`}));
  return [];
 }));
}
const updateEntry=(actor,id,change)=>actor.update({[path]:solarFinishers(actor).map(e=>e.id===id?{...e,...change}:e)});
export async function runSolarFinisher(game,actor,id,{discard=false}={}){
 if(!actor.isOwner||!game.settings.get(MODULE_ID,'subclassMoldingAutomation')||!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!ownedSubclassMoldings(actor).some(r=>r.id==='solar-interflow'))throw Error('Solar-Feature oder Berechtigung fehlt.');
 if(busy.has(actor))throw Error('Ein Solar-Finisher ist bereits offen.');busy.add(actor);
 try{
  const choice=await withCastingActorLock(actor,async()=>{
   const entry=solarFinishers(actor).find(e=>e.id===id);if(entry?.status!=='pending')throw Error('Kein ausstehender Solar-Finisher.');
   if(game.modules.get(MODULE_ID).api.getSubclassMoldingRequests(actor).find(r=>r.id===entry.requestId)?.status!=='applied')throw Error('Schockwellen-Anwendung zuerst abschließen.');
   const primary=game.messages.get(entry.messageId);if(!primary||primary.getFlag(MODULE_ID,'moldingCast')?.refunded)throw Error('Auslösender Cast fehlt oder wurde erstattet.');
   if(discard){if(await foundry.applications.api.DialogV2.confirm({window:{title:'Solar-Finisher verwerfen'},content:'<p>Gespeicherten Folgecast ungenutzt verwerfen?</p>',rejectClose:false}))await updateEntry(actor,id,{status:'discarded'});return null;}
   const choices=solarFinisherChoices(actor);if(!choices.length)throw Error('Kein eigenes Taijutsu-Finisher- oder Ninjutsu-Nahkampf-Jutsu vorhanden.');
   const selected=await foundry.applications.api.DialogV2.wait({window:{title:'Solar-Interflow-Finisher'},content:`<p>Nur das ursprüngliche Ziel oder eine Kreatur mit fehlgeschlagenem Schockwellen-Save ist zulässig. Reichweite des Folgejutsu bestätigen. Aktionsökonomie bleibt manuell.</p><label>Folgejutsu <select name="jutsu">${choices.map((c,i)=>`<option value="${i}">${esc(c.label)}</option>`).join('')}</select></label><label>Ziel <select name="target">${entry.targets.map((t,i)=>`<option value="${i}">${esc(t.name)}</option>`).join('')}</select></label>`,buttons:[{action:'select',label:'Folgejutsu und zulässiges Ziel bestätigen',callback:(_e,b)=>({choice:Number(b.form.elements.jutsu.value),target:Number(b.form.elements.target.value)})}],rejectClose:false});
   if(!selected)return null;const cast=choices[selected.choice],target=entry.targets[selected.target];if(!cast||!target||!await fromUuid(target.uuid))throw Error('Folgejutsu oder Ziel nicht mehr vorhanden.');
   let reduction=entry.reduction;if(!Number.isInteger(reduction)){const roll=await new Roll('1d6').evaluate();reduction=roll.total;await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'Solar-Finisher · gespeicherter Wirkkostenrabatt'});await updateEntry(actor,id,{reduction,reductionRoll:roll.toJSON()});}
   return {...cast,target,reduction};
  });
  if(!choice)return null;
  const token=await fromUuid(choice.target.tokenUuid);if(token?.parent?.id===globalThis.canvas?.scene?.id)token.object.setTarget(true,{releaseOthers:true});
  const result=await withFollowupMoldingGrant(choice.item,{kind:'solar-interflow',reduction:choice.reduction,isNin:choice.isNin,damageIndex:choice.index,die:choice.die,target:choice.target,onPrepared:()=>updateEntry(actor,id,{status:'applying'})},ticket=>choice.activity.use({n5ese:{sharedMoldingTicket:ticket},consume:{chakra:true,resources:true,action:false}},{configure:true},{create:true}));
  if(!result?.message){if(solarFinishers(actor).find(e=>e.id===id)?.status==='pending')return null;throw Error('Bestätigter Solar-Finisher fehlgeschlagen.');}
  await updateEntry(actor,id,{status:'applied',finisherMessageId:result.message.id});return result;
 }catch(error){if(solarFinishers(actor).find(e=>e.id===id)?.status==='applying')await updateEntry(actor,id,{status:'review',error:error.message});throw error;}
 finally{busy.delete(actor);}
}
