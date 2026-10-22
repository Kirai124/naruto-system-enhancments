/** Observe the native completion hook; Actor.applyDamage also returns an Actor when another hook cancels. */
export async function applyMedicalDamage(target,parts,options={}){
 const receiptId=foundry.utils.randomID();let applied=false,amount=0,calculatedParts=[];
 const before={hp:target.system.attributes.hp.value,temp:target.system.attributes.hp.temp,chakra:target.system.attributes.chakra?.value,chakraTemp:target.system.attributes.chakra?.temp};
 const hook=Hooks.on('dnd5e.applyDamage',(actor,total,config)=>{if(actor===target&&config.n5eseMedicalReceipt===receiptId){applied=true;amount=total;}});
 const calculation=Hooks.on('dnd5e.calculateDamage',(_actor,damages,config)=>{if(config.n5eseMedicalReceipt===receiptId)calculatedParts=damages.map(p=>({type:p.type,value:p.value,properties:[...(p.properties??[])]}));});
 try{await target.applyDamage(parts,{...options,n5eseMedicalReceipt:receiptId});}finally{Hooks.off('dnd5e.applyDamage',hook);Hooks.off('dnd5e.calculateDamage',calculation);}
 if(!applied)throw Error('Native Medical-Anwendung wurde unterbrochen; GM-Prüfung erforderlich.');
 return {before,after:{hp:target.system.attributes.hp.value,temp:target.system.attributes.hp.temp,chakra:target.system.attributes.chakra?.value,chakraTemp:target.system.attributes.chakra?.temp},hpDamageBeforeTemp:Math.max(0,amount),calculatedParts};
}
