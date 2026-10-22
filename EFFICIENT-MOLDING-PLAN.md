# Efficient Molding — Regeln und Integrationsstand

Aktueller Zusatzstand 0.13.0: 27 Casting- und vier Adaptive-Unterklassen-Moldings sind integriert; Drip Release und Ryo Master sind ausdrücklich ausgeschlossen. Dieser ursprüngliche Plan enthält darunter den historischen Stand 0.12. Details: SUBCLASS-MOLDINGS.md und TESTING.md im Modulverzeichnis.

Stand: 2026-10-13, Version 0.12.0: alle 17 Standardoptionen integriert.

## Vereinbart

- Normale Moldings zuerst; Unterklassen folgen separat.
- Vorhandene, aktive Charakter-Features mit bestätigter Compendium-Quelle sind der Besitznachweis. Kompendiumsexistenz allein gewährt nichts.
- Passende Castingoptionen im bestehenden Dialog; spätere Auslöser an der Chatkarte; kompakter gemeinsamer Zähler im Sheet.
- Gemeinsame Nutzungen zuerst. Verbleibende kostenlose Nutzungen sind zuweisbar; teuerste Optionen werden vorgeschlagen.
- Alternative Molding-Kosten separat nach Jutsu-Rabatten und Chakra Recovery. Nur ausdrücklich auf Moldings bezogene Rabatte reduzieren diesen Zusatz.
- Transmogrified erlaubt nur STR ↔ DEX und WIS ↔ CHA. CON und INT bleiben ausgeschlossen.
- Potent maximiert ausschließlich ursprüngliche Jutsu-Würfel; zusätzliche Feature-Würfel werden normal gewürfelt.
- Aktionsökonomie bleibt manuell. Änderungen an Wirkzeit-Metadaten dürfen keine neue Aktionsabrechnung auslösen.

## Quellen und Ressourcen

Basisfeature: `Compendium.n5eb.class.Item.FsvDzBMGBKvUj93O`.
Installierte Klassen-Auswahl enthält 17 Optionen. Das ItemChoice-Advancement unterstützt Lernen und Wechsel beim Klassenaufstieg bereits; dessen Inventar wird wiederverwendet.

Bekannte Optionen: 2 ab Klassenstufe 3, jeweils +1 ab 5/9/13/18.
Gemeinsame Nutzungen: 2 ab Stufe 3, 3 ab 9, 4 ab 15.
Basisdaten enthalten Short-Rest-Recovery (`uses.per = sr`); native Migration und tatsächliche Rest-Abrechnung müssen im Integrationstest geprüft werden.

| Option | Alternative Chakra | Geplanter Ablauf |
|---|---:|---|
| Careful | 5 je Gruppe bis 3 Kreaturen | Geschützte Ziele bestätigen; Zusatzgruppen bezahlen |
| Distant | 3 | Reichweite verdoppeln, Touch → 30 ft |
| Doubled | D/C/B/A/S: 4/8/12/15/20 | Zulässigkeit als Einziel-Jutsu prüfen, zweites Ziel bestätigen |
| Echoing | 5 | Einmaligen Folge-Cast mit gleichem Rang/Ziel speichern |
| Extended | 5 | Dauer ×10, Grenzen 10 Minuten mit Konzentration / 24 Stunden ohne |
| Focused | 4 | Konzentrationsprüfung bewusst automatisch bestehen lassen |
| Heightened | 5 | Ein Ziel, dessen erster Rettungswurf mit Nachteil |
| Piercing | 5 | Castbezogene Verteidigungsbehandlung; keine dauerhafte Zieländerung |
| Potent | D/C/B/A/S: 3/5/7/9/12 | Ursprüngliche Schadenswürfel maximieren |
| Precise | 3 je Angriff | Ausgewählten Angriff mit Vorteil würfeln |
| Quickened | 5 | Wirkzeit dieses Casts Bonusaktion anzeigen |
| Reactive | 6 | Wirkzeit dieses Casts Reaktion anzeigen; nur eigener Zug |
| Redirected | 5 | Bestätigten Fehlschlag neu würfeln, zweites Ergebnis maßgeblich |
| Subtle | 3 | Handsigns für diesen Cast entfernen |
| Tenacious | 5 | Bestätigter Clash/Counter/Dispel/Interrupt; +1d10 / SG +3 |
| Transmogrified | 9 | Bestätigte Rettungswurf-Gruppe wechseln |
| Widened | 4 | Formabhängige Fläche vergrößern; Line/Cylinder-Achse wählen |

Nur ein reguläres Molding pro Cast. Focused, Heightened, Piercing, Redirected und Subtle erlauben ausdrücklich Kombination mit anderen Moldings. Careful erlaubt ausdrücklich das Combination-Keyword; die übrigen Basisoptionen erben dessen Ausschluss aus Efficient Molding.

## Implementiert und geprüft

Alle 17 normalen Moldings sind an den vorhandenen Castingdialog, native Würfe und Chatkarten angeschlossen. Gemeinsamer Pool mit nativer Rast, frei zuordenbare kostenlose Nutzungen, separate Chakra-Zusätze, kompakter Sheet-Zähler und GM-Korrektur. Unterklassen-Moldings folgen separat. Aktionsökonomie bleibt manuell.

175 Unit-Tests, 8 native Basisassertionen, 40 Workflowassertionen, 5 tatsächliche Reload-Prüfungen und separat bediente Casting-/Tracker-UI. Details und Einschränkungen: [TESTING.md](TESTING.md).

Weitere bestätigte Entscheidungen: Echoing außerhalb des Kampfes mit ausdrücklicher Zeitbestätigung; halben Schaden vor Zielverteidigungen aufrunden. Tenacious trennt Clash und Counter-SG; unbekannter Basis-SG wird eingegeben. Shocked verdoppelt nur den Jutsu-Anteil, niemals den separaten Molding-Zusatz.

## Verbleibender separater Umfang

Unterklassen-Moldings einschließlich ihrer Rabatte, Kombinationen und Spezialwährungen. Nicht bestätigte Flächenformen/Einheiten, textliche Zielbeschränkungen und echte Mehrclient-Parallelität werden nicht aus Namen geraten. Der normale Molding-Meilenstein umfasst keine allgemeine Counter-/Dispel-Regelengine.
