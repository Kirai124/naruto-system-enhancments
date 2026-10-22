# 0.17.0 · 21.10.2026 · Taijutsu Specialist, Gruppenfassung

- Grundklasse, installierte Martial Techniques und14 Unterklassen als optionale Gruppenfassung.
- Native Ressourcen, Casting-/Sondercast-Tickets, gespeicherte Ziel-/GM-Anfragen, Waffenprofile, Schutz-/Abwehrabläufe, Zugereignisse und Nachwirkungen.
- Letzte Ergänzungen: Oppressive Soul, Instinctual Inversion, Iron Combat, Leviathan, Quarterstaff Expert, Dragon-Soul-Skill-/Lernkontext und ursprünglicher Schild/Nachfertigung.
- Manuelle Aktionsökonomie, Stance-Grundfähigkeiten und dokumentierte unstrukturierte Grenzfälle bleiben erhalten.
- Ausschließlich statische Syntax-/Importprüfung; keine Spiel-, Unit-, Browser-, visuellen oder Foundry-Integrationstests auf Nutzerwunsch.

## Unveröffentlicht · Fortsetzung 21.10.2026

Nin-Tai-Grundabläufe, automatischer Armor-Unterhalt und Catalyst-Kurzschluss sowie Tempest-/Realized-Soul-Teilabläufe ergänzt. Vollständiger aktueller Umfang und offene Punkte im [Arbeitsstand](TAIJUTSU-ARBEITSSTAND.md). Nicht installiert; keine Spielprüfung.

## Unveröffentlicht · Taijutsu-Arbeitsstand 20.10.2026

Stancer, Ruin-Treffer/Casting sowie Teile von Ironclad, Tempest und Matrix ergänzt. Gesamtklasse weiterhin unvollständig, nicht installiert und nicht spielgeprüft. Aktueller Umfang und Grenzen: [Arbeitsstand](TAIJUTSU-ARBEITSSTAND.md), [Einzelstatus](../TAIJUTSU-IMPLEMENTATION-STATUS.json). Installierte Version bleibt0.16.0.

## 0.16.0 — 2026-10-18

- Medical-Nin: optionale Grundklasse, vier vorhandene Doctrines und elf Unterklassen als ungeprüfte Gruppenfassung; exakte Besitzprüfung und sichtbare Tabellenprogression.
- Bestätigte Heilungs-/Treffer-/Condition-Abläufe, Skalpell/Sabre, Shaman-Waffen, Castingoptionen, Ressourcen-/Zieljournale und gespeicherte GM-Anwendung.
- Bestehende Summon-/Diamondheart-/Golem-Profile, Rückverwandlung, gemeinsame Saves mit Empfängerauswahl, Umleitung, Constructive Healing und getrennte temporäre HP.
- Öffentliche medical-API und aktuelle Quellcheckliste. Manuelle Schritte und bekannte Grenzen ausdrücklich dokumentiert.
- Keine Unit-, Spiel-, Browser-, visuellen oder Foundry-Integrationstests auf Nutzerwunsch; statische Syntax-/Importkontrolle separat protokolliert. Medical standardmäßig deaktiviert.

# Changelog

## Unveröffentlicht · Medical-Nin, 17.10.2026

Bestätigte Scalpel-/Sabre-Treffer, Poisonous Touch, fünf Elemental-Traces-Zielwirkungen, gemeinsame temporäre-HP-Buchhaltung, Natures Avatar und Altered Strength/Rebuilt Fortitude ergänzt. Dazu Black-Medicine-Passiven, Mending-Presence-Pool und Healing-Ascension-Grundablauf. Medical-Nin bleibt unvollständig und nicht installiert; keine Spieltests. Details und Grenzen: MEDICAL-ARBEITSSTAND.md.

## 0.15.0 — 2026-10-17 · Genjutsu-Gruppenfassung

Abschluss des implementierten Klassenumfangs mit zielbezogenem Sensory Mode, ergänzten Mirage-Caständerungen, gemeinsamem Song-Konzentrationsplatz, Lucid-Entfernung/Unterdrückung, Brawler-Angriffsmodus und tatsächlichen Wiederholungssave-Schaltflächen. Nicht spielgetestet. Grenzen ursprünglicher manueller Jutsu-Abläufe sind in GENJUTSU-GRUPPENFASSUNG.md ausdrücklich dokumentiert.

### Historischer Entwicklungsstand

Quellenkatalog und Teilumsetzung für Actualization, Disruption, Save-Ergebnisse/Conversions, Prestige, 30 Mirage-Castwege, Misty Kit, Stopwatch und Inception-Zusatzgrants. Ergänzt am 16.10.: persistente Illusionary Weapons mit höchster Verbesserung/illusionärer Munition, Smite-Zahlungen und GM-Anfragen, getrennte Phantasmal-Strahlen, bestätigte Angriffs-Rückgewinnung sowie Moment/Temporal-Mastery-Konzentration. Kein Klassenabschluss. Noch nicht installiert; Manifest bleibt 0.14.0. Keine Gameplay-/Integrationstests ausgeführt.

## 0.14.0 — 2026-10-15

Die noch offenen Klassenabläufe sind als opt-in Erweiterungen implementiert. **Neu in 0.14.0: nicht spiel-, visuell oder integrationsgetestet.** Auf Nutzerwunsch übernimmt die Gruppe die Spielprüfung. Syntax-/Importkontrolle ist kein Funktionsnachweis. Drip Release und Ryo Master bleiben ausgeschlossen; Aktionsökonomie bleibt manuell.

