import {isMoldingPrimary,readMoldingRecord} from './molding-record.mjs';
/** Maximize native original dice before feature additions; keep dice for critical processing. */
export function maximizeMoldingFormula(formula){
  if(typeof formula!=='string')throw Error('Potent: unbekannte Schadensformel.');
  if(/\b\d*d\d+[a-z]/i.test(formula))throw Error('Potent: komplexe Würfelmodifikatoren benötigen manuelle Prüfung.');
  const terms=[...formula.matchAll(/\b(\d*)d(\d+)\b/gi)];
  if(!terms.length)return formula;
  if(terms.some(term=>Number(term[2])<2)||/\bd\d+[a-z]/i.test(formula)||/\d+d\d+[a-z]/i.test(formula))throw Error('Potent: komplexe Würfelmodifikatoren benötigen manuelle Prüfung.');
  return formula.replace(/\b(\d*)d(\d+)\b/gi,(_match,count,faces)=>`${count||1}d${faces}min${faces}`);
}
export function piercingOptions(actor,damages,options={}){
  // Preserve vulnerabilities and damage reduction. Only ordinary resistance is ignored.
  const immune=actor.system.traits?.di?.value??new Set();
  const types=new Set(damages.map(d=>d.type).filter(type=>!immune.has(type)&&!immune.has('ALL')));
  const prior=options.ignore?.resistance;
  const ignore=options.ignore===true?true:{...options.ignore,resistance:prior===true?true:new Set([...(prior??[]),...types])};
  return {...options,ignore,downgrade:options.downgrade===true?true:new Set([...(options.downgrade??[]),...damages.map(d=>d.type)])};
}
export function moldingTurnActive(record,combat){
  if(record?.ended)return false;
  if(!record?.timing)return true; // Out of combat: explicit manual end, never invented elapsed time.
  return !!combat?.started&&record.timing.combatId===combat.id&&record.timing.round===combat.round&&record.timing.turn===combat.turn;
}
export function currentMoldingRecord(game,record){
  if(!record?.castId)return record;
  const current=game.messages?.find?.(m=>isMoldingPrimary(m)&&readMoldingRecord(m)?.castId===record?.castId);
  const latest=current?readMoldingRecord(current):record;
  return latest?.refunded?null:latest;
}
