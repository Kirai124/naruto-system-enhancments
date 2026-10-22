# Taijutsu Specialist · Gruppenfassung 0.17.0

Die Implementierungsrunde umfasst die Grundklasse, die installierten Martial Techniques und alle 14 vorhandenen Unterklassen.135 Quellfeatures sind in der [Einzelcheckliste](TAIJUTSU-SPECIALIST-CHECKLISTE.md) erfasst. Das ist eine ungeprüfte Implementierungsfassung; Spiel-, Unit-, Browser-, visuelle und Foundry-Integrationstests wurden auf ausdrücklichen Nutzerwunsch nicht ausgeführt.

## Einschalten und Bedienung

Nach dem Aktualisieren das lokale Foundry neu laden. **Taijutsu Specialist: Klassenautomation** ist standardmäßig ausgeschaltet. Die Weltsetting aktivieren, wenn ihr die Klassenabläufe verwenden wollt. Nur tatsächlich vorhandene, anhand ihrer Systemquelle erkannte Features und freigeschaltete Klassenstufen geben Optionen frei. Kompendiumseinträge allein gewähren keine Fähigkeiten.

Im Features-Bereich des Charakterbogens erscheinen die Klassenaktionen, Ressourcen und gespeicherten Wirkungen. Zuerst tatsächlichen Unarmed-/Waffenkontext und gegebenenfalls feste Unterklassenwahlen festlegen. Castingoptionen erscheinen im vorhandenen Jutsu-Dialog. Bezahlte Gegenangriffe, Zielanfragen und unterbrochene Vorgänge behalten ihre eigenen Journale. Fremde Ziele werden über die gespeicherte GM-Anwendung behandelt.

Der native Martial-Pool wird im Kampf zum tatsächlichen eigenen Zugbeginn erneuert. Außerhalb des Kampfes den neuen eigenen Zug ausdrücklich bestätigen. Elemental Armor bezahlt anschließend seinen Unterhalt; ohne verfügbaren Die endet die verstärkte Form. Aktionsökonomie wird weiterhin von euch verwaltet.

## Sondercasts und Treffer

- **Oppressive Soul:** Tatsächliche Aktivierungsziele bestätigen, dann den vorbereiteten nativen Aura-Cast öffnen. Bei tatsächlicher Soul-Manifestation-Aktivierung halber ungekürzter Rangpreis, aufgerundet, vor erlaubten Rabatten; optionaler Aura-Zusatz3 Chakra. Fremde Zuschläge bleiben spät. Halber Preis ist mit dem Martial-Technique-Festpreis nicht kombinierbar; der Sondercast wählt diesen freiwilligen Festpreis zunächst ab. Native Konzentration bleibt erhalten, der entsprechende Aktivierungscast bezahlt keinen Chakra-Unterhalt. STR-Saves und CON-Wiederholungen am Zielzugende laufen über gespeicherte Zielvorgänge. Verlassen des Bereichs bestätigen; nur die eigene Aura endet. Ab Stufe 10 ist nach einem gespeicherten fehlgeschlagenen Wiederholungswurf ein zusätzlicher mentaler Rang für 5 Chakra verfügbar.
- **Instinctual Inversion:** Ursprüngliche noch unangewendete Fläche und bekanntes Dragon-Soul-Jutsu wählen. Im normalen Castingdialog Chakra und rangabhängige Martial Dice gemeinsam bezahlen. Danach genau einen gespeicherten Abwehrwurf ausführen. Restschaden nach Schadensarten bestätigen; ab vollständiger Abwehr Save-Vorteil, ab150 Prozent automatisch gelungener Save. Rest vor den eigenen Verteidigungen abziehen und genau einmal über die gespeicherte Anfrage anwenden. Kartenfläche und Schutzraum hinter dem Wirker bleiben manuell.
- **Interpose / Shield Bash:** Den defensiven Reaktions-Taijutsu bei Interpose zunächst normal wirken und seine tatsächlichen Effekte anwenden, dann den bezahlten Cast verknüpfen. Keine zweite Chakra-Zahlung. Shield Bash bezahlt seinen Die vor dem Treffer; anschließend tatsächlichen Shove mit dem Angriffsergebnis bestätigen und Originaltreffer plus Martial Die gemeinsam anwenden. DR wird einmal behandelt.
- **Martial Focus / Leviathan:** Tatsächlich geführtes Waffenprofil freiwillig auswählen. Inventarprofile werden nicht überschrieben. Der Leviathan-Verbündete verwendet sein eigenes vorhandenes Unarmed-Profil, den bestätigten Angriffsbonus des Wirkers und dessen Martial Die. Der GM führt fremde Actors aus; Bewegung und Waffenübergabe selbst ausführen.
- **Quarterstaff Expert:** Keine DR, Resistenz oder sonstigen Schadenssenkungen; Immunitäten und temporäre HP bleiben wirksam. Erster ursprünglicher Save je Ziel mit Nachteil. Gemischte oder außergewöhnliche Fremdabläufe zuerst mit dem GM abgrenzen.
- **Source Code / The One:** Ursprüngliche Würfe bleiben erhalten. Bullet Time speichert den zusätzlichen d20 beziehungsweise den Zusatz zum genauen nächsten Save. No Chakra verwendet SG10 und beendet nur bestätigte Wirkungen des betreffenden Jutsu. Für einen gestoppten einzelnen Fernkampftreffer bei The One genau den zugehörigen Schadensbeleg verknüpfen; andere Treffer werden nicht pauschal gesperrt.

