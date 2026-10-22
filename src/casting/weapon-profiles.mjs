/** Copy only the mundane profile, never embedded effects, enchanted bonuses or arbitrary activities. */
export function mundaneWeaponProfile(item){
 if(item?.type!=='weapon'||!item.system.damage.base.formula)throw Error('Vorhandenes Waffenprofil mit auslesbarem Grundschaden erforderlich.');
 const raw=item.toObject().system;
 return {name:item.name,img:item.img,system:{type:raw.type,damage:{base:raw.damage.base,versatile:raw.damage.versatile},range:raw.range,properties:raw.properties}};
}
