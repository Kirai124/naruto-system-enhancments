import {medicalFeature} from '../casting/medical-context.mjs';
export function addWarriorBenefitFields(source,target,host){
 if(!medicalFeature(source,'Warrior Of The Hex','Shaman'))return;
 const p=document.createElement('p');p.textContent='Warrior Of The Hex: ausschließlich tatsächlich positive, zu entfernende Vorteile bestätigen. Sie enden VOR diesem Treffer. Kombinierte positive/negative Effekte muss der GM vorher trennen. Übertragene Item-Effekte bleiben ausgenommen.';host.append(p);
 for(const effect of target.effects.filter(e=>!e.disabled&&!e.transfer)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='warriorEffect';input.value=effect.id;label.append(input,document.createTextNode(effect.name));host.append(label,document.createElement('br'));}
 const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='warriorTemp';label.append(input,document.createTextNode('Alle vorhandenen '+(target.system.attributes.hp.temp??0)+' temporären HP vor dem Treffer entfernen'));host.append(label);
}
export function warriorBenefitChoice(source,target,form){
 if(!medicalFeature(source,'Warrior Of The Hex','Shaman'))return null;
 return {effects:[...form.querySelectorAll('[name="warriorEffect"]:checked')].map(input=>{const effect=target.effects.get(input.value);if(!effect||effect.disabled||effect.transfer)throw Error('Gewählter Vorteil nicht mehr vorhanden.');return {id:effect.id,fingerprint:JSON.stringify(effect.toObject())};}),temporaryHP:form.elements.warriorTemp?.checked?Number(target.system.attributes.hp.temp??0):null};
}
export function validateWarriorBenefits(source,target,choice){
 if(!choice)return;
 if(!medicalFeature(source,'Warrior Of The Hex','Shaman'))throw Error('Warrior Of The Hex nicht mehr vorhanden.');
 if(choice.effects.some(ref=>{const effect=target.effects.get(ref.id);return !effect||effect.disabled||effect.transfer||JSON.stringify(effect.toObject())!==ref.fingerprint;}))throw Error('Bestätigter Vorteil seit der Auswahl verändert; GM-Prüfung erforderlich.');
 if(choice.temporaryHP!==null&&Number(target.system.attributes.hp.temp??0)!==choice.temporaryHP)throw Error('Bestätigte temporäre HP seit der Auswahl verändert.');
}
export async function removeWarriorBenefits(source,target,choice){
 validateWarriorBenefits(source,target,choice);if(!choice)return;
 if(choice.effects.length)await target.deleteEmbeddedDocuments('ActiveEffect',choice.effects.map(e=>e.id));
 if(choice.temporaryHP!==null)await target.update({'system.attributes.hp.temp':0});
}
