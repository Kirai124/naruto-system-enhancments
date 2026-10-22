import {MODULE_ID} from '../settings/register.mjs';
import {taijutsuFeature,isTaijutsu,martialDie,taijutsuLevel} from '../casting/taijutsu-context.mjs';
import {natureForm} from './taijutsu-nin-tai.mjs';
import {martialDialog} from '../ui/martial-dialog.mjs';
export async function chooseElementalCrush(game,actor,message,parts){
 if(!natureForm(game,actor)||!taijutsuFeature(actor,'Elemental Combat','Nin-Tai')||!isTaijutsu(message.getAssociatedItem?.())||actor.getFlag(MODULE_ID,'taijutsuCrushDebt'))return null;
 const choices=[...new Set(parts.filter(p=>p.type!=='chakra'&&!CONFIG.DND5E.healingTypes[p.type]).map(p=>p.type))];if(!choices.length)return null;
 const c=await martialDialog('Elemental Crush · optionaler Trefferzusatz','Zusatz gemeinsam mit diesem noch nicht angewendeten Taijutsu-Schaden berechnen, damit Verteidigungen einmal greifen. 0 = nicht verwenden. Nach Einsatz dieselbe Zahl Martial Dice zum Wiederaufladen bezahlen.',[{name:'dice',label:'Martial Dice ausgeben',min:0,value:0},{name:'type',label:'Vorhandene Schadensart',options:choices.map(value=>({value,label:value}))}]);if(!c)return null;
 if(!Number.isSafeInteger(c.dice)||c.dice<0||!choices.includes(c.type))throw Error('Ungültige Elemental-Crush-Auswahl.');return c.dice?c:null;
}
export async function applyElementalCrush(actor,entry){
 if(!entry.elementalCrush)return;
 const c=entry.elementalCrush;await actor.setFlag(MODULE_ID,'taijutsuCrushDebt',{paymentId:entry.id,dice:c.dice});
 const roll=await new Roll(c.dice+'d'+martialDie(taijutsuLevel(actor))).evaluate();entry.rolls.push(roll.toJSON());entry.parts.find(p=>p.type===c.type).value+=2*roll.total;
}
