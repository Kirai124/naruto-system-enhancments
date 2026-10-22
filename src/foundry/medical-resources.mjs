import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {MEDICAL_FEATURES} from '../casting/medical-sources.mjs';
import {medicalEnabled,medicalLevel} from '../casting/medical-context.mjs';
import {medicalResourceMaximum} from '../casting/medical-rules.mjs';

/** Prepared maxima only. Native spent/recovery data remains the single source of truth. */
export function installMedicalResources(game,FeatModel){
 const previous=new WeakMap(),p=FeatModel.prototype,prepare=p.prepareFinalData;
 p.prepareFinalData=function(...args){
  const before=previous.get(this);
  if(before?.field===this.uses&&this.uses.max===before.maximum)this.uses.max=before.base;
  if(before?.field===this.uses&&before.recovery===this.uses.recovery)this.uses.recovery=before.baseRecovery;
  previous.delete(this);const result=prepare.apply(this,args),item=this.parent;
  if(!medicalEnabled(game)||!medicalLevel(item.actor)||item.dependentOrigin?.active===false)return result;
  const definition=MEDICAL_FEATURES.find(d=>d.source===sourceOf(item));if(!definition)return result;
  if(String(this._source.uses.max??'')!==String(definition.installedMaximum)||item.overrides?.['system.uses.max']!==undefined||item.overrides?.system?.uses?.max!==undefined)return result;
  const maximum=medicalResourceMaximum(item.actor,definition.name);
  if(maximum===null||!Number.isInteger(this.uses.spent))return result;
  const baseRecovery=this.uses.recovery,recovery=definition.name==='Preserve Life: Mending Presence'&&!baseRecovery.length?[{period:'lr',type:'recoverAll'}]:baseRecovery;this.uses.recovery=recovery;
  previous.set(this,{field:this.uses,base:this.uses.max,maximum,baseRecovery,recovery});this.uses.max=maximum;this.uses.value=Math.max(0,maximum-this.uses.spent);return result;
 };
}
