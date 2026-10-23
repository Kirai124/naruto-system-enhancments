import {registerClassSheetPanel} from '../ui/class-window.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {genjutsuEnabled,ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
export const CHRONICLE='genjutsuChronicleRitual';
export async function configureChronicleRitual(game,actor){
 if(!genjutsuEnabled(game)||!actor.isOwner||!ownedGenjutsuFeature(actor,'Illusionary Chronicle','Malleable Mirages'))throw Error('Eigene Illusionary Chronicle erforderlich.');const state=actor.getFlag(MODULE_ID,CHRONICLE)??{};if(state.ability&&!state.unlocked&&!game.user.isGM)throw Error('Erst bei der nächsten tatsächlich abgeschlossenen kurzen/langen Rast neu wählen.');
 const choice=await foundry.applications.api.DialogV2.wait({window:{title:'Illusionary Chronicle · Rast-Ritual'},content:'<p>Meditatives Ritual während einer tatsächlich abgeschlossenen kurzen oder langen Rast bestätigen. Welche Rettungswürfe schützt es?</p>',buttons:[{action:'str',label:'Strength',callback:()=>'str'},{action:'dex',label:'Dexterity',callback:()=>'dex'}],rejectClose:false});if(choice)await actor.setFlag(MODULE_ID,CHRONICLE,{ability:choice,unlocked:false,at:game.time.worldTime});
}
export function installGenjutsuRituals(game){
 Hooks.on('dnd5e.restCompleted',async(actor,_result,config)=>{if(genjutsuEnabled(game)&&actor.isOwner&&['short','long','full'].includes(config.type)&&ownedGenjutsuFeature(actor,'Illusionary Chronicle','Malleable Mirages'))await actor.setFlag(MODULE_ID,CHRONICLE,{...actor.getFlag(MODULE_ID,CHRONICLE),unlocked:true});});
 registerClassSheetPanel(game,'genjutsu','.n5ese-chronicle-ritual','Chronicle-Rituale',(app,html)=>{const actor=app.actor??app.document,root=html instanceof HTMLElement?html:app.element;root?.querySelector('.n5ese-chronicle-ritual')?.remove();if(!genjutsuEnabled(game)||!ownedGenjutsuFeature(actor,'Illusionary Chronicle','Malleable Mirages'))return;const host=root?.querySelector('section[data-tab="features"]');if(!host)return;const button=document.createElement('button');button.type='button';button.className='n5ese-chronicle-ritual';button.textContent='Chronicle · Rast-Ritual: '+(actor.getFlag(MODULE_ID,CHRONICLE)?.ability?.toUpperCase()??'auswählen');button.disabled=!actor.isOwner;button.addEventListener('click',()=>configureChronicleRitual(game,actor).catch(e=>ui.notifications.warn(e.message)));host.prepend(button);});
}
