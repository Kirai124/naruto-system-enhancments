import {MODULE_ID} from '../settings/register.mjs';
import {subclassCastActive} from '../casting/subclass-cast-lifetime.mjs';
const busy=new WeakSet();
/** Receipt belongs to the target, so its owner can roll without writing the caster. */
export async function rollMoldingSaves(game,message,targets,{ability,dc,configure=true}={}){
  const activity=message.getAssociatedActivity(),record=message.getFlag(MODULE_ID,'moldingCast'),results=[];
  if(!activity||!record)throw Error('Castingkontext fehlt.');
  if(!targets.length)throw Error('Betroffene Tokens zunächst als Ziele auswählen.');
  for(const target of targets){
    if(record.targets?.careful?.some(t=>t.uuid===target.uuid))continue;
    if(!target.isOwner)throw Error(`${target.name}: der GM muss den Rettungswurf ausführen.`);
    if(busy.has(target))throw Error('Ein Rettungswurf für dieses Ziel ist noch offen.');
    busy.add(target);
    try{
      const receipts=target.getFlag(MODULE_ID,'heightenedReceipts')??[],heightened=record.targets?.heightened?.some(t=>t.uuid===target.uuid)&&!receipts.includes(record.castId);
      const subclass=game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&subclassCastActive(record,game.time.worldTime),type=target.system.details?.type?.value;
      let crimson=subclass&&record.ids.includes('crimson')&&['beast','plant'].includes(type);
      if(subclass&&record.ids.includes('crimson')&&type==='construct')crimson=await foundry.applications.api.DialogV2.confirm({window:{title:'Crimson: organisches Konstrukt'},content:'<p>Besteht dieses betroffene Konstrukt aus organischem Material? Nur dann gilt Nachteil.</p>',rejectClose:false});
      const disadvantage=heightened||crimson||(subclass&&record.ids.includes('elitist'));
      const rolls=await target.rollSavingThrow({ability:ability??[...activity.save.ability][0],target:dc??activity.save.dc.value,rolls:[{options:{disadvantage:!!disadvantage}}]},{configure},{data:{flags:{n5eb:{originatingMessage:message.id}}}});
      if(heightened&&rolls?.length)await target.setFlag(MODULE_ID,'heightenedReceipts',[...new Set([...(target.getFlag(MODULE_ID,'heightenedReceipts')??[]),record.castId])]);
      results.push({target:target.uuid,rolls});
    }finally{busy.delete(target);}
  }
  return results;
}
