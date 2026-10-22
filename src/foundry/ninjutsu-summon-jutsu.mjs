import {MODULE_ID} from '../settings/register.mjs';
import {classFeature} from '../casting/ninjutsu-class-options.mjs';
import {withCastingActorLock} from './mode-adapter.mjs';

export async function syncSummoningMaster(game,source,target){
 if(!game.user.isGM||!source.isOwner||!target.isOwner||!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||!classFeature(source,'Summoning Master'))throw Error('GM und Summoning Master erforderlich.');
 const link=target.getFlag(MODULE_ID,'ninjutsuLink');if(link?.kind!=='summon'||link.sourceActorUuid!==source.uuid)throw Error('Tatsächliche Beschwörung zuerst zuordnen.');
 return withCastingActorLock(target,async()=>{
  const candidates=[...source.items].filter(i=>i.type==='spell'&&['e','d','c'].includes(i.system.rank)),existing=new Set([...target.items].map(i=>i.getFlag(MODULE_ID,'summoningMasterJutsu')?.sourceItemUuid)),missing=candidates.filter(i=>!existing.has(i.uuid));
  if(!missing.length){ui.notifications.info('Keine zusätzlichen bekannten Jutsu bis C-Rang zu übertragen.');return;}
  if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Summoning Master'},content:'<p>'+missing.length+' tatsächlich bekannte Jutsu bis C-Rang als eigene Kopien auf diese Beschwörung übertragen? Initiative, Kommandos und zusätzliche Bonusaktionen selbst verwalten. Die Kopien bleiben an diese Zuordnung und den Featurebesitz gebunden.</p>',rejectClose:false}))return;
  const copies=missing.map(item=>{const data=item.toObject();delete data._id;delete data.folder;delete data.sort;data.flags??={};data.flags[MODULE_ID]={summoningMasterJutsu:{sourceActorUuid:source.uuid,sourceItemUuid:item.uuid}};return data;});
  await target.createEmbeddedDocuments('Item',copies);
 });
}

export function installSummoningMasterJutsu(game){Hooks.on('dnd5e.preUseActivity',activity=>{
 const grant=activity.item?.getFlag?.(MODULE_ID,'summoningMasterJutsu');if(!grant)return;
 const link=activity.actor?.getFlag(MODULE_ID,'ninjutsuLink'),source=globalThis.fromUuidSync?.(grant.sourceActorUuid),original=globalThis.fromUuidSync?.(grant.sourceItemUuid);
 if(!game.settings.get(MODULE_ID,'ninjutsuClassAutomation')||link?.kind!=='summon'||link.sourceActorUuid!==grant.sourceActorUuid||!classFeature(source,'Summoning Master')||original?.actor?.uuid!==source.uuid||!['e','d','c'].includes(original.system.rank)){
  ui.notifications.warn('Dieses Summoning-Master-Jutsu ist ohne gültige Zuordnung, Quelle und Feature nicht verfügbar.');return false;
 }
});}

export async function unlinkNinjutsuCreature(game,source,target){
 if(!game.user.isGM||!target.isOwner||target.getFlag(MODULE_ID,'ninjutsuLink')?.sourceActorUuid!==source.uuid)throw Error('GM und ursprüngliche Zuordnung erforderlich.');
 if(!await foundry.applications.api.DialogV2.confirm({window:{title:'Kreatur-Zuordnung beenden'},content:'<p>Zuordnung und ausschließlich ihre eigenen N5ESE-Verknüpfungsboni entfernen? Andere Effekte und Inventareinträge bleiben erhalten. Übertragene Summoning-Master-Jutsu werden ohne Zuordnung unbenutzbar.</p>',rejectClose:false}))return;
 const ids=target.effects.filter(e=>{const m=e.getFlag(MODULE_ID,'ninjutsuEffect');return m?.id==='ninjutsu-link'&&m.sourceActorUuid===source.uuid;}).map(e=>e.id);
 if(ids.length)await target.deleteEmbeddedDocuments('ActiveEffect',ids);await target.unsetFlag(MODULE_ID,'ninjutsuLink');
}
