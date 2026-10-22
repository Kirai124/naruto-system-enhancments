import {MODULE_ID} from '../settings/register.mjs';
export function tomoeFor(actor,item,definition) {
 const levels=definition?.id==='n5ese.sharingan'?[3,7,11]:definition?.id==='n5ese.latent-sharingan'?[7,11,15]:null;
 if(!levels)return null;
 const saved=actor.flags?.[MODULE_ID]?.dojutsu?.unlocks?.[item.id]?.maxTomoe;
 const unlocked=Number.isInteger(saved)&&saved>=1&&saved<=3?saved:1;
 const level=Number(actor.system.details?.level??0);
 const available=levels.filter(min=>level>=min).length;
 return {unlocked,effective:Math.min(unlocked,available),available};
}