- Persistente Master-/Incorporation-/Fusion-Auswahl; automatische zusätzliche Refined-Einträge für Taijutsu Incorporation und Summoning Adept außerhalb des normalen Limits. Combination bleibt ausgeschlossen.
- Fünf zusätzliche Pools: Blood Vials, Rain Blades, Traditional Inertia, Solid Gems und Ink Sketches. Neue Einträge erneuern die Gruppenminute. Elf Pool-/Mark-Arten insgesamt.
- Besitzgeprüfte Klassen-/Meisteroptionen im bestehenden Castingdialog und bestätigte Chataktionen mit GM-Anfragen, Saves, Conditions und eigenen verwalteten Effekten.
- Ninjutsu Master maximiert nur ursprüngliche Würfel. Kostenverdopplungen multiplizieren sich; danach gegebenenfalls Chakra Recovery, zuletzt Molding-/Void-Zusätze. Sanguine Elite sperrt Recovery.
- Deadly Tradition erhält mindestens die abgerundete Hälfte des ursprünglichen nicht immunisierten Schadens nach Saves und Verteidigungen. Native Immunitäten schützen weiter. Berechnungsansichten verbrauchen nichts.
- Imbuement speichert Jutsu an tatsächlichen Waffen; Enhancement verwendet den höheren Rang, erneuert die gemeinsame Minute und stellt den gewählten kostenlosen Finisher bis Zugende mehrfach bereit.
- Scroll-Seals mit Quellzuordnung, gehaltenem Zustand, Verbrauch/Retain und bestätigten Capture-/Rückcast-Abläufen; bestehende Beschwörungen/Konstrukte lassen sich ausdrücklich verknüpfen.
- Ressourcen-/Folgecast-Journale sperren Teilfehler zur GM-Prüfung statt automatisch zu wiederholen. Ember-DR wird pro Verursacher addiert und endet außerhalb des Kampfes manuell.

Bedienung, manuelle Anteile und Grenzen: [NINJUTSU-0.14-NUTZUNG.md](NINJUTSU-0.14-NUTZUNG.md). Featureweise Zuordnung: [NINJUTSU-SPECIALIST-CHECKLISTE.md](NINJUTSU-SPECIALIST-CHECKLISTE.md).

## 0.13.0 — 2026-10-15

- 27 quellverifizierte Casting-Techniken und vier Adaptive Moldings; Drip Release/Ryo Master ausdrücklich ausgeschlossen.
- Native Saves/Conditions, persistente GM-Zielanfragen, quellengebundene Resistenz und eigene neutrale temporäre Effekte.
- S-Rang-Castingklone, Schadenskonversion/DR-Behandlung, gespeicherte Schadensbelege und einmalige Infusion-Zusatzwürfel.
- Final Lesson/Magnum mit Vorab-Kostenprüfung, Solar-Schockwelle und persistentem Finisher; Teilfehler zur GM-Prüfung gesperrt.
- Charged-Blade-Angriffsbonus im tatsächlichen nativen Angriffswurf; Imbuement bündelt Angriffsschäden vor einer DR-Anwendung.
- Öffentliche Abfragen/Aktionen und getrenntes Opt-in-Setting; keine Aktionsabrechnung.
- Actor-reset-Kompatibilität und validierte Molding-Zusätze verhindern erneute Verarbeitung unvollständiger vorbereiteter Daten.


0.13.0 Nachprüfung: eigene Chataktionen und Zusatzschadenhinweise an den nachgelagerten System-Render-Hook verschoben; lange Castingdialoge auf die Fensterhöhe begrenzt. Infusion übernimmt bestätigte Jutsu-Schadenskonversionen ohne zusätzliche Angriffsboni.

## 0.12.0 — 2026-10-13

- Alle 17 Standard-Moldings mit optionalem Casting-/Chatworkflow implementiert.
- Verifizierter gemeinsamer Pool, freie Kostenzuordnung einschließlich Mehrfachgruppen/Angriffen und native Rast.
- Zielschutz, erster Save-Nachteil, temporäre Verteidigungsbehandlung, ursprüngliche Würfelmaximierung und einmaliger Echo-Folgecast.
- Bestätigte Postaktionen, persistente Unterbrechungsprüfung und native Erstattungsabsicherung.
- Kosten nach Recovery separat, Shocked verdoppelt nur den Jutsu-Anteil; normaler Unterhalt bleibt erhalten.
- Installierten Klassenkennungsfehler ohne Änderungen an System oder Featurequelle korrigiert.
- Kompakter Tracker, GM-Korrektur, API und reproduzierbare Foundry-/UI-Prüfungen. Keine Unterklassen-Moldings oder neue Aktionsabrechnung.


## 0.11.0 — 2026-10-12

- Persistente Refined-Ninjutsu-Auswahl und optionaler Casting-SG/-Würfelbonus mit erhaltenen Chat-Snapshots.
- Bestätigter Void-/Lightning-/Elemental-Castingverbrauch im nativen Ressourcenbatch.
- Gespeicherte GM-Anfragen für Void-Zuschläge auf nächstes Jutsu und Lightning-Schaden nicht schädigender Jutsu.
- Additive Professor-Chakra mit eigenem Maximum 10 und Verbrauch zuerst; Vergabe nach allen nativen Castingkosten.
- Korrekte Clone-Finaldaten und Optionsübergabe im vorhandenen Castingdialog; originale System-/Class-Mod-Dateien unverändert.
- Kein Abschluss von Efficient Molding, Ninjutsu Master, Ember-DR oder aller Traditionen.


## 0.10.0 — Chakra Recovery und Ninjutsu-Nutzungen

- Freiwillige native Castingoption: normale reduzierte Wirkkosten halbieren/abrunden, eine Nutzung verbrauchen, normalen Unterhalt erhalten.
- Klassenstufen für Chakra Recovery und Jutsu Breaker, ausschließlich vorbereitete Werte; opt-in Setting, kein Item-/Kompendium-Umschreiben.
- Rücksetzung wiederverwendeter vorbereiteter Resource-Felder und Beibehaltung des tatsächlich bezahlten Konzentrations-Castingbetrags.
- Vollständige Ninjutsu-Grant-Checkliste; Refined-Interpretation und Void-Shard-Regeln vom Nutzer bestätigt, Umsetzung dieser Mechaniken weiterhin offen.
- 129 Unit-Tests; 11 native Casting-/Ressourcenprüfungen und 6 Reload-/Rastprüfungen, tatsächliche UI-Umschaltung dokumentiert.


