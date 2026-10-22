import {increaseMoldingDice} from './subclass-molding-effects.mjs';
/** Same verified d4/d6/d8/d10/d12 ladder; preserve maximization only on its original terms. */
export function stepDamageDice(formula){formula=String(formula);const plain=formula.replace(/\b(\d*)d(\d+)min\2\b/gi,'$1d$2');increaseMoldingDice(plain);return formula.replace(/\b(\d*)d(\d+)(min\2)?\b/gi,(_m,n,f,max)=>{const next=Number(increaseMoldingDice('1d'+f).slice(2));return (n||1)+'d'+next+(max?'min'+next:'');});}
