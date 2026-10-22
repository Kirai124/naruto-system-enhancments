const ID='naruto5e-system-enhancements';
const flag=(message,scope,key)=>key.split('.').reduce((value,part)=>value?.[part],message.flags?.[scope])??message.getFlag?.(scope,key);
export const readMoldingRecord=message=>flag(message,ID,'moldingCast');
/** Native usage cards remain recognizable when an older async finalizer omitted its explicit marker. */
export function isMoldingPrimary(message){return !!readMoldingRecord(message)&&(flag(message,ID,'moldingPrimary')===true||message.type==='usage');}