## 0.9.0 — Tenseigan-orientierte Karten und bestätigte Mark-Wirkungen

- Eigenständige Karten, fünf Ressourcenpunkte, Zielzeilen, Gruppenrestlaufzeit und Ergebnisanzeige.
- Persistente Mark-Anfragen mit aktiver GM-Anwendung: Breeze-Bleeding, Ember-Fire-Schaden, Blade-Waffenschaden und Prone.
- Native Resistenzen/Conditions, typisierte Schadensbestätigung, Teilverbrauch und Cancel ohne erneuerte Dauer.
- Dauerhafter Bearbeitungszustand; kein automatisches Replay nach Fehler/Reload; ausdrückliche manuelle GM-Auflösung.
- Ember-DR, höherstufige Sonderregeln und Shard-/Mote-Verbrauch bleiben offen.
- 121 Unit-Tests, neun native Basisprüfungen und vier native UI-/Reloadprüfungen bestanden.


## 0.8.0 — Persistente Ninjutsu-Tracker, erste Stufe

- Sechs besitzgeprüfte Shard-/Mote-/Mark-Tracker mit persönlichen Pools und Actor-/Token-Zielreferenzen.
- Bestätigtes Hinzufügen, Zählerkorrektur, Gruppenlaufzeit und Reload-beständige Speicherung; opt-in Setting.
- Sechs neue Unit-Tests; bestehende Tests weiterhin erfolgreich. Gameplay-Wirkungen und Zuglimits folgen separat.
- Weiterer Ausbau ohne Lunar Slayer, Jujutsu Sorcerer und deren Unterklassen.

## 0.7.0 — Dojutsu-Grundlage

- Vier Standarddefinitionen, getrennte Instanzen und Augen-Zuordnung im bestehenden Bogen.
- Verifizierte Chakra-Aktivierung, bezahlte Byakugan-Zeitfenster, Chakra-Sicht und Ablaufbereinigung.
- Sichere eigene Effektmarker, bei Modul-Deaktivierung ohne verbliebene Sichtboni.
- Registrierungs-/Aktivierungs-API, default false; Aktionen und einzelne Fähigkeiten manuell.
- 99 Unit-Tests und 18 native Dojutsu-Prüfungen bestanden; Lokalisierungsfehler im realen Bogen behoben.
- Stufenboni und Mehrclient-Transaktionssicherheit bleiben offen.

## 0.2.0 — Passive Kosten im nativen Casting

- Enger Wrapper für zentrale Chakra-Berechnung; Ressourcenprüfung und Abbuchung bleiben beim Originalsystem.
- Sichere Welteinstellung dynamicChakraCosts (default false), Kostenhinweis und Provenienzdiagnose im vorhandenen Dialog.
- Originalmethode für Vorschau verhindert doppelte Reduktion; Minion-/Fixkosten-Ausnahmen erhalten.
- 38 automatisierte Tests; sechs finale native Cast-/Ressourcen-/Chatprüfungen und Dialogabbruch in test12 erfolgreich.
- Wiederholbare Testmakros, zwei markierte Actors und UI-Screenshot.
- Vollständige Transaktion, Nutzungsverbrauch, optionale Modi, Mehrclient-Sicherheit und Dojutsu noch offen.
## 0.1.0 — Modulgrundlage und Kosten-Vorschau

- Separates Manifest, Init/Ready, Versionsschutz, Debug-Setting und Deutsch/Englisch.
- Deklarative Modifier-Registry, reiner Kostenkern, Validierung und Aufschlüsselung.
- Amplified-Flames-Kostenregel für verifizierte Standard-Uchiha-Quellen; keine automatische Castanwendung.
- Öffentliche Vorschau-API; keine Chakra-Abbuchungen, Effect-Writes oder Dojutsu-Workflows.
- 32 bestandene automatisierte Tests und erfolgreiche statische Prüfungen.
- Alle 43 Systemkompendien strukturell untersucht; 11 Standard-Uchiha-Jutsu-Quellen dokumentiert.
- Lokal installiert, in test12 aktiviert und drei API-Smoke-Fälle über ein gespeichertes Foundry-Makro erfolgreich geprüft; Testwelt-Backup vor Weltstart erstellt.
- Standard-Featurequelle erforderlich, damit T7-/Homebrew-Identifier nicht die Standardregel auslösen.

## 2026-10-11 — Discovery und Architekturabstimmung

- Foundry 14.364 / N5eB 3.1.1 und lokale Installationspfade verifiziert.
- test12 vom Nutzer als isolierte Testwelt freigegeben.
- Initialen Audit mit belegten Integrationsrisiken erstellt.
- Amplified-Flames-Regeltext und vorhandene Drittanbieter-Effektmetadaten untersucht.
- Architekturgrundlage und Implementierungsreihenfolge abgestimmt.
- Keine Systemdateien geändert, keine Gameplay-Fixes implementiert, keine Integrationstests behauptet.

## 0.3.0 — 2026-10-11

- Persistente Release-/Kategorieauswahl beim Feat-Erwerb, Bestandskonfiguration und GM-Korrektur.
- Verifizierte Spezialisierungs- und Latent-Release-Wirkkosten; Elemental Specialization + Amplified Flames additiv gemäß Nutzerentscheidung.
- Unterhaltsregistry, stärkste Reduktion, absolute/relative Mindestgrenzen, passive Befreiungen und Master-Weaver-Auswahl.
- Native Unterhaltsintegration mit gespeicherter Basis und dynamischer Flagkopie; keine eigene zusätzliche Chakra-Abbuchung.
- Castingdialog ergänzt Unterhaltsaufschlüsselung und fehlende Auswahl-Diagnose.
- 47 Tests bestanden; neun native Foundry-Ablaufprüfungen in test12. Dokumentierte offene Kontexte und Kompatibilitätsgrenzen.

## 0.4.0 — 2026-10-11

