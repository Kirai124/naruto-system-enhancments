import {postCostSurcharge} from '../casting/pending-costs.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {spendMoldings,knownMoldings} from '../casting/efficient-molding.mjs';
import {moldingTransform} from '../casting/molding-transforms.mjs';
import {normalizeMoldingConfig} from '../ui/molding-dialog.mjs';
import {confirmMoldingTargets} from './molding-targets.mjs';
import {mergeCastingMode} from './mode-adapter.mjs';
import {nativeMaintainCost} from './maintain-adapter.mjs';
import {modeUpkeep} from '../casting/casting-modes.mjs';
import {applyAugmentedSave} from './casting-augmentation.mjs';
import {nativeChakraCost,bindMoldingUsageCost} from './cost-adapter.mjs';
import {professorReleases} from '../casting/professor-releases.mjs';
import {subclassCastExpiry} from '../casting/subclass-cast-lifetime.mjs';
import {checkPainterRound,painterRound} from './painter-triggers.mjs';
import {castingMoldingPlan,sharedMoldingGrant} from './shared-molding-casts.mjs';
import {imbuementConfiguration} from '../casting/imbuement-master.mjs';
import {nextActorTurnDeadline} from '../casting/molding-lifetimes.mjs';
const wrapped=new WeakSet(),pendingCosts=new WeakMap(),installed=new WeakSet();
const timing=(game,actor)=>game.combat?.started&&game.combat.combatants?.some(c=>c.actor?.uuid===actor.uuid)?{combatId:game.combat.id,round:game.combat.round,turn:game.combat.turn}:null;
export function installEfficientMolding(game,types){
  if(!installed.has(game)){
    installed.add(game);
    Hooks.on('dnd5e.activityConsumption',(_activity,config,message)=>{
      const amount=pendingCosts.get(config);if(!amount)return;
      pendingCosts.delete(config);config.chakra.cost+=amount;
      foundry.utils.setProperty(message,'data.system.chakraCost',config.chakra.cost);
    });
  }
  for(const {documentClass} of Object.values(types)){
    let prototype=documentClass?.prototype;
    while(prototype&&!Object.hasOwn(prototype,'_prepareUsageScaling'))prototype=Object.getPrototypeOf(prototype);
    if(!prototype||wrapped.has(prototype))continue;
    wrapped.add(prototype);
    const scale=prototype._prepareUsageScaling,prepare=prototype._prepareUsageUpdates,finish=prototype._finalizeMessageConfig;
    prototype._prepareUsageScaling=async function(config,message,item){
      const result=await scale.call(this,config,message,item);
      if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!this.isSpell)return result;
      const configuration=normalizeMoldingConfig(config.n5ese?.moldings),activity=item.system.activities.get(this.id);
      if(config.n5ese?.echoOf){
        const primary=game.messages.get(config.n5ese.echoOf),record=primary?.getFlag(MODULE_ID,'moldingCast');
        if(primary?.getAssociatedActor()?.uuid!==this.actor.uuid||primary.getFlag(MODULE_ID,'echoState')?.state!=='applying'||record?.itemId!==item.id||record.activityId!==this.id)throw Error('Ungültiger Echoing-Folgecast.');
        item.updateSource({[`system.activities.${this.id}.activation`]:{...foundry.utils.deepClone(activity.activation),override:true,type:'bonus',value:1},[`flags.${MODULE_ID}.moldingCast`]:{...record,castId:foundry.utils.randomID(),ids:[],options:{},echo:true,echoOf:primary.id,uses:0,additionalCost:0,timing:null}});
        item.prepareFinalAttributes?.();
        return result;
      }
      const plan=castingMoldingPlan(game,activity,configuration,config.jutsu?.rank??item.system.effectiveRank,config);
      bindMoldingUsageCost(config,plan.additionalCost);
      if(plan.selected.some(m=>m.subclass)&&!game.settings.get(MODULE_ID,'subclassMoldingAutomation'))throw Error('Unterklassen-Moldings sind ausgeschaltet.');
      const followup=game.settings.get(MODULE_ID,'subclassMoldingAutomation')?sharedMoldingGrant(this.item,config):null;
      if(!plan.selected.length&&followup?.kind!=='solar-interflow'&&!['concentration','miss','clash'].some(phase=>knownMoldings(item,{phase}).length))return result;
      if(plan.selected.length&&(!game.settings.get(MODULE_ID,'dynamicChakraCosts')||config.cause||!(config.consume===true||config.consume?.chakra===true)))throw Error('Moldings benötigen einen normalen bestätigten Cast mit Chakra-Verbrauch und dynamischen Kosten.');
      if(plan.selected.some(m=>m.id==='reactive')){
        if(timing(game,this.actor)&&game.combat.combatant?.actor?.uuid!==this.actor.uuid)throw Error('Reactive Ninjutsu ist nur im eigenen Zug verfügbar.');
        if(!timing(game,this.actor)&&!await foundry.applications.api.DialogV2.confirm({window:{title:'Reactive Ninjutsu'},content:'<p>Bestätige: Der Cast erfolgt als Reaktion in deinem eigenen Zug. Aktionsökonomie bleibt manuell.</p>',rejectClose:false}))throw Error('Reactive abgebrochen; nichts verbraucht.');
        // Native preUse inspected the original action timing. Repeat only its
        // missed reaction-specific Shocked check, never the whole preUse hook.
        const shocked=this.actor.getConditionRank?.('shocked');
        if(shocked){
          const {hasConditionResistance}=game.n5eb.conditions;
          const dc=Math.min(12,8+Math.max(0,shocked-1)),roll=new CONFIG.Dice.D20Roll('1d20',{}, {target:dc,advantage:hasConditionResistance(this.actor,'shocked')});
          roll.evaluateSync();await roll.toMessage({flavor:game.i18n.format('N5EB.CONDITION.Roll.Shocked',{dc}),speaker:ChatMessage.getSpeaker({actor:this.actor})});
          if(roll.total<dc){config.n5eb??={};config.n5eb.shockedCostMultiplier=2;}
        }
      }
      const targets=await confirmMoldingTargets(game,plan,configuration);if(!targets)throw Error('Molding-Zielauswahl abgebrochen; nichts verbraucht.');
      const patch={};
      if(plan.selected.some(m=>m.id==='imbuement-master')){
        configuration['imbuement-master']={...configuration['imbuement-master'],...imbuementConfiguration(item,this.id,configuration['imbuement-master'],CONFIG.DND5E.conditionTypes)};
        patch[`system.activities.${this.id}.target`]={...foundry.utils.deepClone(activity.target),override:true,template:{...activity.target.template,type:''},affects:{...activity.target.affects,type:'creature',count:'1'}};
        config.create??={};config.create.measuredTemplate=false;
      }
      for(const rule of plan.selected.filter(m=>['distant','extended','widened','quickened','reactive','transmogrified'].includes(m.id))){
        const changes=moldingTransform(activity,rule.id,configuration[rule.id]);
        for(const field of new Set(Object.keys(changes).map(path=>path.split('.')[0]).filter(field=>field!=='save'))){
          patch[`system.activities.${this.id}.${field}`]={...foundry.utils.deepClone(activity[field]),override:true};
        }
        for(const [path,value] of Object.entries(changes))patch[`system.activities.${this.id}.${path}`]=value;
      }
      if(plan.selected.some(m=>m.id==='doubled'))patch[`system.activities.${this.id}.target`]={...foundry.utils.deepClone(activity.target),override:true,affects:{...activity.target.affects,count:'2'}};
      if(targets['scribe-master']){
        patch[`system.activities.${this.id}.target`]={...foundry.utils.deepClone(activity.target),override:true,template:{...activity.target.template,type:''},affects:{...activity.target.affects,type:'creature',count:String(targets['scribe-master'].length)}};
        config.create??={};config.create.measuredTemplate=false;
      }
      if(plan.selected.some(m=>m.id==='subtle'))patch['system.jutsu.components']=[...item.system.jutsu.components].filter(c=>c!=='hs');
      let releases;
      if(plan.selected.some(m=>m.id==='chakra-infusion')){
        releases=professorReleases(this.actor);if(!releases.some(k=>item.system.jutsu.keywords.has(k)))throw Error('Chakra Infusion benötigt ein Nature-Release-Jutsu mit tatsächlichem Zugang des Charakters; Releases vom GM bestätigen lassen.');
        releases=[...new Set([...releases,...[...item.system.jutsu.keywords].filter(k=>['earth','wind','fire','water','lightning'].includes(k))])];
        patch['system.jutsu.keywords']=[...new Set([...item.system.jutsu.keywords,...releases])];
      }
      if(plan.selected.some(m=>m.id==='charged-blade')){
        const selected=configuration['charged-blade'],weapon=this.actor.items.get(selected.weaponId);
        const types=[...(weapon?.system.damage?.base?.types??[])];
        if(selected.damageType!=='force'&&(!weapon||weapon.type!=='weapon'||!types.includes(selected.damageType)))throw Error('Charged Blade: tatsächliche Waffe und deren Schadensart auswählen.');
        patch['system.jutsu.keywords']=[...new Set([...item.system.jutsu.keywords,'ninjutsu'])];
      }
      const rank=config.jutsu?.rank??item.system.effectiveRank,upcast=plan.selected.some(m=>m.upcast);
      if(upcast){
        config.scaling=item.system.getRankDelta('s');patch['flags.n5eb.scaling']=config.scaling;
        foundry.utils.setProperty(message,'data.system.scaling',config.scaling);
        foundry.utils.setProperty(message,'data.system.jutsuRank','s');
        foundry.utils.setProperty(message,'data.system.spellLevel',CONFIG.DND5E.jutsuSpellLevelByRank.s);
      }
      const record={castId:foundry.utils.randomID(),activityId:this.id,itemId:item.id,rank,effectRank:upcast?'s':rank,nativeCost:nativeChakraCost(this.item.system,{rank}),createdAt:game.time.worldTime,expiresAt:subclassCastExpiry(activity.duration,game.time.worldTime),options:configuration,infusionReleases:releases,ids:plan.selected.map(m=>m.id),targets,timing:timing(game,this.actor),uses:plan.uses,additionalCost:plan.additionalCost};
      if(record.ids.includes('generational'))record.generationalDeadline=nextActorTurnDeadline(game.combat,this.actor.uuid,'end');
      if(followup?.kind==='solar-interflow'){
        record.solarFinisher={isNin:followup.isNin,damageIndex:followup.damageIndex,die:followup.die,target:followup.target};
        if(followup.isNin)patch['system.jutsu.keywords']=[...new Set([...(patch['system.jutsu.keywords']??item.system.jutsu.keywords),'finisher'])];
      }
      patch[`flags.${MODULE_ID}.moldingCast`]=record;
      item.updateSource(patch);item.prepareFinalAttributes?.();applyAugmentedSave(item);
      // Changing displayed casting time must not add any action-economy automation.
      if(plan.selected.some(m=>['quickened','reactive'].includes(m.id))){if(config.consume===true)config.consume={resources:true,chakra:true,action:false};else config.consume={...config.consume,action:false};}
      return result;
    };
    prototype._prepareUsageUpdates=async function(config,options){
      if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!this.isSpell)return prepare.call(this,config,options);
      let plan;
      try{
        const original=this.actor.items.get(this.item.id)?.system.activities.get(this.id)??this;
        plan=castingMoldingPlan(game,original,normalizeMoldingConfig(config.n5ese?.moldings),config.jutsu?.rank??this.item.system.effectiveRank,config);
        if(plan.selected.length&&(config.cause||!(config.consume===true||config.consume?.chakra===true)))throw Error('Molding-Verbrauch ist für diesen Ablauf nicht verfügbar.');
        if(plan.selected.length&&config.n5eb?.shockedCostMultiplier){
          const api=game.modules.get(MODULE_ID).api,preview=api.previewJutsuCost(this.item,{rank:config.jutsu?.rank,pools:config.n5ese?.pools,chakraRecovery:config.n5ese?.chakraRecovery,martialTechnique:config.n5ese?.martialTechnique,ignoreVoidSurcharge:!game.settings.get(MODULE_ID,'ninjutsuTrackers')});
          const total=(preview.finalCost-postCostSurcharge(preview))*config.n5eb.shockedCostMultiplier+postCostSurcharge(preview)+plan.additionalCost;
          if(this.actor.getChakraAvailable()<total)throw Error('Nicht genügend Chakra einschließlich Shocked und separatem Molding-Zusatz.');
        }
      }catch(error){ui.notifications.warn(error.message);return false;}
      const result=await prepare.call(this,config,options);if(!result||Array.isArray(result)||!plan.selected.length)return result;
      try{
        if(plan.selected.some(m=>m.id==='painter')){if(!await checkPainterRound(game,this.actor))return false;result.actor[`flags.${MODULE_ID}.painterRound`]=painterRound(game,this.actor);}
        spendMoldings(result,plan);
        const api=game.modules.get(MODULE_ID).api,rank=config.jutsu?.rank??this.item.system.effectiveRank;
        const cost=api.previewJutsuCost(this.item,{rank,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,ignoreMoldingCost:true,pools:config.n5ese?.pools,martialTechnique:config.n5ese?.martialTechnique}).finalCost*(config.n5eb?.shockedCostMultiplier??1);
        const mode=mergeCastingMode(this,{upkeepChakraCost:cost});
        config.chakra??={};config.chakra.maintain=modeUpkeep(nativeMaintainCost(this.item.system,{rank,cost}),api.previewMaintainCost(this.item,{rank,cost}).finalCost,mode);
        const record=this.item.getFlag(MODULE_ID,'moldingCast');
        if(record){
          const paid=api.previewJutsuCost(this.item,{rank,ignoreMoldingCost:true,ignoreVoidSurcharge:true,ignorePostCostSurcharge:true,pools:config.n5ese?.pools,chakraRecovery:config.n5ese?.chakraRecovery,martialTechnique:config.n5ese?.martialTechnique}).finalCost*(config.n5eb?.shockedCostMultiplier??1);
          const patch={[`flags.${MODULE_ID}.moldingCast`]:{...record,paidJutsuCost:paid}};
          this.item.updateSource(patch);this.item.prepareFinalAttributes?.();
        }
        if(config.n5eb?.shockedCostMultiplier&&plan.additionalCost){pendingCosts.set(config,plan.additionalCost);config.chakra.cost-=plan.additionalCost;}
        return result;
      }catch(error){ui.notifications.warn(error.message);return false;}
    };
    prototype._finalizeMessageConfig=function(config,message,updates){
      const result=finish.call(this,config,message,updates),record=this.item.getFlag(MODULE_ID,'moldingCast');
      if(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&record){
        message.data.flags??={};message.data.flags[MODULE_ID]??={};
        message.data.flags[MODULE_ID].moldingCast=record;
        message.data.flags[MODULE_ID].moldingPrimary=true;
        message.data.flags[MODULE_ID].castingSnapshot=this.item.toObject();
        if(record.echo)message.data.system.chakraCost=0;
        const targets=record.solarFinisher?[record.solarFinisher.target]:record.echo?record.targets.echoing:(record.targets['scribe-master']??record.targets.doubled);
        if(targets)message.data.flags.n5eb.targets=targets.map(t=>{const actor=fromUuidSync(t.uuid);return {uuid:t.uuid,name:t.name,img:actor?.img,ac:actor?.system.attributes.ac.value??null};});
      }
      return result;
    };
  }
}
