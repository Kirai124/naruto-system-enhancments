import {MODULE_ID} from '../settings/register.mjs';
import {actualizationPool,genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {appendActualizationSpend,regainActualization} from '../casting/genjutsu-resources.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

function requireActor(game,actor){if(!genjutsuEnabled(game)||!actor?.isOwner||!ownedGenjutsuFeature(actor,'Actualization'))throw Error('Actualization-Feature und Quellenberechtigung erforderlich.');}
export async function rollGenjutsuSkill(game,actor,{readEnemy=false}={}){
 requireActor(game,actor);
 return withCastingActorLock(actor,async()=>{
  const pool=actualizationPool(actor),content=document.createElement('div'),ability=document.createElement('select'),skill=document.createElement('select'),count=document.createElement('select');ability.name='ability';skill.name='skill';count.name='count';
  for(const key of ['wis','cha']){const o=document.createElement('option');o.value=key;o.textContent=game.i18n.localize(CONFIG.DND5E.abilities[key].label);ability.append(o);}
  for(const [key,definition] of Object.entries(CONFIG.DND5E.skills)){if(readEnemy&&key!=='ill')continue;const o=document.createElement('option');o.value=key;o.textContent=game.i18n.localize(definition.label);skill.append(o);}
  for(let n=0;n<=Math.min(2,pool.remaining);n++){const o=document.createElement('option');o.value=String(n);o.textContent=n+' Actualization Dice';count.append(o);}
  const hint=document.createElement('p');hint.textContent=readEnemy?'Tatsächlichen Read-the-Enemy-Check mit Illusion bestätigen: +1d4. Weitere Actualization-Dice nur im regelgerechten Zusammenhang mit einem Genjutsu gegen feindliche Kreaturen verwenden.':'WIS-/CHA-Skillcheck im regelgerechten Zusammenhang mit einem Genjutsu gegen feindliche Kreaturen bestätigen. Bis zwei Actualization Dice als Wurfbonus.';content.append(hint,ability,skill,count);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:readEnemy?'Read the Enemy':'Actualization – Skillcheck'},content:content.innerHTML,buttons:[{action:'roll',label:'Voraussetzungen bestätigen und würfeln',callback:(_e,b)=>({ability:b.form.elements.ability.value,skill:b.form.elements.skill.value,count:Number(b.form.elements.count.value)})},{action:'cancel',label:'Abbrechen',callback:()=>null}],rejectClose:false});if(!choice)return;
  if(!['wis','cha'].includes(choice.ability)||!CONFIG.DND5E.skills[choice.skill]||readEnemy&&choice.skill!=='ill'||!Number.isSafeInteger(choice.count)||choice.count<0||choice.count>2||choice.count>actualizationPool(actor).remaining)throw Error('Ungültiger Skill-/Dice-Kontext.');
  const key='genjutsuSkillJournal',prior=actor.getFlag(MODULE_ID,key);if(['applying','review'].includes(prior?.status))throw Error('Unterbrochenen Genjutsu-Check zuerst vom GM prüfen lassen.');
  const journal={id:foundry.utils.randomID(),status:'applying',...choice,readEnemy};await actor.setFlag(MODULE_ID,key,journal);
  try{
   const parts=[...(readEnemy?['1d4']:[]),...(choice.count?[choice.count+'d'+pool.die]:[])];
   const rolls=await actor.rollSkill({ability:choice.ability,skill:choice.skill,rolls:[{parts}]},{configure:true});
   if(!rolls?.length){journal.status='cancelled';await actor.setFlag(MODULE_ID,key,journal);return;}
   if(choice.count){const updates={actor:{},item:[]};appendActualizationSpend(actor,choice.count,updates);await actor.updateEmbeddedDocuments('Item',updates.item);}
   journal.status='applied';await actor.setFlag(MODULE_ID,key,journal);return rolls;
  }catch(error){journal.status='review';journal.error=error.message;await actor.setFlag(MODULE_ID,key,journal);throw error;}
 });
}

export async function recoverKeenAwareness(game,actor){
 requireActor(game,actor);if(!ownedGenjutsuFeature(actor,'Keen Awareness'))throw Error('Keen Awareness fehlt.');
 return withCastingActorLock(actor,async()=>{
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Keen Awareness'},content:'<p>Bestätige: Rettungswurf gegen ein tatsächlich feindliches Genjutsu um mindestens 5 übertroffen. Einen verbrauchten Actualization Die zurückerhalten? Eine gegebenenfalls erlaubte Reaktion selbst verwalten.</p>',rejectClose:false}))return;
  const recovered=await regainActualization(actor,1);if(recovered)await actor.setFlag(MODULE_ID,'genjutsuKeenCredit',{id:foundry.utils.randomID(),status:'available',at:game.time.worldTime,turn:game.combat?.started?game.combat.id+':'+game.combat.round+':'+game.combat.turn:null});return recovered;
 });
}
