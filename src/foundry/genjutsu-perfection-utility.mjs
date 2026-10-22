import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled} from '../casting/genjutsu-context.mjs';
const busy=new WeakSet();
export function installGenjutsuUtilityPerfection(game,types){
 const wrapped=new WeakSet();for(const {documentClass}of Object.values(types)){let proto=documentClass?.prototype;while(proto&&!Object.hasOwn(proto,'rollFormula'))proto=Object.getPrototypeOf(proto);if(!proto||wrapped.has(proto))continue;wrapped.add(proto);const original=proto.rollFormula;
  proto.rollFormula=async function(...args){const record=this.item.getFlag(MODULE_ID,'genjutsuCast');if(!genjutsuEnabled(game)||record?.choice.perfection!=='utility:0')return original.apply(this,args);const primary=game.messages.find(m=>m.type==='usage'&&m.getFlag(MODULE_ID,'genjutsuCast')?.id===record.id);if(!primary||primary.system.deltas===null)throw Error('Bezahlter ursprünglicher Perfection-Cast fehlt.');if(primary.getFlag(MODULE_ID,'genjutsuPerfectionUsed'))return original.apply(this,args);if(busy.has(primary))throw Error('Dieser Perfection-Wurf ist bereits offen.');busy.add(primary);
   try{const data=this.item.toObject(),activity=data.system.activities[this.id];if(!activity?.roll?.formula)throw Error('Ursprüngliche Utility-Formel fehlt.');activity.roll.formula='('+activity.roll.formula+') + 1d'+record.die;const copy=new CONFIG.Item.documentClass(data,{parent:this.actor});copy.prepareFinalAttributes?.();const result=await original.apply(copy.system.activities.get(this.id),args);if(result?.length)await primary.setFlag(MODULE_ID,'genjutsuPerfectionUsed',true);return result;}finally{busy.delete(primary);}
  };
 }
}
