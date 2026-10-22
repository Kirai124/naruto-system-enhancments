/** No invented Counter DC: the caller explicitly supplies the applicable base. */
export async function promptTenacious(record){
  const result=await foundry.applications.api.DialogV2.wait({window:{title:'Tenacious Ninjutsu — Auslöser'},content:`
    <label>Auslöser <select name="kind"><option value="clash">Clash (+1d10)</option><option value="counter">Counter / Dispel / Interrupt (SG +3)</option></select></label>
    <label>Basis-SG für Counter / Dispel / Interrupt <input name="dc" type="number" min="0" step="1"></label>
    <p>Für Clash: wie im nativen Ablauf den gegnerischen Rang und die Würfe wählen.</p>
    <label>Gegnerischer Rang <select name="opposingRank">${['e','d','c','b','a','s'].map(r=>`<option value="${r}" ${r===record.rank?'selected':''}>${r.toUpperCase()}</option>`).join('')}</select></label>
    <label>Clash-Würfe <select name="rounds"><option value="auto">Automatisch nach nativer Rangregel</option><option value="1">1</option><option value="3">3</option></select></label>
    <label>Clash-Fertigkeit <select name="skill"><option value="nsh">Ninshou</option><option value="mar">Martial Arts</option><option value="ill">Illusions</option></select></label>
    <label>Attribut <select name="ability">${['int','wis','cha','str','dex','con'].map(a=>`<option value="${a}">${a.toUpperCase()}</option>`).join('')}</select></label>
    <label>Wurfmodus <select name="rollMode"><option value="">Normal</option><option value="advantage">Vorteil</option><option value="disadvantage">Nachteil</option></select></label>
    `,buttons:[{action:'select',label:'Auslöser bestätigen',callback:(_event,button)=>new FormDataExtended(button.form).object}],rejectClose:false});
  if(!result)return null;
  if(result.kind==='counter'){
    if(result.dc===''||result.dc===undefined||!Number.isInteger(Number(result.dc))||Number(result.dc)<0)throw Error('Einen gültigen Basis-SG eingeben.');
    return {kind:'counter',baseDC:Number(result.dc),dc:Number(result.dc)+3};
  }
  if(result.kind!=='clash'||!['e','d','c','b','a','s'].includes(result.opposingRank)||!['auto','1','3'].includes(result.rounds)||!['nsh','mar','ill'].includes(result.skill)||!['str','dex','con','int','wis','cha'].includes(result.ability)||!['','advantage','disadvantage'].includes(result.rollMode))throw Error('Ungültige Clash-Auswahl.');
  return {...result,rounds:result.rounds==='auto'?'auto':Number(result.rounds)};
}
