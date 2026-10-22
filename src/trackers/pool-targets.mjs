import {MODULE_ID} from '../settings/register.mjs';
/** Pending pool effects use the same persistent GM queue as target marks. */
export function poolTargetEffect(plan,targets,sourceItemUuid){
 if(!Number.isInteger(plan.count)||plan.count<1||plan.count>5)throw Error('Ungültiger Pool-Verbrauch.');
 if(!Array.isArray(targets)||!targets.length||targets.some(t=>!t.actorUuid||!t.tokenUuid)||new Set(targets.map(t=>t.actorUuid)).size!==targets.length)throw Error('Eindeutige betroffene Kreaturen erforderlich.');
 if(plan.kind==='void-shards'&&plan.mode==='next-cost'&&targets.length===1)return {kind:plan.kind,mode:plan.mode,count:plan.count,sourceItemUuid,target:targets[0],label:`Nächstes Jutsu +${plan.count*5} Chakra`,amount:plan.count*5};
 if(plan.kind==='lightning-motes'&&plan.mode==='zap')return {kind:plan.kind,mode:plan.mode,count:plan.count,sourceItemUuid,target:{name:targets.map(t=>t.name).join(', ')},targets,label:`${plan.count}d8 Lightning auf bestätigte Ziele`,formula:`${plan.count}d8`,damageType:'lightning'};
 if(plan.kind==='rain-blades'&&plan.mode==='rain-chill')return {kind:plan.kind,mode:plan.mode,count:plan.count,sourceItemUuid,targets,target:{name:targets.map(t=>t.name).join(', ')},condition:{id:'chilled',delta:Math.floor(plan.count/2)},label:'Chilled +'+Math.floor(plan.count/2)};
 if(plan.kind==='solid-gems'&&plan.mode==='gem-construct'&&targets.length===1)return {kind:plan.kind,mode:plan.mode,count:plan.count,sourceItemUuid,targets,target:targets[0],label:'Konstrukt-DR +'+Math.min(8,plan.count*2),reduction:Math.min(8,plan.count*2)};
 if(plan.kind==='ink-sketches'&&['ink-help','ink-dodge','ink-command-dice'].includes(plan.mode))return {kind:plan.kind,mode:plan.mode,count:plan.count,sourceItemUuid,targets,target:{name:targets.map(t=>t.name).join(', ')},label:plan.mode==='ink-help'?'Ink Summon: Help':plan.mode==='ink-command-dice'?'Ink Summon: Zusatzwürfel':'Ink Summon: Dodge'};
 throw Error('Unbekannte Pool-Zielwirkung.');
}
export function readVoidSurcharges(actor){
 const entries=actor?.flags?.[MODULE_ID]?.voidSurcharges??[];
 if(!Array.isArray(entries)||entries.some(e=>!e.id||!e.sourceActorUuid||!e.sourceItemUuid||!Number.isInteger(e.amount)||e.amount<5||e.amount>25||e.amount%5))throw Error('Ungültige gespeicherte Void-Zuschläge.');
 if(new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Doppelte Void-Zuschläge.');
 return entries.map(e=>({...e}));
}
export function voidSurcharge(actor){return readVoidSurcharges(actor).reduce((sum,e)=>sum+e.amount,0);}
export function reservePoolRequests(actor,plans,targets,now,updates,randomId,requestedBy){
 const state=updates.actor[`flags.${MODULE_ID}.ninjutsuTracker`];
 if(!state)throw Error('Pool-Verbrauch fehlt im Castingvorgang.');
 for(const plan of plans.filter(p=>['next-cost','zap','rain-chill','gem-construct','ink-help','ink-dodge','ink-command-dice'].includes(p.mode))){
  const group=actor.flags?.[MODULE_ID]?.ninjutsuTracker?.groups.find(g=>g.key===plan.key);
  if(!group||state.requests?.some(r=>r.key===plan.key&&['pending','applying','review'].includes(r.status)))throw Error('Offene Pool-Auslösung muss zuerst abgeschlossen werden.');
  const entries=group.entries.filter(e=>e.expiresAt>now).slice(0,plan.count);
  if(entries.length!==plan.count)throw Error('Pool-Einträge nicht mehr verfügbar.');
  const effect=poolTargetEffect(plan,targets[plan.kind],group.sourceItemUuid);
  state.requests??=[];state.requests.push({id:randomId(),key:plan.key,effect,entries,groupTarget:null,status:'pending',createdAt:now,requestedBy,steps:[]});
 }
}
