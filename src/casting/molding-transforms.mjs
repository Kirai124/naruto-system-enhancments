import {moldingSaveAbilities} from './efficient-molding.mjs';

const positive=value=>{const n=Number(value);if(!Number.isFinite(n)||n<=0)throw Error('Molding: unklare oder ungültige Größenangabe.');return n;};
const seconds=Object.freeze({second:1,round:6,minute:60,hour:3600,day:86400});
/** Return clone-only updates; never change the original document or spend an action. */
export function moldingTransform(activity,id,{axis,ability}={}){
  switch(id){
    case 'distant':{
      const {range}=activity;
      if(range?.units==='touch')return {'range.units':'ft','range.value':'30'};
      if(!['ft','mi','m','km'].includes(range?.units)||range.special)throw Error('Distant: Reichweite nicht eindeutig numerisch.');
      return {'range.value':String(positive(range.value)*2)};
    }
    case 'extended':{
      const {duration}=activity,factor=seconds[duration?.units];
      if(!factor||duration.special)throw Error('Extended: Dauer nicht eindeutig numerisch.');
      const normal=positive(duration.value)*factor;
      if(normal<60)throw Error('Extended benötigt mindestens eine Minute Dauer.');
      // Native DurationField converts minutes to effect seconds; "second" is
      // not handled by getEffectDuration and would silently lose expiration.
      return {'duration.units':'minute','duration.value':String(Math.min(normal*10,duration.concentration?600:86400)/60)};
    }
    case 'widened':{
      const template=activity.target?.template;
      // Feet are explicit in these rules. Unverified metric conventions stay manual.
      if(template?.units!=='ft')throw Error('Widened: diese Flächeneinheit benötigt eine bestätigte Umrechnung.');
      let dimension='size',increase=10;
      if(template.type==='line'){
        if(!['width','size'].includes(axis))throw Error('Widened: Breite oder Länge wählen.');
        dimension=axis;
      }else if(template.type==='cylinder'){
        if(!['size','height'].includes(axis))throw Error('Widened: Radius oder Höhe wählen.');
        dimension=axis;increase=15;
      }else if(!['cube','sphere','cone'].includes(template.type))throw Error('Widened: Flächenform nicht unterstützt.');
      return {[`target.template.${dimension}`]:String(positive(template[dimension])+increase)};
    }
    case 'transmogrified':{
      const abilities=[...(activity.save?.ability??[])];
      if(abilities.length!==1||!moldingSaveAbilities(abilities[0]).includes(ability))throw Error('Transmogrified: diese Rettungswurf-Änderung ist nicht freigegeben.');
      return {'save.ability':[ability]};
    }
    case 'quickened':
    case 'reactive':{
      if(activity.activation?.type!=='action'||(activity.activation.value??1)!==1)throw Error('Molding benötigt eine Wirkzeit von einer Aktion.');
      return {'activation.type':id==='quickened'?'bonus':'reaction','activation.value':1};
    }
    default:throw Error('Dieses Molding besitzt keine einfache Activity-Transformation.');
  }
}
