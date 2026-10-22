import {moldingLifetimeExpired} from './molding-lifetimes.mjs';
export function generationalProtection(record,game){
 if(!record?.ids?.includes('generational')||record.refunded||record.ended||moldingLifetimeExpired({deadline:record.generationalDeadline},{combat:game.combat,worldTime:game.time?.worldTime??0}))return null;
 return Object.freeze({blocks:Object.freeze(['interrupt','negate','dispel']),deadline:record.generationalDeadline??null,manualEnd:!record.generationalDeadline});
}