- Zusätzliche passive Kosten: Insect Nest Integrity, Split Focus, Latent Genjutsu Specialty I, Genjutsu Adept, Signature Control; Efficient-Breathing-Wirkkosten ergänzt.
- Long/Full-Rest-Neuauswahl für Master Weaver; geeignete Force-of-Rage-Jutsu bei Erwerb und Full Rest wählen.
- Eingebaute Castingoptionen Technical Technique / Force of Rage; nativer Martial-Die-Verbrauch und gespeicherte Unterhaltswirkung. User-confirmed ceil(half die) und ausdrückliche Frenzy-Bestätigung.
- 57 Tests; tatsächliche optionale Castingabläufe, passive Previews, Reload/Rast und neun frühere Ressourcenregressionen erfolgreich geprüft.
- Begrenzungen und weitere Ressourcen-/Featureaufgaben dokumentiert.

## 0.5.0 — Kostenworkflow-Abschluss

- Optionaler Martial-Pool-Reset im nativen Kampf-Recovery-Batch, bestehende Profile erhalten, eigene Zugkennung.
- Martial Technique: feste Basis, native Rangzuschläge, Opt-out und Ausschluss weiterer Wirkkostenreduktionen. Unterhalt nach Nutzerklärung weiterhin reduzierbar.
- Eigene Aktionsökonomie-Verbuchung entfernt; native Konfiguration unverändert.
- 67 automatisierte Tests und 20 Modul-JavaScript-Dateien geprüft. Erweiterte native Tests und weitere Kostenkandidaten separat dokumentiert.
- Kein Anspruch auf vollständige Automation aller gefundenen Kostentexte, Class Mods oder Frenzy-Boni.

## 0.6.0 — Empowered Taijutsu und Medical Specialization

- Passive rangabhängige Empowered-Kosten für Combo/Finisher-Taijutsu.
- Medical-Schadensart beim Erwerb auswählen; typabhängige Medical-Ninjutsu-Kosten ohne Änderung der Jutsu.
- Wiederverwendbare bedingte stärkste Rangreduktion; bestehende Addition außerhalb passender exklusiver Regeln erhalten.
- Native Angriff-/Save-Schadensdaten, Duplikatschutz, Mehrdeutigkeitsdiagnose und Dialoghinweis.
- Keine zusätzliche Aktionsökonomie, keine Schadensboni oder Feature-Nutzungsverbräuche für passive Rabatte.

Validierung 0.6.0: 83 Unit-Tests, 19 neue native Spezialisierungsprüfungen und 14 native Regressionen bestanden; Reload und Dialog visuell geprüft.

## 0.7.1 — kompakter Tracker und DM-Tomoe-Freigabe

- Augen-Auswahl aus dem Bogen entfernt, Legacy-Daten kompatibel erhalten.
- Kompakte farbige Tracker-Zeilen nach Kāma-Vorbild, unabhängig von der Class Mod Library.
- GM-Freigabe und automatische höchste levelberechtigte Tomoe-Stufe.
- Aktiver 3-Tomoe-Bonus +5 passive Wahrnehmung ohne Doppelanwendung.
- 104 Unit-Tests, elf native Tomoe-Prüfungen, wiederholte Berechnung und Reload bestanden.

Smite-Abgrenzung vom 16.10.: Waffen- und Smite-Schaden gemeinsam anwenden, DR einmal für den gesamten Treffer. Dafür den tatsächlichen, noch unbenutzten nativen Waffenschadenswurf bestätigen. Bereits ausgewürfelte Anteile werden nach Schadensart/Eigenschaften gruppiert und nicht neu gewürfelt. Die native Einzelanwendung des reservierten Waffenschadens am bestätigten Ziel ist gesperrt; manuelle HP-Änderungen und fremde Drittmodul-Abläufe bleiben Verantwortung der Gruppe. Keine Laufzeitprüfung.

### Waffen-Infusion und Illusionary Bukijutsu (WIP, 16.10.2026)

Supreme-Infusion speichert einen bezahlten nativen Genjutsu-Cast in genau einer aktiven Waffenform. Jede Form hat einen eigenen Speicher; Ersetzen wird ausdrücklich bestätigt. Ein bestätigter erfolgreicher Treffer gibt den Cast für genau eine Kreatur frei und verbraucht den Speicher. Fehlschläge verbrauchen ihn nicht. Selbst Flächen-Genjutsu betreffen hierbei nur die getroffene Kreatur; kein vorzeitiges Template. Vorhandene Jutsudauer/Konzentration beginnt beim ursprünglichen Cast. Saves erhalten −1d4; eigene GM-Anfragen übernehmen native Effekte mit verbleibender Laufzeit. Bereits bezahlte zielgebundene Actualization-/Power-/Prestige-Optionen können nicht heimlich auf andere Ziele verschoben werden. Originale Angriffs-/Schadens-/Effektanwendung vor Trefferfreigabe wird abgefangen. Die Entscheidung zur kritischen Behandlung des infundierten Genjutsu-Schadens steht noch aus.

Illusionary Bukijutsu verwendet nach ausdrücklicher Waffenwahl bis C-Rang das Genjutsu-Attribut für Angriff, attributsabhängigen Schaden und berechneten SG. Native Bukijutsu-Kosten und Jutsu-Klassifikation bleiben erhalten. Ein manueller fester SG wird nicht ohne belegte Formel umgerechnet. Neue Casts starten über das ursprüngliche Inventar-Jutsu; alte Chat-Snapshots bleiben Belege ihres ursprünglichen Casts.

Keine Installation und keine Laufzeit-/Spieltests. Grenzen: fehlende/gelöschte Ursprungs-Chatkarten, technische Teilfehler während der nativen Konzentrationserzeugung und Mehrclient-Änderungen verlangen spätere Prüfung bzw. GM-Handhabung. Nicht strukturierte Jutsu-Wirkungen bleiben über ihren tatsächlichen Regeltext zu handhaben. Genjutsu Specialist ist weiterhin unvollständig.


### Genjutsu-Arbeitsfortschritt 16.10.2026

