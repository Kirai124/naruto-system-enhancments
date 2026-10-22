import {MODULE_ID} from '../settings/register.mjs';
import {sourceOf} from '../casting/feature-rules.mjs';
import {ninjutsuLevel,ninjutsuUses,CHAKRA_RECOVERY,EFFICIENT_MOLDING} from '../casting/ninjutsu-resources.mjs';
const wrapped=new WeakSet(),prepared=new WeakMap();
const aliasWrapped=new WeakSet(),aliasedItems=new WeakSet();
/** Resolve only the installed broken resource formula, in transient roll data. */
export function installMoldingScaleAlias(game,ItemClass){
  const prototype=ItemClass?.prototype;if(!prototype?.getRollData||aliasWrapped.has(prototype))return;
  aliasWrapped.add(prototype);const original=prototype.getRollData;
  prototype.getRollData=function(...args){
    const data=original.apply(this,args);
    if(!game.settings.get(MODULE_ID,'efficientMoldingAutomation')||sourceOf(this)!==EFFICIENT_MOLDING||this._source?.system?.uses?.max!=='@scale.nin-spec.efficient-moldings'||data.scale?.['nin-spec']?.['efficient-moldings']!==undefined)return data;
    const max=ninjutsuUses(EFFICIENT_MOLDING,ninjutsuLevel(this.actor));if(max===null)return data;
    aliasedItems.add(this);
    return {...data,scale:{...data.scale,'nin-spec':{...data.scale?.['nin-spec'],'efficient-moldings':max}}};
  };
}
/** Prepared data only: disabling the setting restores native values on the next preparation. */
export function installNinjutsuResources(game,prototype) {
  if(!prototype||wrapped.has(prototype))return;
  const original=prototype.prepareFinalData;
  if(typeof original!=='function')throw Error('Native feature preparation missing');
  wrapped.add(prototype);
  prototype.prepareFinalData=function(...args) {
    const previous=prepared.get(this),overrides=this.parent?.overrides;
    // Some native prepareData paths reuse the prepared field object without resetting it.
    // Restore only our own exact previous value, never a changed source or effect override.
    if(previous&&previous.uses===this.uses&&this.uses.max===previous.maximum&&this._source?.uses?.max===previous.source
      &&overrides?.['system.uses.max']===undefined&&overrides?.system?.uses?.max===undefined) {
      this.uses.max=previous.base;
    }
    prepared.delete(this);
    const result=original.apply(this,args),item=this.parent;
    const source=sourceOf(item);
    if(game.settings.get(MODULE_ID,'ninjutsuClassAutomation')&&source==='Compendium.n5eb.subclass.Item.xXoIERtvvLXAJUr8'&&this._source.uses.max==='3'&&this.uses.max===3){this.uses.max=item.actor.system.attributes.prof;this.uses.value=Math.max(0,this.uses.max-this.uses.spent);return result;}
    if(!(source===EFFICIENT_MOLDING?game.settings.get(MODULE_ID,'efficientMoldingAutomation'):game.settings.get(MODULE_ID,'ninjutsuClassAutomation'))||item?.actor?.type!=='character'||item.dependentOrigin?.active===false)return result;
    const maximum=ninjutsuUses(source,ninjutsuLevel(item.actor));
    if(overrides?.['system.uses.max']!==undefined||overrides?.system?.uses?.max!==undefined)return result;
    const base=source===CHAKRA_RECOVERY?1:2;
    // Preserve customized formulas, Active Effects and other module overrides.
    const brokenMolding=source===EFFICIENT_MOLDING&&this._source?.uses?.max==='@scale.nin-spec.efficient-moldings'&&this.uses.max===0;
    // Native preparation can retain a number resolved through our transient alias.
    // Remember that value too, so switching off restores the original unresolved pool.
    if(source===EFFICIENT_MOLDING&&aliasedItems.has(item)&&this._source?.uses?.max==='@scale.nin-spec.efficient-moldings'&&this.uses.max===maximum){
      prepared.set(this,{uses:this.uses,maximum,base:0,source:this._source.uses.max});
      return result;
    }
    if(maximum===null||(!brokenMolding&&(String(this._source?.uses?.max)!==String(base)||this.uses.max!==base))||!Number.isInteger(this.uses.spent))return result;
    const originalMaximum=this.uses.max;
    this.uses.max=maximum;
    this.uses.value=Math.max(0,maximum-this.uses.spent);
    prepared.set(this,{uses:this.uses,maximum,base:originalMaximum,source:this._source.uses.max});
    return result;
  };
}
