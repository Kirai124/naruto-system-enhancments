import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {refreshActorPreparation} from './actor-preparation.mjs';

const KEY='genjutsuSkillPackage',busy=new WeakSet(),beforePackages=new WeakMap();
const packages=Object.freeze([
 {name:'Beguiling Influence',category:'Malleable Mirages',skills:['dec','per'],effects:['wpLjO2nSO6OiMN0E']},
 {name:'Illusionary Vigor',category:'Malleable Mirages',skills:['ath','acr'],effects:['4WfVfe8ba1gxCiPv']},
 {name:'Genjutsu Insignia',category:'Distant Soul',skills:['nsh'],effects:[]}
]);
const owned=(actor,rule)=>ownedGenjutsuFeature(actor,rule.name,rule.category);
function selection(actor,feature){const state=feature.getFlag(MODULE_ID,KEY);return state?.actorUuid===actor.uuid&&state.featureId===feature.id?state:null;}
export async function configureSkillPackage(game,actor,name){
 const rule=packages.find(r=>r.name===name),feature=rule&&owned(actor,rule);if(!genjutsuEnabled(game)||!actor?.isOwner||!feature||busy.has(actor))throw Error('Eigene belegte Skill-Fähigkeit erforderlich.');
 if(selection(actor,feature)&&!game.user.isGM)throw Error('Lernentscheidung bereits gespeichert; Korrektur durch GM.');busy.add(actor);
 try{
  refreshActorPreparation(actor);const baseline=beforePackages.get(actor)??{},state=selection(actor,feature),root=document.createElement('div'),p=document.createElement('p');p.textContent=rule.name+': tatsächlichen Stand vor dem Erlernen bestätigen. Vorhandene Beherrschung/Mastery wird erhalten. Die aktuelle Systemmigration bildet frühere Expertise als Mastery-Rang 1 ab.';root.append(p);
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.name='hadAll';if(state?.hadAll??rule.skills.every(id=>(baseline[id]?.value??0)>=1))check.setAttribute('checked','');label.append(check,document.createTextNode(rule.skills.length===1?'Diesen Skill bereits vor dem Erlernen beherrscht':'Beide Skills bereits vor dem Erlernen beherrscht'));root.append(label);
  const select=document.createElement('select');select.name='skill';for(const id of rule.skills){const o=document.createElement('option');o.value=id;o.textContent=game.i18n.localize(CONFIG.DND5E.skills[id].label);if(id===state?.skill)o.setAttribute('selected','');select.append(o);}root.append(select);
  const choice=await foundry.applications.api.DialogV2.wait({window:{title:rule.name+' · Skill-Auswahl'},content:root.innerHTML,buttons:[{action:'save',label:'Lernstand und Auswahl speichern',callback:(_e,b)=>({hadAll:b.form.elements.hadAll.checked,skill:b.form.elements.skill.value})}],rejectClose:false});if(!choice)return;
  if(!rule.skills.includes(choice.skill)||owned(actor,rule)?.id!==feature.id)throw Error('Skill oder Quelle inzwischen verändert.');await feature.setFlag(MODULE_ID,KEY,{actorUuid:actor.uuid,featureId:feature.id,...choice});refreshActorPreparation(actor);actor.sheet?.render(false);
 }finally{busy.delete(actor);}
}
export function installGenjutsuSkillPackages(game,CharacterModel,EffectClass){
 const apply=EffectClass.applyChange;
 EffectClass.applyChange=function(actor,change,options){
  if(genjutsuEnabled(game)&&change.type==='add'&&Number(change.value)===1){const rule=packages.find(r=>r.effects.includes(change.effect?.id)&&r.skills.some(id=>change.key==='system.skills.'+id+'.value'));if(rule&&owned(actor,rule))return {};}
  return apply.call(this,actor,change,options);
 };
 const prepare=CharacterModel.prototype.prepareSkills;
 CharacterModel.prototype.prepareSkills=function(...args){
  const actor=this.parent;if(genjutsuEnabled(game)){
   const baseline=Object.fromEntries(Object.entries(this.skills).map(([id,skill])=>[id,{value:skill.value,mastery:skill.mastery}]));beforePackages.set(actor,baseline);
   for(const rule of packages){const feature=owned(actor,rule);if(!feature)continue;const state=selection(actor,feature);for(const id of rule.skills)this.skills[id].value=Math.max(1,this.skills[id].value);if(state?.hadAll&&rule.skills.includes(state.skill))this.skills[state.skill].mastery=Math.max(1,this.skills[state.skill].mastery??0);}
  }
  return prepare.apply(this,args);
 };
 Hooks.on('renderCharacterActorSheet',(sheet,html)=>{
  const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;root?.querySelector('.n5ese-genjutsu-skill-packages')?.remove();if(!genjutsuEnabled(game))return;const available=packages.filter(r=>owned(actor,r)),host=root?.querySelector('section[data-tab="features"]');if(!available.length||!host)return;const panel=document.createElement('details');panel.className='n5ese-ninjutsu-card n5ese-genjutsu-skill-packages';const summary=document.createElement('summary');summary.textContent='Genjutsu · Skill-Lernentscheidungen';panel.append(summary);
  for(const rule of available){const feature=owned(actor,rule),state=selection(actor,feature),b=document.createElement('button');b.type='button';b.textContent=rule.name+' · '+(state?(state.hadAll?game.i18n.localize(CONFIG.DND5E.skills[state.skill].label)+' Mastery 1':'Proficiencies bestätigt'):'Lernstand / Skill wählen');b.disabled=!actor.isOwner||!!state&&!game.user.isGM;b.addEventListener('click',()=>configureSkillPackage(game,actor,rule.name).catch(e=>ui.notifications.warn(e.message)));panel.append(b);}host.prepend(panel);
 });
 Hooks.on('createItem',(item,_options,userId)=>{if(busy.has(item.actor)||userId!==game.user.id||!item.actor?.isOwner||!genjutsuEnabled(game))return;const rule=packages.find(r=>owned(item.actor,r)?.id===item.id);if(rule&&!selection(item.actor,item))configureSkillPackage(game,item.actor,rule.name).catch(e=>ui.notifications.warn(e.message));});
}
