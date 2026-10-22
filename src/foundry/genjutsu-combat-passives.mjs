import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,isGenjutsu,isDistantSoulJutsu,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
const wrapped=new WeakSet(),rolling=new WeakSet();
export function installGenjutsuCombatPassives(game,types){
 for(const {documentClass} of Object.values(types)){
  const p=documentClass?.prototype;if(!p||wrapped.has(p)||typeof p.rollAttack!=='function')continue;wrapped.add(p);const attack=p.rollAttack;
  p.rollAttack=async function(config={},dialog={},message={}){
   if(rolling.has(this)||!genjutsuEnabled(game)||!(isGenjutsu(this.item)||this.item.getFlag(MODULE_ID,'genjutsuWeapon')||this.item.getFlag(MODULE_ID,'genjutsuPhantasmal')||this.item.getFlag(MODULE_ID,'genjutsuBrawler')))return attack.call(this,config,dialog,message);rolling.add(this);
   try{
    const actor=this.actor,bonus=ownedGenjutsuFeature(actor,'Void Slash','Umbra Cleaver')?1+Number(genjutsuLevel(actor)>=10)+Number(genjutsuLevel(actor)>=19):0,cast=this.item.getFlag(MODULE_ID,'genjutsuCast'),dice=bonus?Number(cast?.choice?.damageDice??0):0;
    const rolls=[...(config.rolls??[])],parts=[...(rolls[0]?.parts??[])];if(bonus+dice)parts.push(String(bonus+dice));
    const options={...rolls[0]?.options};if(ownedGenjutsuFeature(actor,'Darkness Illusion','Umbra Cleaver')){const base=Number(options.criticalSuccess??this.criticalThreshold??20);options.criticalSuccess=Math.min(base,Math.max(16,base-1));}
    rolls[0]={...rolls[0],parts,options};return await attack.call(this,{...config,rolls},dialog,message);
   }finally{rolling.delete(this);}
  };
 }
 Hooks.on('dnd5e.preCalculateDamage',(_target,_damages,options)=>{
  if(!genjutsuEnabled(game))return;const origin=options.originatingMessage,message=origin?.type==='usage'?origin:origin?.getOriginatingMessage?.(),item=message?.getAssociatedItem?.(),actor=message?.getAssociatedActor?.();
  if(!isDistantSoulJutsu(item)||message.system.deltas===null||options.ignore===true)return;
  if(item.system.jutsu.keywords.has('inhaled')&&ownedGenjutsuFeature(actor,'Permeating Intoxicant','Misty Distortionist')&&options.ignore?.resistance!==true)options.ignore={...options.ignore,resistance:new Set([...(options.ignore?.resistance??[]),'poison'])};
  if(!item.system.jutsu.keywords.has('fuinjutsu')||!ownedGenjutsuFeature(actor,'Permeating Seals','Distant Soul')||options.downgrade===true)return;
  // Native downgrade means: ordinary resistance ignored, immunity becomes resistance.
  options.downgrade=new Set([...(options.downgrade??[]),'psychic','chakra']);
 });
 Hooks.on('dnd5e.renderChatMessage',(message,html)=>{
  html.querySelector('.n5ese-genjutsu-cast-passives')?.remove();if(!genjutsuEnabled(game)||message.type!=='usage')return;const item=message.getAssociatedItem(),actor=message.getAssociatedActor();if(!isGenjutsu(item))return;
  const marker=item.getFlag(MODULE_ID,'genjutsuAugmentation'),sensory=item.getFlag(MODULE_ID,'genjutsuSensoryCast'),notes=[];if(sensory)notes.push('Sensory Type · '+sensory.kind+(sensory.rangeFeet?' · '+sensory.rangeFeet+' Fuß':'')+' · tatsächliche Erfassung nach Sense Chakra / aktivierten Sinnen an der Karte bestätigen. Unterhalt kostenlos; Konzentration zählt nicht gegen das Limit.');if(marker?.nightmareIncarnates)notes.push('Nightmare Incarnates: als Bonusaktion gewirkt; eine Feature-Nutzung bezahlt, Aktionsökonomie manuell.');if(marker?.eagleFree)notes.push('Sensor’s Influence: 3 Actualization Dice und eine Nutzung bezahlt; normale Wirkkosten entfallen.');if(marker?.venomousIllusions)notes.push('Venomous Illusions: als Full-Turn-Action gewirkt, 3 Actualization Dice bezahlt; Aktionsökonomie manuell.');if(item.getFlag(MODULE_ID,'genjutsuTemporalShift'))notes.push('Temporal Shift: nach der Schadensberechnung bis zu '+item.getFlag(MODULE_ID,'genjutsuTemporalShift').movement+' Fuß ohne Gelegenheitsangriff bewegen.');if(item.getFlag(MODULE_ID,'genjutsuBladeSong'))notes.push('Blade Song: '+item.getFlag(MODULE_ID,'genjutsuBladeSong').copies+' Illusionswaffen bei diesem Cast; Erzeugen/Verbrauch des ursprünglichen Jutsu weiterhin manuell.');if(marker?.permeatingSeal)notes.push('Permeating Seals: Auf diesen Cast kann nicht reagiert werden. Reaktionen selbst verwalten.');
  if(ownedGenjutsuFeature(actor,'Subdued Illusion','Master of Illusion Features'))notes.push('Subdued Illusion: Der SG zum Identifizieren dieser Illusion ist um 5 erhöht; der Jutsu-Rettungswurf-SG bleibt unverändert.');
  if(ownedGenjutsuFeature(actor,'Genjutsu Insignia','Distant Soul'))notes.push('Genjutsu Insignia: Dispel-Checks gegen dieses Genjutsu −'+Math.ceil(actor.system.attributes.jutsu.genjutsu.mod/2)+'. Dispel-Check entsprechend ergänzen.');
  if(!notes.length)return;const div=document.createElement('aside');div.className='n5ese-molding-chat n5ese-genjutsu-cast-passives';for(const note of notes){const p=document.createElement('p');p.textContent=note;div.append(p);}html.append(div);
 });
}
