import {sourceOf} from './feature-rules.mjs';
export const NINJUTSU_CLASS='Compendium.n5eb.class.Item.n5ebNinSpec00001';
export const CHAKRA_RECOVERY='Compendium.n5eb.class.Item.n5ebChakraRec001';
export const JUTSU_BREAKER='Compendium.n5eb.class.Item.pSfnPm1YPdJ90FPq';
export const EFFICIENT_MOLDING='Compendium.n5eb.class.Item.FsvDzBMGBKvUj93O';
export function ninjutsuLevel(actor) {
  const level=[...(actor?.items??[])].find(i=>i.type==='class'&&sourceOf(i)===NINJUTSU_CLASS)?.system.levels;
  return Number.isInteger(level)&&level>=1&&level<=20?level:0;
}
export function ninjutsuUses(source,level) {
  if(!Number.isInteger(level)||level<1||level>20)return null;
  if(source===CHAKRA_RECOVERY)return 1+[6,11,17].filter(n=>level>=n).length;
  if(source===JUTSU_BREAKER&&level>=5)return 2+[11,17].filter(n=>level>=n).length;
  if(source===EFFICIENT_MOLDING&&level>=3)return 2+[9,15].filter(n=>level>=n).length;
  return null;
}
export function recoveryFeature(item) {
  if(item?.type!=='spell'||item.actor?.type!=='character'||!ninjutsuLevel(item.actor))return null;
  const keywords=[...(item.system.jutsu?.keywords??[])];
  if(!(item.system.jutsu?.type==='ninjutsu'||keywords.includes('ninjutsu'))||keywords.includes('combination'))return null;
  return [...item.actor.items].find(i=>i.type==='feat'&&sourceOf(i)===CHAKRA_RECOVERY&&i.dependentOrigin?.active!==false)??null;
}
export function recoveryCost(cost) {
  if(!Number.isInteger(cost)||cost<0)throw new TypeError('Invalid Chakra cost');
  return Math.floor(cost/2);
}
/** Add to the native update batch. Native resource validation/deduction remains authoritative. */
export function spendRecovery(updates,feature) {
  if(!updates||Array.isArray(updates))return updates;
  const spent=feature.system.uses.spent,max=feature.system.uses.max;
  if(!Number.isInteger(spent)||!Number.isInteger(max)||max-spent<1)throw Error('Chakra Recovery: keine Nutzung verfügbar.');
  updates.item??=[];
  const update=updates.item.find(u=>u._id===feature.id);
  // Do not silently overlap a native or third-party consumption of this resource.
  if(update&&(Object.hasOwn(update,'system.uses.spent')||update.system?.uses?.spent!==undefined||Object.hasOwn(update,'system.uses')))throw Error('Chakra Recovery: konkurrierender Ressourcenverbrauch.');
  if(update)update['system.uses.spent']=spent+1;
  else updates.item.push({_id:feature.id,'system.uses.spent':spent+1});
  return updates;
}
