const EYES = new Set(['unassigned','left','right','both']);
export const eyeAssignments = Object.freeze([...EYES]);
const plain = value => value && Object.getPrototypeOf(value) === Object.prototype;
const key = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);

/** Declarative definitions only; owning an exact source item is mandatory. */
export class DojutsuRegistry {
  #definitions = new Map();
  register(input) {
    const allowed=['id','label','source','minimumLevel','activationCost','durationSeconds','freeReactivation','sight'];
    if(!plain(input)||Object.keys(input).some(k=>!allowed.includes(k)))throw TypeError('Invalid Dojutsu definition');
    const {id,label,source,minimumLevel=1,activationCost=0,durationSeconds,freeReactivation=false,sight={outOfCombat:0,inCombat:0}}=input;
    if(!key(id)||typeof label!=='string'||!label.trim()||typeof source!=='string'||!source.startsWith('Compendium.'))throw TypeError('Invalid Dojutsu identity');
    if(this.#definitions.has(id)||this.list().some(d=>d.source===source))throw Error('Duplicate Dojutsu definition');
    if(!Number.isSafeInteger(minimumLevel)||minimumLevel<1||!Number.isSafeInteger(activationCost)||activationCost<0
      ||!Number.isSafeInteger(durationSeconds)||durationSeconds<1||typeof freeReactivation!=='boolean')throw TypeError('Invalid Dojutsu rule');
    if(!plain(sight)||Object.keys(sight).some(k=>!['outOfCombat','inCombat'].includes(k))
      ||[sight.outOfCombat,sight.inCombat].some(v=>!Number.isSafeInteger(v)||v<0))throw TypeError('Invalid Chakra sight');
    const definition=Object.freeze({id,label,source,minimumLevel,activationCost,durationSeconds,freeReactivation,sight:Object.freeze({...sight})});
    this.#definitions.set(id,definition);return definition;
  }
  unregister(id){return this.#definitions.delete(id);}
  list(){return Object.freeze([...this.#definitions.values()]);}
  forItem(item){return item?.type==='feat'?this.list().find(d=>d.source===(item._stats?.compendiumSource??item.flags?.core?.sourceId)):undefined;}
}

export function registerBuiltinDojutsu(registry) {
  const source=id=>`Compendium.n5eb.clan.Item.${id}`;
  for(const definition of [
    {id:'n5ese.sharingan',label:'Sharingan',source:source('ac90epAKkDOLQy9v'),minimumLevel:3,activationCost:0,durationSeconds:600,sight:{outOfCombat:30,inCombat:30}},
    {id:'n5ese.byakugan',label:'Byakugan',source:source('iEvrB8siPuzNdz48'),activationCost:5,durationSeconds:3600,freeReactivation:true,sight:{outOfCombat:500,inCombat:250}},
    // User-confirmed: ten minutes and 30 ft sight from Latent Sharingan I.
    {id:'n5ese.latent-sharingan',label:'Latent Sharingan',source:source('j4LmUpUb5FeuH0qg'),minimumLevel:7,activationCost:10,durationSeconds:600,sight:{outOfCombat:30,inCombat:30}},
    {id:'n5ese.latent-byakugan',label:'Latent Byakugan',source:source('fog7EqfLDDdqHK9q'),minimumLevel:3,activationCost:10,durationSeconds:600,freeReactivation:true,sight:{outOfCombat:120,inCombat:60}}
  ])registry.register(definition);
}

export function activationPlan(definition,previous,now,eye='unassigned') {
  if(!Number.isSafeInteger(now)||!EYES.has(eye))throw TypeError('Invalid Dojutsu context');
  const validWindow=previous?.definitionId===definition.id && Number.isSafeInteger(previous.expiresAt) && previous.expiresAt>now;
  if(validWindow && previous.active===true)return Object.freeze({alreadyActive:true,cost:0,state:previous});
  const reuse=validWindow && definition.freeReactivation && previous.paid===true;
  const state={schemaVersion:1,definitionId:definition.id,active:true,eye,paid:true,
    startedAt:reuse?previous.startedAt:now,expiresAt:reuse?previous.expiresAt:now+definition.durationSeconds};
  return Object.freeze({alreadyActive:false,cost:reuse?0:definition.activationCost,state:Object.freeze(state)});
}
export function liveState(state,definition,now,level) {
  return !!definition && state?.schemaVersion===1 && state.definitionId===definition?.id && state.active===true
    && Number.isSafeInteger(state.expiresAt) && state.expiresAt>now && level>=definition.minimumLevel;
}
