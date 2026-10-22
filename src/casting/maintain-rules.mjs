import { RANK_REDUCTION, SOURCE, choiceToken } from "./feature-rules.mjs";
import { calculateCost } from "../domain/cost-engine.mjs";

export const GENJUTSU_SPECIALTY = `${SOURCE}clan.Item.CLL5iAz1nOeh5IJg`;
export function registerMaintainRules(registry) {
  registry.register({id:'maintain.sensory-type',source:'Compendium.n5eb.t7-subclass.Item.SgTp2a4oyBEonH1O',label:'Sensory Type',filters:{featuresAll:['n5ese.sensory-cast']},change:{operation:'multiply',value:0}});
  registry.register({id:'maintain.brain-worm',source:`${SOURCE}t7-subclass.Item.C6bQU37OL6ulV3kf`,label:'Brain Worm',filters:{featuresAll:[`${SOURCE}t7-subclass.Item.C6bQU37OL6ulV3kf`,'n5ese.brain-worm-cast']},change:{operation:'multiply',value:0.5},minimumCost:1});
  registry.register({id:"maintain.signature-control",source:`${SOURCE}class.Item.obvRMj1Qcky6T1U6`,label:"Signature Control",filters:{featuresAll:[`${SOURCE}class.Item.obvRMj1Qcky6T1U6`,"n5ese.signature-control-jutsu"]},change:{operation:"add",value:-2}});
  registry.register({id:"maintain.genjutsu-adept",source:`${SOURCE}feats.Item.uKvSzjhPuU6PsGBF`,label:"Genjutsu Adept",filters:{featuresAll:[`${SOURCE}feats.Item.uKvSzjhPuU6PsGBF`,"n5ese.only-genjutsu-concentration"],keywordsAll:["genjutsu"]},change:{operation:"add",value:-1}});
  for(const [rank,reduction] of Object.entries(RANK_REDUCTION)) registry.register({id:`maintain.insect-nest.${rank}`,source:`${SOURCE}clan.Item.VYvfGNsnHlL3kVFi`,label:"Insect Nest Integrity",filters:{featuresAll:[`${SOURCE}clan.Item.VYvfGNsnHlL3kVFi`],clans:["aburame"],ranks:[rank]},change:{operation:"add",value:-reduction}});
  for(const reduction of [1,2,3]) registry.register({id:`maintain.split-focus.${reduction}`,source:`${SOURCE}subclass.Item.tvVUMw0khdsXW55L`,label:"Split Focus",filters:{featuresAll:[`${SOURCE}subclass.Item.tvVUMw0khdsXW55L`,`n5ese.split-focus-${reduction}`],keywordsAll:["genjutsu"]},change:{operation:"add",value:-reduction},minimumCost:1});
  registry.register({id:"maintain.master-weaver",source:`${SOURCE}feats.Item.IUP3QLqV0zosxB7n`,label:"Master Weaver",filters:{featuresAll:[`${SOURCE}feats.Item.IUP3QLqV0zosxB7n`,"n5ese.master-weaver-base-jutsu"]},change:{operation:"multiply",value:0}});
  const refined=`${SOURCE}clan.Item.MiMcnaCtgYIvXimE`;
  registry.register({id:"maintain.refined-network",source:refined,label:"Refined Chakra Network",filters:{featuresAll:[refined],keywordsAny:["taijutsu","medical"]},change:{operation:"add",value:-2},minimumCostRatio:0.5});
  const breathing=`${SOURCE}feats.Item.g5Xb0PN6LSvQZVOs`;
  registry.register({id:"maintain.efficient-breathing",source:breathing,label:"Efficient Breathing",filters:{featuresAll:[breathing,"n5ese.heavenly-breath"],keywordsAll:["taijutsu"]},change:{operation:"multiply",value:0}});
  registry.register({ id: "maintain.shinobi-edge", source: `${SOURCE}class.Item.wy9xySp19wJzUAc2`, label: "Shinobi Edge", filters: {featuresAll:[`${SOURCE}class.Item.wy9xySp19wJzUAc2`]}, change:{operation:"add",value:-1}, minimumCost:1 });
  const streamlined = `${SOURCE}feats.Item.TuBih5BiqmOINEgu`;
  for (const type of ["ninjutsu","genjutsu","taijutsu","bukijutsu"]) registry.register({
    id:`maintain.streamlined.${type}`,source:streamlined,label:"Streamlined Chakra Efficiency",
    filters:{featuresAll:[choiceToken(streamlined,type)],keywordsAll:[type]},change:{operation:"add",value:-1},minimumCost:1,
    stacking:{group:streamlined,mode:"exclusive"}
  });
  for (const [rank,reduction] of Object.entries(RANK_REDUCTION)) for (const [source,label] of [
    [GENJUTSU_SPECIALTY,"Genjutsu Specialty"], [`${SOURCE}class.Item.i069w6em8mShXwRh`,"Reality Marble"], [`${SOURCE}clan.Item.dIg2xmgpfCoXYi5a`,"Latent Genjutsu Specialty II"]
  ]) registry.register({id:`maintain.${source}.${rank}`,source,label,filters:{featuresAll:[source],keywordsAll:["genjutsu"],ranks:[rank]},change:{operation:"add",value:-reduction}});
}

export function calculateMaintainCost(registry, context) {
  // A genuinely free native upkeep must never be raised by a minimum-one reduction.
  const zeroAllowed = context.baseCost === 0;
  // User-confirmed policy: evaluate independent reductions, apply only the strongest.
  calculateCost(registry,context); // Validate complete input, including unknown selected IDs.
  let best=calculateCost({list:()=>[]},{...context,selectedModifierIds:[]});
  const skipped=[];
  for(const rule of registry.list()) {
    const candidate=calculateCost({list:()=>[zeroAllowed?{...rule,minimumCost:0,minimumCostRatio:0}:rule]},
      {...context,selectedModifierIds:(context.selectedModifierIds??[]).filter(id=>id===rule.id)});
    if(!candidate.breakdown.length) {skipped.push(...candidate.skipped);continue;}
    if(candidate.finalCost<best.finalCost) best=candidate;
  }
  for(const rule of registry.list()) if(!best.breakdown.some(entry=>entry.id===rule.id) && !skipped.some(entry=>entry.id===rule.id)) skipped.push(Object.freeze({id:rule.id,source:rule.source,reason:"weaker-maintain-modifier"}));
  return Object.freeze({...best,finalCost:context.baseCost===0?0:best.finalCost,skipped:Object.freeze(skipped)});
}
