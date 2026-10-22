/** Reuse the installed namespace export; no dice are evaluated again. */
export function groupRolledDamage(rolls){
 const aggregate=game.n5eb.dice.aggregateDamageRolls;
 if(typeof aggregate!=='function')throw Error('Native Schadensgruppierung nicht verfügbar.');
 return aggregate(rolls,{respectProperties:true}).map(roll=>({type:roll.options.type,value:Math.max(0,roll.total),properties:[...(roll.options.properties??[])]}));
}
