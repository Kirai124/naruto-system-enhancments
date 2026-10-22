const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function confirmMoldingTargets(game,plan,options){
  const targets=[...new Map([...game.user.targets].filter(t=>t.actor).map(t=>[t.actor.uuid,{uuid:t.actor.uuid,tokenUuid:t.document.uuid,name:t.name}])).values()];
  const assignments={};
  for(const rule of plan.selected.filter(m=>['careful','heightened','doubled','echoing'].includes(m.id))){
    const count=rule.id==='careful'?3*(options.careful.count??1):rule.id==='doubled'?2:1;
    if(!targets.length)throw Error(`${rule.name}: betroffene Kreaturen zunächst als Ziele auswählen.`);
    const chosen=await foundry.applications.api.DialogV2.wait({window:{title:rule.name},content:`<p>${rule.id==='careful'?`Bis zu ${count} geschützte Kreaturen auswählen.`:`Genau ${count} betroffene Kreatur(en) auswählen.`} Reichweite und sämtliche textlichen Zielbeschränkungen bestätigen.</p>${targets.map((t,i)=>`<label style="display:block"><input type="checkbox" name="moldingTarget" value="${i}"> ${escape(t.name)}</label>`).join('')}`,buttons:[{action:'confirm',label:'Ziele bestätigen',callback:(_event,button)=>[...button.form.querySelectorAll('input[name="moldingTarget"]:checked')].map(e=>targets[Number(e.value)])}],rejectClose:false});
    if(!chosen)return null;
    if(!chosen.length||chosen.length>count||(rule.id!=='careful'&&chosen.length!==count))throw Error(`${rule.name}: Zielanzahl passt nicht zur Auswahl.`);
    assignments[rule.id]=chosen;
  }
  for(const rule of plan.selected.filter(m=>['combination','synchronization'].includes(m.id))){
    if(!targets.length)throw Error(`${rule.name}: tatsächliche Helfer zunächst als Ziele auswählen.`);
    const sync=rule.id==='synchronization',chosen=await foundry.applications.api.DialogV2.wait({window:{title:rule.name},content:`<p>${sync?'Verbündete innerhalb von 60 Fuß von dir und deinem Summon bestätigen.':'Dich/deinen tatsächlichen Summon als Helfer bestätigen.'} Keyword-Beschränkungen entfallen für diese Zusammenarbeit. Die übrigen Combination-Grundregeln bleiben manuell.</p>${targets.map((t,i)=>`<label style="display:block"><input type="checkbox" name="helper" value="${i}"> ${escape(t.name)}</label>`).join('')}`,buttons:[{action:'confirm',label:'Helfer und Reichweite bestätigen',callback:(_event,button)=>[...button.form.querySelectorAll('[name="helper"]:checked')].map(e=>targets[Number(e.value)])}],rejectClose:false});
    if(!chosen)return null;if(!chosen.length)throw Error('Mindestens einen tatsächlichen Helfer bestätigen.');assignments[rule.id]=chosen;
  }
  if(plan.selected.some(m=>m.id==='scribe-master')){
    if(!targets.length)throw Error('Scribe Master: ursprüngliches und weitere tatsächlich feindliche Ziele zunächst auswählen.');
    const chosen=await foundry.applications.api.DialogV2.wait({window:{title:'Scribe Master: feindliche Kreaturen'},content:`<p>Bestätige: Dieses Jutsu richtet sich ursprünglich gegen eine feindliche Kreatur. Alle zusätzlich bestätigten Kreaturen sind dem Wirker feindlich und liegen innerhalb von 30 Fuß dieser ursprünglichen Kreatur.</p><label>Ursprüngliches Ziel <select name="original">${targets.map((t,i)=>`<option value="${i}">${escape(t.name)}</option>`).join('')}</select></label>${targets.map((t,i)=>`<label style="display:block"><input type="checkbox" name="scribeTarget" value="${i}"> ${escape(t.name)}</label>`).join('')}`,buttons:[{action:'confirm',label:'Feindlichkeit, Ursprung und 30 Fuß bestätigen',callback:(_e,b)=>({original:targets[Number(b.form.elements.original.value)],targets:[...b.form.querySelectorAll('[name="scribeTarget"]:checked')].map(e=>targets[Number(e.value)])})}],rejectClose:false});
    if(!chosen)return null;
    if(!chosen.targets.some(t=>t.uuid===chosen.original.uuid))throw Error('Das ursprüngliche Ziel muss eingeschlossen sein.');
    assignments['scribe-master']=chosen.targets;
  }
  return assignments;
}