## Bewusst manuelle Grenzen

- Aktionen, Bonusaktionen, Reaktionen, tatsächliche Reichweiten, Allianzen und Tokenbewegung bleiben manuell. Ausdrückliche Featuresperren werden trotzdem berücksichtigt.
- Grundfähigkeiten der Stances bleiben nach Vereinbarung beim bestehenden Regeltext. Stancer-Klassenkosten, Gleichzeitigkeit und Boni sind angebunden.
- Das tatsächliche Grapple-, Trip- oder Shove-Ergebnis bestätigen, wo das installierte System keine eindeutige Vergleichsregel bereitstellt. Ground Fighting zeigt die5-Fuß-Aufstehregel und erlaubt das Entfernen tatsächlicher Prone-Beiträge; reine Prone-Wurfvorteile/-nachteile im nativen Wurfdialog passend berücksichtigen.
- Gas-/Nebelzonen, Teleportation, Bewegungshindernisse, Flächenschablonen und sonstige Kartenphysik werden nicht simuliert. Konkrete reine Abwehrwirkungen können bestätigt werden.
- Nicht strukturierte fremde oder zusammengesetzte Effekte, komplexe Custom-/Munitions-Waffenprofile, gemischte geschützte/ungeschützte kritische Treffer und gemischte Psychic-/Chakra-Iron-Heart-Transfers benötigen eine gezielte GM-Abwicklung.
- Lernvoraussetzungen und tatsächliche Downtime-Buchungen bleiben im vorhandenen Ablauf. Dragon Soul stellt Martial Arts als Alternative zu Chakra Control sowie einen nicht stapelnden Zeitrechner bereit; Nin-Tai zeigt seine bestätigten Attributsvoraussetzungen. Schildnachfertigung zieht100 Ryō ab, die tatsächlich geleistete Downtime wird separat bestätigt und gebucht.
- Mehrere Klassen-Spezialtreffer auf derselben Schadensinstanz gemeinsam mit dem GM abwickeln; denselben Originalschaden nicht über mehrere unabhängige Buttons anwenden.

## Unterbrechungen und Gruppenprüfung

Öffnen oder Abbrechen eines vorbereiteten Castingdialogs verbraucht keine neuen Cast-Ressourcen. Nach Zahlung, Würfeln oder einer technischen Teilanwendung werden Journale bei unklarem Ausgang zur GM-Prüfung gesperrt. Nicht blind erneut klicken oder Casts wiederholen; zuerst bereits erfolgte Zahlungen, Würfe, HP und Effekte prüfen. Automatische Wiederholung oder pauschale Rückzahlung würde bereits angewendete Schritte duplizieren.

Die statische Syntax-/Importprüfung bestätigt lediglich lesbaren, verknüpfbaren Quellcode. Die Gruppe prüft Ressourcen, native Dialoge, tatsächliche Effekte, Zugwechsel, Reload und Zusammenspiel der Klassen später gemeinsam. Produktionswelt, Originalsystem und Class Mod Library wurden nicht verändert.