Unveröffentlichter Genjutsu-Teilstand: gemeinsame bestätigte Zielaktionen, getrennte Condition-Quellen, wiederkehrende Effekte, Jutsu-Auswahlen und Save-Rückgewinnungen; normale Infusionsschäden bei kritischem Waffentreffer.


Unveröffentlichter Teilstand: Remote Trigger/Brain Worm mit bestätigtem späterem Dauer-/Konzentrationsbeginn; Vicious Mockery/Mental Placebo; private GM-Save-Belege und serialisierte Ereignisablage.


Unveröffentlicht: drei Genjutsu-Konzentrationsausnahmen und bestätigte Zugdauer von Critical Moment; noch kein Klassenabschluss.

Unveröffentlicht: Critical Confusion als bezahlter Wiederholungswurf; private ursprüngliche GM-Save-Belege für Outcome-Anfragen, alte Saves als ersetzt markieren.


### Signature Work und zusätzliche Cast-Verstärkungen (Quellstand, 16.10.2026)

Signature Work speichert ein tatsächliches bekanntes E-/D-Genjutsu am ursprünglichen bezahlten Programm. Folgecasts kosten normal Chakra beim ursprünglichen Wirker und starten erst bei erfolgreicher Zahlung eine neue 60-Sekunden-Sperre. Auslöser, Illusionsort, Reichweite und Ziele werden bestätigt. Kein neuer Actor, keine automatische Aktion. Beschädigung/Bannung manuell beenden; technische Teilfehler verlangen GM-Prüfung ohne automatische Wiederholung.

Words Of Detriment und Illusionary Fury verändern nur die Cast-Kopie und bezahlen im nativen Batch. Zusätzliche Zielwirkungen: bestätigter Save und quelleneigene Conditions/Mali. Permeating Seals bezahlt 8 Chakra zusätzlich und speichert das Reaktionsverbot; Reaktionen bleiben manuell. Broken Reality verstärkt ausdrücklich ausgewählte bereits vorhandene Mali. Crest Of Psychosis enthält bestätigte Zielzug-Chakraschäden; AD-Escrow fehlt weiterhin. Distant Influence enthält zunächst nur die bestätigte Abwehr, nicht die True-Strike-Aura.

Weiterhin unvollständiger, nicht installierter Quellstand. Keine Gameplay-, Browser-, visuellen oder Integrationstests.


Weitere Quellergänzungen 16.10.: Master Of Reality als normal bezahlter unmittelbarer Konzentrations-Folgecast mit Feature-Nutzung und Teilfehlerjournal; Poisoned Mists nach bestätigter Regel (Envenomed 1 + Weakened 1), direkter Kit-Stufenabbau; Venomous Illusions 3 AD und manuelle Full-Turn-Action. Phantom-/Void-/Darkness-Passiven teilweise ergänzt, Permeating-Seals-Schadensverteidigungen über native Downgrade-Option. Beneath the Boot +3 Ziele; Evil Thoughts +1 Originalwürfel und bestätigte Critical-Failure-Ersatzwirkung; Temporal Shift d12 und Bewegungsangabe. Blade Song weist +2 Kopien aus, deren ursprünglicher Verbrauch bleibt manuell. Nicht als vollständige Features/Klasse freigegeben; keine Laufzeit-/Gameplaytests.


### Weiterer Teilstand: Insignia, bekannte Jutsu und Sensory Type (16.10.)

Genjutsu Insignia bezahlt die native Nutzung, belegt Nachteil und fehlgeschlagenen Save, kombiniert Psychic-/Chakra-Zusatzschaden und schreibt einmaligen nächsten Unterhalt gut. Prolonged Songs bestätigt den echten Bonusaktionseinsatz beim Unterhalt. Psyche Breaker und Illusionary Rage verwenden die gespeicherten Jutsu-Auswahlen und bestätigte Zielanfragen. Nightmare Incarnates erhält eine bezahlte Bonusaktions-Castoption samt stufenabhängiger Nutzungszahl.

Sensory Type erkennt tatsächlich besessene Sensing-/Kagura-/Eagle-Varianten. Die gewährte Team-7-Kagura-Quelle war als C-Rang gespeichert; laut Nutzer wird die Enhancement-Kopie B-Rang. Bestätigt: A/S eine Meile und zehn Minuten, S ohne Konzentration. Erfassungsmarker entstehen nach bestätigtem tatsächlichem Erfassen; Secret-Actor-Daten werden nicht ausgelesen. SG-Bonus und Chakra Distortion beziehen sich ausschließlich auf solche quelleneigenen Marker. Third Eye Opening gewährt bestätigte Chakra-Sicht für die Restdauer. Tatsächlicher Sense-Chakra-Check, Suppress-Chakra-Ergebnis, Geheimwissen und weitere Sensory-Overload-Wirkungen bleiben noch manuell. Eagle optional 3 AD + 1/LR für kostenlose Wirkkosten; keine neue Lernberechtigung.

Weiterhin kein Klassenabschluss, keine Installation und keine Gameplay-/Foundry-/Browser-/Visualtests. Nur Syntax und statische Verknüpfung geprüft.


### Weitere Genjutsu-Teilumsetzung · 17.10.2026

Gemeinsame Skill-Lernpakete ersetzen die exakt belegten doppelt addierenden nativen Effekte von Beguiling Influence/Illusionary Vigor. Lernstand wird ausdrücklich bestätigt; bei vorheriger Beherrschung beider Skills genau eine Expertise/Mastery-1-Auswahl gemäß nativer Legacy-Migration, höhere Werte bleiben erhalten. Auch Ninshou aus Genjutsu Insignia verwendet dieses Muster. Temporal Technique bietet eine zusätzliche berechtigte Stopwatch-Mirage ohne neue Inception.

Pure Terror ersetzt bei genau einer gewählten Kreatur einen strukturierten mentalen/sensorischen Condition-Eintrag. Bestätigte Reihenfolge: Ersatz 1 → Fury 2 → Overwhelming Fear 3. Gemeinsame GM-Condition-Anfrage wahrt Ziel, ursprüngliche Dauer, Power und Waffeninfusion. Zusätzliche native Änderungen an einer zu ersetzenden Effektzeile sind zunächst ausgeschlossen. Overwhelming-Fear-Immunitätsumgehung erfordert bestätigte reale 30-Fuß-Voraussetzung; deren Wegfall manuell im Effekt zurücknehmen.

