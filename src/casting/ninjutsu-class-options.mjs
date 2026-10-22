import {isSummoningTechnique} from './ninjutsu-selections.mjs';
import {MODULE_ID} from '../settings/register.mjs';
import {NINJUTSU_FEATURE_SOURCES as S} from './ninjutsu-feature-sources.mjs';
import {ownedNinjutsuFeature,jutsuType} from './ninjutsu-selections.mjs';
import {ninjutsuLevel} from './ninjutsu-resources.mjs';
import {isRefined} from './refined-ninjutsu.mjs';
export const classFeature=(a,name)=>ownedNinjutsuFeature(a,S[name]);
export const rankNumber=rank=>({d:1,c:2,b:3,a:4,s:5}[rank]??0);
export function classOptions(activity){
 const item=activity?.item,a=item?.actor;if(item?.type!=='spell'||!a)return [];
 const keys=new Set(item.system.jutsu.keywords),nin=jutsuType(item)==='ninjutsu'||keys.has('ninjutsu'),refined=isRefined(item),nature=['earth','wind','fire','water','lightning'].some(k=>keys.has(k)),types=[...(activity.damage?.parts??[])].flatMap(p=>[...(p.types??[])]),blood=types.some(t=>['acid','necrotic','poison'].includes(t)),ink=/beast\s+imitating\s+art/i.test(item.name),summoning=isSummoningTechnique(item),out=[];
 const add=(name,choices,eligible=true,limited=false)=>{const feature=classFeature(a,name);if(feature&&eligible)out.push({name,feature,limited,multiple:['Unstoppable Gale','Aqua Soul','Force Of Nature','Pure Skill'].includes(name),choices:choices.map(([value,label])=>({value,label}))});};
 add('Soshikage',[['damage','Bei fünf ausgegebenen Elemental Motes: +3× Ninjutsu-Attribut Schaden']],nin&&nature);
 add('Enhancement Master',[['finisher','Imbuerte Waffe bestätigen; gespeichertes Jutsu bis Zugende als kostenlosen Finisher freigeben']],jutsuType(item)==='bukijutsu'&&keys.has('combo'));
 add('Realized Scroll',[['retain','Seal nach diesem Cast einmal behalten'],['cost','Rangabhängiger Scroll-Rabatt'],['clash','Fuinjutsu-Clash mit Vorteil']],!!item.getFlag?.(MODULE_ID,'scrollSeal'));
 add('Fuinjutsu Sennin',[['convert','Doppelte Kosten: Nature Release aus eigenem Seal wechseln']],!!item.getFlag?.(MODULE_ID,'scrollSeal')&&nature&&types.length>0);
 add('Breath of Life',[['activate','Unbewaffnete Angriffe / Taijutsu zeitlich verstärken']],nin);
 add('Ninjutsu Imbuement',[...(nin?[['store','In tatsächliche Waffe speichern statt Jutsu-Wirkung']]:[]),...(jutsuType(item)==='bukijutsu'?[['weapon','Tatsächlich imbuerte Waffe als Komponente; Zusatzwürfel']]:[])],nin||jutsuType(item)==='bukijutsu');
 add('Summoning Adept',[['quick','Als Aktion beschwören; Nutzung oder einen Chakra Die']],summoning);
 add('Deadly Tradition',[['reaction','Bei Schaden an dir / Verbündetem als Reaktion wirken']],nin&&keys.has('hijutsu')&&(activity.activation?.type==='action'||activity.activation?.type==='bonus'&&!!classFeature(a,'Hijutsu Master')),true);
 add('Jutsu Breaker',[['breaker','Als bestätigter Jutsu-Breaker-Cast; Clash ermöglichen']],nin&&activity.activation?.type==='action',true);
 add('Lightning Tamer',[['overcharge','Overcharge bestätigen; Nutzung oder einen Chakra Die verbrauchen']],nin&&keys.has('lightning'));
 add('Lightning Release',[['attack','Bis zu zwei Angriffe gegen Shocked mit Stufenbonus'],['cost','Overcharge ausdrücklich bestätigen: Rangrabatt']],nin&&keys.has('lightning'));
 add('Versatile Release',[['attack','Bis zu zwei Angriffe gegen Elemental-Condition mit Stufenbonus'],['dr','Rangabhängige DR ignorieren']],nin&&nature);
 add('Lightning Release Master',[['advantage','Gegen Shocked: Angriffsvorteil / Save-Nachteil']],refined&&keys.has('lightning'),true);
 add('Wind Release',[['range','Reichweite nach Rang erhöhen'],['area','Fläche nach Klassenstufe erhöhen']],nin&&keys.has('wind'));
 add('Fire Release',[['damage','Zusätzliche Fire-Würfel nach Klassenstufe'],['push','10 Fuß zurückstoßen (bestätigte Zielaktion)']],nin&&keys.has('fire'));
 add('Water Release',[['water','Wasserquelle speichern'],['temp','Temporäre HP nach Rang']],nin&&keys.has('water'));
 add('Earth Release',[['dr','Typbezogene DR nach Rang wählen'],['construct','Konstrukt: zusätzliche HP würfeln']],nin&&keys.has('earth'));
 add('Hijutsu Specialization',[['range','Reichweite nach Rang erhöhen'],['cost','Rangrabatt auf Wirkkosten']],nin&&keys.has('hijutsu'));
 add('Hemomantic Specialization',[['temp','Temporäre HP bis nächsten eigenen Zugbeginn'],['corroded','Zusätzlichen Corroded-Rang bestätigt anwenden']],nin&&blood);
 add('Void Specialization',[['concentration','−3 auf betroffenen Konzentrationswurf bestätigen'],['clash','−3 auf betroffenen Clash bestätigen']],nin&&!nature);
 add('Fuinjutsu Specialization',[['components','CS und CM ignorieren'],['chakra','Bestätigtes Sealed-Ziel: Chakra-Schaden']],nin&&keys.has('fuinjutsu'));
 add('Ink Affinity',[['temp','Ink Summon: temporäre HP'],['cost','Wörtlicher rang-/stufenabhängiger Rabatt']],nin&&ink);
 add('Flash Fire',classFeature(a,'Fire Release Master')?[['damage','Ninjutsu-Attribut + Klassenstufe Zusatzschaden'],['double-damage','Doppelter Flash-Fire-Zusatzschaden']]:[['damage','Ninjutsu-Attribut + Klassenstufe Zusatzschaden']],nin&&keys.has('fire'),true);
 add('Storm Herald',[['trigger','Bedingungsschaden bestätigter Ziele auslösen']],nin&&keys.has('wind'),true);
 add('Frigid Deep',[['slow','Bestätigte Ziele: Bewegung −15 / 0 bei Water Master']],nin&&keys.has('water'),true);
 add('Bloody Evocation',[['convert','Necrotic-Schaden; Condition-Konversion an bestätigten Zielen']],nin&&blood,true);
 add("Mountain's Aegis",[['aegis','Verbündete: einmalige Schadensreduktion']],nin&&keys.has('earth'),true);
 add('Inferno Fury',[['plant','Doppelter Schaden gegen Plants ohne doppelte Verwundbarkeit'],['damage','Ein Schadenswurf +Proficiency'],['clash','Water-Clash: gegnerischen Elementvorteil aufheben']],refined&&keys.has('fire'));
 add('Unstoppable Gale',[['flying','Doppelter Schaden gegen fliegende/schwebende Ziele'],['flight','Flug bis nächsten eigenen Zugbeginn'],['clash','Fire-Clash: gegnerischen Elementvorteil aufheben']],refined&&keys.has('wind'));
 add('Aqua Soul',[['water','B-Rang-Wasserquelle mit zwei Nutzungen'],['damage','Ein Schadenswurf +Proficiency'],['clash','Earth-Clash: gegnerischen Elementvorteil aufheben']],refined&&keys.has('water'));
 add('Pure Chakra',[['resistance','Bestätigtes Ziel: passende Resistenzen bis nächsten eigenen Zugende entfernen'],['damage','Ein Schadenswurf +Proficiency'],['clash','Clash mit Vorteil']],refined&&!nature);
 add('Destructive Ichor',[['damage','Ein Schadenswurf +Ninjutsu-Attribut'],['conditions','Bestätigte Condition-Saves: zusätzlicher Rang'],['clash','Ein Blood Vial für Clash-Vorteil']],refined&&!nature);
 add('Wrathful Jolts',[['critical','Kritischer Treffer 18–20'],['maximum','Save um mindestens 5 verfehlt: ursprüngliche Würfel maximieren'],['clash','Wind-Clash: gegnerischen Elementvorteil aufheben']],refined&&keys.has('lightning'));
 add('Stones Tenacity',[['temp','Temporäre HP nach Rang bis nächsten eigenen Zugbeginn'],['critical','Konstrukt/THP: kritischen Zusatzschaden verhindern'],['clash','Lightning-Clash: gegnerischen Elementvorteil aufheben']],refined&&keys.has('earth'));
 add('Force Of Nature',[['mote','Zusätzlichen Elemental Mote bestätigt erzeugen'],['damage','Ein Schadenswurf +Proficiency'],['clash','Verlorenen Clash ausdrücklich neu würfeln']],refined&&nature);
 add('Generational Greatness',[['inertia','Bei Save-Fehlschlag um 5: Inertia bestätigt erzeugen'],['upcast','Doppelte Upcast-Schritte bis Klassenmaximum'],['clash','Clash mit Vorteil']],refined&&keys.has('hijutsu'));
 add('Taijutsu Incorporation',[['attack','Ein Angriff +1d4'],['ac','AC +1 bis nächsten eigenen Zugbeginn']],keys.has('ninjutsu')&&jutsuType(item)==='taijutsu');
 add('Bukijutsu Incorporation',[['damage','Ein Schadenswurf +1d4'],['disengage','Disengage bestätigen; Aktion bleibt manuell']],keys.has('ninjutsu')&&jutsuType(item)==='bukijutsu');
 add('Battle Tendency',[['attacks','Zusätzliche unbewaffnete Angriffe ohne Attributschaden vorbereiten'],['push','Treffer: 10 Fuß zurückstoßen; bei Schutz STR-Save'],['clash','Clash-Vorteil; Elementüberlegenheit bestätigen']],refined&&jutsuType(item)==='taijutsu');
 add('Pure Skill',[['damage','Berechtigtes Ziel: +2× Proficiency'],['str','Save STR; Waffenschadensart bestätigen'],['con','Save CON; Waffenschadensart bestätigen']],refined&&jutsuType(item)==='bukijutsu');
 for(const [name,key] of [['Wind Release Master','wind'],['Fire Release Master','fire'],['Water Release Master','water'],['Earth Release Master','earth'],['Hijutsu Master','hijutsu']])add(name,name==='Hijutsu Master'?[['empower','Resistenz ignorieren; Reichweite verdoppeln'],['area','Resistenz ignorieren; Fläche verdoppeln']]:name==='Earth Release Master'?[['empower','Doppelte Kosten: Reichweite / Gelände'],['construct-hp','Tatsächliches Konstrukt: HP verdoppeln'],['construct-dr','Tatsächliches Konstrukt: DR verdoppeln']]:[['empower','Meisterverstärkung wählen']],refined&&keys.has(key),true);
 add('Kiyo',[['surge','Doppelte Kosten: Verbündete innerhalb 60 Fuß gegen nächsten Nin-/Gen-Save schützen']],nin&&!nature);
 add('Sanguine Elite',[['empower','Doppelte Kosten; Ziele = aktuelle Blood Vials; kein Chakra Recovery']],refined&&blood&&!activity.target?.template?.type&&Number(activity.target?.affects?.count)===1);
 add('Fusion of the Body and Soul',[['empower','Doppelte Kosten, Force, Reichweite ×3 und Würfelsteigerung']],refined&&jutsuType(item)==='taijutsu',true);
 return out;
}
export function selectedClassOptions(activity,configuration={}){const available=classOptions(activity),out=[];for(const [name,raw] of Object.entries(configuration)){if(!raw||raw==='none')continue;const values=typeof raw==='object'?Object.keys(raw).filter(k=>raw[k]===true):[raw],rule=available.find(r=>r.name===name);if(!values.length)continue;if(!rule||!rule.multiple&&values.length>1||values.some(value=>!rule.choices.some(c=>c.value===value)))throw Error('Ungültige Klassenoption: '+name);if(name==='Pure Skill'&&values.includes('str')&&values.includes('con'))throw Error('Pure Skill: entweder STR oder CON wählen.');for(const value of values)out.push({...rule,value});}return out;}
export function classCostChanges(item,configuration={},rank,base,{excludeReductions=false,minimumCost=0,rankExclusive=false,existingRankReduction=0}={}){
 const activity=[...(item.system.activities??[])].find(a=>a.id===configuration?.activityId)??[...(item.system.activities??[])][0];if(!activity)return {cost:base,noRecovery:false};
 const choices=selectedClassOptions(activity,configuration?.choices??{}),r=rankNumber(rank),level=ninjutsuLevel(item.actor),reductions=[];
 if(!excludeReductions){if(classFeature(item.actor,'Empowered Summoning')&&isSummoningTechnique(item))reductions.push(r);for(const c of choices){if(c.value==='cost'&&['Hijutsu Specialization','Lightning Release','Realized Scroll'].includes(c.name))reductions.push(r);if(c.value==='cost'&&c.name==='Ink Affinity')reductions.push(rank==='d'?1:rank==='c'&&level>=5?2:rank==='b'&&level>=9?3:rank==='s'&&level>=17?5:rank==='s'&&level>=13?4:0);}}
 const reduction=rankExclusive?Math.max(0,...reductions)-existingRankReduction:reductions.reduce((a,b)=>a+b,0),cost=Math.max(Math.min(base,minimumCost),base-Math.max(0,reduction)),doubles=choices.filter(c=>c.value==='surge'||c.name==='Fuinjutsu Sennin'&&c.value==='convert'||c.value==='empower'&&c.name!=='Hijutsu Master').length;
 return {cost:cost*2**doubles,noRecovery:choices.some(c=>c.name==='Sanguine Elite')};
}
