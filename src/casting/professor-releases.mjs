import {sourceOf} from './feature-rules.mjs';
export const NATURES=Object.freeze(['earth','wind','fire','water','lightning']);
export const NATURE_DAMAGE=Object.freeze({earth:'earth',wind:'wind',fire:'fire',water:'cold',lightning:'lightning'});
const SOURCES=Object.freeze({
 earth:['Compendium.n5eb.subclass.Item.6k3tzrVimrHisn7E'],
 wind:['Compendium.n5eb.class.Item.n5ebStormWind001','Compendium.n5eb.subclass.Item.ZbYbe11Y9Q7mZRLy'],
 fire:['Compendium.n5eb.subclass.Item.m0LySRt20oFw78cs'],
 water:['Compendium.n5eb.subclass.Item.GjmoJoGDyoRRTQ4W'],
 lightning:['Compendium.n5eb.subclass.Item.SnFB2RKnmhbkij5G']
});
/** Source-backed access and GM-confirmed actor choices; item names never grant access. */
export function professorReleases(actor){
 const owned=new Set([...(actor?.items??[])].filter(i=>i.type==='feat'&&i.dependentOrigin?.active!==false).map(sourceOf));
 const confirmation=actor?.flags?.['naruto5e-system-enhancements']?.professorReleases;
 const confirmed=confirmation?.schemaVersion===1&&typeof confirmation.confirmedBy==='string'&&Array.isArray(confirmation.releases)?confirmation.releases:[];
 return NATURES.filter(k=>SOURCES[k].some(s=>owned.has(s))||confirmed.includes(k));
}
export function infusionRolls(releases){
 if(!Array.isArray(releases)||new Set(releases).size!==releases.length||releases.some(k=>!NATURES.includes(k)))throw Error('Chakra Infusion benötigt bestätigte Nature Releases.');
 return releases.map(k=>({parts:['1d10'],options:{type:NATURE_DAMAGE[k],types:[NATURE_DAMAGE[k]]}}));
}
