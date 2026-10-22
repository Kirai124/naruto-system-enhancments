import {MODULE_ID} from '../settings/register.mjs';
import {medicalEnabled,medicalFeature,isMedical} from '../casting/medical-context.mjs';
export async function assistedCopingChoice(game,target,source,item,rule){
 if(!medicalEnabled(game)||!medicalFeature(source,'Assisted Coping','Counselor-Nin')||!isMedical(item)||(target.system.attributes.hp.temp??0)<=0||target.getFlag(MODULE_ID,'medicalRecipientUses')?.assistedCoping)return false;
 const entries=target.getFlag(MODULE_ID,'medicalTemporaryHP')??[],known=entries.some(e=>e.remaining>0&&(e.sourceActorUuid!==source.uuid||e.itemUuid&&e.itemUuid!==item.uuid||rule&&e.rule!==rule)),unknown=(target.system.attributes.hp.temp??0)>entries.reduce((n,e)=>n+e.remaining,0);
 if(!known&&!unknown)return false;
 return foundry.applications.api.DialogV2.confirm({window:{title:'Assisted Coping · tatsächliche andere Quelle'},content:'<p>Die bereits vorhandenen temporären HP stammen tatsächlich aus einer anderen Quelle als dieses Medical-Jutsu? Den neuen Anteil zusätzlich gewähren und die gemeinsame Empfängergrenze bis zum Verlust aller temporären HP belegen?</p>',rejectClose:false});
}
export function assistedCopingUpdates(target,{sourceActorUuid,itemUuid,amount,rule='assisted-coping',id=foundry.utils.randomID()}){
 const hp=target.system.attributes.hp.temp??0,ledger=structuredClone(target.getFlag(MODULE_ID,'medicalTemporaryHP')??[]),entry={id,sourceActorUuid,itemUuid,rule,remaining:amount,at:game.time.worldTime};
 const updates={'system.attributes.hp.temp':hp+amount,['flags.'+MODULE_ID+'.medicalTemporaryHP']:[...ledger,entry],['flags.'+MODULE_ID+'.medicalRecipientUses']:{...(target.getFlag(MODULE_ID,'medicalRecipientUses')??{}),assistedCoping:true}};
 for(const key of ['genjutsuTemporaryHP','ninjutsuTemporaryHP'])if(target.getFlag(MODULE_ID,key)!==undefined)updates['flags.'+MODULE_ID+'.'+key]=structuredClone(target.getFlag(MODULE_ID,key));return {updates,id};
}
export function installMedicalAssistedCoping(game,ActorClass){
 const apply=ActorClass.prototype.applyDamage;ActorClass.prototype.applyDamage=async function(parts,options={}){const item=options.originatingMessage?.getAssociatedItem?.(),amount=parts.filter(p=>p.type==='temphp'&&p.value>0).reduce((n,p)=>n+p.value,0);if(amount&&await assistedCopingChoice(game,this,item?.actor,item)){options={...options,n5eseAssistedCoping:{amount,sourceActorUuid:item.actor.uuid,itemUuid:item.uuid}};}return apply.call(this,parts,options);};
 Hooks.on('dnd5e.preApplyDamage',(target,_amount,updates,options)=>{if(!medicalEnabled(game)||!options.n5eseAssistedCoping)return;if(target.getFlag(MODULE_ID,'medicalRecipientUses')?.assistedCoping)throw Error('Assisted Coping inzwischen verbraucht; Anwendung erneut prüfen.');const result=assistedCopingUpdates(target,options.n5eseAssistedCoping);Object.assign(updates,result.updates);options.n5eseAssistedCoping.tempGrantId=result.id;});
}
