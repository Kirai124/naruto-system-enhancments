import {sourceOf} from './feature-rules.mjs';
import {ownedGenjutsuFeature} from './genjutsu-context.mjs';
export const SENSORY_JUTSU=Object.freeze([
 {kind:'sensing',name:'Sensory Expertise',sources:['Compendium.n5eb.t7-jutsus.Item.PepjsuFd3PsU3HN1','Compendium.n5eb.jutsus.Item.rJGBb5PfcuUcvhWf']},
 {kind:'kagura',name:'Sensory Overload',sources:['Compendium.n5eb.t7-jutsus.Item.ulmRpea1VR0c85tK','Compendium.n5eb.jutsus.Item.st2oNPWsXuHs2ZUi']},
 {kind:'eagle',name:"Sensor's Influence",sources:['Compendium.n5eb.jutsus.Item.6AcFpt2sVFp5O033']}
]);
export function sensoryDefinition(item){return item?.type==='spell'?SENSORY_JUTSU.find(r=>r.sources.includes(sourceOf(item))&&ownedGenjutsuFeature(item.actor,r.name,'Sensory Type')):undefined;}
