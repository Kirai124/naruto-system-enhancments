import {sensoryDefinition} from '../casting/genjutsu-sensory.mjs';
import {medicalEnabled,medicalFeature,medicalLevel,isMedical} from '../casting/medical-context.mjs';
import { VERIFIED_UCHIHA_SOURCES } from "../casting/verified-uchiha-sources.mjs";
import { VERIFIED_ABURAME_SOURCES } from "../casting/verified-aburame-sources.mjs";
import { choiceRuleFor, validChoice, choiceToken, sourceOf } from "../casting/feature-rules.mjs";
import { fixedDamageTypes } from "../casting/damage-types.mjs";

/** Read-only adapter. Provenance does not grant actor abilities. */
export function buildCastingContext(item, { rank = item.system.effectiveRank, selectedModifierIds = [], usageRemaining = {} } = {}, nativeCost = system => system.getChakraCost({ rank })) {
  if (item.type !== "spell" || typeof item.system?.getChakraCost !== "function") throw new TypeError("An N5eB jutsu is required");
  const actor = item.actor;
  if (!actor) throw new TypeError("The jutsu must belong to an actor");
  const sourceUuid = item._stats?.compendiumSource ?? item.flags?.core?.sourceId;
  const clan = VERIFIED_UCHIHA_SOURCES.includes(sourceUuid) ? "uchiha" : VERIFIED_ABURAME_SOURCES.includes(sourceUuid) ? "aburame" : null;
  const ownedFeatures = [...actor.items].filter(i => i.type === "feat");
  const features = ownedFeatures.flatMap(i => [i.system?.identifier, i._stats?.compendiumSource ?? i.flags?.core?.sourceId]).filter(Boolean);
  if(item.flags?.['naruto5e-system-enhancements']?.genjutsuDelayedCast?.kind==='brain'&&globalThis.game?.settings.get('naruto5e-system-enhancements','genjutsuClassAutomation'))features.push('n5ese.brain-worm-cast');
  if(globalThis.game?.settings.get('naruto5e-system-enhancements','genjutsuClassAutomation')&&sensoryDefinition(item))features.push('n5ese.sensory-cast');
  const genClass = [...actor.items].find(i=>i.type==="class" && sourceOf(i)==="Compendium.n5eb.class.Item.HowNkV03NSJZ71AV");
  const genLevels=genClass?.system?.levels;
  if(Number.isInteger(genLevels) && genLevels>=6) features.push(`n5ese.split-focus-${genLevels>=19?3:genLevels>=10?2:1}`);
  if(item.system.properties?.has?.("concentration")) features.push("n5ese.concentration-jutsu");
  // Inspect raw flags to avoid recursion through the dynamic concentration getter.
  const concentrated=[...(actor.concentration?.effects??[])].map(effect=>actor.items.get?.(effect.flags?.n5eb?.item?.id));
  const genjutsu=i=>i && (i.system.jutsu?.type==="genjutsu" || [...(i.system.jutsu?.keywords??[])].includes("genjutsu"));
  if(genjutsu(item) && concentrated.every(genjutsu)) features.push("n5ese.only-genjutsu-concentration");
  for (const feature of ownedFeatures) {
    const choice = feature.flags?.["naruto5e-system-enhancements"]?.costChoice;
    if (validChoice(feature, choice)) features.push(choiceToken(sourceOf(feature), choice));
    if(sourceOf(feature)==="Compendium.n5eb.feats.Item.IUP3QLqV0zosxB7n" && validChoice(feature,choice) && choice===item.id && rank===item.system.rank) features.push("n5ese.master-weaver-base-jutsu");
    if(sourceOf(feature)==="Compendium.n5eb.class.Item.obvRMj1Qcky6T1U6" && validChoice(feature,choice) && choice===item.id) features.push("n5ese.signature-control-jutsu");
  }
  const warnings = [];
  if(globalThis.game&&medicalEnabled(game)){
    if(medicalFeature(actor,'Healing Touch','Adept Medic'))features.push('n5ese.medical-healing-touch');
    if(medicalFeature(actor,'Advanced Medical Research')&&item.getFlag('naruto5e-system-enhancements','medicalResearch')?.actorUuid===actor.uuid)features.push('n5ese.medical-research');
    const group=[...concentrated.filter(i=>i&&i.id!==item.id),item];
    if(medicalFeature(actor,'Fortifying Scripture','Spiritual Scribe')&&group.every(i=>isMedical(i)||i.system.jutsu?.keywords?.has('fuinjutsu'))){const double=medicalLevel(actor)>=9&&group.length>=2&&group.every(i=>isMedical(i)&&i.system.jutsu?.keywords?.has('fuinjutsu'));features.push('n5ese.medical-fortifying-'+(double?2:1));}
  }
  const damage = fixedDamageTypes(item);
  features.push(...damage.types.map(type => `n5ese.damage.${type}`));
  if (damage.ambiguous && ownedFeatures.some(feature => choiceRuleFor(feature)?.selection === "damage")
    && item.system.jutsu?.type === "ninjutsu" && [...(item.system.jutsu?.keywords ?? [])].includes("medical")) warnings.push("unverified-damage-type");
  if (/heavenly[\s-]+breath/i.test(item.name??"")) features.push("n5ese.heavenly-breath");
  if (ownedFeatures.some(feature => choiceRuleFor(feature) && !validChoice(feature, feature.flags?.["naruto5e-system-enhancements"]?.costChoice))) warnings.push("missing-cost-choice");
  if (!clan && features.includes("amplified-flames") && [...(item.system.jutsu?.keywords ?? [])].includes("fire")) warnings.push("unverified-clan");
  if (features.includes("amplified-flames") && !features.includes("Compendium.n5eb.clan.Item.xqFLFGRWFRamlGuy")) warnings.push("unverified-feature");
  return { baseCost: nativeCost(item.system, { rank }), rank, keywords: [...new Set([...(item.system.jutsu?.keywords ?? []),item.system.jutsu?.type].filter(Boolean))], features, clan, selectedModifierIds, usageRemaining,
    warnings, sourceUuid: sourceUuid ?? null };
}
