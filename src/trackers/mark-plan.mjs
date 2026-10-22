/** Verified base feature effects; higher-level molding is intentionally separate. */
export function markPlan(kind, available, {count=available, damageType, mode}={}) {
  if(!Number.isSafeInteger(available)||available<1||available>5||!Number.isSafeInteger(count)||count<1||count>available)throw Error('Ungültige Mark-Anzahl.');
  if(kind==='breeze-marks') {
    if(count!==available)throw Error('Breeze Marks werden vollständig ausgelöst.');
    return {kind,count,condition:{id:'bleeding',delta:count},label:`Bleeding +${count}`};
  }
  if(kind==='ember-marks'&&mode==='dr'){if(count!==1)throw Error('Ember-DR verbraucht genau eine Marke.');return {kind,count,mode:'dr',label:'Damage Reduction −4 bis Zugende'};}
  if(kind==='ember-marks')return {kind,count,formula:`${count}d12`,damageType:'fire',label:`${count}d12 Fire`};
  if(kind==='blade-marks') {
    if(count!==available)throw Error('Blade Marks werden vollständig ausgelöst.');
    if(typeof damageType!=='string'||!damageType)throw Error('Schadensart der verwendeten Waffe fehlt.');
    return {kind,count,formula:`${count}d6`,damageType,condition:{id:'prone',rank:1},label:`${count}d6 ${damageType} + Prone`};
  }
  throw Error('Diese Mechanik unterstützt noch keine Mark-Auslösung.');
}
