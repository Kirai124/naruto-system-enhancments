import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {ILLUSIONARY_WEAPONS,illusionaryWeaponAvailable,illusionaryWeaponData,illusionaryWeaponProfile,illusionaryWeaponStage} from '../casting/genjutsu-weapons.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export const illusionaryWeapons=actor=>structuredClone(actor.getFlag(MODULE_ID,ILLUSIONARY_WEAPONS)??[]);
function requireActor(game,actor){if(!genjutsuEnabled(game)||!actor?.isOwner||!ownedGenjutsuFeature(actor,'Illusionary Weapon','Choose Inception'))throw Error('Eigener Charakter mit Illusionary Weapon erforderlich.');}
export async function summonIllusionaryWeapons(game,actor){
 requireActor(game,actor);
 return withCastingActorLock(actor,async()=>{
  if(actor.getChakraAvailable()<=0||actor.statuses.has('unconscious')||actor.statuses.has('dead'))throw Error('Ohne Chakra bzw. bewusstlos/tot ist keine Illusionary Weapon verfügbar.');
  const candidates=[...actor.items].filter(i=>i.type==='weapon').map(i=>({uuid:i.uuid,name:i.name+' · Inventar'})),pack=game.packs.get('n5eb.items');
  if(pack){const index=await pack.getIndex();for(const entry of index)if(entry.type==='weapon')candidates.push({uuid:'Compendium.n5eb.items.Item.'+entry._id,name:entry.name+' · Systemprofil'});}
  if(!candidates.length)throw Error('Keine tatsächlichen Waffenprofile verfügbar.');candidates.sort((a,b)=>a.name.localeCompare(b.name));
  const content=document.createElement('div'),doubled=!!ownedGenjutsuFeature(actor,'Doubled Weapon','Malleable Mirages');
  for(let n=0;n<(doubled?2:1);n++){const select=document.createElement('select');select.name='weapon'+n;if(n){const blank=document.createElement('option');blank.value='';blank.textContent='Keine zweite Waffe';select.append(blank);}for(const c of candidates){const o=document.createElement('option');o.value=c.uuid;o.textContent=c.name;select.append(o);}content.append(select);}
  const hint=document.createElement('p');hint.textContent='Waffenform in tatsächlich freier Hand erzeugen. Grundprofil wird Psychic mit Genjutsu-Attribut; fremde Verzauberungen und Zusatzeffekte werden nicht übernommen. Diese Aktivierung ersetzt vorherige Illusionary Weapons. Bei zwei Waffen darf keine Two-Handed sein. Aktionsökonomie bleibt manuell.';content.append(hint);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Illusionary Weapon · Waffenform'},content:content.innerHTML,buttons:[{action:'summon',label:'Freie Hand und Waffenformen bestätigen',callback:(_e,b)=>[b.form.elements.weapon0.value,b.form.elements.weapon1?.value].filter(Boolean)}],rejectClose:false});if(!choice)return;
  const weapons=[];for(const uuid of choice){if(!candidates.some(c=>c.uuid===uuid))throw Error('Unbekanntes Waffenprofil.');const original=await fromUuid(uuid),profile=illusionaryWeaponProfile(original);if(choice.length>1&&profile.system.properties?.includes('two'))throw Error('Doubled Weapon erlaubt keine Two-Handed-Waffe.');weapons.push({id:foundry.utils.randomID(),activityId:foundry.utils.randomID(),profileSource:uuid,profile,active:true,createdAt:game.time.worldTime,separatedAt:null});}
  if(actor.getChakraAvailable()<=0)throw Error('Chakra während der Auswahl erschöpft.');await actor.setFlag(MODULE_ID,ILLUSIONARY_WEAPONS,weapons);
 });
}
export async function setIllusionaryWeaponDistance(game,actor,id,outside){
 requireActor(game,actor);return withCastingActorLock(actor,async()=>{const all=illusionaryWeapons(actor),weapon=all.find(w=>w.id===id);if(!weapon||!illusionaryWeaponAvailable(game,actor,weapon))throw Error('Waffe nicht mehr aktiv.');weapon.separatedAt=outside?game.time.worldTime:null;await actor.setFlag(MODULE_ID,ILLUSIONARY_WEAPONS,all);});
}
export async function dismissIllusionaryWeapons(game,actor,id){
 if(!actor.isOwner)throw Error('Eigentümer erforderlich.');return withCastingActorLock(actor,async()=>actor.setFlag(MODULE_ID,ILLUSIONARY_WEAPONS,illusionaryWeapons(actor).map(w=>!id||w.id===id?{...w,active:false}:w)));
}
export async function rollIllusionaryWeaponAttack(game,actor,id){
 requireActor(game,actor);return withCastingActorLock(actor,async()=>{
  const state=illusionaryWeapons(actor).find(w=>w.id===id);if(!state||!illusionaryWeaponAvailable(game,actor,state))throw Error('Illusionary Weapon nicht mehr verfügbar.');
  const item=new CONFIG.Item.documentClass(illusionaryWeaponData(game,actor,state,{bonus:illusionaryWeaponStage(actor)}),{parent:actor});item.prepareFinalAttributes?.();const activity=item.system.activities.get(state.activityId);
 return activity.rollAttack({ammunition:false,ammunitionDie:false}, {configure:true},{data:{flags:{[MODULE_ID]:{castingSnapshot:item.toObject(),genjutsuWeaponAttack:{id:foundry.utils.randomID(),instanceId:id,profile:state.profile.name,sourceActorUuid:actor.uuid}}}}});
 });
}
const wrapped=new WeakSet(),virtualAttacks=new WeakMap();
export function installIllusionaryWeapons(game,types,ActorClass){
 // Native thrown attacks try to decrease the quantity of their item. Virtual
 // weapons have no embedded item: suppress only that nonexistent item's update.
 // No Returning property or other gameplay property is granted for this guard.
 const update=ActorClass.prototype.updateEmbeddedDocuments;
 ActorClass.prototype.updateEmbeddedDocuments=function(type,updates,...args){
  const ids=virtualAttacks.get(this);
  if(type==='Item'&&ids?.size){updates=updates.filter(u=>!ids.has(u._id)||this.items.has(u._id));if(!updates.length)return Promise.resolve([]);}
  return update.call(this,type,updates,...args);
 };
 for(const {documentClass} of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const attack=p.rollAttack;p.rollAttack=async function(config={},dialog={},message={}){
  const marker=this.item.getFlag(MODULE_ID,'genjutsuWeapon');if(!marker)return attack.call(this,config,dialog,message);
  const state=illusionaryWeapons(this.actor).find(w=>w.id===marker.instanceId);if(marker.sourceActorUuid!==this.actor.uuid||!state||!illusionaryWeaponAvailable(game,this.actor,state)||this.actor.items.has(this.item.id))throw Error('Diese Illusionary Weapon ist nicht mehr aktiv oder kein temporäres Waffenprofil.');
  const ids=virtualAttacks.get(this.actor)??new Set();if(ids.has(this.item.id))throw Error('Ein Angriff dieser Waffenform ist noch offen.');ids.add(this.item.id);virtualAttacks.set(this.actor,ids);
  try{
   // A new attack from an older chat card uses the current unlocked stage and
   // current Genjutsu attribute. Damage from the previous attack keeps its snapshot.
   const item=new CONFIG.Item.documentClass(illusionaryWeaponData(game,this.actor,state,{bonus:illusionaryWeaponStage(this.actor)}),{parent:this.actor});item.prepareFinalAttributes?.();const activity=item.system.activities.get(state.activityId);
   message={...message,data:{...message.data,flags:{...message.data?.flags,[MODULE_ID]:{...message.data?.flags?.[MODULE_ID],castingSnapshot:item.toObject(),genjutsuWeaponAttack:{id:foundry.utils.randomID(),instanceId:state.id,profile:state.profile.name,sourceActorUuid:this.actor.uuid}}}}};
   return await attack.call(activity,{...config,ammunition:false,ammunitionDie:false},{...dialog,options:{...dialog.options,ammunitionDie:false,ammunitionOptions:[]}},message);
  }finally{ids.delete(this.item.id);if(!ids.size)virtualAttacks.delete(this.actor);}
 };}
 const refresh=async actor=>{if(!genjutsuEnabled(game)||!actor?.isOwner||(game.users.activeGM&&game.users.activeGM.id!==game.user.id))return;const all=illusionaryWeapons(actor);if(all.some(w=>w.active&&!illusionaryWeaponAvailable(game,actor,w)))await actor.setFlag(MODULE_ID,ILLUSIONARY_WEAPONS,all.map(w=>w.active&&!illusionaryWeaponAvailable(game,actor,w)?{...w,active:false}:w));};
 Hooks.on('updateActor',(actor,changes)=>{if(Object.keys(changes).some(k=>k==='system'||k.startsWith('system.')))refresh(actor).catch(console.error);});
 Hooks.on('updateWorldTime',()=>{for(const actor of new Set([...game.actors,...(globalThis.canvas?.tokens?.placeables??[]).map(t=>t.actor)].filter(Boolean)))refresh(actor).catch(console.error);});
 for(const hook of ['createActiveEffect','updateActiveEffect','deleteActiveEffect'])Hooks.on(hook,effect=>{if(effect.parent?.documentName==='Actor')refresh(effect.parent).catch(console.error);});
}
