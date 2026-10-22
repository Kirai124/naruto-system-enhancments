import {MODULE_ID} from '../settings/register.mjs';
import {solarFinishers,runSolarFinisher} from '../foundry/solar-interflow.mjs';
export function addSolarFinishers(game,actor,panel,messageId){
 if(!actor.isOwner||!game.settings.get(MODULE_ID,'subclassMoldingAutomation'))return;
 for(const entry of solarFinishers(actor).filter(e=>(!messageId||e.messageId===messageId)&&['pending','applying','review'].includes(e.status))){
  const label=document.createElement('p');label.textContent=`Solar-Finisher · ${entry.status} · ${entry.targets.map(t=>t.name).join(', ')}`;panel.append(label);
  const button=(text,operation)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',async()=>{b.disabled=true;try{await operation();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});panel.append(b);};
  if(entry.status==='pending'){
   button('Solar-Finisher wirken',()=>runSolarFinisher(game,actor,entry.id));
   button('Solar-Finisher verwerfen',()=>runSolarFinisher(game,actor,entry.id,{discard:true}));
  }else if(game.user.isGM)button('GM: Solar-Folgecast geprüft',async()=>{
   if(await foundry.applications.api.DialogV2.confirm({window:{title:'Solar-Folgecast prüfen'},content:'<p>Ressourcen und vorhandene Chatkarten geprüft und gegebenenfalls korrigiert? Ohne erneuten Cast abschließen.</p>',rejectClose:false}))await actor.setFlag(MODULE_ID,'solarFinishers',solarFinishers(actor).map(e=>e.id===entry.id?{...e,status:'resolved',resolvedBy:game.user.id}:e));
  });
 }
}
