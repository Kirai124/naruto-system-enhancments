import {sourceOf} from './feature-rules.mjs';
const rule=(id,name,pack,item,keyword,extra={})=>Object.freeze({id,name,source:`Compendium.n5eb.${pack}.Item.${item}`,cost:5,phase:'cast',additive:true,subclass:true,keyword,...extra});
const ultimate=(id,name,pack,item,keyword,extra={})=>rule(id,name,pack,item,keyword,{cost:10,mandatoryPayment:true,...extra});
/** Installed source identifiers, never name-based grants or compendium-wide ability detection. */
export const SUBCLASS_MOLDINGS=Object.freeze([
 rule('swirling','Swirling Technique','subclass','1tECAZbpXI7zjOHn','wind'),
 ultimate('storm-terror','Storm Terror Technique','subclass','flr5CUeuCg78QuYG','wind'),
 rule('crimson','Crimson Molding','subclass','jTSSx56FyWeoKTds','fire'),
 ultimate('blaze-walker','Blaze Walker Technique','subclass','qpAWP56V3NQDpLM8','fire',{upcast:true}),
 rule('macabre','Macabre Techniques','subclass','0ZpgECWwswu7z3SF',null),
 ultimate('sanguine-master','Sanguine Master Technique','subclass','JCOBMk3Fdp0LHQGV',null),
 rule('gigawatt','Gigawatt Molding','subclass','IFp5CjcRfqXY2GzX','lightning'),
 ultimate('lightning-breaker','Lightning Breaker Technique','subclass','YQ8A0n506YCmKB0w','lightning'),
 rule('raining-vortex','Raining Vortex','subclass','z1yJZQP8vJj7465t','water'),
 ultimate('tsunami','Tsunami Technique','subclass','YHToxugNXeYhONgO','water'),
 rule('void-break','Void Break Technique','subclass','8v2XDdTFgHZxbrUV','non-elemental'),
 ultimate('talent-voider','Talent Voider','subclass','uQ6pcveomHxxR3bT','non-elemental'),
 rule('generational','Generational Molding','subclass','W2jgpr6lqO3PordB','hijutsu'),
 ultimate('elitist','Elitist Technique','subclass','UFt8nmhcCFZTEbqq','hijutsu',{upcast:true}),
 rule('combination','Combination Technique','subclass','MuR98WjSrOwyAcHb','combination',{combination:true}),
 ultimate('synchronization','Synchronization Technique','subclass','H4qC14P0PcyzR4yZ','combination',{combination:true}),
 rule('chakra-infusion','Chakra Infusion Technique','subclass','McL3TQgvNHkGErkF','elemental'),
 ultimate('final-lesson','The Final Lesson','subclass','nDuHM89lGdJG1YtX','paired'),
 rule('tectonic-plates','Tectonic Plate Technique','subclass','JbLpz96Yy7nVH52c','earth'),
 ultimate('stone-crusher','Stone Crusher Technique','subclass','88xcRl0tWX5LcA1c','earth'),
 rule('seal-break','Seal Break','subclass','JDRPCzXornnoYkx6','fuinjutsu'),
 ultimate('scribe-master','Scribe Master','subclass','KCzg0AOoJJckf1om','fuinjutsu'),
 rule('painter','Painter\'s Technique','t7-subclass','syr9JG8aqbCA9IWg','ink'),
 ultimate('magnum-opus','Magnum Opus Technique','t7-subclass','ULKCwvSmNpwN2OXr','ink'),
 ultimate('solar-interflow','Solar Interflow Technique','t7-subclass','PAIFTWRL665S3Y7n','taijutsu'),
 rule('charged-blade','Charged Blade Technique','t7-subclass','Gk0lVndj3PM3LnDR','bukijutsu'),
 ultimate('imbuement-master','Imbuement Master Technique','t7-subclass','g3EU4nDePwBgIbxY','bukijutsu')
]);
export const ADAPTIVE_MOLDINGS=Object.freeze([
 ['rejuvenating','Rejuvenating Molding','Dbu5JsjsOkvxxbXg'],['overdrive','Overdrive Molding','vHQI5r0og2lnSHlw'],
 ['survival','Survival Molding','wQNrRLLtq6bPk2Yn'],['tactical','Tactical Molding','XgUSV5PunbU3mmib']
].map(([id,name,item])=>rule(id,name,'t7-subclass',item,null,{phase:'self',mandatoryPayment:true})));
export function ownedSubclassMoldings(actor){
 const sources=new Set([...(actor?.items??[])].filter(i=>i.type==='feat'&&i.dependentOrigin?.active!==false).map(sourceOf));
 return [...SUBCLASS_MOLDINGS,...ADAPTIVE_MOLDINGS].filter(r=>sources.has(r.source));
}
export function subclassMoldingContext(configuration={}){
 return {inkArtConfirmed:configuration.painter?.eligibilityConfirmed===true||configuration['magnum-opus']?.eligibilityConfirmed===true,
 pairedCastConfirmed:configuration['final-lesson']?.eligibilityConfirmed===true,
 taijutsuAttacksConfirmed:configuration['imbuement-master']?.eligibilityConfirmed===true,
 imbuedWeaponConfirmed:configuration['charged-blade']?.eligibilityConfirmed===true};
}
export function matchesSubclassMolding(rule,activity,context={}){
 const item=activity?.item,system=item?.system;if(item?.type!=='spell')return false;
 const keywords=new Set(system.jutsu?.keywords??[]),type=system.jutsu?.type,natures=['earth','wind','fire','water','lightning'];
 const nin=type==='ninjutsu'||keywords.has('ninjutsu');
 if(keywords.has('combination')&&!rule.combination)return false;
 if(rule.keyword==='taijutsu')return type==='taijutsu'&&keywords.has('ninjutsu');
 if(rule.keyword==='bukijutsu')return type==='bukijutsu'&&(keywords.has('ninjutsu')||(rule.id==='charged-blade'&&context.imbuedWeaponConfirmed===true))&&(rule.id!=='imbuement-master'||context.taijutsuAttacksConfirmed===true&&activity.type==='attack');
 if(!nin)return false;
 if(rule.keyword==='non-elemental')return !natures.some(k=>keywords.has(k));
 if(rule.keyword==='elemental')return natures.some(k=>keywords.has(k));
 // Text-only Ink/paired-cast prerequisites need explicit verified configuration.
 if(rule.keyword==='ink')return context.inkArtConfirmed===true;
 if(rule.keyword==='paired')return context.pairedCastConfirmed===true;
 if(rule.id==='sanguine-master')return (activity.damage?.parts??[]).some(p=>[...(p.types??[])].some(t=>['acid','necrotic','poison'].includes(t)));
 return !rule.keyword||keywords.has(rule.keyword);
}
