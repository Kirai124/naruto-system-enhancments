/** Snapshot the next actual actor turn, including multiple turns; never invent six-second out-of-combat turns. */
export function nextActorTurnDeadline(combat,actorUuid,edge='start',count=1){
 if(!combat?.started||!Number.isInteger(combat.round)||!Number.isInteger(combat.turn))return null;
 const turns=combat.turns??[];
 if(!turns.length||!['start','end'].includes(edge)||!Number.isInteger(count)||count<1)return null;
 const maxDistance=turns.length*count;
 for(let distance=1;distance<=maxDistance;distance++){
  const index=(combat.turn+distance)%turns.length;
  if(turns[index].actor?.uuid!==actorUuid)continue;
  if(--count>0)continue;
  const offset=edge==='end'?1:0,total=combat.turn+distance+offset;
  return {combatId:combat.id,actorUuid,edge,round:combat.round+Math.floor(total/turns.length),turn:total%turns.length,order:turns.map(t=>t.id)};
 }
 return null;
}
export function moldingLifetimeExpired(lifetime,{combat,worldTime}){
 if(!lifetime)return false;
 if(Number.isFinite(lifetime.expiresAt))return worldTime>=lifetime.expiresAt;
 const due=lifetime.deadline;if(!due||!combat?.started||combat.id!==due.combatId)return false;
 // Initiative edits invalidate the old positional deadline rather than removing somebody else's bonus early.
 if(JSON.stringify((combat.turns??[]).map(t=>t.id))!==JSON.stringify(due.order))return false;
 return combat.round>due.round||(combat.round===due.round&&combat.turn>=due.turn);
}
export function currentTurnEndDeadline(combat){
 const turns=combat?.turns??[];if(!combat?.started||!turns.length||!Number.isInteger(combat.turn)||!Number.isInteger(combat.round))return null;
 const next=combat.turn+1;return {combatId:combat.id,actorUuid:turns[combat.turn]?.actor?.uuid,edge:'end',round:combat.round+Math.floor(next/turns.length),turn:next%turns.length,order:turns.map(t=>t.id)};
}
