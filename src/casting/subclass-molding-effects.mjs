const condition=(id,delta)=>({kind:'condition',id,delta});
const natureConditions=Object.freeze({earth:'bruised',wind:'bleeding',fire:'burned',water:'chilled',lightning:'shocked'});
export function swirlConditions(types,ranks){
 return Object.entries(types).filter(([id,c])=>!c.alias&&['elemental','physical'].includes(c.category)&&c.ranked&&Number(ranks[id])>0).map(([id])=>condition(id,1));
}
/** Pure effect descriptions. Saving throws, target permission and confirmation belong to the Foundry workflow. */
export function subclassEffectPlan(id,{nativeCost,hasSave=false,types={},ranks={},targetType='',organic=false}={}){
 const elemental=(ability,status)=>({save:hasSave?'original':ability,onFailure:[condition(status,1)],onSuccess:[]});
 switch(id){
  case 'swirling':return {onAll:swirlConditions(types,ranks)};
  case 'storm-terror':return {onAll:[condition('bleeding',5)]};
  case 'crimson':return {...elemental('con','burned'),saveDisadvantage:['plant','beast'].includes(targetType)||(targetType==='construct'&&organic)};
  case 'gigawatt':return {...elemental('con','shocked'),specialTarget:['aberration','celestial','mutant'].includes(targetType)};
  case 'tectonic-plates':return {...elemental('str','bruised'),ignoreConditionDefense:['demon','monstrosity','undead'].includes(targetType)};
  case 'seal-break':return {save:'cha',onFailure:[condition('sealed',1)],onSuccess:[]};
  case 'tsunami':return {onAll:[condition('chilled',2),{kind:'restriction',id:'no-mobile-tai-buki',until:'source-next-turn-end'}]};
  case 'void-break':{
   if(!Number.isInteger(nativeCost)||nativeCost<0)throw Error('Void Break benötigt verifizierte ungereduzierte Rangkosten.');
   const damage={kind:'damage',type:'chakra',amount:2*nativeCost};
   return {save:'con',onFailure:[damage,{kind:'restriction',id:'no-chakra-molding',until:'target-next-turn-end'}],onSuccess:[{...damage,multiplier:0.5}]};
  }
  case 'raining-vortex':return {onAll:[{kind:'trigger',id:'raining-vortex',until:'source-next-turn-end',perRound:1}]};
  case 'generational':return {onAll:[{kind:'protection',id:'cannot-interrupt-negate-dispel',until:'source-next-turn-end'}]};
  case 'painter':return {save:'wis',onFailure:[{kind:'temporary-condition',id:'blinded',until:'source-next-turn-end'}],onSuccess:[]};
  default:throw Error('Dieses Molding besitzt einen eigenen Ablauf statt eines einfachen Zieleffekts.');
 }
}
export function vortexCondition(keyword){const id=natureConditions[keyword];if(!id)throw Error('Nature Release für Raining Vortex eindeutig auswählen.');return condition(id,1);}
export function increaseMoldingDice(formula){
 if(typeof formula!=='string'||/\b\d*d\d+[a-z]/i.test(formula))throw Error('Unklare Schadenswürfel benötigen eine bestätigte Formel.');
 const next={4:6,6:8,8:10,10:12,12:12};
 return formula.replace(/\b(\d*)d(\d+)\b/gi,(_m,count,faces)=>{if(!next[faces])throw Error('Für diese Würfelgröße fehlt eine bestätigte Steigerung.');return `${count||1}d${next[faces]}`;});
}
