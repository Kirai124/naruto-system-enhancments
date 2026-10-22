/** Observe the native completion hook so a canceled native damage event cannot continue with secondary effects. */
export async function applyMoldingDamage(target,damage,options){
 let applied=false;const marker={};
 const listener=Hooks.on('dnd5e.applyDamage',(actor,_amount,event)=>{if(actor===target&&event.n5eseDamageMarker===marker)applied=true;});
 try{await target.applyDamage(damage,{...options,n5eseDamageMarker:marker});}
 finally{Hooks.off('dnd5e.applyDamage',listener);}
 if(!applied)throw Error('Native Schadensanwendung abgebrochen; nachfolgende Wirkungen werden nicht angewendet.');
}
