import {medicalLevel,medicalFeature,scalpelState} from '../casting/medical-context.mjs';
import {registerClassPanel,classPanelEntries,openClassWindow,installClassWindows} from './class-window.mjs';
export const registerMedicalPanel=(game,id,label,build)=>registerClassPanel(game,'medical',id,label,build);
export const medicalPanelEntries=(game,actor)=>classPanelEntries(game,actor,'medical');
export function medicalSummary(game,actor){
 const pools=['Chakra Scalpel','Preserve/Take Life','Channeled Healing','Natural Healing'].flatMap(name=>{
  const item=medicalFeature(actor,name),uses=item?.system.uses;
  return uses&&Number.isFinite(uses.max)?[{name,value:uses.value,max:uses.max}]:[];
 });
 const scalpel=scalpelState(game,actor);
 return {level:medicalLevel(actor),pools,status:scalpel?(scalpel.sabre?'Sabre aktiv':'Scalpel aktiv'):'Scalpel inaktiv'};
}

export const openMedicalWindow=(game,actor)=>openClassWindow(game,actor,'medical');
export const installMedicalActionWindow=installClassWindows;
