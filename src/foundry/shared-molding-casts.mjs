import {postCostSurcharge} from '../casting/pending-costs.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {availableMoldings,configuredMoldings} from '../casting/efficient-molding.mjs';
import {subclassMoldingContext} from '../casting/subclass-moldings.mjs';
import {castingUsage,mergeCastingMode} from './mode-adapter.mjs';
import {normalizeMoldingConfig} from '../ui/molding-dialog.mjs';
import {nativeChakraCost as rankCost} from './cost-adapter.mjs';
const grants=new Map(),wrapped=new WeakSet(),natures=['earth','wind','fire','water','lightning'];
export function sharedMoldingGrant(item,config=castingUsage(item)){
 const grant=grants.get(config?.n5ese?.sharedMoldingTicket);
 return grant&&grant.actorUuid===item.actor?.uuid&&grant.itemId===item.id?grant:null;
}
export function castingMoldingPlan(game,activity,configuration,rank,config){
 const plan=configuredMoldings(activity,configuration,rank,{subclassEnabled:game.settings.get(MODULE_ID,'subclassMoldingAutomation')});
 return sharedMoldingGrant(activity.item,config)?.sharedMoldings?{...plan,uses:0,additionalCost:0,freeIds:[]}:plan;
}
export async function withFollowupMoldingGrant(item,grant,operation){
 const ticket=foundry.utils.randomID();grants.set(ticket,{...grant,actorUuid:item.actor.uuid,itemId:item.id});
 try{return await operation(ticket);}finally{grants.delete(ticket);}
}
export function magnumPartner(actor,primary,options){
 const item=actor.items.get(options.partnerItemId),activity=item?.system.activities.get(options.partnerActivityId);
 if(!options.inkSummonConfirmed||!options.partnerInkConfirmed||!activity||item.type!=='spell'||item.system.jutsu.type!=='ninjutsu')throw Error('Magnum Opus: tatsächlichen Ink Summon und eigenes Beast-Imitating-Art-Folgejutsu bestätigen.');
 const rank=options.partnerRank??item.system.effectiveRank;return {item,activity,rank,fixedCost:Math.floor(rankCost(item.system,{rank})/2)};
}
export function finalLessonPartner(actor,primary,options){
 const item=actor.items.get(options.partnerItemId),activity=item?.system.activities.get(options.partnerActivityId);
 if(!activity||item.type!=='spell'||item.system.jutsu.type!=='ninjutsu'||item.id===primary.id)throw Error('Final Lesson: zweites eigenes Ninjutsu auswählen.');
 const a=options.primaryNature,b=options.partnerNature;
 if(!natures.includes(a)||!natures.includes(b)||a===b||!primary.system.jutsu.keywords.has(a)||!item.system.jutsu.keywords.has(b))throw Error('Final Lesson benötigt zwei bestätigte verschiedene, tatsächlich vorhandene Nature Releases.');
 return {item,activity,rank:options.partnerRank??item.system.effectiveRank};
}
export function transferableMoldings(activity,configuration){
 const available=new Set(availableMoldings(activity,{context:subclassMoldingContext(configuration)}).map(m=>m.id));
 return Object.fromEntries(Object.entries(configuration).filter(([id,value])=>id!=='final-lesson'&&value.enabled&&available.has(id)).map(([id,value])=>[id,{...value,payment:'auto',freeCount:undefined}]));
}
/** Two native casts with one shared Molding payment; interrupted pairs require explicit GM review. */
export function installSharedMoldingCasts(game,types){
 for(const {documentClass} of Object.values(types)){
  let p=documentClass?.prototype;while(p&&!Object.hasOwn(p,'_prepareUsageUpdates'))p=Object.getPrototypeOf(p);
  if(!p||wrapped.has(p))continue;wrapped.add(p);const prepare=p._prepareUsageUpdates,use=p.use;
  p._prepareUsageUpdates=async function(config,options){
   const enabled=game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&game.settings.get(MODULE_ID,'efficientMoldingAutomation'),grant=sharedMoldingGrant(this.item,config);
   const finishFollowup=async result=>{
    if(!result||Array.isArray(result)||!enabled||!grant||!['magnum-opus','solar-interflow'].includes(grant.kind))return result;
    const api=game.modules.get(MODULE_ID).api,rank=config.jutsu?.rank??this.item.system.effectiveRank,cost=api.previewJutsuCost(this.item,{rank,ignoreMoldingCost:true,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,ignoreMoldingFollowup:true,martialTechnique:config.n5ese?.martialTechnique}).finalCost;
    mergeCastingMode(this,{upkeepChakraCost:cost});config.chakra??={};config.chakra.maintain=api.previewMaintainCost(this.item,{rank,cost}).finalCost;
    if(grant.onPrepared)await grant.onPrepared();return result;
   };
   const kind=config.n5ese?.moldings?.['final-lesson']?.enabled?'final-lesson':config.n5ese?.moldings?.['magnum-opus']?.enabled?'magnum-opus':null;
   if(!enabled||!kind)return finishFollowup(await prepare.call(this,config,options));
   if(['applying','review'].includes(this.actor.getFlag(MODULE_ID,'sharedMoldingJournal')?.status))throw Error('Das vorherige Jutsu-Paar benötigt eine GM-Prüfung.');
   const selection=config.n5ese.moldings[kind],partner=kind==='final-lesson'?finalLessonPartner(this.actor,this.item,selection):magnumPartner(this.actor,this.item,selection),api=game.modules.get(MODULE_ID).api;
   const preview=api.previewJutsuCost(this.item,{rank:config.jutsu?.rank,moldings:normalizeMoldingConfig(config.n5ese.moldings),moldingActivityId:this.id,pools:config.n5ese.pools,chakraRecovery:config.n5ese.chakraRecovery});
   const first=(preview.finalCost-preview.moldingAdditionalCost-postCostSurcharge(preview))*(config.n5eb?.shockedCostMultiplier??1)+preview.moldingAdditionalCost+postCostSurcharge(preview);
   const second=kind==='magnum-opus'?partner.fixedCost:api.previewJutsuCost(partner.item,{rank:partner.rank,ignoreMoldingCost:true,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true}).finalCost;
   if(this.actor.getChakraAvailable()<first+second)throw Error(`Final Lesson: ${first+second} Chakra für beide Jutsu benötigt.`);
   const result=await prepare.call(this,config,options);if(!result||Array.isArray(result))return result;
   const record=this.item.getFlag(MODULE_ID,'moldingCast');
   this.item.updateSource({[`flags.${MODULE_ID}.moldingCast`]:{...record,partner:{kind,itemId:partner.item.id,activityId:partner.activity.id,rank:partner.rank,fixedCost:partner.fixedCost,moldings:kind==='final-lesson'?transferableMoldings(partner.activity,config.n5ese.moldings):{}}}});return finishFollowup(result);
  };
  p.use=async function(...args){
   const result=await use.apply(this,args),record=result?.message?.getFlag(MODULE_ID,'moldingCast');
   if(!record?.ids?.some(id=>['final-lesson','magnum-opus'].includes(id))||!record.partner||record.echo||!game.settings.get(MODULE_ID,'subclassMoldingAutomation'))return result;
   const actor=this.actor,journal={id:foundry.utils.randomID(),status:'applying',firstMessageId:result.message.id,partner:record.partner};
   await actor.setFlag(MODULE_ID,'sharedMoldingJournal',journal);
   const ticket=foundry.utils.randomID(),partner=actor.items.get(record.partner.itemId)?.system.activities.get(record.partner.activityId);
   grants.set(ticket,{kind:record.partner.kind,sharedMoldings:record.partner.kind==='final-lesson',fixedCost:record.partner.fixedCost,actorUuid:actor.uuid,itemId:record.partner.itemId,primaryMessageId:result.message.id});
   try{
    if(!partner)throw Error('Zweites Jutsu inzwischen entfernt.');
    const second=await partner.use({jutsu:{rank:record.partner.rank},consume:{chakra:true,resources:false,action:false},concentration:{begin:false},subsequentActions:false,create:{measuredTemplate:false},n5ese:{sharedMoldingTicket:ticket,moldings:record.partner.moldings}},{configure:false},{create:true});
    if(!second?.message)throw Error('Zweites Jutsu abgebrochen oder fehlgeschlagen.');
    journal.status='applied';journal.secondMessageId=second.message.id;await actor.setFlag(MODULE_ID,'sharedMoldingJournal',journal);
    await second.message.setFlag(MODULE_ID,'sharedMoldingPrimary',result.message.id);return {...result,paired:second};
   }catch(error){journal.status='review';journal.error=error.message;await actor.setFlag(MODULE_ID,'sharedMoldingJournal',journal);ui.notifications.error(`Jutsu-Paar zur GM-Prüfung gesperrt: ${error.message}`);return result;}
   finally{grants.delete(ticket);}
  };
 }
}
