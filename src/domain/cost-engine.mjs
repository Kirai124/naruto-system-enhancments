import { stringList } from "./registry.mjs";

function nonnegative(value, name) {
  if (!Number.isFinite(value) || value < 0) throw new TypeError(`${name} must be finite and nonnegative`);
  return value;
}

/** Calculates a proposal only. The caller remains responsible for resource validation and commit. */
export function calculateCost(registry, input) {
  const baseCost = nonnegative(input.baseCost, "baseCost");
  let minimumCost = nonnegative(input.minimumCost ?? 0, "minimumCost");
  if (!new Set(["e", "d", "c", "b", "a", "s", "art"]).has(input.rank)) throw new TypeError("Unknown cast rank");
  const context = {
    keywords: stringList(input.keywords ?? [], "keywords"),
    features: stringList(input.features ?? [], "features"),
    selected: stringList(input.selectedModifierIds ?? [], "selectedModifierIds")
  };
  const definitions = registry.list();
  if (context.selected.some(id => !definitions.some(d => d.id === id))) throw new TypeError("Unknown selected modifier");
  let cost = baseCost;
  const breakdown = [], skipped = [], groups = new Set();
  const usageRemaining = { ...(input.usageRemaining ?? {}) };
  const ineligible = (definition, remaining) => {
    const { filters: f } = definition;
    let reason;
    if(input.excludeCostReductions && ((definition.change.operation==="add" && definition.change.value<0) || (definition.change.operation==="multiply" && definition.change.value<1))) reason="cost-reduction-excluded";
    else if(input.excludeCostIncreases && definition.imposedCostIncrease && ((definition.change.operation==="add" && definition.change.value>0) || (definition.change.operation==="multiply" && definition.change.value>1))) reason="cost-increase-excluded";
    else if (f.featuresAll?.some(k => !context.features.includes(k))) reason = "missing-feature";
    else if (f.keywordsAll?.some(k => !context.keywords.includes(k))) reason = "keyword-mismatch";
    else if (f.keywordsAny?.length && !f.keywordsAny.some(k => context.keywords.includes(k))) reason = "keyword-mismatch";
    else if (f.ranks?.length && !f.ranks.includes(input.rank)) reason = "rank-mismatch";
    else if (f.clans?.length && !input.clan) reason = "unverified-clan";
    else if (f.clans?.length && !f.clans.includes(input.clan)) reason = "clan-mismatch";
    else if (definition.optional && !context.selected.includes(definition.id)) reason = "not-selected";
    else if (definition.usage && (!Number.isSafeInteger(remaining[definition.usage.key]) || remaining[definition.usage.key] < definition.usage.required)) reason = "usage-unavailable";
    return reason;
  };
  const rankCandidates = definitions.filter(d => d.rankReduction && !ineligible(d, usageRemaining));
  const exclusive = rankCandidates.some(d => d.exclusiveRankReduction);
  const individualCost = d => Math.max(minimumCost, d.minimumCost, Math.floor(baseCost*d.minimumCostRatio), baseCost+d.change.value);
  const winner = exclusive ? [...rankCandidates].sort((a,b) => individualCost(a)-individualCost(b) || definitions.indexOf(a)-definitions.indexOf(b))[0] : null;
  for (const definition of definitions) {
    let reason = ineligible(definition, usageRemaining);
    if (!reason && winner && definition.rankReduction && definition.id !== winner.id) reason = "exclusive-rank-reduction";
    if (!reason && definition.stacking && groups.has(definition.stacking.group)) reason = "exclusive-group";
    if (reason) { skipped.push(Object.freeze({ id: definition.id, source: definition.source, reason })); continue; }
    const before = cost;
    cost = definition.change.operation === "add" ? cost + definition.change.value : cost * definition.change.value;
    if (!Number.isFinite(cost)) throw new RangeError(`Cost overflow: ${definition.id}`);
    if (definition.stacking) groups.add(definition.stacking.group);
    minimumCost = Math.max(minimumCost, definition.minimumCost ?? 0, Math.floor(baseCost*(definition.minimumCostRatio??0)));
    if (definition.usage) usageRemaining[definition.usage.key] -= definition.usage.required;
    breakdown.push(Object.freeze({ id: definition.id, source: definition.source, label: definition.label, before, after: cost }));
  }
  // Round once at the boundary; the N5eB native baseline is already rounded.
  const finalCost = Math.max(minimumCost, Math.floor(cost));
  return Object.freeze({ baseCost, finalCost, minimumCost, breakdown: Object.freeze(breakdown), skipped: Object.freeze(skipped),
    usageRemaining: Object.freeze(usageRemaining), roundingDelta: finalCost - cost });
}
