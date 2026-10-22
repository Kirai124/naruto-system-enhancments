import { MODULE_ID } from "../settings/register.mjs";

import {castingUsage} from "./mode-adapter.mjs";
import {normalizeMoldingConfig} from '../ui/molding-dialog.mjs';

const originals = new WeakMap();
const moldingUsageCosts=new WeakMap();
/** Validated once before clone transformations; later native preparation may see incomplete activity data. */
export function bindMoldingUsageCost(config,cost){if(!Number.isSafeInteger(cost)||cost<0)throw Error('Ungültiger bestätigter Molding-Zusatz.');moldingUsageCosts.set(config,cost);}

/** Always use the captured native calculation for API previews: never discount twice. */
export function nativeChakraCost(system, options) {
  let prototype = Object.getPrototypeOf(system);
  while (prototype) {
    const original = originals.get(prototype);
    if (original) return original.call(system, options);
    prototype = Object.getPrototypeOf(prototype);
  }
  return system.getChakraCost(options);
}

/** The native workflow remains responsible for validation and resource writes. */
export function installCostAdapter(game, prototype, api) {
  if (originals.has(prototype)) return;
  if (typeof prototype?.getChakraCost !== "function") throw new TypeError("Native Chakra method missing");
  const original = prototype.getChakraCost;
  originals.set(prototype, original);
  prototype.getChakraCost = function(options = {}) {
    const baseline = original.call(this, options);
    const actor = this.parent?.actor;
    if(actor&&game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&this.parent.getFlag?.(MODULE_ID,'moldingCast')?.echo)return 0;
    if (!game.settings.get(MODULE_ID, "dynamicChakraCosts") || !actor) return baseline;
    try {
      const usage=castingUsage(this.parent);
      const validated=game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&options.moldings===undefined?moldingUsageCosts.get(usage):undefined;
      const moldingConfig=actor._embeddedPreparation?undefined:(options.moldings??(game.settings.get(MODULE_ID,'efficientMoldingAutomation')?normalizeMoldingConfig(usage?.n5ese?.moldings):undefined));
      return api.previewJutsuCost(this.parent, {...options,taijutsu:options.taijutsu??usage?.n5ese?.taijutsu,genjutsu:options.genjutsu??usage?.n5ese?.genjutsu,classFeatures:options.classFeatures??(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')?usage?.n5ese?.classFeatures:undefined),moldings:validated===undefined?moldingConfig:undefined,moldingActivityId:options.moldingActivityId??usage?.n5ese?.moldingActivityId,ignoreVoidSurcharge:!game.settings.get(MODULE_ID,'ninjutsuTrackers'),pools:options.pools??(game.settings.get(MODULE_ID,'ninjutsuTrackers')?usage?.n5ese?.pools:undefined),chakraRecovery:options.chakraRecovery??(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&usage?.n5ese?.chakraRecovery),martialTechnique:options.martialTechnique??usage?.n5ese?.martialTechnique}).finalCost+(validated??0);
    } catch (error) {
      console.error(`[${MODULE_ID}] Cost calculation failed; retaining native cost.`, error);
      return baseline;
    }
  };
}
