import { MODULE_ID } from "../settings/register.mjs";
export function debug(game, ...args) {
  if (game.settings.get(MODULE_ID, "debugLogging")) console.debug(`[${MODULE_ID}]`, ...args);
}
