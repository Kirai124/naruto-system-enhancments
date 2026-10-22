import { MODULE_ID } from "../settings/register.mjs";
import { choiceRuleFor, validChoice, sourceOf, choicesFor } from "../casting/feature-rules.mjs";

const pending = new Set();
let queue = Promise.resolve();
const escape = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export async function configureFeatureChoice(game, item, {afterRest=false}={}) {
  const rule = choiceRuleFor(item);
  if (!rule || !item.actor || !item.isOwner) return false;
  const previous = item.getFlag(MODULE_ID,"costChoice");
  if (validChoice(item,previous) && !game.user.isGM && !(afterRest && rule.rest)) return false;
  const used = new Set([...item.actor.items].filter(other=>other.id!==item.id && sourceOf(other)===rule.source)
    .map(other=>other.getFlag(MODULE_ID,"costChoice")));
  const options = choicesFor(item).filter(choice=>!used.has(choice) || choice===previous);
  if (!options.length) { ui.notifications.warn(game.i18n.localize("N5ESE.Choice.NoOptions")); return false; }
  const selected = await foundry.applications.api.DialogV2.prompt({
    window:{title:game.i18n.localize("N5ESE.Choice.Title")},classes:["n5ese-feature-choice"],rejectClose:false,
    content:`<p>${escape(rule.name)}</p><p>${escape(game.i18n.localize(rule.selection === "damage" ? "N5ESE.Choice.DamageHint" : "N5ESE.Choice.Hint"))}</p><div class="form-group"><label>${escape(game.i18n.localize(rule.selection === "damage" ? "N5ESE.Choice.DamageType" : "N5ESE.Choice.Label"))}</label><select name="costChoice">${options.map(choice=>`<option value="${choice}" ${previous===choice?'selected':''}>${escape(rule.selection==="jutsu"?item.actor.items.get(choice).name:rule.selection==="damage"?game.i18n.localize(`DND5E.DAMAGE.Type.${choice[0].toUpperCase()+choice.slice(1)}`):game.i18n.localize(`N5EB.JUTSU.${'Keyword'}.${choice[0].toUpperCase()+choice.slice(1)+(["earth","wind","fire","water","lightning"].includes(choice)?"Release":"")}`))}</option>`).join("")}</select></div>`,
    ok:{label:game.i18n.localize("N5ESE.Choice.Save"),callback:(_event,button)=>button.form.elements.costChoice.value}
  });
  if (!selected) return false;
  if (!validChoice(item,selected) || !item.actor.items.has(item.id)) return false;
  // Validate duplicates again after the user finishes a potentially long dialog.
  if ([...item.actor.items].some(other=>other.id!==item.id && sourceOf(other)===rule.source && other.getFlag(MODULE_ID,"costChoice")===selected)) return false;
  await item.setFlag(MODULE_ID,"costChoice",selected);
  return true;
}

export function offerRestChoices(game,actor,result) {
  if(!actor.isOwner || !["long","full"].includes(result.type)) return;
  for(const item of actor.items) if(choiceRuleFor(item)?.rest==="long" || (result.type==="full" && choiceRuleFor(item)?.rest==="full")) {
    queue=queue.catch(()=>{}).then(()=>configureFeatureChoice(game,item,{afterRest:true}))
      .catch(error=>console.error(`[${MODULE_ID}] Rest choice failed`,error));
  }
  return queue;
}

export function addFeatureChoiceControl(game,sheet,controls) {
  const item=sheet.item??sheet.document;
  if(!item || !choiceRuleFor(item) || !item.actor || !item.isOwner) return;
  const selected=validChoice(item,item.getFlag(MODULE_ID,"costChoice"));
  if(selected && !game.user.isGM) return;
  const action="n5eseFeatureChoice";
  if(controls.some(control=>control.action===action)) return;
  controls.push({action,icon:"fa-solid fa-bolt",label:game.i18n.localize(selected?"N5ESE.Choice.Repair":"N5ESE.Choice.Title"),onClick:()=>configureFeatureChoice(game,item)});
}

export function queueFeatureChoice(game,item,userId) {
  if (userId!==game.user.id || !choiceRuleFor(item) || !item.actor || !item.isOwner
    || validChoice(item,item.getFlag(MODULE_ID,"costChoice")) || pending.has(item.uuid)) return;
  pending.add(item.uuid);
  queue = queue.catch(()=>{}).then(()=>configureFeatureChoice(game,item)).catch(error=>console.error(`[${MODULE_ID}] Feature choice failed`,error))
    .finally(()=>pending.delete(item.uuid));
}
