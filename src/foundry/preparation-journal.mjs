/** Persist each random step before opening the next dialog; interrupted RNG is never repeated automatically. */
export async function preparedRandomStep(request,persist,key,roll){
 request.preparation??={};
 const previous=request.preparation[key];
 if(previous?.status==='done')return structuredClone(previous.result);
 if(previous?.status==='rolling')throw Error('Unterbrochener Würfelschritt: vor erneutem Würfeln vom GM prüfen lassen.');
 request.preparation[key]={status:'rolling'};await persist();
 const result=await roll();
 if(result===null){delete request.preparation[key];await persist();return null;}
 request.preparation[key]={status:'done',result:structuredClone(result)};await persist();return result;
}
export function preparedSave(request,persist,key,actor,config,message){
 const fingerprint=JSON.stringify(config),prior=request.preparation?.[key];
 if(prior?.status==='done'&&prior.result.fingerprint!==fingerprint)throw Error('SG oder Save-Konfiguration seit dem gespeicherten Wurf verändert; vom GM prüfen lassen.');
 return preparedRandomStep(request,persist,key,async()=>{const rolls=await actor.rollSavingThrow(config,{configure:true},{data:{flags:{n5eb:{originatingMessage:message.id}}}});return rolls?.length?{total:rolls[0].total,fingerprint,rolls:rolls.map(r=>r.toJSON())}:null;});
}
