import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled} from '../casting/taijutsu-context.mjs';
/** Compensate only an explicitly confirmed numerical penalty in this one roll. */
export function installPreciseTechnique(game,types){
 const wrapped=new WeakSet();
 for(const {documentClass}of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const original=p.rollAttack;
  p.rollAttack=async function(config={},dialog={},message={}){
   const record=this.item?.getFlag(MODULE_ID,'taijutsuCast');if(!taijutsuEnabled(game)||(!record?.preciseTechnique||record.stancer?.technique))return original.call(this,config,dialog,message);
   const div=document.createElement('div'),p=document.createElement('p'),input=document.createElement('input');p.textContent='Precise Technique: Summe der tatsächlich in diesem Angriff enthaltenen Zahlenabzüge aus Jutsu/Traits bestätigen. 0 bedeutet keine solchen Abzüge. Nachteil bleibt unverändert. Nur bereits enthaltene Abzüge angeben.';input.name='penalty';input.type='number';input.min='0';input.step='1';input.value='0';div.append(p,input);
   const amount=await foundry.applications.api.DialogV2.wait({window:{title:'Precise Technique · Zahlenabzüge'},content:div.innerHTML,buttons:[{action:'confirm',label:'Abzüge bestätigen und Angriff würfeln',callback:(_e,b)=>Number(b.form.elements.penalty.value)}],rejectClose:false});
   if(amount===null||amount===undefined)return;if(!Number.isSafeInteger(amount)||amount<0)throw Error('Tatsächlichen nichtnegativen Zahlenabzug bestätigen.');
   const rolls=(config.rolls??[{}]).map((r,i)=>i?{...r}:{...r,parts:[...(r.parts??[]),...(amount?[String(amount)]:[])]});
   return original.call(this,{...config,rolls},dialog,message);
  };
 }
}
