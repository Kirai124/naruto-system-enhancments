export const SOURCE = "Compendium.n5eb.";
export const CHOICES = Object.freeze([
  { source: `${SOURCE}feats.Item.Y8MjDEZ1HdFI4GT0`, name: "Elemental Specialization", choices: ["earth", "wind", "fire", "water", "lightning"], type: "ninjutsu", rankReduction: true },
  { source: `${SOURCE}feats.Item.AS8fRoa7OqVbdneK`, name: "Non-Elemental Specialization", choices: ["fuinjutsu", "medical"], type: "ninjutsu", rankReduction: true },
  { source: `${SOURCE}feats.Item.SWq8YRDXdmleHJSh`, name: "Sensory Specialization", choices: ["auditory", "visual", "inhaled"], type: "genjutsu", rankReduction: true },
  { source: `${SOURCE}clan.Item.VJTuJYJmpzNn3QFN`, name: "Latent Plasma Release III", choices: ["fire", "lightning"], reduction: 1, minimum: 1 },
  { source: `${SOURCE}clan.Item.ow8LXxeY0hLiXsMv`, name: "Latent Swift Release III", choices: ["wind", "lightning"], reduction: 1 },
  { source: `${SOURCE}feats.Item.TuBih5BiqmOINEgu`, name: "Streamlined Chakra Efficiency", choices: ["ninjutsu", "genjutsu", "taijutsu", "bukijutsu"], maintain: true },
  { source: `${SOURCE}feats.Item.IUP3QLqV0zosxB7n`, name: "Master Weaver", choices: [], selection:"jutsu",maintain:true,rest:"long" },
  { source: `${SOURCE}class.Item.obvRMj1Qcky6T1U6`, name:"Signature Control", choices:[],selection:"jutsu",maxRank:"b",maintain:true },
  { source: `${SOURCE}subclass.Item.gq14aktuBUS0c9eF`,name:"Force Of Rage",choices:[],selection:"jutsu",frenzy:true,maintain:true,rest:"full" },
  { source: `${SOURCE}feats.Item.Qe9VhMIJWCjLljBE`, name: "Medical Specialization", choices: ["acid", "necrotic", "poison"], type: "ninjutsu", selection: "damage", rankReduction: true, exclusiveRankReduction: true }
].map(rule => Object.freeze({ ...rule, choices: Object.freeze(rule.choices) })));
export const RANK_REDUCTION = Object.freeze({ d: 1, c: 2, b: 3, a: 4, s: 5 });
export const sourceOf = item => item._stats?.compendiumSource ?? item.flags?.core?.sourceId;
export const choiceRuleFor = item => item.type === "feat" ? CHOICES.find(rule => rule.source === sourceOf(item)) : undefined;
export function choicesFor(item) {
  const rule=choiceRuleFor(item);
  if(!rule) return [];
  if(rule.selection!=="jutsu") return rule.choices;
  if(rule.frenzy) return [...(item.actor?.items??[])].filter(jutsu=>jutsu.type==="spell" && jutsu.system.range?.units==="self"
    && ["minute","hour","day"].includes(jutsu.system.duration?.units) && Number(jutsu.system.duration.value)>=1
    && [...(jutsu.system.activities??[])].some(activity=>["action","bonus"].includes(activity.activation?.type))).map(jutsu=>jutsu.id);
  return [...(item.actor?.items??[])].filter(jutsu=>jutsu.type==="spell" && (rule.maxRank==="b"?["e","d","c","b"]:["e","d","c"]).includes(jutsu.system.rank)
    && (rule.maxRank==="b" || jutsu.system.properties?.has?.("concentration") || jutsu.system.duration?.concentration)).map(jutsu=>jutsu.id);
}
export const validChoice = (item, value) => choicesFor(item).includes(value);
export const choiceToken = (source, choice) => `${source}#choice=${choice}`;

export function registerChoiceModifiers(registry) {
  registry.register({id:"n5ese.signature-control",source:`${SOURCE}class.Item.obvRMj1Qcky6T1U6`,label:"Signature Control",filters:{featuresAll:[`${SOURCE}class.Item.obvRMj1Qcky6T1U6`,"n5ese.signature-control-jutsu"]},change:{operation:"add",value:-2},minimumCost:1});
  registry.register({id:"n5ese.latent-genjutsu-i",source:`${SOURCE}clan.Item.BcLhmrkWc6oMIYGS`,label:"Latent Genjutsu Specialty I",filters:{featuresAll:[`${SOURCE}clan.Item.BcLhmrkWc6oMIYGS`,"n5ese.concentration-jutsu"],keywordsAll:["genjutsu"],ranks:["d","c","b","a","s"]},change:{operation:"add",value:-1}});
  for(const [rank,reduction] of Object.entries(RANK_REDUCTION)) registry.register({id:`n5ese.empowered-taijutsu.${rank}`,source:`${SOURCE}feats.Item.Iz3IvHteq5JpIwSL`,label:"Empowered Taijutsu",rankReduction:true,exclusiveRankReduction:true,filters:{featuresAll:[`${SOURCE}feats.Item.Iz3IvHteq5JpIwSL`],keywordsAll:["taijutsu"],keywordsAny:["combo","finisher"],ranks:[rank]},change:{operation:"add",value:-reduction}});
  for(const [rank,reduction] of Object.entries(RANK_REDUCTION)) registry.register({rankReduction:true,id:`n5ese.efficient-breathing.${rank}`,source:`${SOURCE}feats.Item.g5Xb0PN6LSvQZVOs`,label:"Efficient Breathing",filters:{featuresAll:[`${SOURCE}feats.Item.g5Xb0PN6LSvQZVOs`,"n5ese.heavenly-breath"],keywordsAll:["taijutsu"],ranks:[rank]},change:{operation:"add",value:-reduction}});
  for (const rule of CHOICES.filter(rule => !rule.maintain)) for (const choice of rule.choices) {
    const ranks = rule.rankReduction ? Object.entries(RANK_REDUCTION) : [[null, rule.reduction]];
    for (const [rank, reduction] of ranks) registry.register({
      id: `n5ese.choice.${rule.source}.${choice}.${rank ?? "all"}`, source: rule.source, label: rule.name,
      filters: { featuresAll: [choiceToken(rule.source, choice), ...(rule.selection === "damage" ? [`n5ese.damage.${choice}`] : [])], keywordsAll: [...(rule.type ? [rule.type] : []), rule.selection === "damage" ? "medical" : choice], ...(rank ? { ranks: [rank] } : {}) },
      change: { operation: "add", value: -reduction },
      // User-confirmed: Elemental Specialization stacks with Amplified Flames.
      // Repeated copies of the same feat never discount the same jutsu twice.
      stacking: { group: rule.source, mode: "exclusive" },
      rankReduction: !!rule.rankReduction, exclusiveRankReduction: !!rule.exclusiveRankReduction,
      minimumCost: rule.minimum ?? 0
    });
  }
}
