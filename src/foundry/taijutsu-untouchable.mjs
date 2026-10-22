import {taijutsuEnabled,taijutsuFeature} from '../casting/taijutsu-context.mjs';
export function installUntouchable(game,types){const wrapped=new WeakSet();for(const {documentClass}of Object.values(types)){let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'rollAttack'))p=Object.getPrototypeOf(p);if(!p||wrapped.has(p))continue;wrapped.add(p);const original=p.rollAttack;p.rollAttack=async function(config={},dialog={},message={}){
 if(!taijutsuEnabled(game)||!this.actor?.isOwner)return original.call(this,config,dialog,message);
 const targets=[...game.user.targets].filter(t=>t.actor),protectedTargets=targets.filter(t=>taijutsuFeature(t.actor,'Untouchable','Disturbance'));if(!protectedTargets.length)return original.call(this,config,dialog,message);
 if(targets.length!==1)throw Error('Untouchable: genau das tatsächliche Ziel dieses Angriffswurfs markieren.');
 const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Untouchable · '+targets[0].name},content:'<p>Gegen dieses Ziel sind Gelegenheitsangriffe verboten. Wird für diesen Angriff tatsächlich eine Reaktion verbraucht, gilt Nachteil. Angriffe ohne Reaktionsverbrauch normal behandeln, auch wenn ein Feature einen normalerweise reaktiven Angriff ausdrücklich kostenlos erlaubt. Aktionsökonomie manuell.</p>',buttons:[{action:'reaction',label:'Tatsächlich Reaktion verbrauchen · Nachteil',callback:()=> 'reaction'},{action:'normal',label:'Kein Reaktionsverbrauch · normal',callback:()=> 'normal'},{action:'opportunity',label:'Gelegenheitsangriff · nicht erlaubt',callback:()=> 'opportunity'}],rejectClose:false});
 if(!choice||choice==='opportunity')return;
 return original.call(this,choice==='reaction'?{...config,disadvantage:true}:config,dialog,message);
 };}}
