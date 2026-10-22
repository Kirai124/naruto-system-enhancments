import {availableMoldings,configuredMoldings} from '../casting/efficient-molding.mjs';
import {refinedDamageChoices} from '../casting/refined-ninjutsu.mjs';
import {NATURES} from '../casting/professor-releases.mjs';
export function addMoldingDialogFields(activity,config,result,{subclassEnabled=false}={}){
  if(!activity?.item)return;
  const options=availableMoldings(activity,{preview:true}).filter(m=>subclassEnabled||!m.subclass),selected=config.n5ese?.moldings??{};
  const select=choices=>(_field,input)=>foundry.applications.fields.createSelectInput({...input,options:choices});
  for(const option of options){
    const name=`n5ese.moldings.${option.id}`,value=selected[option.id]??{};
    result.fields.push({name:`${name}.enabled`,value:!!value.enabled,field:new foundry.data.fields.BooleanField({label:option.name,hint:option.additive?'Mit anderen Moldings kombinierbar.':'Höchstens ein reguläres Molding pro Cast.'}),input:result.inputs.createCheckboxInput});
    if(!value.enabled)continue;
    const prerequisite=option.id==='charged-blade'&&activity.item.system.jutsu.keywords.has('ninjutsu')?null:option.id==='imbuement-master'?'Dieses Nin-Bukijutsu verwendet Taijutsu-Angriffe.':{ink:'Dies ist eine Beast Imitating Art.',paired:'Zwei Ninjutsu mit verschiedenen Nature Releases werden im selben Castingvorgang gewirkt.',bukijutsu:'Die Imbued Weapon wird als Komponente verwendet.'}[option.keyword];
    if(prerequisite)result.fields.push({name:`${name}.eligibilityConfirmed`,value:!!value.eligibilityConfirmed,field:new foundry.data.fields.BooleanField({label:'Voraussetzung bestätigen',hint:prerequisite}),input:result.inputs.createCheckboxInput});
    if(option.mandatoryPayment)result.notes.push({type:'info',message:`${option.name}: immer ${option.cost} zusätzliche Chakra; keine kostenlose Molding-Nutzung.`});
    else result.fields.push({name:`${name}.payment`,value:value.payment??'auto',field:new foundry.data.fields.StringField({label:'Nutzung zuordnen'}),input:select([{value:'auto',label:'Automatisch: teuerste zuerst'},{value:'free',label:'Kostenlose Nutzung'},{value:'chakra',label:'Alternative Chakra-Kosten'}])});
    if(option.id==='macabre')result.fields.push({name:`${name}.damageType`,value:value.damageType??'acid',field:new foundry.data.fields.StringField({label:'Schadensart'}),input:select(['acid','necrotic','poison'].map(type=>({value:type,label:type})))});
    if(option.id==='charged-blade'){
      const weapons=[...activity.item.actor.items].filter(i=>i.type==='weapon');
      result.fields.push({name:`${name}.weaponId`,value:value.weaponId??'',field:new foundry.data.fields.StringField({label:'Verwendete Waffe (für Waffen-Schadensart)'}),input:select([{value:'',label:'Force-Schaden'},...weapons.map(i=>({value:i.id,label:i.name}))])});
      const weapon=weapons.find(i=>i.id===value.weaponId),types=[...new Set(['force',...(weapon?.system.damage?.base?.types??[])])];
      result.fields.push({name:`${name}.damageType`,value:value.damageType??'force',field:new foundry.data.fields.StringField({label:'Charged Blade: Schadensart'}),input:select(types.map(type=>({value:type,label:type})))});
    }
    if(option.id==='gigawatt'){
      const choices=refinedDamageChoices(activity);
      if(choices.length)result.fields.push({name:`${name}.damagePart`,value:String(value.damagePart??choices[0].index),field:new foundry.data.fields.StringField({label:'Gigawatt: Schadenswürfel für besondere Kreaturentypen'}),input:select(choices.map(p=>({value:String(p.index),label:`${p.formula} · ${p.types.join(', ')}`})))});
    }
    if(['final-lesson','magnum-opus'].includes(option.id)){
      const final=option.id==='final-lesson';
      const spells=[...activity.item.actor.items].filter(i=>i.type==='spell'&&i.system.jutsu.type==='ninjutsu'&&(!final||i.id!==activity.item.id&&NATURES.some(k=>i.system.jutsu.keywords.has(k))));
      if(!final)for(const [field,label] of [['inkSummonConfirmed','Das erste Jutsu erschafft tatsächlich einen Ink Summon.'],['partnerInkConfirmed','Das zweite Jutsu ist tatsächlich eine Beast Imitating Art.']])result.fields.push({name:`${name}.${field}`,value:!!value[field],field:new foundry.data.fields.BooleanField({label}),input:result.inputs.createCheckboxInput});
      result.fields.push({name:`${name}.partnerItemId`,value:value.partnerItemId??'',field:new foundry.data.fields.StringField({label:'Zweites eigenes Ninjutsu'}),input:select([{value:'',label:'Bitte auswählen'},...spells.map(i=>({value:i.id,label:i.name}))])});
      const partner=spells.find(i=>i.id===value.partnerItemId);
      if(partner){
        result.fields.push({name:`${name}.partnerActivityId`,value:value.partnerActivityId??[...partner.system.activities][0]?.id,field:new foundry.data.fields.StringField({label:'Aktivität des zweiten Jutsu'}),input:select([...partner.system.activities].map(a=>({value:a.id,label:a.name})))});
        const ranks=['e','d','c','b','a','s'],base=ranks.indexOf(partner.system.effectiveRank);
        result.fields.push({name:`${name}.partnerRank`,value:value.partnerRank??partner.system.effectiveRank,field:new foundry.data.fields.StringField({label:'Rang des zweiten Jutsu'}),input:select(ranks.slice(Math.max(0,base)).map(rank=>({value:rank,label:rank.toUpperCase()})))});
        if(final)for(const [field,item,label] of [['primaryNature',activity.item,'Nature Release des ersten Jutsu'],['partnerNature',partner,'Verschiedene Nature Release des zweiten Jutsu']]){
          const keywords=NATURES.filter(k=>item.system.jutsu.keywords.has(k));
          result.fields.push({name:`${name}.${field}`,value:value[field]??keywords[0],field:new foundry.data.fields.StringField({label}),input:select(keywords.map(k=>({value:k,label:k})))});
        }
      }
      result.notes.push({type:'info',message:final?'Final Lesson: beide Jutsu vorab auswählen. Gemeinsame passende Moldings werden einmal bezahlt. Ein unterbrochenes Paar wird zur GM-Prüfung gesperrt.':'Magnum Opus: Folgejutsu zum halben unreduzierten Rangpreis (abgerundet), ohne weitere Preisrabatte. Der Unterhalt wird nicht zusätzlich halbiert.'});
    }
    if(option.id==='imbuement-master'){
      const attacks=[...activity.item.system.activities].filter(a=>a.type==='attack'),numbers=Array.from({length:21},(_,i)=>({value:String(i),label:String(i)}));
      for(let i=0;i<3;i++){
        result.fields.push({name:`${name}.attackCount${i}`,value:String(value[`attackCount${i}`]??(i===0?1:0)),field:new foundry.data.fields.StringField({label:`Angriffsgruppe ${i+1}: tatsächliche Anzahl`}),input:select(i===0?numbers.slice(1):numbers)});
        if(Number(value[`attackCount${i}`]??(i===0?1:0)))result.fields.push({name:`${name}.attackActivity${i}`,value:value[`attackActivity${i}`]??activity.id,field:new foundry.data.fields.StringField({label:`Angriffsgruppe ${i+1}: native Schadensformel`}),input:select(attacks.map(a=>({value:a.id,label:a.name})))});
      }
      result.fields.push({name:`${name}.criticalSlot`,value:String(value.criticalSlot??0),field:new foundry.data.fields.StringField({label:'Bei Fehlschlag um 5: ein kritischer Treffer in Gruppe'}),input:select([0,1,2].map(i=>({value:String(i),label:String(i+1)})))});
      result.fields.push({name:`${name}.conditionCount`,value:String(value.conditionCount??0),field:new foundry.data.fields.StringField({label:'Anzahl unterschiedlicher tatsächlicher Conditions'}),input:select(Array.from({length:7},(_,i)=>({value:String(i),label:String(i)})))});
      const conditions=Object.entries(CONFIG.DND5E.conditionTypes).filter(([_id,c])=>!c.alias).map(([id])=>({value:id,label:id}));
      for(let i=0;i<Number(value.conditionCount??0);i++){
        result.fields.push({name:`${name}.conditionId${i}`,value:value[`conditionId${i}`]??conditions[0]?.value,field:new foundry.data.fields.StringField({label:`Condition ${i+1}`}),input:select(conditions)});
        result.fields.push({name:`${name}.conditionDelta${i}`,value:String(value[`conditionDelta${i}`]??1),field:new foundry.data.fields.StringField({label:`Condition ${i+1}: bestätigte Gesamtränge/Anwendungen`}),input:select(numbers.slice(1))});
      }
      result.notes.push({type:'info',message:'Ein CON-Save auf genau ein bestätigtes Ziel ersetzt die Angriffe. Native Schadensformeln der bestätigten Gruppen werden gewürfelt; gesamter Schaden wird gemeinsam angewendet (DR einmal).'});
    }
    if(['careful','precise'].includes(option.id))result.fields.push({name:`${name}.count`,value:String(value.count??1),field:new foundry.data.fields.StringField({label:option.id==='careful'?'Gruppen mit jeweils bis zu 3 geschützten Zielen':'Angriffe mit Vorteil'}),input:select(Array.from({length:20},(_,i)=>({value:String(i+1),label:String(i+1)})))});
    if(['careful','precise'].includes(option.id)&&Number(value.count)>1)result.fields.push({name:`${name}.freeCount`,value:value.freeCount===undefined?'':String(value.freeCount),field:new foundry.data.fields.StringField({label:'Davon kostenlos zuordnen',hint:'Diese Anzahl ersetzt die allgemeine Zuordnung für dieses Molding.'}),input:select([{value:'',label:'Allgemeine Zuordnung verwenden'},...Array.from({length:Number(value.count)+1},(_,i)=>({value:String(i),label:String(i)}))])});
    if(option.id==='widened'&&['line','cylinder'].includes(activity.target.template.type)){
      const cylinder=activity.target.template.type==='cylinder';
      result.fields.push({name:`${name}.axis`,value:value.axis??'size',field:new foundry.data.fields.StringField({label:'Fläche erweitern'}),input:select([{value:'size',label:cylinder?'Radius +15 ft':'Länge +10 ft'},{value:cylinder?'height':'width',label:cylinder?'Höhe +15 ft':'Breite +10 ft'}])});
    }
    if(option.id==='transmogrified'){
      const from=[...activity.save.ability][0],to={str:'dex',dex:'str',wis:'cha',cha:'wis'}[from];
      result.fields.push({name:`${name}.ability`,value:to,field:new foundry.data.fields.StringField({label:'Neuer Rettungswurf'}),input:select([{value:to,label:to.toUpperCase()}])});
    }
  }
  if(options.length)result.hasConsumption=true;
  try{
    const plan=configuredMoldings(activity,normalizeMoldingConfig(selected),config.jutsu?.rank??activity.item.system.effectiveRank,{subclassEnabled});
    if(plan.selected.length)result.notes.push({type:'info',message:`Efficient Molding: ${plan.uses} gemeinsame Nutzung(en), zusätzlich ${plan.additionalCost} Chakra nach Jutsu-Rabatten und Chakra Recovery. Bestätigung bezahlt; Abbrechen verbraucht nichts.`});
  }catch(error){result.notes.push({type:'warn',message:error.message});}
}
export function normalizeMoldingConfig(configuration={}){
  return Object.fromEntries(Object.entries(configuration).map(([id,value])=>[id,{...value,count:value.count===undefined?1:Number(value.count),freeCount:value.freeCount===undefined||value.freeCount===''?undefined:Number(value.freeCount)}]));
}
