import {isMoldingPrimary} from '../casting/molding-record.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {subclassCastActive} from '../casting/subclass-cast-lifetime.mjs';
import {chargedBladeBonus} from '../casting/subclass-molding-damage.mjs';
const wrapped=new WeakSet(),busy=new WeakSet();
export function installMoldingAttacks(game,types){
  for(const {documentClass} of Object.values(types)){
    const prototype=documentClass?.prototype;if(!prototype||typeof prototype.rollAttack!=='function'||wrapped.has(prototype))continue;wrapped.add(prototype);
    const original=prototype.rollAttack;
    prototype.rollAttack=async function(config={},dialog={},message={}){
      const record=this.item.getFlag(MODULE_ID,'moldingCast');
      if(game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&record?.solarFinisher&&[...game.user.targets].some(t=>t.actor?.uuid!==record.solarFinisher.target.uuid))throw Error('Solar-Finisher: nur das bestätigte zulässige Ziel auswählen.');
      const primary=record?.castId&&game.messages.find(m=>isMoldingPrimary(m)&&m.getFlag(MODULE_ID,'moldingCast')?.castId===record.castId);
      const current=primary?.getFlag(MODULE_ID,'moldingCast');
      if(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&current?.ids?.includes('charged-blade')&&!current.refunded){
        const bonus=chargedBladeBonus(current.paidJutsuCost),rolls=[...(config.rolls??[])];
        rolls[0]={...rolls[0],parts:[...(rolls[0]?.parts??[]),String(bonus)]};config={...config,rolls};
      }
      if(game.settings.get(MODULE_ID,'efficientMoldingAutomation')&&game.settings.get(MODULE_ID,'subclassMoldingAutomation')&&current?.ids?.includes('elitist')&&subclassCastActive(current,game.time.worldTime)){
        const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],options:{...rolls[0]?.options,advantage:true}};config={...config,rolls};
      }
      if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||!primary||primary.getFlag(MODULE_ID,'moldingCast')?.refunded||!record.ids.includes('precise'))return original.call(this,config,dialog,message);
      if(busy.has(primary))throw Error('Ein Precise-Angriff ist noch offen.');
      const used=primary.getFlag(MODULE_ID,'preciseUsed')??0,count=record.options.precise.count??1;
      if(used>=count)return original.call(this,config,dialog,message);
      if(!primary.isAuthor&&!game.user.isGM)throw Error('Berechtigung für die Casting-Chatkarte fehlt.');
      busy.add(primary);
      try{
        const use=await foundry.applications.api.DialogV2.confirm({window:{title:'Precise Ninjutsu'},content:`<p>Precise für diesen Angriff verwenden? Noch ${count-used} bereits bezahlte Angriffe mit Vorteil verfügbar.</p>`,rejectClose:false});
        if(use&&((primary.getFlag(MODULE_ID,'preciseUsed')??0)>=count||primary.getFlag(MODULE_ID,'moldingCast')?.refunded))throw Error('Precise-Verfügbarkeit hat sich während der Bestätigung geändert.');
        if(use){const rolls=[...(config.rolls??[])];rolls[0]={...rolls[0],options:{...rolls[0]?.options,advantage:true}};config={...config,rolls};}
        const result=await original.call(this,config,dialog,message);
        if(use&&result?.length)await primary.setFlag(MODULE_ID,'preciseUsed',(primary.getFlag(MODULE_ID,'preciseUsed')??0)+1);
        return result;
      }finally{busy.delete(primary);}
    };
  }
}
