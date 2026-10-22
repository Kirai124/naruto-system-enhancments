import {SOURCE,sourceOf,validChoice} from "./feature-rules.mjs";
export const TECHNICAL=`${SOURCE}class.Item.0fiiTQYNOvYThIk4`;
export const FORCE=`${SOURCE}subclass.Item.gq14aktuBUS0c9eF`;
export const FRENZY=`${SOURCE}subclass.Item.AYlQ6DT673xQZe8H`;
export const MARTIAL=`${SOURCE}class.Item.ucEljLiJZkch29oz`;
export const TAI_CLASS=`${SOURCE}class.Item.Ipg5bKh1zS3Yfn2I`;

export function availableCastingModes(item,rank) {
  if(item.type!=="spell" || !item.actor) return [];
  const items=[...item.actor.items],owned=source=>items.find(i=>i.type==="feat" && sourceOf(i)===source);
  const resource=owned(MARTIAL),levels=items.find(i=>i.type==="class"&&sourceOf(i)===TAI_CLASS)?.system.levels;
  if(!resource || !Number.isInteger(levels) || levels<2) return [];
  const die=levels>=17?8:levels>=9?6:4,modes=[];
  if(owned(TECHNICAL) && (item.system.jutsu?.type==="taijutsu" || [...(item.system.jutsu?.keywords??[])].includes("taijutsu"))) modes.push({id:"technical",label:"Technical Technique",resourceId:resource.id,dice:1,die});
  const controlled=globalThis.game?.settings?.get('naruto5e-system-enhancements','taijutsuClassAutomation'),state=item.actor.getFlag?.('naruto5e-system-enhancements','taijutsuFrenzy'),activation=controlled&&state?.status==='active'&&state.expiresAt>globalThis.game.time.worldTime&&state.forceAvailable;
  const force=owned(FORCE),extra={d:1,c:1,b:2,a:2,s:3}[rank];
  const heavyArmor=items.some(i=>i.type==="equipment" && i.system.equipped && i.system.type?.value==="heavy");
  if((!controlled||activation)&&force && levels>=6 && owned(FRENZY) && !heavyArmor && validChoice(force,force.flags?.["naruto5e-system-enhancements"]?.costChoice)
    && force.flags["naruto5e-system-enhancements"].costChoice===item.id && extra) modes.push({id:"frenzy",label:"Force of Rage",resourceId:resource.id,dice:extra+(controlled?0:1),die});
  return modes;
}

export function modeUpkeep(baseCost,passiveCost,{technicalResult=null,frenzy=false,lightningReduction=0,inertiaReduction=0,noUpkeep=false}={}) {
  if(!Number.isInteger(baseCost)||baseCost<0||!Number.isInteger(passiveCost)||passiveCost<0) throw new TypeError("Invalid upkeep");
  if(technicalResult!==null && (!Number.isInteger(technicalResult)||technicalResult<1)) throw new TypeError("Invalid Martial Die result");
  // User-confirmed: round the half die up; compare with passive reductions, never add.
  if(!Number.isInteger(lightningReduction)||lightningReduction<0)throw new TypeError('Invalid Lightning Mote reduction');
  return frenzy||noUpkeep?0:Math.min(passiveCost,Math.max(0,baseCost-lightningReduction),inertiaReduction?Math.max(Math.min(baseCost,1),baseCost-inertiaReduction):baseCost,technicalResult===null?baseCost:Math.max(0,baseCost-Math.ceil(technicalResult/2)));
}
