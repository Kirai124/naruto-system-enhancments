/** Duration on the casting snapshot; instantaneous chat rolls remain usable until explicitly ended. */
export function subclassCastActive(record,worldTime){
 return !!record&&!record.refunded&&!record.ended&&(!Number.isFinite(record.expiresAt)||worldTime<record.expiresAt);
}
export function subclassCastExpiry(duration,worldTime){
 const seconds={second:1,round:6,minute:60,hour:3600,day:86400}[duration?.units];
 return seconds&&Number(duration.value)>0?worldTime+seconds*Number(duration.value):undefined;
}
