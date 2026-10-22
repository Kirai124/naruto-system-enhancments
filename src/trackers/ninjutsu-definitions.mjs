const source = (pack, id) => `Compendium.n5eb.${pack}.Item.${id}`;
export const ninjutsuTrackers = Object.freeze([
  {id:'blood-vials',label:'Blood Vials',source:source('subclass','aFZFPHSCAb8WgiKF'),targeted:false},
  {id:'rain-blades',label:'Rain Blades',source:source('subclass','J93qivZsfgmjOANW'),targeted:false},
  {id:'traditional-inertia',label:'Traditional Inertia',source:source('subclass','avUVKt697NWEUl8R'),targeted:false},
  {id:'solid-gems',label:'Solid Gems',source:source('subclass','tQ7i0o9eKWejvMpR'),targeted:false},
  {id:'ink-sketches',label:'Ink Sketches',source:source('t7-subclass','o2AdqhbWnCNvYDBe'),targeted:false},
  {id:'void-shards', label:'Void Shards', source:source('subclass','n6BSSlSie5m8osNz'), targeted:false},
  {id:'lightning-motes', label:'Lightning Motes', source:source('subclass','zavWoZI5pO9y10nC'), targeted:false},
  {id:'elemental-motes', label:'Elemental Motes', source:source('subclass','Odji8s2fVtc7WmOY'), targeted:false},
  {id:'breeze-marks', label:'Breeze Marks', source:source('subclass','XRQqZDduw90wOBMy'), targeted:true},
  {id:'ember-marks', label:'Ember Marks', source:source('subclass','q2jgw4auBTlE79bk'), targeted:true},
  {id:'blade-marks', label:'Blade Marks', source:source('t7-subclass','ftFrng5S6dTSZC9r'), targeted:true}
].map(definition=>Object.freeze({...definition,gainPerTurn:definition.id!=='blade-marks'})));
export function ownedTrackers(actor) {
  return ninjutsuTrackers.flatMap(definition => {
    const item = [...(actor?.items ?? [])].find(item => item.type === 'feat'&&item.dependentOrigin?.active!==false
      && (item._stats?.compendiumSource ?? item.flags?.core?.sourceId) === definition.source);
    return item ? [{...definition, item}] : [];
  });
}
