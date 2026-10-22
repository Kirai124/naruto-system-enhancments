import {increaseMoldingDice} from './subclass-molding-effects.mjs';
/** Transform the native roll configuration once, after feature dice were appended. */
export function applySubclassDamage(result,record,{attack=true}={}){
 if(!record?.ids)return result;
 const has=id=>record.ids.includes(id);
 if(has('charged-blade')){
  const type=record.options?.['charged-blade']?.damageType??'force',bonus=attack&&Number.isFinite(record.paidJutsuCost)?chargedBladeBonus(record.paidJutsuCost):0;
  for(const roll of result.rolls??[]){roll.options??={};roll.options.type=type;roll.options.types=[type];if(bonus)roll.parts.push(String(bonus));}
 }
 if(has('macabre')){
  const type=record.options?.macabre?.damageType;if(!['acid','necrotic','poison'].includes(type))throw Error('Macabre: Schadensart bestätigen.');
  for(const roll of result.rolls??[]){roll.options??={};roll.options.type=type;roll.options.types=[type];}
 }
 for(const roll of result.rolls??[]){
  const type=roll.options?.type,step=has('stone-crusher')||(has('blaze-walker')&&type==='fire');
  if(step)roll.parts=roll.parts.map(formula=>{
   // Potent has already maximized original dice. Keep its new maximum tied to the upgraded die.
   const restored=formula.replace(/\b(\d*)d(\d+)min\2\b/gi,'$1d$2');
   const upgraded=increaseMoldingDice(restored);
   return formula===restored?upgraded:upgraded.replace(/\b(\d*)d(\d+)\b/gi,(_m,n,f)=>`${n||1}d${f}min${f}`);
  });
 }
 return result;
}
export function chargedBladeBonus(cost){if(!Number.isFinite(cost)||cost<0)throw Error('Charged Blade benötigt die endgültigen Jutsu-Kosten.');return Math.min(5,Math.floor(cost/5));}
export function subclassDefenseOptions(record,options={}){
 const ids=record?.ids??[];
 if(!ids.some(id=>['blaze-walker','sanguine-master','lightning-breaker','solar-interflow'].includes(id)))return options;
 if(options.ignore===true)return options;
 return {...options,ignore:{...options.ignore,immunity:true,resistance:true,...(ids.includes('sanguine-master')?{armorDR:true}: {})}};
}
/** Ignore only negative modification budgets; positive bonuses and existing ignores remain native. */
export function prepareMoldingReduction(damages,modifiers,options={},half=false){
 if(options.ignore===true||options.ignore?.modification===true)return options;
 const ignored=new Set(options.ignore?.modification??[]),budgets={};
 for(const [type,value] of Object.entries(modifiers))if(Number.isFinite(value)&&!ignored.has(type)){
  ignored.add(type);budgets[type]=value<0?(half?-Math.ceil(-value/2):0):value;
 }
 for(const damage of damages){
  for(const key of [damage.type,'ALL']){
   const modifier=budgets[key];if(!modifier)continue;
   const before=damage.value,next=before+modifier;
   damage.value=Math.sign(before)!==Math.sign(next)?0:next;budgets[key]+=before-damage.value;
  }
 }
 return {...options,ignore:{...options.ignore,modification:ignored}};
}
