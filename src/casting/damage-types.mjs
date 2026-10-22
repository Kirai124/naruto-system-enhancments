/** Read damage shared by every damaging activity; never guess between alternative types. */
export function fixedDamageTypes(item) {
  const activities = [...(item.system.activities ?? [])].filter(activity => activity.damage?.parts?.length);
  if (!activities.length) return { types: [], ambiguous: false };
  const fixed = activities.map(activity => [...new Set(activity.damage.parts.flatMap(part => {
    const values = [...(part.types ?? [])];
    return values.length === 1 ? values : [];
  }))]);
  const types = fixed[0].filter(type => fixed.every(values => values.includes(type)));
  const alternatives = activities.some(activity => activity.damage.parts.some(part => [...(part.types ?? [])].length > 1));
  const differentActivities = fixed.some(values => values.length !== fixed[0].length || values.some(type => !fixed[0].includes(type)));
  return { types, ambiguous: alternatives || differentActivities };
}
