import {sourceOf} from './feature-rules.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from './genjutsu-context.mjs';
const rules=[
 ['Compendium.n5eb.jutsus.Item.PwPO0rHvWFAaIoBT','Shaping Your World','Illusionist'],
 ['Compendium.n5eb.jutsus.Item.n5ebTransform001','Inspired Appearance','Beguiler'],
 ['Compendium.n5eb.jutsus.Item.r22E3m0wQlmuhE72','Fear Of The Unknown','Nightmare Keeper']
];
export function innateGenjutsuFreeCast(game,item){if(!game||!genjutsuEnabled(game))return null;const rule=rules.find(([source,name,category])=>sourceOf(item)===source&&ownedGenjutsuFeature(item.actor,name,category));return rule?.[1]??null;}
