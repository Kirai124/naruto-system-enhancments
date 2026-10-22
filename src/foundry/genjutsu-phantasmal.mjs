import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuAbility,genjutsuLevel,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {activeMoldingEffect,moldingMarker} from '../effects/molding-effects.mjs';

const journalKey='genjutsuPhantasmalJournal';
export const phantasmalBeams=actor=>genjutsuLevel(actor)>=16?4:genjutsuLevel(actor)>=13?3:genjutsuLevel(actor)>=7?2:1;
function requireActor(game,actor){
 const feature=ownedGenjutsuFeature(actor,'Phantasmal Force','Choose Inception');
 if(!genjutsuEnabled(game)||!actor?.isOwner||!feature)throw Error('Phantasmal Force und Quellenberechtigung erforderlich.');
 if(!(taijutsuEnabled(game)&&taijutsuFeature(actor,'Mystic Awakening','Ultimate Battle'))&&actor.effects.some(e=>activeMoldingEffect(game,e)&&moldingMarker(e).metadata?.id==='no-chakra-molding'))throw Error('Chakra Molding ist derzeit durch einen verwalteten Effekt gesperrt.');
 return feature;
}
function beamData(actor,feature,activation,index){
 const ability=genjutsuAbility(actor),offset=actor.system.attributes.jutsu.genjutsu.attack-actor.system.abilities[ability].mod-actor.system.attributes.prof;
 const agonizing=!!ownedGenjutsuFeature(actor,'Agonizing Thoughts','Malleable Mirages'),activityId=foundry.utils.randomID();
 return {_id:foundry.utils.randomID(),name:'Phantasmal Force · Strahl '+(index+1),type:'feat',img:feature.img,effects:[],flags:{[MODULE_ID]:{genjutsuPhantasmal:{activationId:activation.id,sourceActorUuid:actor.uuid,sourceItemUuid:feature.uuid,index,activityId,keywords:['genjutsu','tactile'],agonizing}}},system:{type:{value:'class'},description:{value:feature.system.description.value},activities:{[activityId]:{_id:activityId,type:'attack',name:'Phantasmal Force',activation:{type:'action',value:1},attack:{ability,bonus:String(offset),type:{value:'ranged',classification:'spell'}},damage:{includeBase:false,parts:[{number:1,denomination:10,bonus:agonizing?'@mod':'',types:['psychic']}]},range:{override:true,value:60,units:'ft'},target:{affects:{count:'1',type:'creature'}}}}}};
}
export async function usePhantasmalForce(game,actor){
 requireActor(game,actor);
 return withCastingActorLock(actor,async()=>{
  if(['applying','review'].includes(actor.getFlag(MODULE_ID,journalKey)?.status))throw Error('Unterbrochenen Strahl-Ablauf zuerst vom GM prüfen lassen.');
  const maximum=phantasmalBeams(actor),div=document.createElement('div'),p=document.createElement('p');p.textContent='Bis '+maximum+' Strahlen mit getrennten Angriffen. Vor jedem Angriff das tatsächlich gewählte Ziel markieren. Reichweite 60 ft, 1d10 Psychic je Treffer; Aktionsökonomie manuell. Chakra formen muss tatsächlich möglich sein, auch wenn das Modul eine fremde Sperre nicht erkennt.';div.append(p);
  const select=document.createElement('select');select.name='count';for(let n=1;n<=maximum;n++){const o=document.createElement('option');o.value=String(n);o.textContent=n+' Strahl(en)';o.selected=n===maximum;select.append(o);}div.append(select);
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.name='molding';label.append(check,document.createTextNode('Chakra formen ist möglich; Voraussetzungen bestätigt'));div.append(label);
  const count=await foundry.applications.api.DialogV2.wait({window:{title:'Phantasmal Force'},content:div.innerHTML,buttons:[{action:'attack',label:'Strahlen beginnen',callback:(_e,b)=>b.form.elements.molding.checked?Number(b.form.elements.count.value):null}],rejectClose:false});if(count===null||count===undefined)return;
  if(!Number.isInteger(count)||count<1||count>phantasmalBeams(actor))throw Error('Ungültige Strahlenzahl.');
  const state={id:foundry.utils.randomID(),status:'applying',count,createdAt:game.time.worldTime,beams:[]};await actor.setFlag(MODULE_ID,journalKey,state);
  try{
   for(let index=0;index<count;index++){
    const feature=requireActor(game,actor);
    const proceed=await foundry.applications.api.DialogV2.confirm({modal:false,window:{title:'Phantasmal Force · Strahl '+(index+1)+'/'+count},content:'<p>Jetzt genau das Ziel dieses Strahls markieren und 60-Fuß-Reichweite prüfen. Abbrechen beendet die übrigen Strahlen; bereits gewürfelte Angriffe bleiben bestehen.</p>',rejectClose:false});if(!proceed)break;
    const targets=[...game.user.targets].filter(t=>t.actor);if(targets.length!==1)throw Error('Genau ein Ziel je Strahl markieren.');
    const data=beamData(actor,feature,state,index),item=new CONFIG.Item.documentClass(data,{parent:actor});item.prepareFinalAttributes?.();
    const marker=item.getFlag(MODULE_ID,'genjutsuPhantasmal'),activity=item.system.activities.get(marker.activityId),rolls=await activity.rollAttack({}, {configure:true},{data:{flags:{[MODULE_ID]:{castingSnapshot:item.toObject(),genjutsuPhantasmalAttack:{...marker,id:foundry.utils.randomID(),targetUuid:targets[0].actor.uuid,targetTokenUuid:targets[0].document.uuid}}}}});
    if(!rolls?.length)break;
    state.beams.push({index,targetUuid:targets[0].actor.uuid,rolls:rolls.map(r=>r.toJSON())});await actor.setFlag(MODULE_ID,journalKey,state);
   }
   state.status='applied';await actor.setFlag(MODULE_ID,journalKey,state);return state;
  }catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,journalKey,state);throw error;}
 });
}
export async function resolvePhantasmal(game,actor){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{const state=actor.getFlag(MODULE_ID,journalKey);if(!['applying','review'].includes(state?.status))throw Error('Kein unterbrochener Strahl-Ablauf.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Phantasmal Force prüfen'},content:'<p>Bereits gewürfelte Angriffe und Schäden manuell geprüft? Ohne erneute Strahlen abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,journalKey,{...state,status:'resolved'});});
}
const wrapped=new WeakSet();
export function installPhantasmalGuards(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const attack=p.rollAttack;
  p.rollAttack=function(config={},dialog={},message={}){
   const marker=this.item.getFlag(MODULE_ID,'genjutsuPhantasmal');if(!marker)return attack.call(this,config,dialog,message);
   const feature=requireActor(game,this.actor);if(marker.sourceActorUuid!==this.actor.uuid||marker.sourceItemUuid!==feature.uuid)throw Error('Ursprüngliche Phantasmal-Force-Quelle fehlt.');
   return attack.call(this,config,dialog,{...message,data:{...message.data,flags:{...message.data?.flags,[MODULE_ID]:{...message.data?.flags?.[MODULE_ID],castingSnapshot:this.item.toObject(),genjutsuPhantasmalAttack:{...marker,...message.data?.flags?.[MODULE_ID]?.genjutsuPhantasmalAttack,id:foundry.utils.randomID()}}}}});
  };
 }
}
