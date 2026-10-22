import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuEnabled} from '../casting/taijutsu-context.mjs';
import {prepareMoldingReduction} from '../casting/subclass-molding-damage.mjs';
/** The debt applies only to an actual native melee damage application, never a preview. */
export function installSavageForce(game,ActorClass){
 const busy=new WeakSet(),original=ActorClass.prototype.applyDamage;
 ActorClass.prototype.applyDamage=async function(parts,options={}){
  const debt=this.getFlag(MODULE_ID,'taijutsuSavageDebt'),activity=options.originatingMessage?.getAssociatedActivity?.();
  if(!taijutsuEnabled(game)||options.multiplier===0||options.n5eseSecondaryTaijutsu||activity?.type!=='attack'||activity.attack?.type?.value!=='melee')return original.call(this,parts,options);
  if(['applying','review'].includes(debt?.status))throw Error('Savage Force: unterbrochenen eingehenden Treffer vor weiterer Anwendung vom GM prüfen lassen.');
  if(!debt?.active)return original.call(this,parts,options);
  if(!this.isOwner)throw Error('Savage Force: Zielanwendung durch Eigentümer oder GM erforderlich.');
  if(busy.has(this))throw Error('Savage Force: eingehender Treffer wird bereits bearbeitet.');
  busy.add(this);const id=foundry.utils.randomID();let applied=false,amount=0,chakraAmount=0;
  const hook=Hooks.on('dnd5e.applyDamage',(actor,total,config)=>{if(actor===this&&config.n5eseSavageApplication===id){applied=true;amount=total;}});
  const calculation=Hooks.on('dnd5e.calculateDamage',(_actor,damages,config)=>{if(config.n5eseSavageApplication===id)chakraAmount=damages.chakraAmount??0;});
  try{
   await this.setFlag(MODULE_ID,'taijutsuSavageDebt',{...debt,status:'applying',active:false,applicationId:id,incomingMessageId:options.originatingMessage.id});
   const result=await original.call(this,parts,{...options,n5eseSavageApplication:id,n5eseNoDamageReduction:true});
   const current=this.getFlag(MODULE_ID,'taijutsuSavageDebt');if(current?.applicationId!==id)throw Error('Savage-Force-Journal während der Anwendung verändert.');
   await this.setFlag(MODULE_ID,'taijutsuSavageDebt',applied&&(amount>0||chakraAmount>0)?{...current,status:'consumed',active:false,consumedBy:options.originatingMessage.id,consumedAt:game.time.worldTime}:{...debt,status:'active',active:true});
   return result;
  }catch(error){await this.setFlag(MODULE_ID,'taijutsuSavageDebt',{...debt,status:'review',active:false,applicationId:id,incomingMessageId:options.originatingMessage.id,error:error.message});throw error;
  }finally{Hooks.off('dnd5e.applyDamage',hook);Hooks.off('dnd5e.calculateDamage',calculation);busy.delete(this);}
 };
 // Installed after the other module damage hooks. Keep immunity and positive modifiers.
 Hooks.on('dnd5e.preCalculateDamage',(actor,damages,options)=>{
  if(!taijutsuEnabled(game)||!(options.n5eseSavageApplication||options.n5eseQuarterstaffExpert)||!options.n5eseNoDamageReduction)return;
  options.ignore={...(options.ignore===true?{}:options.ignore),immunity:false,resistance:true,armorDR:true,threshold:true};
  options.downgrade=false;
  if(Number.isFinite(options.multiplier)&&options.multiplier>=0&&options.multiplier<1)options.multiplier=1;
  const modifiers=Object.fromEntries(Object.entries(actor.system.traits.dm?.amount??{}).map(([key,formula])=>[key,game.n5eb.utils.simplifyBonus(formula,actor.getRollData({deterministic:true}))]));
  const immune=actor.system.traits.di.value,eligible=damages.filter(d=>d.value>0&&!CONFIG.DND5E.healingTypes[d.type]&&!immune.has('ALL')&&!immune.has(d.type)&&!(CONFIG.DND5E.damageTypes[d.type]?.isPhysical&&d.properties?.size&&actor.system.traits.dm?.bypasses?.intersection(d.properties).size));
  Object.assign(options,prepareMoldingReduction(eligible,modifiers,{...options,ignore:{...options.ignore,modification:new Set()}},false));
 });
}
