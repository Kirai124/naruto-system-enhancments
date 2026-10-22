/** Values verified in Compendium.n5eb.clan.Item.xqFLFGRWFRamlGuy on 2026-10-11. */
export function registerAmplifiedFlames(registry) {
  for (const [rank, reduction] of Object.entries({ d: 1, c: 2, b: 3, a: 4, s: 5 })) {
    registry.register({ rankReduction: true, id: `n5e-enhancements.amplified-flames.${rank}`, source: "Compendium.n5eb.clan.Item.xqFLFGRWFRamlGuy", label: "Amplified Flames",
      filters: { featuresAll: ["Compendium.n5eb.clan.Item.xqFLFGRWFRamlGuy"], keywordsAll: ["fire", "hijutsu"], ranks: [rank], clans: ["uchiha"] },
      change: { operation: "add", value: -reduction }, stacking: { group: "amplified-flames", mode: "exclusive" } });
  }
}
