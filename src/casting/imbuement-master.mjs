export function imbuementConfiguration(item,activityId,options,conditionTypes){
 const groups=[];
 for(let i=0;i<3;i++){
  const count=Number(options[`attackCount${i}`]??(i===0?1:0));if(!Number.isInteger(count)||count<0||count>20)throw Error('Imbuement Master: tatsächliche Angriffszahl bestätigen.');
  if(!count)continue;
  const id=options[`attackActivity${i}`]??activityId,activity=item.system.activities.get(id);
  if(activity?.type!=='attack')throw Error('Imbuement Master: tatsächliche Angriffsaktivität fehlt.');
  groups.push({activityId:id,count,slot:i});
 }
 if(!groups.length)throw Error('Imbuement Master benötigt mindestens einen ersetzten Angriff.');
 const criticalSlot=Number(options.criticalSlot??0);if(!groups.some(g=>g.slot===criticalSlot))throw Error('Die für einen kritischen Treffer gewählte Angriffsgruppe ist leer.');
 const count=Number(options.conditionCount??0),conditions=[];
 if(!Number.isInteger(count)||count<0||count>6)throw Error('Ungültige Condition-Auswahl.');
 for(let i=0;i<count;i++){
  const id=options[`conditionId${i}`],delta=Number(options[`conditionDelta${i}`]??1);
  if(!conditionTypes[id]||conditionTypes[id].alias||!Number.isInteger(delta)||delta<1||delta>20)throw Error('Imbuement Master: tatsächliche Conditions und Gesamtränge bestätigen.');
  conditions.push({kind:'condition',id,delta});
 }
 return {groups,criticalSlot,conditions};
}
