export function registerMedicalCosts(registry,maintainRegistry){
 for(const [rank,value]of Object.entries({d:1,c:2,b:3,a:4,s:5})){
  registry.register({id:'medical.healing-touch.'+rank,source:'Compendium.n5eb.subclass.Item.R8QhKGU9VYbs6Miu',label:'Healing Touch',rankReduction:true,filters:{featuresAll:['n5ese.medical-healing-touch'],keywordsAll:['medical'],ranks:[rank]},change:{operation:'add',value:-value}});
  registry.register({id:'medical.research.'+rank,source:'Compendium.n5eb.class.Item.KKxP2FUeeJ7Vw3iz',label:'Advanced Medical Research · bestätigte Eigenentwicklung',rankReduction:true,filters:{featuresAll:['n5ese.medical-research'],keywordsAll:['medical'],ranks:[rank]},change:{operation:'add',value:-value}});
 }
 for(const value of [1,2])maintainRegistry.register({id:'medical.fortifying.'+value,source:'Compendium.n5eb.t7-subclass.Item.YpCGlAFc61uP4OWQ',label:'Fortifying Scripture',filters:{featuresAll:['n5ese.medical-fortifying-'+value]},change:{operation:'add',value:-value},minimumCost:1});
}
