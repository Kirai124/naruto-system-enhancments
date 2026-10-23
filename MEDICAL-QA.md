# Medical-Nin · lokaler Prüfstand 23.10.2026

Änderungen auf Basis 0.17.0, in Zwischenversion 0.17.1 enthalten. Tatsächlich geprüft in Foundry 14.364 / N5eB 3.1.1, Welt **test12**, als GM. Die Freigabe lokaler Tests ersetzt für diesen Arbeitsstand die frühere Verschiebung aller Spieltests. Kein vollständiger Klassen- oder Release-Freigabenachweis.

## Tatsächlich ausgeführt

| Prüfung | Ergebnis |
| --- | --- |
| Grundklasse Stufe 20, echte Kompendium-Quellen | Scalpel 9, Preserve/Take Life 5, Channeled Healing 9 maximale Nutzungen korrekt vorbereitet |
| Kompakter Sheet-Zugang | Ein Button öffnet ein ApplicationV2-Fenster mit Ressourcen, Suche und einklappbaren Gruppen |
| Scalpel öffnen / abbrechen / bestätigen | Abbruch verbraucht nichts; Bestätigung genau eine Charge; Fenster aktualisiert sich |
| Scalpel-Angriff und Schaden | Nativer Angriff 1d20+4+9; korrigierter Schaden 5d4+4; Schadenskarte bietet bestätigte Zielanwendung |
| Scalpel-Zielanwendung | 17 Schaden: HP 20 → 3; 12 temporäre HP bleiben durch die Stufenregel erhalten; zweite Anwendung blockiert |
| Preserve-Life-Grenze | 48 Heilung bei 3/100 HP abgewiesen; 47 erlaubt, HP anschließend 50; genau eine Nutzung verbraucht |
| Preserve-Life-Wiederholung | Bereits angewendete Anfrage abgewiesen |
| Medical Release Healing Elixir | Tatsächlicher nativer D-Rang-Cast, 5 Chakra einmal bezahlt: 200 → 195 |
| Supreme + Gifted + Channeled + Scalpel | Drei ursprüngliche Würfel maximiert, ein anderer neu gewürfelt; 46 Heilung inklusive +4 Scalpel und +12 Channeled; HP 50 → 96 |
| Channeled-Healing-Pool | Bleibt für den Heilbonus bei 9; Nutzungen gehören zum separaten Death-Save-Ablauf |
| Natural Healing | Zwei Heilwürfel: Pool 20 → 18; Zielanfrage gespeichert. Abschließende Zielanwendung nicht geprüft |
| Alle elf Unterklassen + vier Doctrines | 85 zusätzliche Quellfeatures erkannt; Datenvorbereitung und verfügbare Fenstergruppen aufgebaut. Kein Nachweis aller Einzelwirkungen |
| Besitzerlose Kompendium-Profile | Scalpel und Healing Elixir nach Korrektur ohne Ausnahme vorbereitet |
| Never On The Front Lines | Nur fehlerhafter permanenter Dash-Transfer zur Laufzeit unterdrückt; 30 Fuß Basis bleiben 30. Originaleffekt unverändert |
| Reload | HP 96, THP 12, Chakra 195, Scalpel 8, Preserve 4, Channeled 9 und angewendete Journale bleiben erhalten; letzter Reload ohne Warnungen/Fehler |

Bestehende Kämpfe wurden nicht weitergeschaltet. Testobjekte tragen `medicalQA` und den Präfix `N5ESE QA Medical`. Eigene QA-Szene und QA-Makro bleiben zur Wiederholung in test12 erhalten. Keine Produktionsfiguren, Originalsystemdateien oder Class-Mod-Dateien geändert.

## Behobene Fehler

- Collection statt Array: Companion-Quellen und Taijutsu-Condition-Aufräumlogik verwenden vor `flatMap` eine Array-Konvertierung.
- Fehlender Schadenszugang: neue Medical-Waffen-Chataktion verwendet den nativen Dialog, erhält Krit-/Snapshot-Daten, sperrt parallele und bereits gespeicherte Schadenswürfe und erlaubt einen erneuten Versuch nach Abbruch.
- Fehlender Scalpel-Attributsbonus: das virtuelle Profil enthält ausdrücklich `@mod`, da native natürliche Spell-Angriffe diesen Bonus auslassen.
- Molding-Chatbereinigung entfernte fremde Klassenaktionen: eigener eindeutiger Selektor.
- Ninjutsu-/Genjutsu-Schadensadapter erwarteten auch bei Kompendium-Profilen einen Actor: Guards ergänzt.
- Erstmaliges Fensteröffnen rief `bringToFront` vor dem ersten Render auf: korrigiert.
- Natural Healing weist auch Null-/ungültige Würfelbeträge vor Zahlung zurück.
- Die Doctrine übertrug Dash dauerhaft und erzeugte eine ungültige Bewegungsformel: nur exakt erkannter fehlerhafter Transfer wird in `setup` unterdrückt; Dash bleibt manuell.

## Automatisierte Prüfungen

- `node --test tests/medical.test.mjs`: **14/14 bestanden**.
- `node tools/check.mjs`: Manifestpfade, JSON und **360** JavaScript-Module geprüft.
- Gesamttest: **201/235 bestanden, 34 fehlgeschlagen**. Unveränderter Git-Ausgangsstand: **186/221 bestanden, 35 fehlgeschlagen**. Keine neu hinzugekommenen fehlschlagenden Tests; ein vorher fehlgeschlagener Test besteht nach dem Actor-Guard. Bestehende Fehler unter anderem in älteren Adapter-/Casting-/Tracker-Testfällen sind weiterhin offen. Der Gesamttest ist ausdrücklich nicht grün.

## Noch nicht nachgewiesen

Alle Unterklassenfähigkeiten einzeln, Spielerrechte/GM-Übernahme in zwei Sitzungen, alle Mehrziel-/Rast-/Zugwechsel-/Ablaufkombinationen, Transformation/Rückkehr, Companion-Befehle/gemeinsame Saves, alle gemischten HP-/Chakra-/THP-Verteidigungen sowie Modul-Deaktivierung/Wiederaktivierung. Spiritual Weapons teilen den getesteten Schadenshelfer; ihr vollständiger Spielablauf steht aus. Bestehende Chatkarten können beim Start vor den in `ready` registrierten Erweiterungen dargestellt werden; neu erzeugte Karten wurden geprüft.

Die 0.17.0-GitHub-Veröffentlichung enthält diese QA-Korrekturen nicht; sie sind im Paket 0.17.1 enthalten.
