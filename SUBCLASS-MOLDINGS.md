# Unterklassen-Moldings

Stand 15.10.2026. Umfang: 27 Casting-Techniken und vier Adaptive Moldings. Drip Release und Ryo Master sind ausdrücklich ausgeschlossen, ebenso Jujutsu Sorcerer und Lunar Slayer aus dem Klassenprojekt. Das ist kein Abschluss der gesamten Klasse.

Aktivierung: dynamische Chakra-Kosten, Efficient Molding und Unterklassen-Moldings einschalten. Alle Einstellungen bleiben standardmäßig aus. Nur tatsächlich besessene, über Quellen-UUID verifizierte aktive Features gewähren Optionen. Keine Aktionsökonomie wird automatisiert.

| Technik | Umgesetzter Ablauf |
|---|---|
| Swirling Technique | Bestehende physische/elementale Condition-Ränge erhöhen. |
| Storm Terror Technique | Fünf native Bleeding-Ränge. |
| Crimson Molding | Burned nach Save; Nachteil für passende Kreaturentypen. |
| Blaze Walker Technique | S-Wirkungsrang zum bezahlten Rang +10; Fire-Würfelsteigerung und Verteidigungsbehandlung. |
| Macabre Techniques | Bestätigte Schadenskonversion; halbe DR ignorieren. |
| Sanguine Master Technique | Verteidigungen ignorieren; native Schadensbelege senken Max-HP vor temporären HP, additive einzelne Minutenfristen. |
| Gigawatt Molding | Shocked; gespeicherter Zusatzwürfel je tatsächlichem Schaden gegen Aberration/Celestial/Mutant. |
| Lightning Breaker Technique | Immunität/Resistenz ignorieren; Abfangen und Reaktionen bleiben manuell. |
| Raining Vortex | Persistenter Zieleffekt; späteren fehlgeschlagenen Nature-Save ausdrücklich bestätigen. |
| Tsunami Technique | Chilled und zeitlich begrenzte M-Komponenten-Sperre für Tai/Buki. |
| Void Break Technique | Zweimal ungekürzter Rangpreis als Chakra-Schaden, CON-Save und CM-Sperre. |
| Talent Voider | Chakra-Schaden aus nativen HP-Schadensbelegen; eigener CON-Save und 1d4+1 Zielzüge CM-Sperre. |
| Generational Molding | Zeitgebundener Schutzstatus und öffentliche Abfrage für Interrupt/Negate/Dispel; keine erfundene Counter-Engine. |
| Elitist Technique | S-Wirkungsrang; native Angriffsvorteile und Rettungswurf-Nachteile. |
| Combination Technique | Tatsächliche Helfer/Reichweite bestätigen; CHA-Modifikator +1 anzeigen. |
| Synchronization Technique | Tatsächliche Helfer/Reichweite bestätigen; CHA-Modifikator +3 anzeigen. |
| Chakra Infusion Technique | Belegte/GM-bestätigte Releases; zusätzliche Keywords und einmalige d10 gemeinsam mit nativem Grundschaden. |
| The Final Lesson | Zwei Jutsu vorab prüfen; gemeinsame passende Moldings einmal bezahlen; Fehlerjournal für GM. |
| Tectonic Plate Technique | Bruised; Condition-Verteidigungen passender Kreaturentypen ignorieren. |
| Stone Crusher Technique | Würfelsteigerung; quellengebundene Resistenz für bestätigte Wirker bis zum nächsten eigenen Zugbeginn. |
| Seal Break | Nativer CHA-Save und Sealed. |
| Scribe Master | Ursprüngliches sowie weitere feindliche Ziele ausdrücklich bestätigen; native Casting-Zieldaten. |
| Painter's Technique | Jutsu- oder bestätigter Ink-Summon-Auslöser; WIS-Save und eigene temporäre Blindheit. |
| Magnum Opus Technique | Bestätigter zweiter Ink-Cast zum halben ungekürzten Rangpreis; normaler Unterhalt. |
| Solar Interflow Technique | Verteidigungsbehandlung; bestätigter letzter Combo-Treffer, DEX gegen Ninjutsu-SG, Schockwelle/Dazed und persistenter einmaliger Finisher. |
| Charged Blade Technique | Bestätigte Waffen-/Force-Schadensart; Angriff und Angriffsschaden +floor(Jutsu-Kosten/5), maximal +5. |
| Imbuement Master Technique | Bestätigte Angriffsgruppen/Conditions; ein CON-Save, bei Fehlschlag um fünf genau ein kritischer Angriff; gesamte DR einmal. |
| Rejuvenating Molding | Fünf Chakra; tatsächliches Hit Die wählen und verbrauchen, native Heilung. |
| Overdrive Molding | Fünf Chakra; temporärer Bewegungsbonus; Dash/Disengage manuell. |
| Survival Molding | Fünf Chakra; temporäre AC und nichtpsychische DR, negativer INT ergibt 0 DR. |
| Tactical Molding | Fünf Chakra; temporär +2 STR/DEX/CON-Saves. |

