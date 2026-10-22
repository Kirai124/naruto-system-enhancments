import {grantsNinjutsu} from './ninjutsu-selections.mjs';
import {sourceOf} from './feature-rules.mjs';
import {ninjutsuLevel,EFFICIENT_MOLDING} from './ninjutsu-resources.mjs';
import {SUBCLASS_MOLDINGS,matchesSubclassMolding,subclassMoldingContext} from './subclass-moldings.mjs';

export {EFFICIENT_MOLDING};
const define=(id,name,item,cost,extra={})=>Object.freeze({id,name,source:`Compendium.n5eb.class.Item.${item}`,cost,phase:'cast',additive:false,...extra});
/** Installed class rules only. Subclass extensions are deliberately separate. */
export const MOLDINGS=Object.freeze([
  define('careful','Careful Ninjutsu','dj8plzCbtckqiSmx',5,{combination:true}),
  define('distant','Distant Ninjutsu','WKuW8qIi6pNkwsRw',3),
  define('doubled','Doubled Ninjutsu','LNMxqd08iiPMERIH',Object.freeze({d:4,c:8,b:12,a:15,s:20})),
  define('echoing','Echoing Ninjutsu','895gDQISsr897ged',5),
  define('extended','Extended Ninjutsu','kewhdexPWQsejLv5',5),
  define('focused','Focused Ninjutsu','H0tyZSbi5A3g6e6L',4,{phase:'concentration',additive:true}),
  define('heightened','Heightened Ninjutsu','WlswNmQaBUxffXs4',5,{additive:true}),
  define('piercing','Piercing Ninjutsu','kdNksSkvJ0F4giKZ',5,{additive:true}),
  define('potent','Potent Ninjutsu','EDp8hasyF4myp728',Object.freeze({d:3,c:5,b:7,a:9,s:12})),
  define('precise','Precise Ninjutsu','z7m6vdvku9OSLxgl',3),
  define('quickened','Quickened Ninjutsu','NAozCZIFsyQ1o7qu',5),
  define('reactive','Reactive Ninjutsu','uNJyLoiEeLreoTtp',6),
  define('redirected','Redirected Ninjutsu','V8jLuVGvKtleqePb',5,{phase:'miss',additive:true}),
  define('subtle','Subtle Ninjutsu','zsCeXU1ozYyigLSM',3,{additive:true}),
  define('tenacious','Tenacious Ninjutsu','qbFzllOjI9s2AaJb',5,{phase:'clash'}),
  define('transmogrified','Transmogrified Ninjutsu','1PNGnvxXg8i00vpw',9),
  define('widened','Widened Ninjutsu','X6p9hEMOFluiIGYB',4)
]);
export const ALL_MOLDINGS=Object.freeze([...MOLDINGS,...SUBCLASS_MOLDINGS]);
export function moldingSlots(level){return Number.isInteger(level)&&level>=3&&level<=20?2+[5,9,13,18].filter(n=>level>=n).length:0;}
export function moldingUses(level){return Number.isInteger(level)&&level>=3&&level<=20?2+[9,15].filter(n=>level>=n).length:0;}
export function moldingFeature(actor){
  if(actor?.type!=='character'||!moldingUses(ninjutsuLevel(actor)))return null;
  const found=[...(actor.items??[])].filter(i=>i.type==='feat'&&sourceOf(i)===EFFICIENT_MOLDING&&i.dependentOrigin?.active!==false);
  if(found.length>1)throw Error('Efficient Molding: mehrere gemeinsame Ressourcen-Features vorhanden.');
  return found[0]??null;
}
export function knownMoldings(item,{phase='cast'}={}){
  if(item?.type!=='spell'||!moldingFeature(item.actor))return [];
  const jutsu=item.system?.jutsu,keywords=new Set(jutsu?.keywords??[]);
  const nin=jutsu?.type==='ninjutsu'||keywords.has('ninjutsu');
  const sources=new Set([...item.actor.items].filter(i=>i.type==='feat'&&i.dependentOrigin?.active!==false).map(sourceOf));
  return ALL_MOLDINGS.filter(m=>(nin||m.subclass)&&m.phase===phase&&sources.has(m.source)&&(!keywords.has('combination')||m.combination));
}
export function moldingCost(id,rank){
  const rule=ALL_MOLDINGS.find(m=>m.id===id);
  if(!rule)throw Error('Unbekanntes Molding.');
  const cost=typeof rule.cost==='number'?rule.cost:rule.cost[rank];
  if(!Number.isInteger(cost))throw Error('Für diesen Jutsu-Rang fehlen bestätigte Molding-Kosten.');
  return cost;
}
/** No Constitution substitution: explicitly confirmed by the user. */
export function moldingSaveAbilities(ability){
  const group=[['str','dex'],['wis','cha']].find(g=>g.includes(ability));
  return group?.filter(a=>a!==ability)??[];
}
/** Conservative activity checks; text-only target restrictions need explicit confirmation. */
export function availableMoldings(activity,{phase='cast',context={},preview=false}={}){
  if(!activity?.item)return [];
  const damage=(activity.damage?.parts?.length??0)>0||(activity.damage?.includeBase&&activity.item?.system.damage?.base?.number>0);
  const save=[...(activity.save?.ability??[])],attack=typeof activity.rollAttack==='function'||activity.type==='attack';
  const range=activity.range??{},duration=activity.duration??{},target=activity.target??{};
  return knownMoldings(activity.item,{phase}).filter(m=>{
    if(m.subclass)return matchesSubclassMolding(m,activity,preview?{inkArtConfirmed:true,pairedCastConfirmed:true,imbuedWeaponConfirmed:true,taijutsuAttacksConfirmed:true,...context}:context);
    switch(m.id){
      case 'careful':case 'heightened':return save.length>0;
      case 'transmogrified':return save.length===1&&moldingSaveAbilities(save[0]).length>0;
      case 'potent':return !!damage&&!grantsNinjutsu(activity.item);
      case 'piercing':return !!damage;
      case 'precise':case 'redirected':return attack;
      case 'focused':return !!duration.concentration;
      case 'echoing':return !!damage&&!target.template?.type&&Number(target.affects?.count)===1;
      case 'doubled':return range.units!=='self'&&!target.template?.type&&Number(target.affects?.count)===1;
      case 'distant':return range.units==='touch'||(['ft','mi','m','km'].includes(range.units)&&Number(range.value)>0&&!range.special);
      case 'extended':return ({second:1,round:6,minute:60,hour:3600,day:86400}[duration.units]??0)*Number(duration.value)>=60&&!duration.special;
      case 'widened':return target.template?.units==='ft'&&['line','cube','sphere','cone','cylinder'].includes(target.template?.type);
      case 'quickened':case 'reactive':return activity.activation?.type==='action'&&(activity.activation.value??1)===1;
      default:return true;
    }
  });
}
/** Expand paid groups/attacks without allowing an extra regular Molding type. */
export function configuredMoldings(activity,configuration={},rank=activity.item.system.effectiveRank,{subclassEnabled=true}={}){
  const ids=Object.keys(configuration).filter(id=>configuration[id]?.enabled===true),available=availableMoldings(activity,{context:subclassMoldingContext(configuration)}).filter(m=>subclassEnabled||!m.subclass);
  if(ids.some(id=>!available.some(m=>m.id===id)))throw Error('Ausgewähltes Molding passt nicht zu dieser Aktivität.');
  if(ids.includes('final-lesson')&&ids.includes('magnum-opus'))throw Error('Final Lesson und Magnum Opus dürfen nicht gleichzeitig verwendet werden.');
  if(ids.includes('imbuement-master')&&ids.some(id=>['doubled','scribe-master'].includes(id)))throw Error('Imbuement Master verlangt genau ein Ziel; keine zusätzliche Mehrziel-Auswahl.');
  const plan=planMoldings(activity.item,{ids,rank,subclassEnabled});
  const units=plan.selected.flatMap(m=>{
    const count=configuration[m.id].count??1;
    if(!Number.isInteger(count)||count<1||count>20||(!['careful','precise'].includes(m.id)&&count!==1))throw Error('Ungültige Molding-Anzahl.');
    const freeCount=configuration[m.id].freeCount;
    if(freeCount!==undefined&&(!Number.isInteger(freeCount)||freeCount<0||freeCount>count))throw Error('Ungültige Anzahl kostenloser Molding-Nutzungen.');
    return Array.from({length:count},(_,index)=>({...m,key:`${m.id}:${index}`,policy:freeCount===undefined?(configuration[m.id].payment??'auto'):(index<freeCount?'free':'chakra')}));
  });
  const remaining=plan.feature?Math.max(0,plan.feature.system.uses.max-plan.feature.system.uses.spent):0;
  if(units.some(u=>!['auto','free','chakra'].includes(u.policy)))throw Error('Ungültige Molding-Bezahlung.');
  if(units.some(u=>u.mandatoryPayment&&u.policy==='free'))throw Error('Diese Technik muss immer bezahlt werden; kostenlose Nutzungen sind ausgeschlossen.');
  const eligible=units.filter(u=>!u.mandatoryPayment);
  const assigned=eligible.filter(u=>u.policy==='free');
  if(assigned.length>remaining)throw Error('Nicht genügend kostenlose Molding-Nutzungen für diese Zuordnung.');
  const auto=eligible.filter(u=>u.policy==='auto').sort((a,b)=>b.cost-a.cost);
  const free=[...assigned,...auto.slice(0,Math.max(0,remaining-assigned.length))];
  // Chakra is available only beyond the free-use limit specified by the class feature.
  if(free.length<Math.min(remaining,eligible.length))throw Error('Noch verfügbare Molding-Nutzungen müssen zuerst zugeordnet werden.');
  return {...plan,uses:free.length,units,freeIds:free.map(u=>u.key),additionalCost:units.filter(u=>!free.includes(u)).reduce((n,u)=>n+u.cost,0)};
}
/** Pure preview. Explicit freeIds permits assigning the remaining free uses. */
export function planMoldings(item,{ids=[],freeIds,rank=item?.system?.effectiveRank,phase='cast',subclassEnabled=true}={}){
  if(!Array.isArray(ids)||new Set(ids).size!==ids.length)throw Error('Molding-Auswahl enthält Duplikate.');
  const rules=knownMoldings(item,{phase}).filter(m=>subclassEnabled||!m.subclass),selected=ids.map(id=>{
    const rule=rules.find(m=>m.id===id);if(!rule)throw Error('Molding nicht bekannt oder nicht verfügbar.');
    return {...rule,cost:moldingCost(id,rank)};
  });
  const limit=1;
  if(phase==='cast'&&selected.filter(m=>!m.additive).length>limit)throw Error(`Höchstens ${limit} reguläre(s) Molding für diesen Cast erlaubt.`);
  if(!selected.length)return {selected:[],freeIds:[],uses:0,additionalCost:0,feature:null};
  const feature=moldingFeature(item.actor),{spent,max}=feature.system.uses;
  if(!Number.isInteger(spent)||spent<0||!Number.isInteger(max)||max<0)throw Error('Ungültiger Molding-Nutzungspool.');
  const eligible=selected.filter(m=>!m.mandatoryPayment),remaining=Math.max(0,max-spent),required=Math.min(remaining,eligible.length);
  const free=freeIds??[...eligible].sort((a,b)=>b.cost-a.cost).slice(0,required).map(m=>m.id);
  if(!Array.isArray(free)||new Set(free).size!==free.length||free.length!==required||free.some(id=>!eligible.some(m=>m.id===id)))throw Error('Ungültige Zuordnung der kostenlosen Molding-Nutzungen.');
  return {feature,selected,freeIds:[...free],uses:free.length,additionalCost:selected.filter(m=>!free.includes(m.id)).reduce((sum,m)=>sum+m.cost,0)};
}
/** Supplement the native transaction, never update documents during preview. */
export function spendMoldings(updates,plan){
  if(!plan.uses)return updates;
  if(!updates||Array.isArray(updates))throw Error('Molding: native Transaktion fehlt.');
  const feature=plan.feature,{spent,max}=feature.system.uses;
  if(!Number.isInteger(spent)||spent<0||!Number.isInteger(max)||spent+plan.uses>max)throw Error('Molding-Nutzungen inzwischen erschöpft.');
  updates.item??=[];
  const entry=updates.item.find(i=>i._id===feature.id);
  if(entry&&(Object.hasOwn(entry,'system.uses.spent')||entry.system?.uses!==undefined||Object.hasOwn(entry,'system.uses')))throw Error('Konkurrierender Molding-Verbrauch.');
  if(entry)entry['system.uses.spent']=spent+plan.uses;
  else updates.item.push({_id:feature.id,'system.uses.spent':spent+plan.uses});
  return updates;
}
