const OPERATIONS = new Set(["add", "multiply"]);
const RANKS = new Set(["e", "d", "c", "b", "a", "s", "art"]);

export function stringList(value, name) {
  if (!(Array.isArray(value) || value instanceof Set)) throw new TypeError(`${name} must be an array or Set`);
  const list = [...value];
  if (list.some(v => typeof v !== "string" || !v || v.trim() !== v)) throw new TypeError(`${name} contains invalid keys`);
  return Object.freeze([...new Set(list)]);
}

function text(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} is required`);
  return value;
}

function knownKeys(value, allowed, name) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError(`${name} must be a plain object`);
  if (Object.keys(value).some(k => !allowed.includes(k))) throw new TypeError(`Unknown ${name} field`);
}

/** Immutable declarative definitions; no arbitrary callbacks or document references. */
export class ModifierRegistry {
  #definitions = new Map();

  register(definition) {
    knownKeys(definition, ["id", "source", "label", "priority", "optional", "imposedCostIncrease", "filters", "change", "stacking", "usage", "minimumCost", "minimumCostRatio", "rankReduction", "exclusiveRankReduction"], "modifier");
    const { id, source, label = id, priority = 0, optional = false, filters = {}, change, stacking, usage } = definition;
    text(id, "id"); text(source, "source"); text(label, "label");
    if (this.#definitions.has(id)) throw new Error(`Duplicate modifier: ${id}`);
    if (!Number.isFinite(priority) || typeof optional !== "boolean") throw new TypeError("Invalid priority or optional");
    const imposedCostIncrease=definition.imposedCostIncrease??!optional;if(typeof imposedCostIncrease!=="boolean")throw new TypeError("Invalid imposedCostIncrease");
    const minimumCost = definition.minimumCost ?? 0;
    if (!Number.isSafeInteger(minimumCost) || minimumCost < 0) throw new TypeError("Invalid modifier minimumCost");
    const minimumCostRatio=definition.minimumCostRatio??0;
    if (!Number.isFinite(minimumCostRatio) || minimumCostRatio<0 || minimumCostRatio>1) throw new TypeError("Invalid minimumCostRatio");
    knownKeys(filters, ["keywordsAll", "keywordsAny", "featuresAll", "ranks", "clans"], "filter");
    const normalized = Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, stringList(v, k)]));
    if (normalized.ranks?.some(r => !RANKS.has(r))) throw new TypeError("Unknown rank");
    knownKeys(change, ["operation", "value"], "change");
    if (!OPERATIONS.has(change.operation)) throw new TypeError("Invalid operation");
    if (!Number.isFinite(change.value) || (change.operation === "multiply" && change.value < 0)) throw new TypeError("Invalid change value");
    const rankReduction = definition.rankReduction ?? false;
    const exclusiveRankReduction = definition.exclusiveRankReduction ?? false;
    if (typeof rankReduction !== "boolean" || typeof exclusiveRankReduction !== "boolean"
      || (exclusiveRankReduction && !rankReduction)
      || (rankReduction && (change.operation !== "add" || change.value >= 0))) throw new TypeError("Invalid rank reduction");
    if (stacking !== undefined) {
      knownKeys(stacking, ["group", "mode"], "stacking");
      if (stacking.mode !== "exclusive" || typeof stacking.group !== "string" || !stacking.group) throw new TypeError("Invalid stacking");
    }
    if (usage !== undefined) {
      knownKeys(usage, ["key", "required"], "usage");
      if (typeof usage.key !== "string" || !usage.key || !Number.isSafeInteger(usage.required) || usage.required < 1) throw new TypeError("Invalid usage requirement");
    }
    const entry = Object.freeze({ id, source, label, priority, optional, imposedCostIncrease, minimumCost, minimumCostRatio, rankReduction, exclusiveRankReduction, filters: Object.freeze(normalized),
      change: Object.freeze({ operation: change.operation, value: change.value }),
      stacking: stacking ? Object.freeze({ group: stacking.group, mode: stacking.mode }) : null,
      usage: usage ? Object.freeze({ key: usage.key, required: usage.required }) : null });
    this.#definitions.set(id, entry);
    return entry;
  }

  unregister(id) { return this.#definitions.delete(id); }
  list() { return Object.freeze([...this.#definitions.values()].sort((a, b) => a.priority - b.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))); }
}