False Security schützt andere verwaltete eigene Genjutsu vor Beendigung durch erfolgreiche Wiederholungssaves. Nicht verwaltete Effekte bleiben manuell. Creeping Thoughts stellt Mind Sliver/1d6-Malus bereit, Maddening Pain maximiert einen eindeutig lesbaren ursprünglichen Pain-Wurf. Nicht als vollständige Feature-/Klassenfreigabe deklariert. Keine Installation, keine Gameplay-/Browser-/visuellen/Foundry-Tests.


### Fear, Aura und Sensory-Fortsetzung · 17.10.2026

Blinded By Fear besitzt vier bestätigte Zielvarianten. Zwei Fear-Ränge werden entfernt; bei verbleibenden null Rängen wird keine anhaltende Folgewirkung angelegt. Bestehende verwaltete Folgewirkungen werden bei null Fear entfernt. Keeper’s Influence bezahlt einen AD und dieselbe normale Blinded-Nutzung; der gespeicherte AD-Wurf begrenzt die nachträgliche Auswahl aus den ursprünglich markierten Zielen. Abgebrochene Zielauswahl lässt den bezahlten Vorgang gespeichert. Sichtlinie/Fear-Entfernungssperre bleibt ausdrücklich manuell.

Elemental Tenacity berechnet bestätigte temporäre HP; ursprünglichen Schaden negiert die Gruppe manuell. Chained Element und Corrupt Psyche verwenden bestätigte ursprüngliche Schäden, zusätzliche Ziele und eigene Saves/Verteidigungen. Mehrere ursprüngliche Schadensarten bleiben manuell. Cloak of Chains verwaltet Kosten, CHA-Würfe, bestätigte Aura-Zugschäden und Ende bei null Chakra/Handlungsunfähigkeit; Reichweite/Deckung bleiben bestätigt. Shadow Chain bietet begrenzte AD-Rückgewinnung; zusätzliche Angriffe/Aktionsökonomie bleiben manuell.

Preemptive Scouting speichert vom GM tatsächlich mitgeteilte Chakra-Naturen; Chakra Database den bestätigten Clan. Keine geheimen Actor-Daten werden automatisch ausgelesen. Nutzerbestätigt: Scouting gibt Vorteil auf den eigenen Save. Dieser wird für den nächsten passenden nativen Save mit belegtem gegnerischem Cast und gespeicherter Natur angeboten. Saves ohne ursprüngliche Chatkarten-Zuordnung bleiben manuell. Inspired Appearance verwaltet CHA-Nachteil-Unterdrückung unter bestätigter Transform-Wirkung; vertraute Gestalt erhält einen ausdrücklich bestätigten nächsten +1d4-CHA-Check. Imperceptible bezahlt die Castoption und entfernt HS an der virtuellen Unaware-Castkopie; externe Counter-/Dispel-/Reaktionsabläufe müssen den gespeicherten Schutz manuell berücksichtigen.

Quellstand ohne Installation oder Gameplay-/Foundry-/Browser-/Visualtests. Klasse weiterhin WIP; Syntax-/Importprüfung allein bestätigt kein Spielverhalten.


### Cast- und Folgewirkungen · 17.10.2026

Persistent Genjutsu: bestätigte aktive feindliche Zielwirkung, späte Rangzuschläge D3/C5/B7/A9/S11, stärkster gleicher Feature-Zuschlag, nicht verbraucht; Unterhalt bleibt unverändert. Nutzer bestätigt Reihenfolge/Stapelung. Sonder-/unlesbare Dauer oder vorzeitiges Ende einzelner Zielwirkung manuell behandeln. Gaze of Two Minds speichert bestätigte willige humanoide Verbindung und übernimmt strukturierte Sinnesreichweiten; eigene Umgebung blinded/deafened, Ablauf am nächsten eigenen Zugende und erneuerbare Verbindung. Standort/Deckung, Berührung/Meilenreichweite und nicht strukturierte Spezialwahrnehmung bestätigt/manuell.

Superior Thoughts nutzt eine belegte S-Rang-Genjutsu-Auswahl und ausdrückliche Bestätigung tatsächlicher Lernvoraussetzungen, ohne neue Lernrechte oder Items zu gewähren. Kostenlose Grund-Wirkkosten, native Nutzung bzw. vier ausgewählte Chakra Dice, anschließend drei Confused und drei Concussed. Illusionary Chronicle speichert STR/DEX während bestätigtem Rast-Ritual, erlaubt erneute Ritualauswahl nach tatsächlicher Rast, wirkt ein bekanntes D-Rang-Action-Genjutsu mit normalen Kosten und gibt einmalig Vorteil auf den auslösenden Save. Reaktion/Full-Turn-Action bleiben manuell; außerhalb Kampf ungenutzte Reaktionsmarker beenden.

Illusionary Adept zeigt 10 + Illusions-Skill und nutzt nur bereits sichtbare Genjutsu-Castkarten mit niedrigerem SG und ausdrücklich bestätigtem tatsächlichem Erkennen. Einmaliger sourcegebundener Save-Vorteil, gleiche Jutsu-Quelle erst nach langer Rast erneut. Keine automatische Offenlegung geheimer Effekte. Synchronous Technique bietet für Doubt bestätigte bestehende eigene Genjutsu-Konzentration: virtuelle Reichweite 60 Fuß und gekoppelte Sonderdauer. Zielmarker koppelt Ende an diese Konzentration, INT-Save-Malus −1d4 einmal pro Zug gegen eigenen Wirker sowie Insight-Nachteil bei explizit zugeordnetem Check. Tatsächliche Zielbetroffenheit/Feindseligkeit bleiben bestätigt; außerhalb Kampf neue Züge bestätigen.

