import {castMartialSpecial,rollMartialDefense} from '../foundry/taijutsu-special-casts.mjs';
import {castVersatility} from '../foundry/taijutsu-versatility.mjs';
import {ruinTechniqueWorkflow,requestRuinTechnique} from '../foundry/taijutsu-ruin-technique.mjs';
import {martialTargetWorkflow,requestMartialTarget} from '../foundry/taijutsu-action-targets.mjs';
import {availableFeatureActions,performFeatureAction,endFeatureAction,featureActions} from '../foundry/taijutsu-feature-actions.mjs';
import {knownStances,activeStances,selectPrimaryStance} from '../foundry/taijutsu-stancer.mjs';
import {beginDisturbance,disturbanceAttack,endDisturbance,disturbanceEntries} from '../foundry/taijutsu-disturbance.mjs';
import {beginBarrage,disturbanceWorkflow,requestDisturbanceTargets,resumeBarrageTargets} from '../foundry/taijutsu-disturbance-targets.mjs';
import {matrixFreedom} from '../foundry/taijutsu-matrix-freedom.mjs';
import {activateMatrixBuff,endMatrixBuff} from '../foundry/taijutsu-matrix-buffs.mjs';
import {declareEnhancedBlows,enhancedBlowsAttack,endEnhancedBlows} from '../foundry/taijutsu-enhanced-blows.mjs';
import {flamingSaveWorkflow,requestFlamingSave} from '../foundry/taijutsu-flaming-save.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {TAIJUTSU_FEATURES} from '../casting/taijutsu-sources.mjs';
import {taijutsuEnabled,taijutsuFeature,taijutsuLevel,martialDie,unarmedDie,martialPoolMaximum} from '../casting/taijutsu-context.mjs';
import {configureUnarmedContext,attackUnarmedTechnique} from '../foundry/taijutsu-unarmed.mjs';
import {configureGuardSlots} from '../foundry/taijutsu-guards.mjs';
import {activateChakraFrenzy,endChakraFrenzy} from '../foundry/taijutsu-frenzy.mjs';
import {taijutsuHitWorkflow,requestTaijutsuHit} from '../foundry/taijutsu-hits.mjs';
import {devastatingWorkflow,requestDevastating} from '../foundry/taijutsu-devastating.mjs';
import {focusWorkflow,requestFocus} from '../foundry/taijutsu-focus.mjs';
import {redirectWorkflow,beginRedirect,rollRedirectCounter,confirmRedirectHit} from '../foundry/taijutsu-redirect.mjs';
import {rechargeTaijutsuFeature} from '../foundry/taijutsu-recharge.mjs';
import {useTaijutsuUtility,utilityUnarmedAttack} from '../foundry/taijutsu-utility.mjs';
const owner=actor=>{if(!actor?.isOwner)throw Error('Eigentümerrechte am Taijutsu Specialist erforderlich.');};
/** Unreleased source API. Public calls delegate to the same ownership/resource checks as the UI. */
export function createTaijutsuAPI(game){const workflows={ruin:ruinTechniqueWorkflow,martialTarget:martialTargetWorkflow,disturbance:disturbanceWorkflow,hit:taijutsuHitWorkflow,devastating:devastatingWorkflow,focus:focusWorkflow,redirect:redirectWorkflow,flamingSave:flamingSaveWorkflow};return Object.freeze({version:1,status:'source-complete-unverified',
 castPreparedFeature:(actor,id)=>castMartialSpecial(game,actor,id),rollInversionDefense:(actor,id)=>rollMartialDefense(game,actor,id),castVersatility:(actor,id)=>castVersatility(game,actor,id),
 getLearningContext:actor=>{owner(actor);const dragon=!!taijutsuFeature(actor,'Dragon Soul','Ultimate Battle'),nature=taijutsuFeature(actor,'Nature Enhanced Combat','Nin-Tai')&&actor.getFlag(MODULE_ID,'taijutsuNature'),ability=actor.system.attributes.jutsu.taijutsu.ability;return Object.freeze({dragonSoul:dragon,taijutsuTimeMultiplier:dragon?0.5:1,timeStacking:'strongest',chakraControlAlternative:dragon?'mar':null,ninTaiNature:nature||null,ninTaiAbility:ability,ninTaiAbilityModifier:actor.system.abilities[ability]?.mod??0,ninTaiScoreRequirementOnly:!!nature,automaticLearningGrant:false});},
 requestRuinTechnique:message=>requestRuinTechnique(game,message),requestFeatureTarget:(actor,id)=>requestMartialTarget(game,actor,id),getFeatureActions:actor=>{owner(actor);return {available:availableFeatureActions(actor),entries:featureActions(actor)};},performFeatureAction:(actor,id)=>performFeatureAction(game,actor,id),endFeatureAction:(actor,id)=>endFeatureAction(game,actor,id),getStances:actor=>{owner(actor);return {known:knownStances(actor).map(s=>({id:s.item.id,name:s.item.name})),active:activeStances(game,actor).map(s=>s.item.id)};},selectPrimaryStance:actor=>selectPrimaryStance(game,actor),
 getProgression:actor=>{const level=taijutsuLevel(actor),pool=taijutsuFeature(actor,'Martial Adept');return Object.freeze({enabled:taijutsuEnabled(game),level,martialDie:martialDie(level),unarmedDie:level?unarmedDie(level):0,expectedPoolMaximum:martialPoolMaximum(actor),pool:pool?Object.freeze({value:pool.system.uses.value,max:pool.system.uses.max}):null});},
 getDisturbanceActions:actor=>{owner(actor);return disturbanceEntries(actor);},beginDisturbance:(actor,kind)=>beginDisturbance(game,actor,kind),rollDisturbanceAttack:(actor,id)=>disturbanceAttack(game,actor,id),endDisturbance:(actor,id)=>endDisturbance(game,actor,id),requestDisturbanceTargets:(actor,id)=>requestDisturbanceTargets(game,actor,id),beginBarrage:actor=>beginBarrage(game,actor),resumeBarrageTargets:(actor,id)=>resumeBarrageTargets(game,actor,id),
 getMatrixFreedom:actor=>{owner(actor);return Object.freeze({...matrixFreedom(game,actor)});},activateMatrixBuff:(actor,kind,{renew=false}={})=>activateMatrixBuff(game,actor,kind,renew),endMatrixBuff:(actor,kind)=>endMatrixBuff(game,actor,kind),
 declareEnhancedBlows:actor=>declareEnhancedBlows(game,actor),rollEnhancedBlowsAttack:(actor,id)=>enhancedBlowsAttack(game,actor,id),endEnhancedBlows:(actor,id)=>endEnhancedBlows(game,actor,id),
 getFeatures:actor=>TAIJUTSU_FEATURES.filter(f=>taijutsuFeature(actor,f.name,f.category)).map(({name,category,level,source})=>Object.freeze({name,category,level,source})),
 configureUnarmed:actor=>configureUnarmedContext(game,actor),attackUnarmed:actor=>attackUnarmedTechnique(game,actor),configureGuards:actor=>configureGuardSlots(game,actor),
 activateFrenzy:actor=>activateChakraFrenzy(game,actor),endFrenzy:actor=>endChakraFrenzy(game,actor),
 requestHit:message=>requestTaijutsuHit(game,message),requestDevastating:message=>requestDevastating(game,message),requestFocus:message=>requestFocus(game,message),requestFlamingSave:message=>requestFlamingSave(game,message),
 beginRedirect:actor=>beginRedirect(game,actor),rollRedirect:(actor,id)=>rollRedirectCounter(game,actor,id),confirmRedirectHit:(actor,id)=>confirmRedirectHit(game,actor,id),
 recharge:(actor,name,{rest=false}={})=>rechargeTaijutsuFeature(game,actor,name,rest),useUtility:(actor,name)=>useTaijutsuUtility(game,actor,name),rollUtilityAttack:(actor,id)=>utilityUnarmedAttack(game,actor,id),
 getRequests:actor=>{owner(actor);return Object.entries(workflows).flatMap(([kind,make])=>make(game).list(actor).map(r=>Object.freeze({kind,id:r.id,status:r.status,createdAt:r.createdAt,targets:r.targets.map(t=>Object.freeze({actorUuid:t.uuid,name:t.name}))})));},
 applyRequest:(actor,kind,id)=>{const make=workflows[kind];if(!make)throw Error('Unbekannter Taijutsu-Anfragetyp.');return make(game).apply(actor,id);},
 isSavageForcePending:actor=>{owner(actor);return !!actor.getFlag(MODULE_ID,'taijutsuSavageDebt')?.active;}
 });}
