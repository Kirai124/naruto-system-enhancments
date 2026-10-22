import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,genjutsuLevel,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';

export function prepareMirageExtras(item,grant,config){
 const name=grant.rule.name,patch={};
 if(name==='Freedom of Frenzy')for(const activity of item.system.activities){patch['system.activities.'+activity.id+'.target.affects.count']=String((Number(activity.target.affects.count)||1)+1);patch['system.activities.'+activity.id+'.target.override']=true;}
 if(name==='Ghastly Mist')for(const activity of item.system.activities){patch['system.activities.'+activity.id+'.target.template']={...foundry.utils.deepClone(activity.target.template),type:'cube',size:'45',units:'ft'};patch['system.activities.'+activity.id+'.target.override']=true;}
 if(name==='Piece of Mind')for(const activity of item.system.activities){const parts=structuredClone(item._source.system.activities[activity.id]?.damage?.parts??[]);for(const part of parts){if(part.custom?.enabled)part.custom.formula=part.custom.formula.replace(/\b(\d*)d\d+\b/gi,'$1d8');else if(part.number>0)part.denomination=8;}if(parts.length)patch['system.activities.'+activity.id+'.damage.parts']=parts;}
 const notes={'Berserk Thoughts':'Ein Save infolge eines verletzten Verbündeten erhält −1d4; den tatsächlichen Auslöser an der Karte bestätigen.','Misty Visions':'Diese Innocuous-Aspect-Illusion endet nicht durch Bewegung oder Geräusche; ausschließlich körperliche Untersuchung kann sie aufdecken.','Myriad Forms':'Small/Medium/Large-Objektgestalt bestätigen. Gewicht bleibt unverändert; Large belegt den normalen Raum. In kleiner Objektgestalt keine eigene Bewegung; williges Tragen bleibt möglich. Investigation/Illusions gegen deinen Genjutsu-SG enthüllt die Tarnung.','No Light At The End':'Jede Fracture-Schwelle der ursprünglichen Word-of-the-Lost-Wirkung ist um 1 niedriger. Die Karte bietet die entsprechend angepasste Schwellenzuordnung.','Illusionary Brawler':'Nur Selbstziel; kostenloser Unterhalt. Während des aktiven Casts können tatsächliche unbewaffnete Angriffe als Melee-Genjutsu-Angriff bestätigt werden.','Song of the End':'NT/W, kostenloser Unterhalt. Mehrere eigene Song-of-the-End-Instanzen teilen einen Konzentrationsplatz und enden bei Konzentrationsverlust gemeinsam.'};
 if(notes[name])patch['flags.'+MODULE_ID+'.genjutsuMirageSpecial']={name,note:notes[name]};
 if(name==='Beneath the Boot')for(const activity of item.system.activities){const count=Number(activity.target.affects.count)||1;patch['system.activities.'+activity.id+'.target.affects.count']=String(count+3);patch['system.activities.'+activity.id+'.target.override']=true;}
 if(name==='Evil Thoughts'){
  const activities=[...item.system.activities].filter(a=>a.damage?.parts?.length),activity=activities[0];if(!activity)throw Error('Evil Thoughts: ursprünglicher Schadenswürfel nicht auslesbar.');
  const parts=structuredClone(item._source.system.activities[activity.id].damage.parts),first=parts[0];
  if(first.custom?.enabled){if(!/\b\d*d\d+\b/i.test(first.custom.formula))throw Error('Evil Thoughts: kein ursprünglicher Schadenswürfel vorhanden.');first.custom.formula=first.custom.formula.replace(/\b(\d*)d(\d+)\b/i,(_m,n,d)=>(Number(n||1)+1)+'d'+d);}
  else if(Number.isInteger(first.number)&&first.number>0)first.number+=1;else throw Error('Evil Thoughts: Schadensformel benötigt manuelle Zuordnung.');
  patch['system.activities.'+activity.id+'.damage.parts']=parts;
 }
 if(name==='Blade Song'){const rank=config.jutsu?.rank??item.system.effectiveRank,ranks=CONFIG.DND5E.jutsuRankOrder;patch['flags.'+MODULE_ID+'.genjutsuBladeSong']={copies:6+Math.max(0,ranks.indexOf(rank)-ranks.indexOf('c')),rank};}
 if(Object.keys(patch).length){item.updateSource(patch);item.prepareFinalAttributes?.();}
}
/** Casting-time overrides describe the feature; they do not spend actions. */
export function prepareMirageActivation(item,grant){const name=grant.rule.name,type=['Beast Speech','Piece of Mind'].includes(name)?'bonus':name==='Tentative Escape'||grant.rule.keenCredit?'reaction':grant.rule.phantomPain||name==='Myriad Forms'?null:name==='Superior Thoughts'?'special':'action';if(!type)return;const patch={};for(const activity of item.system.activities)patch['system.activities.'+activity.id+'.activation']={...foundry.utils.deepClone(activity.activation),override:true,type,value:1,...(name==='Superior Thoughts'?{condition:'Full-Turn Action'}:{})};item.updateSource(patch);item.prepareFinalAttributes?.();}
export function prepareTemporalShift(game,item){
 if(!genjutsuEnabled(game)||sourceOf(item)!=='Compendium.n5eb.jutsus.Item.yu9B5zGAzeuU0lsz'||!ownedGenjutsuFeature(item.actor,'Temporal Shift','Time Slipper'))return;
 const patch={};for(const activity of item.system.activities)if(activity.roll?.formula&&/\bd8\b/i.test(activity.roll.formula))patch['system.activities.'+activity.id+'.roll.formula']=activity.roll.formula.replace(/\bd8\b/gi,'d12');
 // Dice usually have a count prefix, so match the whole dice token as well.
 for(const activity of item.system.activities)if(activity.roll?.formula&&/\b\d+d8\b/i.test(activity.roll.formula))patch['system.activities.'+activity.id+'.roll.formula']=activity.roll.formula.replace(/\b(\d+)d8\b/gi,'$1d12');
 patch['flags.'+MODULE_ID+'.genjutsuTemporalShift']={movement:15+5*Number(genjutsuLevel(item.actor)>=5)+5*Number(genjutsuLevel(item.actor)>=11)+5*Number(genjutsuLevel(item.actor)>=17)};item.updateSource(patch);item.prepareFinalAttributes?.();
}