## Bedienung und Grenzen

Passende Castingoption wählen; danach an der Jutsu-Chatkarte betroffene Kreaturen bestätigen. Der aktive GM wendet gespeicherte Zielanfragen an. Zusätzliche Saves verwenden native Würfe. Bei einem bereits fälligen ursprünglichen Save wird dessen Ergebnis ausdrücklich bestätigt. Reichweite, tatsächlicher Treffer, beteiligte Wirker, organische Konstrukte und textliche Voraussetzungen werden nicht geraten.

Adaptive Moldings stehen im Features-Tracker. Painter bietet dort bestätigte Ink-Summon-Auslöser. Solar-Finisher bleiben nach Reload an Chatkarte und Tracker verfügbar. Abbrüche bezahlen keine Castingkosten; technische Teilfehler bleiben zur GM-Prüfung gesperrt. Eine bereits gespeicherte Solar-Rabattzahl wird beim erneuten Öffnen nicht neu gewürfelt.

Molding-Zusätze kommen nach Jutsu-Rabatten/Recovery hinzu. Zwingende 10-Chakra-Techniken lassen sich nicht kostenlos bezahlen. Final Lesson und Magnum Opus sind wie bestätigt nicht gleichzeitig erlaubt. Magnum-/Solar-Preisvorteile senken den Unterhalt nicht zusätzlich.

Sanguine-Verluste haben eigene Minutenfristen; ihr Ende heilt keine aktuellen HP. Turn-Fristen folgen tatsächlichen Actor-Zügen. Außerhalb eines Kampfes oder bei nicht mehr zuordenbarer Initiative werden solche Wirkungen manuell über die eigenen Bedienelemente beendet. Originaldaten fremder Effekte werden erhalten.

Generational stellt Schutzstatus und API bereit; externe Counter-/Dispel-Workflows müssen diesen abfragen. Weitere Combination-Grundregeln bleiben entsprechend der Nutzerentscheidung manuell. Gleichzeitige Schreibvorgänge mehrerer unabhängiger Clients sind nicht durch serverseitige atomare Transaktionen abgesichert. Echte Spieler-/GM-Mehrclient-Tests sowie jede mögliche Fremdmodul- und Molding-Kombination sind nicht verifiziert.

Nachweise und ausgeführte Tests: [TESTING.md](TESTING.md). Regeln und bestätigte Auslegungen: ../../SUBCLASS-MOLDING-SOURCES.json und ../../SUBCLASS-MOLDING-DECISIONS.md im Entwicklungsprojekt.

Auch Infusion-Zusatzwürfel folgen der bestätigten Jutsu-Schadenskonversion (Macabre/Charged Blade); eigene angriffsgebundene Schadensboni werden dabei nicht ein zweites Mal addiert. Verwaltete native Use-Zeilen/Zähler werden bei aktiver Molding-Automation zugunsten des Casting-/Trackerablaufs ausgeblendet, ohne Featuredaten zu löschen.
