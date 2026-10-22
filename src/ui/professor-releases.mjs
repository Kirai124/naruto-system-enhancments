import {MODULE_ID} from '../settings/register.mjs';
import {NATURES,professorReleases} from '../casting/professor-releases.mjs';
export function addProfessorReleaseControl(game,actor,panel){
 const text=document.createElement('p');text.textContent=`Chakra Infusion · bestätigte Releases: ${professorReleases(actor).join(', ')||'keine — GM-Auswahl erforderlich'}`;panel.append(text);
 if(!game.user.isGM||!actor.isOwner)return;
 const button=document.createElement('button');button.type='button';button.textContent='GM: tatsächliche Nature Releases bestätigen';
 button.addEventListener('click',async()=>{
  button.disabled=true;
  try{
   const known=professorReleases(actor),releases=await foundry.applications.api.DialogV2.wait({window:{title:'Professor: Nature Releases'},content:'<p>Nur tatsächlich freigeschaltete Releases bestätigen. Diese Zuordnung gewährt keine Lernrechte.</p>'+NATURES.map(k=>`<label style="display:block"><input name="release" type="checkbox" value="${k}" ${known.includes(k)?'checked':''}> ${k}</label>`).join(''),buttons:[{action:'save',label:'Bestätigte Zuordnung speichern',callback:(_e,b)=>[...b.form.querySelectorAll('[name="release"]:checked')].map(e=>e.value)}],rejectClose:false});
   if(!Array.isArray(releases))return;
   await actor.setFlag(MODULE_ID,'professorReleases',{schemaVersion:1,releases,confirmedBy:game.user.id});
  }catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}
 });panel.append(button);
}