Kein Klassenabschluss: zentrale offene Punkte bleiben insbesondere Psionic Scrivener, Night Terror, Umbral Influence und weitere Teilmechaniken. Keine Installation oder Spieltests.


### Genjutsu-Fortsetzung: Distant Soul und Umbra · 17.10.2026

Psionic Scrivener: bestätigte Fuinjutsu-Ninjutsu-Castoption mit Genjutsu-Attribut und genau einem gewählten Actualization-Effekt für insgesamt einen AD. Ninjutsu-Typ und Kostenregeln bleiben erhalten; ausschließlich Distant-Soul-Erweiterungen werden zusätzlich zugelassen. Skill-Bonus erfordert einen ausdrücklich zugeordneten Check. Lernscore weiterhin manuell; keine automatische neue Lernberechtigung.

Reality Marble: gespeicherte GM-Anfrage ersetzt genau ein altes Ziel. Das alte Ziel verliert seine eindeutig diesem Cast zugeordneten Wirkungen auch bei erfolgreichem Save des neuen Ziels. Unveränderte ursprüngliche Konzentration/Restdauer; bei verwalteten Conditions ursprüngliche Ränge vor neuen Zielverteidigungen vom GM bestätigen. Nicht eindeutig zugeordnete/narrative Wirkungen, besondere gespeicherte/infundierte Casts und Actualized Power bleiben vorerst manuell. Private Saves werden gesichert; technische Teilanwendungen verlangen GM-Prüfung statt Wiederholung.

Night Terror: ein AD plus native Nutzung, bestätigter ursprünglicher Treffer, gespeicherter Folgeangriff oder Stealth-Check; halber Folgeschaden wird über GM-Anfrage vor Zielverteidigungen angewendet. Teleportposition und weitere tatsächliche Jutsu-Effekte manuell bestätigen. Umbral Influence: variable AD, native kritische Original-/Zusatzwürfel ab drei AD, kombinierter Primärschaden mit einmaliger DR und Resistenz-/Immunitätsbehandlung. Ab zwei AD gespeicherte Saves weiterer bestätigter Feinde; Flächenbetrag aus der bestätigten nativen Primärschadensanwendung, gewählte vorhandene Schadensart, eigene Verteidigungen weiterer Ziele. Drei-Runden-Abklingzeit im stabilen Kampf; außerhalb bzw. bei Initiativekorrektur tatsächlichen Ablauf bestätigen. Unlesbare oder Chakra-/Heil-Schadensmischungen bleiben ausgeschlossen/manuell.

Gesamte Klasse weiterhin WIP. Keine Aussage, dass alle Teilmechaniken fertig sind: beispielsweise Pure-Terror-Zusatzschaden, Crest-Die-Reservierung/-Rückgabe, einzelne Waffen-/Mirage-Sonderwege und weitere in der Checkliste ausgewiesene Anteile fehlen weiterhin. Keine Installation; keine Gameplay-, Unit-, Foundry-, Browser- oder Visualtests. Statisch geprüft: 185 ESM-Dateien, lokale Importverknüpfung ohne Auswertung und drei JSON-Dateien.


### Ergänzte Genjutsu-Abläufe · 17.10.2026

Sensory Mode speichert eine quelleneigene Markierung ohne Reichweiten-Ablauf. Sie bleibt bis zur manuellen Beendigung bestehen; eigene Beenden-Anfragen entfernen keine fremde Markierung. Die noch unbeantwortete Empfängerfrage für den Invisible-/Hidden-Ausschluss bleibt offen. Es wird kein Token global enthüllt.

Neu im Quellstand: Pure-Terror-Zusatzschaden mit gemeinsamer DR und bestätigter Save-/Krit-Reihenfolge; Crest-Reservierung und begrenzte Rückgabe mit Unterbrechungsjournal; Concealed-Unease-Skillkontext und Zugschaden; Sensory Overload; Beguiling Presence; Phantom-Pain-Angriff und Wiederholungstrigger; Void-Slash-Waffenprofil; bezahlter Out-of-Sight-Erhalt und Out-of-Mind-Zielmodifikatoren; True-Strike-Aura; Fear-of-the-Unknown-Echoabbruch; Darkness-Mehrzielangriffe; Blade-Song-Kopien; bestätigte Casting-Ursprünge; Keen-Reaktionscast; allgemeines Agonizing Thoughts und Utility-Perfection. Konzentrationsvorteile können beim tatsächlichen Auslösen gespeicherter Genjutsu ausgewählt und bezahlt werden. Permeating Intoxicant verwendet auch bei nativen Envenomed-Effektzeilen die besitzgeprüfte GM-Anfrage.

Manuell bleiben insbesondere Aktionsökonomie, tatsächliche Reichweite/Sichtlinie/Frontbereiche, Teleport- und Schablonenpositionen, Gedanken/Narration, ursprüngliche Parier-Schadensanwendung und nicht eindeutig strukturierte native Mischwirkungen. Phantom Pain verursacht beim normalen Angriffstreffer keinen fälschlichen sofortigen Standardschaden; sein späterer Schaden läuft über die bestätigten Trigger. Kein Gesamtabnahme-Nachweis: Quellstand nicht installiert, Manifest weiterhin 0.14.0 und Genjutsu-Automation standardmäßig aus. Keine Unit-, Gameplay-, Browser-, Visual- oder Foundry-Integrationstests ausgeführt.

0.15.0 Abschlussstand: 202 ESM-Dateien syntaktisch geprüft, lokale statische ESM-Verknüpfung ohne Auswertung und drei Konfigurations-JSON-Dateien erfolgreich; keine Laufzeit-/Unit-/Spieltests. Ergänzt: besitzgeprüfter No-Light-Fracture-Zielmarker, tatsächliche Save-Trigger, gesenkte Wirkungsschwellen und persistente Monats-Erholung; Maddening-Pain-Angriffsfolge ohne doppelte Phantom-Pain-Anwendung. Jutsuspezifische narrative Regeln werden nicht erfunden.

