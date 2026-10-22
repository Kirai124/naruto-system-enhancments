import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,medicalModifier,scalpelState} from '../casting/medical-context.mjs';
import {scalpelDice} from '../casting/medical-rules.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';
import {appendFeatureSpend} from './ninjutsu-resource-utils.mjs';
import {medicalReleases} from './medical-elemental.mjs';
import {NATURE_DAMAGE} from '../casting/professor-releases.mjs';

const SCALPEL_PROFILE='Compendium.n5eb.items.Item.mUFFgEYTTO5WzZLy';
function requireScalpel(game,actor){if(!medicalEnabled(game)||!actor?.isOwner||!medicalFeature(actor,'Chakra Scalpel'))throw Error('Eigener Medical-Nin mit Chakra Scalpel erforderlich.');}
export async function activateMedicalScalpel(game,actor,{sabre=false}={}){
 requireScalpel(game,actor);return withCastingActorLock(actor,async()=>{
  const feature=medicalFeature(actor,'Chakra Scalpel'),cost=sabre?5:1;
  if(scalpelState(game,actor))throw Error('Chakra Scalpel bereits aktiv; zuerst beenden.');
  if(sabre&&!medicalFeature(actor,'Chakra Sabre','Chakra Scalpel Specialist'))throw Error('Chakra Sabre nicht freigeschaltet.');
  if(feature.system.uses.value<cost)throw Error('Nicht genügend Chakra-Scalpel-Charges.');
  const profile=await fromUuid(SCALPEL_PROFILE);if(profile?.type!=='weapon')throw Error('Installiertes Chakra-Scalpel-Waffenprofil fehlt.');
  const mode=game.combat?.started?'combat':'surgery';
  const types=[sabre?'necrotic':medicalFeature(actor,'Poisonous Touch','Black Medicine')?'poison':medicalFeature(actor,'Transmuter','Transmuter')?'necrotic':'slashing'];if(!sabre&&types[0]==='slashing'&&medicalLevel(actor)>=5&&medicalFeature(actor,'Elemental Traces','Elemental Medic'))types.push(...medicalReleases(actor).map(r=>NATURE_DAMAGE[r]));
  const div=document.createElement('div'),note=document.createElement('p'),select=document.createElement('select');select.name='damageType';note.textContent=cost+' Scalpel-Charge(s) verbrauchen? Dauer: '+(mode==='combat'?'1 Minute':'1 Stunde außerhalb des Kampfes')+'. Aktionsökonomie bleibt manuell. Virtuelles Waffenprofil; vorhandene Inventarwaffen bleiben erhalten.';div.append(note,select);for(const type of new Set(types)){const o=document.createElement('option');o.value=type;o.textContent=type;select.append(o);}
  const type=await foundry.applications.api.DialogV2.wait({window:{title:sabre?'Chakra Sabre':'Chakra Scalpel'},content:div.innerHTML,buttons:[{action:'activate',label:'Aktivierung und Schadensart bestätigen',callback:(_e,b)=>b.form.elements.damageType.value}],rejectClose:false});if(!type)return;if(!types.includes(type))throw Error('Scalpel-Schadensart nicht verfügbar.');
  const journal=actor.getFlag(MODULE_ID,'medicalScalpel');if(['paying','review'].includes(journal?.status))throw Error('Vorherige Scalpel-Aktivierung zuerst vom GM prüfen lassen.');
  const state={id:foundry.utils.randomID(),activityId:foundry.utils.randomID(),status:'paying',mode,sabre,damageType:type,at:game.time.worldTime,expiresAt:game.time.worldTime+(mode==='combat'?60:3600)};
  await actor.setFlag(MODULE_ID,'medicalScalpel',state);
  try{await actor.updateEmbeddedDocuments('Item',[{_id:feature.id,'system.uses.spent':feature.system.uses.spent+cost}]);state.status='active';await actor.setFlag(MODULE_ID,'medicalScalpel',state);}catch(error){state.status='review';state.error=error.message;await actor.setFlag(MODULE_ID,'medicalScalpel',state);throw error;}
 });
}
export async function endMedicalScalpel(game,actor){requireScalpel(game,actor);return withCastingActorLock(actor,async()=>{const s=actor.getFlag(MODULE_ID,'medicalScalpel');if(s)await actor.setFlag(MODULE_ID,'medicalScalpel',{...s,status:'ended'});});}
export async function medicalScalpelItem(game,actor){
 const state=scalpelState(game,actor);if(!state)throw Error('Kein aktives Chakra Scalpel.');
 const profile=await fromUuid(SCALPEL_PROFILE);if(!profile)throw Error('Installiertes Scalpel-Profil fehlt.');
 const data=profile.toObject(),level=medicalLevel(actor);delete data._id;data._id=foundry.utils.randomID();data.name=state.sabre?'Chakra Sabre':'Chakra Scalpel';
 // Use the installed weapon schema, but not obsolete effects/macros or native resource consumption.
 data.effects=[];data.system.activities={};data.system.quantity=1;data.system.equipped=true;data.system.proficient=1;
 let die=4,type='slashing';
 if(medicalFeature(actor,'Biological Knowledge','Chakra Scalpel Specialist'))die=6;
 if(medicalFeature(actor,'Competent Combatant','Combat Medic'))die=6;
 if(level>=5&&medicalFeature(actor,'Biological Knowledge','Chakra Scalpel Specialist'))die=level>=18?12:level>=11?10:8;
 if(medicalFeature(actor,'Transmuted Self','Transmuter'))die=Math.max(die,8);
 if(medicalFeature(actor,'Transmuter','Transmuter'))type='necrotic';
 if(medicalFeature(actor,'Poisonous Touch','Black Medicine'))type='poison';
 if(state.sabre)type='necrotic';
 if(state.damageType)type=state.damageType;
 const preference=actor.getFlag(MODULE_ID,'medicalScalpelAbility'),ability=preference==='int'&&medicalFeature(actor,'Biological Knowledge','Chakra Scalpel Specialist')?'int':actor.getFlag(MODULE_ID,'medicalAbility')==='cha'&&medicalFeature(actor,'Fortifying Scripture','Spiritual Scribe')?'cha':'wis';
 const taijutsu=medicalFeature(actor,'Competent Combatant','Combat Medic')&&actor.getFlag(MODULE_ID,'medicalScalpelTaijutsu'),attackBonus=taijutsu?actor.system.attributes.jutsu.taijutsu.attack-actor.system.abilities[ability].mod-actor.system.attributes.prof:actor.system.attributes.jutsu.ninjutsu.attack-actor.system.attributes.jutsu.ninjutsu.mod-actor.system.attributes.prof;
 data.system.damage??={};data.system.damage.base={number:scalpelDice(level),denomination:die,bonus:'',types:[type],custom:{enabled:false,formula:''},scaling:{mode:'',number:1,formula:''}};
 data.system.range={value:null,long:null,reach:state.sabre?15:5,units:'ft'};if(state.sabre)data.system.properties=[...new Set([...(data.system.properties??[]),'rch'])];
 data.system.activities[state.activityId]={_id:state.activityId,type:'attack',name:data.name,activation:{type:'action',value:1},attack:{ability,type:{value:'melee',classification:'spell'},bonus:String(attackBonus),flat:false},damage:{includeBase:true,parts:[]},consumption:{targets:[]},range:{override:true,value:state.sabre?'15':'5',units:'ft'},target:{affects:{type:'creature',count:'1'},template:{}}};
 data.flags??={};data.flags[MODULE_ID]={medicalScalpelWeapon:{stateId:state.id,attackType:taijutsu?'taijutsu':'ninjutsu',sabre:state.sabre,damageType:type,ability,mode:state.mode}};
 const item=new CONFIG.Item.documentClass(data,{parent:actor});item.prepareFinalAttributes?.();return item;
}
export async function attackMedicalScalpel(game,actor){
 requireScalpel(game,actor);const item=await medicalScalpelItem(game,actor),state=scalpelState(game,actor);
 return item.system.activities.get(state.activityId).rollAttack({}, {configure:true},{data:{flags:{[MODULE_ID]:{castingSnapshot:item.toObject(),medicalScalpelAttack:{id:foundry.utils.randomID(),stateId:state.id}}}}});
}
export function installMedicalScalpel(game,ActorClass){
 const skill=ActorClass.prototype.rollSkill;
 ActorClass.prototype.rollSkill=async function(config={},dialog={},message={}){
  if(medicalEnabled(game)&&config.skill==='med'&&medicalFeature(this,'Medical Ninjutsu')&&!config.n5eseMedicalFixedMedicine){
   const state=scalpelState(game,this),div=document.createElement('div'),select=document.createElement('select');select.name='ability';
   for(const value of ['int','wis']){const o=document.createElement('option');o.value=value;o.textContent=value.toUpperCase();if(value===(config.ability??this.system.skills.med.ability))o.setAttribute('selected','');select.append(o);}div.append(select);
   if(state?.mode==='surgery'){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.name='stabilize';label.append(check,document.createTextNode('Dieser Wurf stabilisiert tatsächlich eine Kreatur: Scalpel +'+(medicalLevel(this)>=11?10:5)));div.append(label);}
   const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Medical Ninjutsu · Medicine'},content:div.innerHTML,buttons:[{action:'roll',label:'Wurf bestätigen',callback:(_e,b)=>({ability:b.form.elements.ability.value,stabilize:!!b.form.elements.stabilize?.checked})}],rejectClose:false});if(!choice)return [];
   const rolls=[...(config.rolls??[])];if(choice.stabilize){const first={...rolls[0]};first.parts=[...(first.parts??[]),String(medicalLevel(this)>=11?10:5)];rolls[0]=first;}config={...config,ability:choice.ability,rolls};
  }
  return skill.call(this,config,dialog,message);
 };
}
