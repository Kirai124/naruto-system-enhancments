import {MODULE_ID} from '../settings/register.mjs';

/** Compact tracker strips inspired by the existing Class Mod sheet trackers. */
export function renderDojutsuControls(game,sheet,html,manager) {
 const actor=sheet.actor??sheet.document,root=html instanceof HTMLElement?html:sheet.element;
 if(!root?.querySelector || actor?.type!=='character')return;
 root.querySelectorAll('.n5ese-dojutsu').forEach(element=>element.remove());
 if(!game.settings.get(MODULE_ID,'dojutsuControls'))return;
 const instances=manager.list(actor);if(!instances.length)return;
 const host=root.querySelector('section[data-tab="features"]');if(!host)return;
 const panel=document.createElement('section');panel.className='n5ese-dojutsu';
 const header=document.createElement('header'),title=document.createElement('h3');title.textContent=game.i18n.localize('N5ESE.Dojutsu.Title');header.append(title);
 const hint=document.createElement('span');hint.className='n5ese-dojutsu-hint';hint.textContent=game.i18n.localize('N5ESE.Dojutsu.ManualShort');header.append(hint);panel.append(header);
 const notify=error=>{console.error(`[${MODULE_ID}] Dojutsu operation failed`,error);ui.notifications.error(game.i18n.localize(error.message));};
 for(const instance of instances){
  const row=document.createElement('div');row.className='n5ese-dojutsu-row';row.dataset.active=String(instance.active);
  row.dataset.kind=instance.definitionId.includes('sharingan')?'sharingan':'byakugan';
  const identity=document.createElement('div');identity.className='n5ese-dojutsu-identity';
  const image=document.createElement('img');image.src=instance.image??'icons/svg/eye.svg';image.alt='';identity.append(image);
  const name=document.createElement('strong');name.textContent=instance.label;identity.append(name);row.append(identity);
  const detail=document.createElement('div');detail.className='n5ese-dojutsu-detail';
  if(instance.tomoe){
   const stage=document.createElement('span');stage.className='n5ese-dojutsu-stage';stage.title=game.i18n.format('N5ESE.Dojutsu.TomoeUnlocked',{stage:instance.tomoe.unlocked});
   const pips=document.createElement('span');pips.className='n5ese-dojutsu-pips';pips.setAttribute('aria-hidden','true');
   for(let i=1;i<=3;i++){const pip=document.createElement('i');pip.className=i<=instance.tomoe.effective?'filled':'';pips.append(pip)}stage.append(pips);
   const label=document.createElement('span');label.textContent=game.i18n.format('N5ESE.Dojutsu.TomoeStage',{stage:instance.tomoe.effective});stage.append(label);detail.append(stage);
   if(game.user.isGM){
    const select=document.createElement('select');select.className='n5ese-dojutsu-unlock';select.setAttribute('aria-label',`${instance.label}: ${game.i18n.localize('N5ESE.Dojutsu.GMUnlock')}`);
    select.title=game.i18n.localize('N5ESE.Dojutsu.UnlockHint');
    for(let i=1;i<=3;i++){const option=document.createElement('option');option.value=String(i);option.textContent=game.i18n.format('N5ESE.Dojutsu.UnlockOption',{stage:i});option.selected=i===instance.tomoe.unlocked;select.append(option)}
    select.addEventListener('change',event=>{event.stopPropagation();select.disabled=true;manager.setTomoeUnlock(actor,instance.instanceId,Number(select.value)).then(()=>sheet.render(false)).catch(error=>{notify(error);sheet.render(false)})});detail.append(select);
   }
  }
  const status=document.createElement('small');status.className='n5ese-dojutsu-status';
  status.textContent=instance.externalActive?game.i18n.localize('N5ESE.Dojutsu.External'):
   !instance.eligible?game.i18n.format('N5ESE.Dojutsu.RequiresLevel',{level:instance.minimumLevel}):
   game.i18n.format(instance.active?'N5ESE.Dojutsu.ActiveStatus':'N5ESE.Dojutsu.InactiveStatus',{cost:instance.nextCost,minutes:Math.ceil(instance.remainingSeconds/60)});
  detail.append(status);row.append(detail);
  const button=document.createElement('button');button.type='button';button.className='n5ese-dojutsu-toggle';button.setAttribute('aria-pressed',String(instance.active));
  button.textContent=game.i18n.localize(instance.active?'N5ESE.Dojutsu.Deactivate':'N5ESE.Dojutsu.Activate');button.setAttribute('aria-label',`${instance.label}: ${button.textContent}`);
  button.disabled=!actor.isOwner || (!instance.active && (!instance.eligible || instance.externalActive));
  button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();button.disabled=true;
   const operation=instance.active?manager.deactivate(actor,instance.instanceId):manager.activate(actor,instance.instanceId);
   operation.then(()=>sheet.render(false)).catch(error=>{notify(error);sheet.render(false)});
  });row.append(button);panel.append(row);
 }
 host.prepend(panel);
}
