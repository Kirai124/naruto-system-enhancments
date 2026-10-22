import {rollMedicalSharedSave} from '../foundry/medical-shared-saves.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {MEDICAL_FEATURES} from '../casting/medical-sources.mjs';
import {medicalFeature,medicalLevel} from '../casting/medical-context.mjs';
import {scalpelCharges,scalpelDice,channeledHealing,preserveLifeUses} from '../casting/medical-rules.mjs';
import {requestMedicalHealing,medicalHealingWorkflow} from '../foundry/medical-healing.mjs';
import {requestMedicalClinical,medicalClinicalWorkflow} from '../foundry/medical-clinical.mjs';
import {requestMedicalScalpelHit,medicalHitWorkflow} from '../foundry/medical-hits.mjs';
import {activateMedicalScalpel,endMedicalScalpel,attackMedicalScalpel} from '../foundry/medical-scalpel.mjs';
import {activeMedicalCompanions,linkMedicalCompanion,dismissMedicalCompanion,castThroughMedicalCompanion,medicalCompanionWorkflow} from '../foundry/medical-companions.mjs';
import {medicalStructureWorkflow} from '../foundry/medical-structure-damage.mjs';
import {medicalRedirectionWorkflow,requestMedicalRedirection} from '../foundry/medical-unbreakable.mjs';
import {medicalConstructTarget} from '../foundry/medical-constructive.mjs';
import {configureMedicalSelection,configureMedicalReleases} from '../foundry/medical-selections.mjs';
import {useMedicalProtector} from '../foundry/medical-protector.mjs';
export function createMedicalAPI(game){
 const workflows={healing:medicalHealingWorkflow,clinical:medicalClinicalWorkflow,hit:medicalHitWorkflow,companion:medicalCompanionWorkflow,structure:medicalStructureWorkflow,redirection:medicalRedirectionWorkflow};
 const owner=actor=>{if(!actor?.isOwner)throw Error('Eigentümerberechtigung am Medical-Nin erforderlich.');};
 return Object.freeze({version:1,
  getFeatures:actor=>MEDICAL_FEATURES.filter(r=>medicalFeature(actor,r.name,r.category)).map(({name,source,category,level})=>Object.freeze({name,source,category,level})),
  getProgression:actor=>{const level=medicalLevel(actor);return Object.freeze({level,scalpelCharges:scalpelCharges(level),scalpelDice:scalpelDice(level),channeledHealing:channeledHealing(level),preserveLifeUses:preserveLifeUses(level)});},
  configureJutsuSelection:(actor,key)=>configureMedicalSelection(game,actor,key),configureReleases:actor=>configureMedicalReleases(game,actor),
  requestHealing:(actor,kind,options={})=>requestMedicalHealing(game,actor,kind,options),requestClinical:(actor,id,options={})=>requestMedicalClinical(game,actor,id,options),requestHit:message=>requestMedicalScalpelHit(game,message),
  activateScalpel:(actor,options={})=>activateMedicalScalpel(game,actor,options),endScalpel:actor=>endMedicalScalpel(game,actor),attackScalpel:actor=>attackMedicalScalpel(game,actor),
  getCompanions:actor=>{owner(actor);return activeMedicalCompanions(actor).map(e=>Object.freeze({id:e.id,kind:e.kind,name:e.name,actorUuid:e.target.uuid,expiresAt:e.expiresAt}));},
  linkCompanion:(actor,kind)=>linkMedicalCompanion(game,actor,kind),dismissCompanion:(actor,id)=>dismissMedicalCompanion(game,actor,id),castThroughCompanion:(actor,id)=>castThroughMedicalCompanion(game,actor,id),
  rollSharedSave:(actor,companionId)=>rollMedicalSharedSave(game,actor,companionId),useProtector:actor=>useMedicalProtector(game,actor),requestRedirection:actor=>requestMedicalRedirection(game,actor),isConstructForMedicalFeatures:target=>medicalConstructTarget(game,target),
  getRequests:actor=>{owner(actor);return Object.entries(workflows).flatMap(([kind,create])=>create(game).list(actor).map(r=>Object.freeze({kind,id:r.id,status:r.status,targets:r.targets.map(t=>Object.freeze({actorUuid:t.uuid,name:t.name})),createdAt:r.createdAt})));},
  applyRequest:(actor,kind,id)=>{owner(actor);if(!workflows[kind])throw Error('Unbekannte Medical-Anfrageart.');return workflows[kind](game).apply(actor,id);}
 });
}
