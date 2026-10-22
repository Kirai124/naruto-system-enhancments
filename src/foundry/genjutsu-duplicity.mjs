import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature,isGenjutsu} from '../casting/genjutsu-context.mjs';
import {appendActualizationSpend} from '../casting/genjutsu-resources.mjs';
import {activeNinjutsuEffect,ninjutsuEffectData,ninjutsuEffect} from '../effects/ninjutsu-effects.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export const duplicityEffects=(game,actor)=>actor.effects.filter(e=>activeNinjutsuEffect(game,e)&&ninjutsuEffect(e).metadata.actualizedDuplicity);
export async function createActualizedDuplicate(game,actor){
 const feature=ownedGenjutsuFeature(actor,'Actualized Duplicity','Real World Conversions');if(!genjutsuEnabled(game)||!actor?.isOwner||!feature)throw Error('Actualized Duplicity nicht verfügbar.');
 return withCastingActorLock(actor,async()=>{
  if(duplicityEffects(game,actor).length)throw Error('Vorhandenen Doppelgänger zuerst beenden.');
  const journal=actor.getFlag(MODULE_ID,'genjutsuDuplicityJournal');if(['applying','review'].includes(journal?.status))throw Error('Unterbrochene Duplicity-Aktivierung vom GM prüfen lassen.');
  const targets=[...game.user.targets].filter(t=>t.actor?.isOwner);if(targets.length!==1)throw Error('Genau einen bereits vorhandenen eigenen Doppelgänger-Token markieren.');
  const limit=actor.system.attributes.concentration.limit;if(!limit||actor.concentration.effects.size>=limit)throw Error('Kein freier Konzentrationsplatz. Gewünschte bisherige Konzentration vorher selbst beenden.');
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Actualized Duplicity'},content:'<p>Bestätige: Der markierte Token ist dein tatsächlicher illusionärer Doppelgänger, erscheint innerhalb 30 Fuß in einem freien sichtbaren Feld und bleibt innerhalb 120 Fuß. Einen Actualization Die bezahlen, eine Minute normale Konzentration ohne Chakra-Unterhalt beginnen? Bewegung und Casting-Ursprung bleiben über die Szene bedienbar.</p>',rejectClose:false}))return;
  const updates={actor:{},item:[]};appendActualizationSpend(actor,1,updates);
  const state={id:foundry.utils.randomID(),status:'applying',tokenUuid:targets[0].document.uuid,createdAt:game.time.worldTime};await actor.setFlag(MODULE_ID,'genjutsuDuplicityJournal',state);
  try{
   await actor.updateEmbeddedDocuments('Item',updates.item);
   const data=ninjutsuEffectData({name:'Actualized Duplicity',id:state.id,sourceActorUuid:actor.uuid,sourceItemUuid:feature.uuid,setting:'genjutsuClassAutomation',lifetime:{expiresAt:game.time.worldTime+60},metadata:{concentration:true,actualizedDuplicity:true,tokenUuid:state.tokenUuid}});
   data.duration={seconds:60,startTime:game.time.worldTime};data.flags.n5eb={item:{id:feature.id,uuid:feature.uuid,type:feature.type}};
   const [effect]=await actor.createEmbeddedDocuments('ActiveEffect',[data]);if(!effect)throw Error('Konzentrationseffekt wurde nicht angelegt.');state.effectId=effect.id;state.status='applied';await actor.setFlag(MODULE_ID,'genjutsuDuplicityJournal',state);
  }catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,'genjutsuDuplicityJournal',state);throw error;}
 });
}
export async function resolveDuplicity(game,actor){
 if(!game.user.isGM||!actor.isOwner)throw Error('GM-Prüfung erforderlich.');return withCastingActorLock(actor,async()=>{const journal=actor.getFlag(MODULE_ID,'genjutsuDuplicityJournal');if(!['applying','review'].includes(journal?.status))throw Error('Keine unterbrochene Aktivierung.');if(await foundry.applications.api.DialogV2.confirm({window:{title:'Duplicity prüfen'},content:'<p>Würfelverbrauch, Tokenverknüpfung und Konzentration manuell geprüft/korrigiert? Ohne erneute Ausführung abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'genjutsuDuplicityJournal',{...journal,status:'resolved'});});
}
const wrapped=new WeakSet();
export function installDuplicityAttacks(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const attack=p.rollAttack;
  p.rollAttack=async function(config={},...args){
   if(!genjutsuEnabled(game)||!isGenjutsu(this.item)||!this.actor?.isOwner||!duplicityEffects(game,this.actor).length)return attack.call(this,config,...args);
   const effects=duplicityEffects(game,this.actor);if(effects.every(e=>!fromUuidSync(ninjutsuEffect(e).metadata.tokenUuid)))return attack.call(this,config,...args);
   if(await foundry.applications.api.DialogV2.confirm({window:{title:'Actualized Duplicity · Angriff'},content:'<p>Sind du und dein weiterhin bestehender Doppelgänger beide innerhalb 5 Fuß des angegriffenen Ziels, und kann das Ziel den Doppelgänger sehen? Dann Vorteil auf diesen Angriff.</p>',rejectClose:false})){const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],options:{...rolls[0]?.options,advantage:true}};config={...config,rolls};}
   return attack.call(this,config,...args);
  };
 }
}
