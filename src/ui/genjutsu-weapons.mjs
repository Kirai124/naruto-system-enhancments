import {recordWeaponPosition} from '../foundry/genjutsu-casting-origins.mjs';
import {ownedGenjutsuFeature} from '../casting/genjutsu-context.mjs';
import {illusionaryWeaponAvailable,illusionaryWeaponStage} from '../casting/genjutsu-weapons.mjs';
import {illusionaryWeapons,summonIllusionaryWeapons,setIllusionaryWeaponDistance,dismissIllusionaryWeapons,rollIllusionaryWeaponAttack} from '../foundry/genjutsu-weapons.mjs';

export function addIllusionaryWeaponControls(game,actor,panel,button){
 if(!ownedGenjutsuFeature(actor,'Illusionary Weapon','Choose Inception'))return;
 const distance=illusionaryWeaponStage(actor)>=2?30:5,heading=document.createElement('strong');heading.textContent='Illusionary Weapon · höchste Verbesserung +'+illusionaryWeaponStage(actor);panel.append(heading);
 button('Illusionary Weapon – Waffenform erzeugen',()=>summonIllusionaryWeapons(game,actor));
 for(const weapon of illusionaryWeapons(actor)){
  const available=illusionaryWeaponAvailable(game,actor,weapon),line=document.createElement('p');line.textContent=weapon.profile.name+' · '+(available?'aktiv':'beendet')+(available&&Number.isFinite(weapon.separatedAt)?' · außerhalb '+distance+' ft, zerfällt in '+Math.max(0,Math.ceil(weapon.separatedAt+60-game.time.worldTime))+' s':'');panel.append(line);if(!available)continue;
  button(weapon.profile.name+' – Genjutsu-Angriff',()=>rollIllusionaryWeaponAttack(game,actor,weapon.id));
  button(weapon.profile.name+(Number.isFinite(weapon.separatedAt)?' – wieder innerhalb ':' – jetzt außerhalb ')+distance+' ft bestätigen',()=>setIllusionaryWeaponDistance(game,actor,weapon.id,!Number.isFinite(weapon.separatedAt)));
  if(ownedGenjutsuFeature(actor,'Ultimate Illusionary Weapon','Malleable Mirages'))button(weapon.profile.name+' – tatsächliche Position festhalten',()=>recordWeaponPosition(game,actor,weapon.id));
  button(weapon.profile.name+' – auflösen',()=>dismissIllusionaryWeapons(game,actor,weapon.id));
 }
 const hint=document.createElement('small');hint.textContent='Abstand der Waffenform ausdrücklich nachführen. Neue Aktivierung ersetzt vorherige Waffen. Illusionäre Fernkampfwaffen verbrauchen keine echte Munition; Loading und Aktionsökonomie bleiben manuell. Vicious Illusion und Reaktionsangriffe nutzt ihr ebenfalls manuell. Smite ist an der Angriffskarte verfügbar. Supreme-Infusion und Illusionary Bukijutsu wählt ihr im bestehenden Jutsu-Castingdialog.';panel.append(hint);
}
