/** Persistent, rule-neutral groups. UUIDs distinguish synthetic actors and scene tokens. */
const copy = value => JSON.parse(JSON.stringify(value));
const string = value => typeof value === 'string' && value.length > 0;
export function readLedger(raw) {
  if (raw == null) return {version: 1, groups: []};
  if (raw.version !== 1 || !Array.isArray(raw.groups)) throw Error('Unsupported tracker state');
  return copy(raw);
}
export function groupKey(kind, target = null) {
  if (!string(kind)) throw TypeError('Invalid tracker kind');
  if (target && (!string(target.actorUuid) || !string(target.tokenUuid))) throw TypeError('Actor and token UUID required');
  return JSON.stringify([kind, target?.actorUuid ?? null, target?.tokenUuid ?? null]);
}
export function liveGroups(raw, now) {
  if (!Number.isFinite(now)) throw TypeError('Invalid world time');
  return readLedger(raw).groups.map(group => ({...group, entries: group.entries.filter(e => e.expiresAt > now)})).filter(group => group.entries.length);
}
export function addUnit(raw, {kind, sourceItemUuid, target = null, id, now, duration = 60, maximum = 5}) {
  if (!string(id) || !string(sourceItemUuid) || !Number.isFinite(now) || !Number.isFinite(duration) || duration <= 0
    || !Number.isSafeInteger(maximum) || maximum < 1) throw TypeError('Invalid tracker entry');
  const state = readLedger(raw), key = groupKey(kind, target);
  if (state.groups.some(g => g.entries.some(e => e.id === id))) throw Error('Duplicate tracker entry');
  let group = state.groups.find(g => g.key === key);
  if (!group) { group = {key, kind, sourceItemUuid, target: target ? copy(target) : null, entries: []}; state.groups.push(group); }
  const live = group.entries.filter(e => e.expiresAt > now);
  if (live.length >= maximum) {
    group.entries = live.map(e => ({...e, expiresAt: now + duration}));
    return state;
  }
  // User decision: renew the active group; never revive expired entries.
  group.entries = [...live.map(e => ({...e, expiresAt: now + duration})), {id, createdAt: now, expiresAt: now + duration}];
  group.sourceItemUuid = sourceItemUuid;
  return state;
}
export function removeUnits(raw, {key, count, now}) {
  if (!Number.isSafeInteger(count) || count < 1 || !Number.isFinite(now)) throw TypeError('Invalid tracker removal');
  const state = readLedger(raw), group = state.groups.find(g => g.key === key);
  if (!group) throw Error('Tracker group unavailable');
  const live = group.entries.filter(e => e.expiresAt > now);
  if (count > live.length) throw Error('Insufficient tracker entries');
  group.entries = live.slice(count);
  state.groups = state.groups.filter(g => g.entries.length);
  return state;
}