## Medical-Nin — Entwicklung, 17.10.2026

Unveröffentlicht — Medical-Nin-Grundlage: Quellenindex (98 Features/elf Unterklassen), getrennte Einstellung, Ressourcen/Heilungs- und klinische Zielabläufe, Casting-/Kosten-/Scalpel-/Auswahlgrundlage. Nicht abgeschlossen, nicht installiert; offene Teile in MEDICAL-ARBEITSSTAND.md. Keine Gameplay-Tests.

## Unreleased — Taijutsu source work, 18 October 2026

- Extend the native Martial pool, confirmed casting modifiers, guard and initial Fury workflows.
- Add persistent full-hit/Devastating requests, numerical Precise confirmation and selective Furious defense calculation.
- Add Savage Force debt journal, target-specific Tyrants Savagery bonuses and confirmed utility attack groups.
- Preserve original system files. Source is not installed/released; gameplay verification deferred by user request.

### Unreleased Taijutsu source continuation · 2026-10-19

Added Passionate Flame casting/attack-action integrations, Matrix shared free allowance and timed flight/Neo perception, native-only Redirected Aggression and first-save/attack Flaming handling. Added opt-in per-random-step preparation persistence for three Taijutsu target workflows. Class remains WIP, runtime-unverified, and uninstalled.

### Unreleased · 2026-10-20

Added Disturbance source workflows and saved GM target requests. Fixed Taijutsu/virtual-unarmed snapshot recognition in the common chat adapter. Interrupted Jutsu preserve spent Chakra and block supported subsequent native/managed applications. Prevented automatic save rerolls by cancel/re-request after prepared random steps. No original system files or installed module changed.

## Quellergänzung 21.10.2026 — Waffen, Grappler und Ultra Instinct

- Nunchaku-Folgeangriff mit nativem Waffen-Angriff und unverstärktem 1d6-Paket, auch kritisch. Gespeicherte Zielanfrage statt separater doppelter Schadensanwendung; höchstens zwei Auslöser pro gespeichertem Kampfzug.
- Break ’em Down und Martial Combat Technique ergänzt; keine künstliche Erhöhung des Angriffsergebnisses für den garantierten Treffer.
- Flying Armbar, Twister, Hammerlock und Chain-Grab-Folgeablauf mit bestätigten tatsächlichen Grapples, gespeicherten Würfen, eigenen Conditions, Befreiungsaktionen und Zielzugereignissen. Fremde Effekte bleiben erhalten.
- Mystic Awakening verwendet ausschließlich seine eigene native Nutzung, aktiviert Ultra Instinct ohne zweite Zahlung und bestätigt die exakten Auslösereffekte. Sofortzug und Angriffsnegierung manuell; Finisher erhalten den bestätigten ursprünglichen Zusatzwürfel und +1 SG.
- Klassenabschluss weiterhin offen; genauer Einzelstatus in ../TAIJUTSU-IMPLEMENTATION-STATUS.json. Keine Spiel-, Unit-, Foundry-, Browser- oder visuellen Tests; keine Installation.

## Weitere Quellergänzung 21.10.2026 — Ironclad, Ultimate Battle und Soul

Ironclad Technique: bestätigter Reaktionscast, 1–3 Dice, normale quellenbezogene temporäre HP und Aufladungsjournal. Instinctual Defiance: eigene native Nutzungen einschließlich zweiter Nutzung ab Stufe 14, konkrete Auslösereffekte und Vorteil gegen den bestätigten Verursacher. Instinctual Strikes: bestätigte zusätzliche AC, keine Erhöhung des Angriffswerts; Ultimate-Battle-Preis halbiert und aufgerundet. Soul Heart: Casting-Klon-Reichweite und native mentale Abzüge; eigene Condition-Konversion und Soul Shatter. Serene Soul: eigene Zahlung, Soul Heart, bestätigte beseelte Gegner und gespeicherte Weakened-Folge. Soul-Force und Offensive-Sign-Margenschaden im gemeinsamen ursprünglichen Treffer. Earth Wrath / blutige Defensive Sign verhindern kritische Schadenskonfiguration vor dem Würfeln, sofern alle aktuell markierten Ziele geschützt sind; gemischte Zielgruppen bleiben manuell. Ein vorzeitiger Zugriff auf die noch nicht erstellte Treffer-Dialogantwort wurde korrigiert.

Keine Laufzeittests und weiterhin keine Veröffentlichung/Installation. Die offenen Punkte stehen im Einzelstatus.


## Quellergänzung 21.10.2026 — Matrix und verbleibende Zielabläufe

Source Code mit Bullet Time, exaktem No-Chakra-Konzentrationscheck und bestätigtem Schutzdurchbruch; ursprüngliche Würfe und getrennte Flurry-Guards-Abzüge bleiben nachvollziehbar. Automatischer Bewegungsmarker nach nativem Taijutsu; unstrukturierten Martial-Technique-Einsatz ausdrücklich bestätigen. The One mit gespeicherter Folge nach einer Minute, Serene-Soul-Folgeverwaltung, Ultra-Save-Zusatzwürfe ohne Neuwürfeln des ursprünglichen Saves, Grapple-Verknüpfungen und Combat-Versatility-Casting-Ticket ergänzt. Iron Fury erhält seine zwei Gegenangriffe nach tatsächlicher Iron-Heart-Anwendung. Hurricane erhält bestätigte Kollisionen, gespeicherten Schaden, native Saves und Prone. Wind-Kartenphysik bleibt nach Absprache manuell.

Oppressive Aura: CON-Wiederholung am Zielzugende bestätigt. Entwurf außerhalb des Moduls; Kosten-/Konzentrationsablauf noch nicht freigegeben. Klassenabschluss, Veröffentlichung und Installation weiterhin offen. Ausschließlich statische Syntax-/Importprüfung; keine Spiel-, Unit-, Foundry-, Browser- oder visuellen Tests. Maßgeblicher aktueller Einzelstatus: ../TAIJUTSU-IMPLEMENTATION-STATUS.json.
