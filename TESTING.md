# 0.17.1 · tatsächlich geprüfter Zwischenstand

In test12 / Foundry 14.364 / N5eB 3.1.1 alle vier Klassenfenster gerendert: je ein Launcher, keine alten großen Aktionsflächen, Öffnen ohne Chakra-Verbrauch. Ninjutsu-Shard im Fenster bestätigt: Zähler 0 → 1, Zustand und Anzeige aktualisiert. Suche ohne Treffer geprüft, Ninjutsu-Darstellung visuell geprüft. Native Casts auf vier separaten Klassenfiguren: alle erfolgreich, je genau 5 Chakra und Chatkarte; Taijutsu-Folgeangriff und beide Heilwürfe ausgeführt. Der gemeldete Fehler der älteren Online-Version ist damit nicht online reproduziert oder nachweislich behoben.

`node --test tests/class-windows.test.mjs tests/medical.test.mjs`: 17/17 bestanden. Gesamttest: 204/238 bestanden, 34 bekannte Fehlschläge; gegenüber Commit 2b02d88 keine neu fehlgeschlagenen Tests. Syntax und statische ESM-Verknüpfung: 361 Module erfolgreich. Kein vollständiger Fähigkeitstest. Details: [Zwischenstand](ZWISCHENSTAND-0.17.1.md).

## Historische Prüfstände

# Unveröffentlicht · Medical-QA 23.10.2026

Lokale Tests sind inzwischen ausdrücklich freigegeben. Medical-Kernabläufe wurden in test12 tatsächlich geprüft und gefundene Fehler korrigiert: [Prüfbericht](MEDICAL-QA.md). 14/14 gezielte Tests erfolgreich; Gesamttest 201/235, 34 bereits im Ausgangsstand vorhandene Fehlschläge bleiben offen. Kein vollständiger Klassentest. Folgende historische Aussagen gelten für die jeweils damaligen Stände.

# 0.17.0 · Taijutsu-Gruppenfassung, ausdrücklich ungeprüft

358 JavaScript-Module: Syntax erfolgreich; statische Importverknüpfung erfolgreich, ohne Module auszuwerten (21.10.2026). Diff-Prüfung ohne Fehler. Ausschließlich statische Kontrollen; keine Unit-, Gameplay-, Browser-, visuellen oder Foundry-Integrationstests auf Nutzerwunsch. Keine Test-Actors oder Weltdaten verändert. Installation und Dateihashes sind kein Funktionsnachweis.

Die Gruppe prüft später native Castingdialoge/Abbruch, einmalige Ressourcenzahlung, Gegenangriffe und kombinierte Schäden, Zugwechsel/Upkeep, Quellenbesitz, parallele Effekte, gespeicherte GM-Anfragen und Fehlerzustände, Reload/Deaktivierung sowie klassenübergreifende Abläufe. Bedienung und bewusst manuelle Grenzen: TAIJUTSU-GRUPPENFASSUNG.md.

## Historische Test- und Entwicklungsnotizen

# 0.16.0 · ausdrücklich ungeprüfte Gruppenfassung

Auf Nutzerwunsch keine Unit-, Gameplay-, Browser-, visuellen oder Foundry-Integrationstests ausgeführt. Keine Test-Actors angelegt, kein Weltzustand durch diese Abschlussarbeit verändert. Statische Syntax-/Import-/JSON-Kontrolle wird in RELEASE-0.16.0.json protokolliert; Module werden dabei nicht ausgewertet.

Spätere Gruppenprüfung: tatsächlicher Featurebesitz; Öffnen/Abbrechen ohne Zahlung; einmalige Bestätigung/Zahlung; Heilwürfel/Mehrzielheilung/Preserve-Grenzen; Scalpel/Sabre und kombinierte Verteidigungen; Rast und Source-HP-Verbrauch; Conditions/Save-Wiederholung; parallele Quellen; höhere Wirkungsränge/Unterhalt; GM-Zielanfragen, Abbruch und Teilanwendungen; Transformation/Rückkehr; Companion-Profile und Einzelempfänger-Save; Reload/Deaktivierung/Wiederaktivierung. Erst diese Prüfung kann den Funktionsnachweis liefern.

Nachfolgende frühere Testberichte gelten nur für ihre jeweils genannten älteren Versionen.

# Teststatus und Workflow

## Genjutsu – Prüfung auf später verschoben

Auf ausdrücklichen Nutzerwunsch keine Unit-, Spiel-, Browser- oder Foundry-Integrationstests bis zum Abschluss aller Klassen. Ausschließlich Syntax-/statische ESM-Verknüpfungskontrolle wurde ausgeführt. Offene spätere Prüfungen: kombinierter Actualization-Verbrauch, Save-Sichtbarkeit, späteste Void/Disruption-Zuschläge mit Shocked, Abbruch/Erstattung, Mirage-Klone und Unterhalt, Misty-Charge-Ende, mehrere Kampfteilnehmer-Züge, Condition-Deferral und Konzentrationsende. Zusätzlich später prüfen: echte Munition unverändert, geworfene temporäre Waffen ohne Inventarupdate, höchste Waffenstufe, Smite-Kritik/Zugbegrenzung/Schadenszusammenführung, getrennte Strahlen, Rückgewinnung, Moment-Abbruch und kombinierter Actualization-Verbrauch, gemeinsame Konzentration und Ersatz nur eigener Moment-Effekte. Kein Funktionsnachweis für den Arbeitsstand.

## 0.14.0 — ausdrücklich ohne Spieltests

Auf Nutzerwunsch wurden **keine Unit-, Gameplay-, Browser-, visuellen oder Foundry-Integrationstests** für diese Erweiterung ausgeführt. Vorhandene Testergebnisse zu 0.13 und älter belegen 0.14 nicht. Es gibt keine neuen Testdateien.

Durchgeführt: statische JavaScript-Syntaxprüfung, ESM-Import-/Export-Verknüpfung ohne Auswertung und JSON-Parsing (115 Module, ESM-Verknüpfung ohne Auswertung und drei JSON-Dateien erfolgreich). Das erkennt Ladefehler, bestätigt aber weder Foundry-Datenpfade noch Ressourcen, Effekte oder Regeln zur Laufzeit. Die tatsächliche Gruppenprüfung steht aus. Ein erforderlicher Reload ist keine erfolgreiche Integration.

Für die Gruppe besonders relevant: mehrfacher Schaden derselben Karte, Abbruch/Teilfehler und GM-Auflösung, gemischte Immunität/Resistenz bei Deadly Tradition, gemeinsame Imbuement-Konzentration, Scroll-Verbrauch/Retain, fremde Zielrechte und Beschwörungs-Slot-Zuordnung. Das ist eine Liste ausstehender Prüfungen, kein ausgeführtes Testprotokoll.

## Aktueller Stand 0.13.0 — 15.10.2026

Der vollständige Unit-Lauf bestand 221 Tests ohne Fehler. Die native Gesamtreihe in test12 bestand 127 Prüfungen: Grundlagen 11, Ziele 9, Adaptive 7, Paare 10, Schaden 10, Solar 10, zusätzliche Traditionen 22 sowie 48 Regressionen der 17 normalen Moldings. Zusätzlich bestand das vollständige Modul-Deaktivieren/Reload/Reaktivieren mit vier Prüfungen.

Nach den abschließenden Chat-Render-/Konversionsänderungen wurden auf ausdrücklichen Nutzerwunsch nur gezielte Nachprüfungen ausgeführt: fünf einschlägige Unit-Tests sowie drei native Abschlussprüfungen (Manifest/API 0.13.0, tatsächliche Infusion-Konversion durch Macabre und synchron gespeicherte Casting-Metadaten). Die vollständige 127er-Reihe wurde danach nicht nochmals wiederholt.

Tatsächlich über die Browseroberfläche bedient: Blaze Walker auswählen, geänderten Gesamtpreis 21 sehen und Cast mit genau 21 Chakra bestätigen; Inventarquelle unverändert. Nach echtem Welt-Neustart wurden die neuen Versionsdaten geladen. Der nachgelagerte System-Render-Hook erhält die eigenen Chatpanels; 97 montierte eigene Karten wurden beobachtet. Native Angriffs-/Schadensschaltflächen bereits angewendeter Imbuement-Casts sind gesperrt. Der lange Castingdialog ist auf die Fensterhöhe begrenzt.

Nachweise im outputs-Ordner des Entwicklungsprojekts: SUBCLASS-MOLDING-NATIVE-RESULTS.json, SUBCLASS-MOLDING-LIFECYCLE-RESULTS.json, SUBCLASS-MOLDING-FINAL-PROBE-RESULTS.json, SUBCLASS-MOLDING-CHAT-UI-PROOF.json, SUBCLASS-MOLDING-UI-CAST-RESULTS.json sowie Unit-/Check-Protokolle und Screenshots. Die normale .js-Testreihe kann in test12 als GM über SUBCLASS-MOLDING-FULL-SUITE-MACRO.js ausgeführt werden; sie verändert ausschließlich eigene Testfixtures, nutzt echte Foundry-Dokumente und native Würfe, beantwortet ihre Bestätigungsdialoge aber kontrolliert. Das ist keine visuelle Prüfung jeder einzelnen Dialogvariante.

Nicht ausgeführt: echte gleichzeitige Spieler-/GM-Clients, jede mögliche Jutsu-Sonderformel, sämtliche Kombinationen fremder Module sowie native Kampfwechsel für jede einzelne neue Ablaufvariante. Zug-/Runden-/Minuten-Grenzen sind automatisch getestet; nicht mehr zuordenbare Kämpfe/Initiativen und Abläufe ohne Kampf haben manuelle Endkontrollen. Generational besitzt keine unbestätigte allgemeine Counter-/Dispel-Engine; weitere Combination-Grundregeln bleiben ausdrücklich manuell. Das Originalsystem und die Class Mod Library wurden nicht bearbeitet; beide vorhandenen System-Dateihashes stimmen mit 0.12.0 überein.


## Historischer Meilenstein 0.11.0

151 Unit-Tests bestanden. Manifest, JSON, Lokalisierung und 41 Modul-JavaScript-Dateien geprüft. Neue Tests decken Refined-Auswahl, Rast-/GM-Freigabe, eindeutige Schadenswürfel, Snapshot/Folgekonfigurationen, Dropdown-Optionen, Mote-Unterhaltsvorschau, Poolverbrauch, Professor-Grenze/Reihenfolge, Zielbestätigung, additive Void-Zuschläge, Unterhaltsausschluss, reservierte persönliche Pools, Zielmutation/Replay-Sperren und gleichzeitige GM-Anfragen im selben Client ab.

Tatsächlich ausgeführte native Reihen in test12: NINJUTSU-REFINED-RESULTS.json (7), NINJUTSU-POOLS-RESULTS.json (10), NINJUTSU-011-RELOAD-RESULTS.json (8), NINJUTSU-TARGET-RESULTS.json (10), NINJUTSU-FINAL-RESULTS.json (9): insgesamt 44 erfolgreiche Assertions plus eine bestandene native Abbruchprüfung der finalen UI (45). Das sind Prüfungen, keine Behauptung von 44 vollständigen Casts. Die UI wurde zusätzlich tatsächlich bedient und kontrolliert; Nachweise werden in NINJUTSU-UI-RESULTS.json / NINJUTSU-UI-OBSERVATION.json und NINJUTSU-CASTING-0.11.0.png gespeichert.

Refined: SG/die Bonus, unverändertes Inventar-Jutsu, tatsächlicher Damage-Roll, gespeicherte Chatwahl nach Reload, reale Auswahl und echte lange Rast ohne Weltzeit-Vorstellen. Pools: endgültige Kostenreihenfolge, wirklicher Verbrauch, native kritische Lightning-Boni, dynamischer Konzentrationsunterhalt, additive Professor-Chakra und Verbrauch zuerst. Ziele: genau eine Void-Kreatur, Zuschlag nach Recovery, kein Unterhaltszuschlag, fehlendes Chakra ohne Verbrauch, native Shocked-Kosten, ausdrücklich bestätigte Lightning-Kreaturen mit nativer typed damage und persistierten Zielbelegen.

Erste native Läufe fanden eigene fehlende Finalvorbereitung von Castingklonen (SG undefined bzw. duration.getEffectData), leere Select-Optionen durch das native Template und eine unvollständige Zielauswahl in der Testfixture. Korrigiert und erneut geprüft. Der letzte Dropdown-Abbruch allein beweist keine Auswahlfähigkeit; alle Optionen wurden separat am echten DOM gelesen und anschließend ausgewählt.

Nicht ausgeführt: zwei unabhängige Spieler-/GM-Clients, serverseitige atomare Mehractor-Rollbacks, jede Kombination fremder Ressourcenmodule, alle höheren Traditionseffekte, unabhängige sekundäre Castingaktivitäten, vollständiges Modul-disable/re-enable in dieser Version sowie eine komplette deutsche Foundry-Oberfläche. Nicht-GM-Berechtigungen/Refined-Rastersatz wurden automatisch getestet; echte Nicht-GM-UI noch offen. Kategorie-Aus-/Ein wurde nativ geprüft, Daten bleiben gespeichert. Bei abgeschalteter Trackerautomation wird der Professor-Anteil nicht bei zwischenzeitlichen fremden Änderungen nachgeführt; nach Reaktivierung darf seine Quellenzuordnung nicht als vollständig verifiziert gelten.

Prüfmakros dürfen ausschließlich als GM in test12 und auf markierten eigenen Fixtures laufen. Original-Systembundle und Manifest haben unveränderte SHA-256-Hashes (ORIGINAL-SYSTEM-HASHES-0.11.0.json). Kein Originalsystem, Class-Mod-Modul oder Produktionswelt verändert.


## Historischer Meilenstein 0.10.0

129 Unit-Tests bestanden; Syntax/Manifest/JSON und 34 Modul-JS-Dateien geprüft. Neue Ressourcenprüfungen decken Klassenstufen, echte Herkunft, Combination-Ausschluss, Rundung, unveränderte Quelldaten, Ausschalten, wiederverwendete vorberechnete Felder, eigene/konkurrierende Update-Batches und erfolgreiche/abgebrochene Verbrauchsvorgänge ab.

Native Prüfprotokolle: NINJUTSU-RECOVERY-RESULTS.json (11 Prüfungen, einschließlich tatsächlich abgebrochenem Castingdialog) und NINJUTSU-RECOVERY-RELOAD-RESULTS.json (6 Prüfungen nach Browserreload, inklusive nativer kurzer Rast und normalem Cast ohne Recovery). Im tatsächlichen Dialog wurde Recovery per Tastatur aus-/eingeschaltet: Anzeige 9 → 4 Chakra, Unterhalt 4. Screenshot: NINJUTSU-RECOVERY-0.10.0.png bei 1280 × 900. Prüfmakros sind separat gespeichert; neue Fixtures ausschließlich in test12.

Der erste native Lauf fand einen Rücksetzungsfehler beim Ausschalten, weil native prepareData-Pfade vorbereitete Felder wiederverwenden. Korrigiert mit exakt zugeordneten eigenen Vorwerten, durch Unit-Regression und wiederholten nativen Lauf geprüft. Ein weiterer Lauf prüfte die Erhaltung des tatsächlich bezahlten Castingbetrags im nativen Konzentrationsfeld.

Nicht geprüft: zwei unabhängige Clients, konkurrierende Fremdmodul-Updates, Module-disable/re-enable als Gesamtworkflow und jede Kombination mit höherstufigen Traditionseffekten. Setting-Aus/-Ein wurde tatsächlich geprüft. Bestehende 0.9.0-Mark-Integration wurde in diesem Meilenstein nicht erneut ausgeführt; sämtliche vorhandenen Unit-Tests wurden ausgeführt. Keine vollständige Klassenabnahme.

## Historische Prüfungen vor 0.10.0


## Aktueller Meilenstein 0.9.0

121 Unit-Tests bestanden, 0 fehlgeschlagen. Acht neue Mark-Tests plus native Schadensbestätigung: Formeln/Gesamtverbrauch, reservierte Einträge, Cancel ohne Wiederbelebung, GM-Rechte, lokale parallele Anwendung, Waffen-/Zielvalidierung, persistenter Fehlerzustand ohne Replay, Zugwarnungen und aktive-GM-Prüfung. Syntax/Manifest/JSON und 32 Modul-JS-Dateien geprüft.

Neun echte Foundry-Prüfungen in MARK-TRIGGERS-RESULTS.json: persistente Pending-Anfrage ohne Zielwirkung, additive Bleeding 2, abgewiesene Wiederholung, Fire-Schaden mit nativer Resistenz, gespeicherte native Schadensmenge, Teilverbrauch, Waffen-Schaden/Prone, Cancel-Rückgabe, Pending für Reload. Eigene Fixtures: Actor.2y53ciMF9BBNssRZ und Actor.XnBAaJpDl5r0ASTl; Token Scene.Kk51vfbNfgArFuOe.Token.7sIsXt6iA67AfzZG. Keine fremden Actors verändert.

Vier zusätzliche native Prüfungen in MARK-TRIGGERS-UI-RELOAD-RESULTS.json bestätigen die tatsächlich bediente Oberfläche: Pending nach echtem Browserreload, GM-Anwenden-Dialog abgebrochen ohne Änderung und anschließend genau einmal bestätigt (Bleeding 3), Ember-Anfrage über Karte gespeichert/abgebrochen, aktive Marke zurückgegeben und HP unverändert. UI-Prüfung mit demselben GM-Client, keine Zwei-Client-Spieler-/GM-Prüfung.

Visuell geprüft bei 1280 × 900; Screenshot NINJUTSU-TRACKERS-0.9.0.png. Zusätzlich bei 1024 × 768 sechs Karten ohne horizontalen Überlauf, gemessen in NINJUTSU-LAYOUT-0.9.0-RESULTS.json. Einspaltige Ansicht unter 400 px und heller Theme-Modus noch nicht getestet.

Offen: Ember-DR, höhere Moldings, Shard-/Mote-Verbrauch, vollständige Mehrclient-/Modul-Deaktivierungsregression, verwaiste UI nach Featurelöschung. Fehlerprüfung und Anwendung durch zweiten GM wurden mit Unit-Tests, nicht durch reale getrennte Clients geprüft. Original-Bundle-/Manifesthash weiterhin unverändert.

## Historische Teststände


Aktueller Stand 11.10.2026: 112 automatisierte Tests bestanden. Die folgenden älteren Abschnitte dokumentieren frühere Meilensteine; vollständige Regression bleibt offen.

## Ninjutsu-Tracker 0.8.0

Acht neue Unit-Tests: persistente Referenzen, Zieltrennung, Gruppenverlängerung/Maximum, Korrektur und Datenunveränderlichkeit bei Fehler, Expiry/Schema, Besitz-/Settingprüfung, lokale parallele Writes und persistente Zugwarnungen. Zusätzlich geprüft: zwei Verursacher mit jeweils fünf Marks auf demselben Ziel; Korrektur einer Quelle lässt die andere unverändert. Gesamt: 112 bestanden, 0 fehlgeschlagen. Manifest, JSON und 31 JS-Dateien geprüft.

In test12 ausgeführtes eigenes Makro NINJUTSU-TRACKER-INTEGRATION-MACRO.js: elf native Prüfungen bestanden. Sechs besessene Originalfeatures erkannt; alte Featureaktivierung ohne Verbrauch umgeleitet; gespeicherte Referenzen, zwei echte Tokens desselben Actors, unveränderter Ziel-Actor, Zählerkorrektur, Expiry ohne globale Weltzeitänderung und kein Wiederbeleben abgelaufener Einträge geprüft. Quellenfixture Actor.X6GBIViHbAhh995o und Zielfixture Actor.UW6AcO9KYzy8gFqn, beide testFixture-markiert. Zwei eigene Testtokens auf der bereits geladenen test12-Szene erstellt.

Tatsächliche UI: persönliches +1 abgebrochen (Zähler bleibt 1), bestätigt (2), nach echtem Reload erhalten. Anschließend echter Zieltoken ausgewählt, Breeze-Mark-Erzeugung bestätigt (2), Korrektur bestätigt (1), Zielreferenzen nach weiterem Reload erhalten. Vier vorhandene native Remaining-Felder ausgeblendet; alte Werte 5 bleiben gespeichert. Screenshot NINJUTSU-TRACKERS-0.8.0.png, Ergebnisse NINJUTSU-TRACKER-RESULTS.json und NINJUTSU-TRACKER-UI-RESULTS.json.

Nicht geprüft: vollständiges Modul-Aus-/Einschalten, mehrere Clients, Zugwarnung im echten Kampf (nur Unit-Test), externe Class-Mod-Interaktion und sekundäre Gameplay-Wirkungen. Diese Wirkungen sind noch nicht implementiert. API-Gruppenspeicherung ist keine vollständig atomare Mehrclient-Transaktion.

## Frühere Prüfungen bis 0.1.0 (historischer Stand)

- Manifest-/Konfigurationsdateien gelesen: Foundry 14.364, n5eb 3.1.1, Testweltzuordnung und Port 30000 bestätigt.
- Node/npm/Git/ripgrep aufgerufen: verfügbar.
- Paketauflösung für Playwright, @playwright/test und Puppeteer aus dem Workspace: nicht verfügbar. Keine globale Vollsuche vorgenommen.
- Windows-Automationsbibliothek geladen und Fensterinventar abgefragt: erfolgreich; kein Foundry-Fenster.
- CUA-Inventar: In-app Browser verfügbar, keine Tabs; Browserinteraktion mit Foundry noch nicht getestet.
- TCP-Prüfung 127.0.0.1:30000: `EACCES`, keine Aussage über Erreichbarkeit/Serverzustand möglich.
- Vier kopierte LevelDB-Kompendien iteriert: erfolgreich. Nur Kopien im Workspace mit bestehender Foundry-Bibliothek geöffnet.
- Quellen-/Packanalyse: erfolgreich; kein Beleg für Laufzeitfunktionalität.
- `npm test`: 32/32 bestanden. Eignung/Ausschlüsse, Rangwerte, Clanzugehörigkeit, Stapelung, Priorität, Auswahl, Nutzungsbudget, Eingabevalidierung, unveränderliche Daten, native Basiskosten, Schutz gegen fremde Feature-Regelausgaben und Init/Ready mit Foundry-Fixtures.
- `npm run check`: Manifestdateipfade, JSON und neun Modul-JavaScript-Dateien erfolgreich geprüft.
- Lokale Anwendung gestartet; Setup, Weltstart und GM-Beitritt zu test12 im In-app Browser erfolgreich.
- Neues Modul durch Foundry als Version 0.1.0 erkannt; Screenshot `foundry-module-0.1.0.png` gespeichert.
- In test12 aktiviert und Reload ausgeführt; Game Settings zeigt Debug logging aus. Screenshot `foundry-foundation-settings.png`. Keine Browser-Warnungen/-Fehler mit Filter naruto5e-system-enhancements beim geprüften Laden.
- Gespeichertes Testmakro `N5ESE — Preview Smoke` (UUID `Macro.HxDNF5hN7mKmGGea`) ausgeführt: Kosten-API tatsächlich verfügbar; drei Kontextfälle ergeben 8/10/10 und castingCommit ist false. Erfolgsnotification und N5ESE_SMOKE_PASS im Browserlog bestätigt. Screenshot `foundry-api-smoke.png`; wiederverwendbarer Scripttext in SMOKE-MACRO.js. Das sind reine API-Prüfungen, keine Casts oder Actor-Preview-Integration.
- Backup von test12 bei noch nicht geladener Welt: `work/backups/test12-before-foundation-20261011`. Beim anschließenden Laden hat das Originalsystem automatisch Weltmigration ausgeführt. Keine eigene destruktive Migration implementiert.
- Alle 43 Manifestkompendien auf Workspace-Kopien strukturell gelesen: PACK-COVERAGE.json. Die Zählung topLevelSpells umfasst Items auf Packwurzelebene, nicht eingebettete NPC-Jutsu.

## Geplanter Ablauf

1. Testwelt test12 ausschließlich lokal nutzen; Class Mod Library nicht verändern.
2. Foundry starten und lokalen Browserzugriff verifizieren. Keine ungeprüfte Weltmigration oder Änderung der Foundry-Version.
3. Vor potenziell destruktiven Testoperationen Backup bei gestopptem Server; keine offenen LevelDB-Datenbanken live kopieren.
4. Native Node-Tests für den Domainkern, ohne zusätzliche Abhängigkeit beginnen.
5. Adaptertests prüfen Verbrauchsreihenfolge und bestehende Methoden mit realistischen Fixtures.
6. Integration: Dialog öffnen/abbrechen, Rangwahl, reduzierte bezahlbare Casts, temp Chakra, Sealed/Shocked, Unterhalt, Sofort-Cast, Reload, Moduleinstellung/Disable.
7. Dojutsu: unabhängige Aktivierung/Deaktivierung, Reaktivierungsfenster, eigene/fremde Effekte, Persistenz, zwei Clients.
8. UI in tatsächlichem Foundry ansehen und Screenshots prüfen; erst danach visuell verifiziert melden.

Historischer Stand 0.1.0: Browser-Workflow verfügbar, damals noch keine vollständige Cast-/Ressourcen-/Effektprüfung. Für den Makrotest wurde ein temporärer Viewport 1280×900 gesetzt und danach zurückgesetzt; die Standardauflösung kann Foundrys Minimum unterschreiten. Installierte Systemdateien sind ausschließlich lesende Referenz. Neue Testactors werden nur in test12 erzeugt; bisher wurde nur das Testmakro angelegt.



## Castingintegration 0.2.0 — tatsächlich ausgeführt

- 38/38 Node-Tests erfolgreich; Manifest/JSON und 11 Modul-JavaScript-Dateien geprüft. Neue Tests für Originalbasis, doppelte Installation, Setting-Bypass, Sonderkosten, Rangwahl, Diagnose, Ausschluss optionaler/nutzungslimitierter Modifier und Erhalt nativer Dialogfelder/-notizen. Shocked-Hinweis nur mit Fixture getestet.
- CASTING-INTEGRATION-MACRO.js als Macro.4oVRZeBFEsUrZV2b gespeichert und ausgeführt. Erste Serie fünf Prüfungen, finale Regression sechs einschließlich tatsächlich erzeugter Chatnachricht mit Kosten 8; beide erfolgreich. Schaden-/Zielwürfe nicht getestet.
- Zwei Actors: Actor.JZxENEly2js59NWE und Actor.zh5zr5n7EtqCBtBk. Beide markiert mit Modulflag testFixture, ausschließlich in test12. Kopien von Amplified Flames und Uchiha Flame Ball; nur die eingebettete Test-Jutsu-Kopie auf Basis 10 ohne Rangskalierung gesetzt. Originalkompendium unverändert. Makro legt je Ausführung einen neuen Actor an.
- Ohne Automatik native Kosten 10, mit Automatik C-Rang 8 und API-Basis weiterhin 10. temp=3/current=5: nativer Cast erfolgreich, danach beide 0. Insgesamt 7: abgelehnt und unverändert. consume=false: weiterhin 7. Chatnachricht dokumentiert 8.
- Erste Serie meldete fehlende gemessene Schablone ohne aktive Szene. Der Ressourcenworkflow war erfolgreich. Finaler Test deaktiviert nur für den Test Schablonenerstellung, keine solche Warnung mehr. Erwartete Warnung für unzureichendes Chakra sichtbar.
- CASTING-DIALOG-MACRO.js als Macro.cH42kJ0FA8OmTr20 ausgeführt. C-Rang: Spend 8, Basis 10 / -2 / 8. A-Rang: Spend 6, Basis 10 / -4 / 6 für bewusst nicht skalierende Testkopie; native Ability-Warnung bleibt sichtbar. Öffnen, Rangwechsel und Abbrechen: vor/nach 20 Chakra. N5ESE_CANCEL_PASS im Log.
- foundry-casting-dialog.png tatsächlich angesehen: Hinweis im nativen Layout lesbar, keine zusätzlichen Verbrauchskontrollen. Testsprache Englisch; deutsche Sprachdatei nicht separat visuell geprüft.
- Reload vor finaler Castregression erfolgreich. Welteinstellung per finally auf vorherigen Wert zurückgestellt (aus). Actors und Ergebnisse bleiben für Folgeprüfungen erhalten. Der Server kann die alte Manifestversion bis zum nächsten Paket-Neuladen cachen; neue Dateien und API sind 0.2.0.

Noch nicht ausgeführt: echtes Sealed/Shocked, Unterhalt/Konzentration, Module-Disable/Re-enable, mehrere Clients, andere Sheetvarianten und vollständige Class-Mod-Kompatibilitätsmatrix. Die native Verbrauchskette garantiert keine globale Transaktion oder Rollback nach bereits erfolgter Abbuchung; die Erweiterung ebenfalls nicht. Keine vollständige Transaktionssicherheit behauptet.

Temporärer Viewport 1280×900 zum Erreichen von Foundrys Mindesthöhe, danach zurückgesetzt. Systemdateien nur lesende Referenz.

## Version 0.3.0 — tatsächlich geprüft am 11.10.2026

- npm test: 47/47 bestanden. Auswahl/Keyword/Quelle, Elemental+Amplified additiv, Duplikate, stärkster Unterhalt, Minima, Refined-Hälfte, Befreiungen, dynamische Flagkopie, unveränderte gespeicherte Basis, Master-Weaver-Basisrang und Auswahlabbruch/Player-Schutz.
- npm run check: Manifest, JSON und 15 Modul-JavaScript-Dateien erfolgreich.
- Ausschließlich test12: Fixture Actor.sMW7vGPp5TA9PXlT; Kopie Uchiha Flame Ball absichtlich nur für den Test auf Konzentration/1 Minute, Basis 10, keine Rangskalierung geändert. Das ist keine Änderung der Jutsu-Regel. Actual Feat copies: Amplified Flames, Shinobi Edge, Elemental Specialization, Streamlined Chakra Efficiency.
- Beim nativen Item-Erwerb erscheinen Elemental- und Streamlined-Auswahl nacheinander; Fire/Ninjutsu gespeichert. Nach Reload erhalten. Bestehender Itembogen zeigt GM-Korrekturkontrolle; korrekte übersetzte Release-Bezeichnungen visuell geprüft.
- MAINTAIN-INTEGRATION-MACRO.js: neun erfolgreiche Assertions in echten Foundry-Dokumenten/nativen Methoden; Resultat MAINTAIN-TEST-RESULTS.json. Castingkosten 10–2–2=6, native Basisunterhalt 3, Shinobi+Streamlined nur stärkster => 2. Dialog zeigt diese Werte; Abbruch bleibt bei 30. Native Castabbuchung 30->24; Konzentrationseffekt gespeichert 3, getFlag liefert 2. Native Unterhaltszahlung temp1/current3->temp0/current2; gleiche Zugkennung nochmals keine Zahlung. Setting aus stellt Unterhalt 3 wieder her. Neuer Zug bei current1 beendet Konzentration ohne Abbuchung.
- Zugkennungen im Zahlungsprüfmakro sind isolierte Fixture-Parameter; kein tatsächlicher Combat-/Chat-Pay-Maintain-Button-Test und keine Änderung vorhandener Kämpfe. Keine Mehrclient-Transaktion behauptet.
- Screenshots MAINTAIN-CASTING-DIALOG.png und FEAT-RELEASE-CHOICE.png. Erste Feat-Dialog-Sichtprüfung fand Kontrastproblem; native Dialogklasse danach verwendet und erneut geprüft. Testoberfläche Englisch, deutsche Sprachdatei syntaktisch geprüft.
- Welteinstellung nach Tests auf vorherigen Wert zurückgesetzt. Keine Änderungen an fremden Actors, Szenen oder Kampfdaten. Original-Systemdateihashes bleiben unverändert.

Weiter offen: vollständiges Modul-Disable/Re-enable statt Settingwechsel, echte Runde/Chatbutton, reale Zustandskombinationen und Klassenmodule, Spielerclient-UI und Parallelität. Master-Weaver-Langrastwechsel nur GM-Korrektur. Ältere fremd modifizierte Effekte müssen vor Anwendung geprüft werden. Dojutsu noch nicht implementiert.

## 0.4.0 — tatsächlich geprüft, 11.10.2026

- 57/57 Node-Tests bestanden; Manifest/JSON und 18 Modul-JavaScript-Dateien geprüft. Neue Prüfungen: Aburame-Provenienz, Klassenlevel-Grenzen, Genjutsu-Mischkonzentration, Latent I, Signatur, Modusbesitz/Auswahl/schwere Rüstung, aufgerundete Hälfte, stärkste Reduktion, Ressourcenupdates und Wurfzeitpunkt, Player-Rastwechsel und Abbruch.
- ADDITIONAL-COSTS-INTEGRATION-MACRO.js in test12 als Macro.rA0cmLhuJRsQn4Ss: fünf erfolgreich ausgeführte Prüfungen. Beide Optionen verfügbar; Dialogabbruch verbraucht nichts; Technical Cast 10 Chakra + 1 Martial Die, gespeicherter Wurf und ceil-Hälfte korrekt; Force C-Rang 10 Chakra + 2 Martial Dice inkl. Aktivierung, Unterhalt 0; zu wenig Dice lässt Chakra/Pool unverändert. Testkopie eines Original-Jutsu ausdrücklich zu Taijutsu/Self/1-Minute-Konzentration geändert, keine solche Regeländerung am Original.
- Erste Serie scheiterte an einem Array statt String für concentration.end im Testmakro. Korrigiert und erfolgreich erneut ausgeführt; Fehler und Erfolg in ADDITIONAL-COSTS-RESULTS.json erhalten. Anschließend zusätzliche Level-6-Prüfung im Modus ergänzt und Fixturelevel entsprechend korrigiert; finale Serie siehe Logs.
- PASSIVE-COSTS-INTEGRATION-MACRO.js: sechs erfolgreiche native Actor-Preview/Reload/Rest-Prüfungen, PASSIVE-COSTS-RESULTS.json. Aburame 4->2, Latent I Cast 10->9, Adept Unterhalt 5->4, Split bei Klassenlevel 19 Unterhalt 5->2, Signatur plus Latent Cast 10->7. Force-Snapshot nach Reload weiter Unterhalt 0. Tatsächliche Full Rest ausschließlich am eigenen Fixtureactor durchgeführt; danach Force- und Master-Weaver-Auswahl nacheinander gesehen und abgebrochen.
- MAINTAIN-INTEGRATION-MACRO.js erneut ausgeführt: neun bestehende Ressourcenprüfungen bestanden, REGRESSION-0.4-RESULTS.json. Kein normaler Chakra-/Unterhaltsablauf durch den Modusadapter doppelt verbraucht.
- Tatsächliche UI-Bedienung der Force-Checkbox per nativer Tastatur geprüft: Konfiguration und dynamischer Hinweis auf Unterhalt 0 aktualisieren sich. CASTING-MODES-DIALOG.png visuell angesehen; native Struktur, interne Scrollleiste bei vielen Hinweisen. Englisch geprüft, Deutsch nur syntaktisch.
- Nur test12 und eigene markierte Actors/Makros geändert. Weltsetting per finally zurückgesetzt, temporären Viewport zurückgesetzt. System-Bundle/Manifest-Hashes erneut mit Referenz vergleichen.

Noch offen: echte Kampf-Action-Economy/Bonusverbrauch, Martial-Pool-Zugregeneration, mehrere Clients, Fehler/Rollback bei späterem Itemwrite, vollständige Mod-disable/re-enable-Matrix, Class-Mod-Ressourcen und komplette Feature-Boni. Item-Preview-Tests der passiven Regeln sind keine Casttests jedes einzelnen Features. Keine vollständige Transaktionssicherheit behauptet.

Finale 0.4-Serie nach zusätzlicher Level-6-Prüfung erfolgreich: Actor.i9LHSPT85613vWZk, Martial-Die-Wurf 1; Unterhalt 5-ceil(1/2)=4. ADDITIONAL-COSTS-FINAL-RESULTS.json enthält fünf erfolgreiche Prüfungen. Der UI-Screenshot dieser finalen Serie wurde erneut aufgenommen.

## 0.5.0 — geprüft am 11.10.2026

- 67/67 Node-Tests bestanden; Manifest/JSON und 20 Modul-JavaScript-Dateien geprüft. Neue Fälle: Martial-Recovery-Perioden/Quelle/Klasse/Maximalwert, fremder Zug, native Profile/Updates, wiederholter Zug nach Verbrauch; Martial-Technique-Basistabelle, native Upcast-Differenz, Opt-out, Reduktionsausschluss bei erhaltenen Erhöhungen und Unterhalt; Frenzy übernimmt die native Aktionskonfiguration unverändert.
- COST-CLOSURE-INTEGRATION-MACRO.js in test12: Actor.LjIw22HUK2e7vh2B und eigener inaktiver Combat.L7r3gio0gGLWsBhJ, ausschließlich markierte Fixtures. 14 erfolgreiche Prüfungen in COST-CLOSURE-FINAL-RESULTS.json, die ersten elf zusätzlich in COST-CLOSURE-SETUP-RESULTS.json. Nativer Level-6-Poolmaximalwert 2, Martial Technique C-Basiskosten 5, B-Upcast-Preview 10, Opt-out mit Signature Control 8. Tatsächliche Native Casts ziehen 5 bzw. 8 ab; Technical-Verbrauch und Signature-Unterhalt bleiben zulässig.
- Eigener Combatant.recoverCombatUses mit tatsächlichen Actor-/Itemupdates: eigener Zug füllt auf, Wiederholung nach Verbrauch im selben Zug füllt nicht auf, neuer eigener Zug füllt auf, eigenes natives loseAll-Profil behält Vorrang, Setting aus erneuert nichts. Runde/Zug ausschließlich am Fixture-Combat über Combat.update mit advanceTime:0 verändert; kein Combattracker-Button- oder Multiplayer-Test behauptet. Fremde Combatants/Kämpfe nicht verändert.
- Tatsächliche Browser-Reloads: Modul aktiv -> deaktiviert -> wieder aktiviert. Ressourcen/Feature-Auswahl/Effektzustand bleiben erhalten; ausgeschaltet native Castkosten 10 und gespeicherter Unterhalt 2, erneut aktiviert Kosten 5 und effektiver Unterhalt 0. Vorherige Kosten-/Recovery-Einstellungen wiederhergestellt (true/false).
- Prüfharness zunächst bei ausgeschaltetem Modul am Foundry-getFlag-Scopecheck gescheitert. Rohflags lesend und explizite Update-Nutzung für eigenen Testzustand korrigiert; erfolgreiche Fortsetzung. Fehler separat in COST-CLOSURE-HARNESS-ERROR.json; kein behaupteter Enhancement-Laufzeitfehler.
- MARTIAL-TECHNIQUE-DIALOG.png visuell geprüft; vollständiger nativer Dialog mit erreichbarem Castbutton. Checkbox per Space abgewählt: Spend 5 -> Spend 8, Aufschlüsselung und Unterhalt aktualisiert; anschließend ohne Ressourcenänderung abgebrochen. UI Englisch, Deutsch syntaktisch geprüft.
- Bestehende Castingmodi erneut ausgeführt: 5/5 bestanden, CASTING-REGRESSION-0.5-RESULTS.json, Actor.00aFA1fWMeSXvp6z, Technical-Wurf 3. Bestehender Unterhalt erneut ausgeführt: 9/9 bestanden, MAINTAIN-REGRESSION-0.5-RESULTS.json. Zusammen 28 erfolgreiche native Prüfungen dieser Version, keine 28 Voll-Casttests. Temporärer Viewport zurückgesetzt und ursprüngliches eigenes Makro wiederhergestellt. Original-Systemmanifest/-Bundle unverändert.

Offen: Mehrclient-Synchronisierung, Fehler nach Teilwrites und vollständiger Rollback, Spielerclient/weitere Sheets, Rückwärtsnavigation und mehrere Combatants desselben Actors, individuelle Prüfung der zusätzlichen Kostenkandidaten, Class-Mod-Ressourcen. Aktionsökonomie-Automatisierung ist auf Nutzerwunsch nicht geplant. Umfang ist der bestehende Kostenworkflow samt Martial-Ergänzungen, keine vollständige Integration aller 164 Suchtreffer.

## 0.6.0 — geprüft am 11.10.2026

- 83/83 Unit-Tests bestanden, Manifest/JSON und 21 Modul-JavaScript-Dateien geprüft. 16 neue Tests decken Empowered/Medical-Ränge und Bedingungen, Quellen, Schadensdatentypen, mehrdeutige/identische Aktivitäten, Auswahl, stärkste Rangreduktion, pauschale Rabatte, bisherige Addition, Opt-out und Registry-Validierung ab.
- SPECIALIZATIONS-INTEGRATION-MACRO.js: Actor.DkTSWLND1olLCQQV, ausdrücklich markierte Testfixture. 19 erfolgreiche Prüfungen, dokumentiert in SPECIALIZATIONS-FINAL-RESULTS.json. Tatsächliche Erwerbsauswahl Acid und zweites Exemplar Poison; Acid als bereits verwendete Auswahl nicht erneut angeboten. Metallic Rust unverändert aus Kompendium: nativer C-Rang 9 -> 7; tatsächliche Abbuchung genau 7. Spore Caller 8 -> 6; Combo-Tai-Testkopie Rang D–S 10 -> 9/8/7/6/5. Kein Feat-Nutzungsverbrauch für passiven Rabatt.
- Medical + Non-Elemental bleibt 7 statt 5; Signature Control zusätzlich ergibt 5. Original-Jutsu-Chakrawert bleibt 9. Castingabbruch verbraucht nichts, Setting aus liefert 9. Tatsächlicher Browser-Reload erhält Acid/Poison und Kosten. Aktionsverbrauch im Test ausdrücklich manuell.
- Erste native Medical-Prüfung fand konservativ keinen Rabatt: echtes Metallic Rust hat zwei schädigende Aktivitäten mit identischer Acid-Art. Erkennung auf gemeinsame feste Typen erweitert und als Regression getestet; anschließend Serie vollständig bestanden. Keine falsche Erfolgsmeldung der ersten Serie.
- CASTING-REGRESSION-0.6-RESULTS.json: 5/5 bestehende Castingmodi erfolgreich, Actor.pO3PrZcHHEA0eNP2, Technical-Wurf 2. MAINTAIN-REGRESSION-0.6-RESULTS.json: 9/9 bestehende Unterhaltsprüfungen erfolgreich, einschließlich weiter additiver Elemental/Amplified-Wirkkosten 6. Zusammen 33 native Prüfungen, nicht 33 vollständige Casts.
- MEDICAL-CASTING-DIALOG.png visuell geprüft: Spend 5, stärkste-Rangreduktion-Hinweis, Basis 9 / Änderung -4, Castbutton erreichbar. MEDICAL-DAMAGE-CHOICE.png zeigt zweite Erwerbsauswahl. Test-UI Englisch; deutsche Texte syntaktisch geprüft, kein deutscher UI-Test behauptet.
- Original-Systemmanifest/-Bundle-Hashes unverändert; Kosten-/Recovery-Einstellungen true/false erhalten und ursprüngliches eigenes Additional-Costs-Makro wiederhergestellt. Temporary Viewport zurückgesetzt. Modul lokal installiert; Manifest wird beim nächsten Foundry-Paket-Neuladen neu eingelesen, API 0.6.0 bereits durch Browser-Reload verifiziert.
- Offen: dynamische Wahl alternativer Schadensarten im Damage-Roll-Dialog, Spielerclient/weitere Sheets, Mehrclient-/Rollback-Prüfungen und übrige Featvorteile. Bei mehrdeutigem Schaden keine automatische Zuordnung. Dojutsu noch nicht implementiert.

## Dojutsu 0.7.0 — tatsächliche Ergebnisse

99/99 Unit-Tests bestanden, davon 16 neue Dojutsu-Tests. npm run check: Manifest inklusive CSS-Pfade, JSON, Lokalisierungskollisionen und 26 JavaScript-Module bestanden. Erstes reales Rendering deckte eine Kollision Eye/Eye.left auf; korrigiert zu EyeLabel, nach Reload übersetzte Oberfläche geprüft.

18 native Prüfungen in test12 bestanden: vier besessene Definitionen, Gratis-Sharingan, native Chakra-Sicht, Temp-Chakra-zuerst, simultane Augen, wiederholte Aktivierung ohne Kosten/Effektduplikate, getrennte Deaktivierung, kostenlose Byakugan-Reaktivierung ohne Zeitverlängerung, Latent-I-Regeln, Einstellung aus/an, abgelaufener Zustand, Reload, UI-Augenwahl, Erhalt fremder Effekte und externe Aktivierungssperre, vollständiges Modul aus/an ohne verbliebene Boni oder erneute Gebühren. Testfigur Actor.0Oy72FVKb3fu3ncx ist markiert; ursprüngliches Additional-Costs-Makro wiederhergestellt. DOJUTSU-TEST-RESULTS.json und DOJUTSU-CONTROLS.png belegen Ergebnis und Ansicht.

DOJUTSU-INTEGRATION-MACRO.js erstellt eine neue markierte Testfigur und führt die ersten zwölf Prüfungen aus. Weitere Reload-/Disable-Prüfungen wurden auf der genannten Figur in separaten GM-Makros durchgeführt. Kein globales Weltzeit-Vorstellen; Ablauf wurde nur am eigenen Testzustand simuliert.

Nicht real integriert getestet: Kampf-/Out-of-Combat-Reichweitenwechsel (Unit-Test vorhanden), tatsächlich verstrichene Weltzeit, Spieler ohne GM, unabhängige gleichzeitige Clients, synthetische Token-Actors und zusätzliche fremde Dojutsu-Definitionen. Bestehende 83 Unit-Regressionsprüfungen bestanden; frühere Casting-/Unterhalts-UI-Integration wurde in dieser Version nicht erneut ausgeführt.

## 0.7.1 — tatsächliche Verifikation

104/104 Unit-Tests bestanden, Manifest/JSON/Lokalisierung und 27 JavaScript-Module geprüft. Elf native Tomoe-Prüfungen erfolgreich an Actor.F3lBgMtFJSIsT7E4, ausschließlich eigene markierte test12-Figur: keine Freigabe durch Level allein, höchste GM-Freigabe, +5 passive Wahrnehmung, keine Kosten/Störung des Byakugan, keine doppelte +5-Anwendung bei zwei Sharingan, unabhängiges Downgrade/Deaktivierung, verifizierte Levelgrenzen, Wiederherstellung nach Leveländerung und Einstellung aus/an. Zehn wiederholte prepareData-Aufrufe und ein echter Reload bewahren exakt passive 15 (Basis 10) und Chakra 15. UI-GM-Auswahl 2/3 bedient; finaler Wert 3 gespeichert.

TOMOE-TEST-RESULTS.json, TOMOE-REPEAT-RESULTS.json und TOMOE-RELOAD-RESULTS.json belegen Ergebnisse; DOJUTSU-TRACKER-0.7.1.png zeigt die neue echte Oberfläche ohne Augen-Auswahl. TOMOE-INTEGRATION-MACRO.js ist wiederholbar, erstellt eine neue eigene Figur. Original-Additional-Costs-Makro wiederhergestellt. Ein erster Native-Test scheiterte wegen initialer Formelbonus-Akkumulation; nach Fix und neuer Figur erfolgreich.

Kein echter Nicht-GM-UI-Test; API-Verweigerung für Nicht-GM automatisiert geprüft. Vollständiges Modul aus/an aus 0.7.0 wurde nicht erneut ausgeführt; neutrale final-Placeholder werden per Unit-Test geprüft. Action Economy bleibt manuell.

Letzte visuelle Prüfung: echte Selects besitzen Optionen, Lightning-Mote-Auswahl ändert die Unterhaltsanzeige von 5 auf 4; Refined-SG und Elemental-SG konnten gewählt werden. Abbruch dieser finalen Auswahl erhält Chakra und sämtliche Pool-Einträge (NINJUTSU-UI-RESULTS.json). Die native UI-Sprache der Testwelt ist Englisch mit deutschen Enhancement-Texten. Gespeicherte Void-Anfragen müssen vor dem relevanten nächsten Ziel-Cast vom GM angewendet werden; bereits vergangene Casts werden nicht rückwirkend geändert.


## Efficient Molding 0.12.0 — 2026-10-13

Alle 17 normalen Moldings sind an den vorhandenen Castingdialog, native Würfe und Chatkarten angeschlossen. Gemeinsamer Pool mit nativer Rast, frei zuordenbare kostenlose Nutzungen, separate Chakra-Zusätze, kompakter Sheet-Zähler und GM-Korrektur. Unterklassen-Moldings folgen separat. Aktionsökonomie bleibt manuell.

175 Unit-Tests bestanden, 0 Fehler; Syntax/Manifest/JSON für 55 Moduldateien bestanden. Foundry 14.364 / n5eb 3.1.1 / test12: 8 Basis-Castingassertionen, 40 Workflowassertionen und 5 Prüfungen nach tatsächlichem Reload. Die Workflowtests benutzen echte Dokumente, Ressourcen, native Würfe/Schaden/Effekte und eigene Testtokens; ihre Bestätigungsdialoge werden kontrolliert beantwortet. Das ist keine visuelle Prüfung jeder Dialogvariante.

Zusätzlich tatsächlich über Browser-UI bedient: Potent/Subtle/Heightened, kostenlose Neuzuordnung, Chakra Recovery und Abbruch ohne Verbrauch; Distant/Subtle-Cast mit genau zwei gemeinsamen Nutzungen und 11 Chakra; GM-Zählerkorrektur und sichtbare Pips. Screenshots: EFFICIENT-MOLDING-DIALOG-0.12.0.png und EFFICIENT-MOLDING-TRACKER-0.12.0.png. Reproduzierbare native Makros und JSON-Belege liegen unter outputs/EFFICIENT-MOLDING-*.

Getestet: alle 17 normalen Optionen, Quelle unverändert, Rang-/Combination-Eligibility, zwei Zielzuordnungen, erster Save mit Nachteil, Temp-HP-/Resistenz-/Immunitätsbehandlung, Potent, Echo-Doppelverbrauch, Focused/Redirected/Tenacious, native Rast, Erstattung, Setting aus/an, Shocked + unabhängige Void-/Molding-Zusätze und normaler Unterhalt. Nicht integriert getestet: echte gleichzeitige Mehrclient-Casts, Nicht-GM-UI-Sitzung, sämtliche möglichen Drittmodule und jede einzelne Jutsu-Sonderformel. Unterklassen-Moldings gehören zum nächsten Meilenstein.

Zusätzliche sechs native Regressionstests für gespeicherte Refined-/Mote-SG, Schadenswürfel, Lightning-Bonus, Professor-Chakra und unveränderte Inventarquelle bestanden. Ein erster Wiederholungsdurchlauf fand einen beim Abschalten erhaltenen Alias-Nutzungswert; nach Korrektur und neuem Unit-Test bestehen alle 40 Workflowtests einschließlich Setting aus/an. Belege: EFFICIENT-MOLDING-REGRESSION-RESULTS.json und EFFICIENT-MOLDING-WORKFLOW-RESULTS.json.

Die letzte echte UI-Auswahl wurde abgebrochen: Chakra 500 → 500, Inventarquelle unverändert, Manifest und API 0.13.0. Der Dialog lag bei 900 Pixel Fensterhöhe vollständig zwischen y=16 und y=863; Cast-Schaltfläche sichtbar. SUBCLASS-MOLDING-UI-CANCEL-RESULTS.json und der finale Dialog-Screenshot dokumentieren diesen Stand. Die abschließende rein visuelle Ausblendung doppelter nativer Use-Zeilen erhielt auf Nutzerwunsch keinen weiteren breiten Regressionstest.

Statische Kontrolle 16.10.2026: 149 JavaScript-Module syntaktisch geprüft und ESM-Verknüpfung ohne Auswertung erfolgreich; drei Modul-JSON-Dateien parsebar. Kein Unit-, Spiel-, Browser- oder Foundry-Test. Für Smite später besonders: gemeinsamer nativer DR-Budgetverbrauch und Psychic-Resistenzrundung, geflavorierte Teilformeln, veränderte/gelöschte Waffenschadenskarte und Sperre doppelter Einzelanwendung.

Spätere Infusionsprüfung: beide Waffen getrennt, Ersetzen abbrechen, Cast abbrechen/erstatten, gespeicherten Cast nach Reload finden, erfolglosen Treffer nicht verbrauchen, erfolgreiche Freigabe genau einmal, nur Einzelziel trotz ursprünglicher Fläche, −1d4 samt vorhandenen Save-Modifikatoren, verbleibende Effektlaufzeit und Konzentrationsende, falsches Ziel und doppelte native Anwendung abfangen, GM-Anfragen und Actualized Power. Bukijutsu: neues Attribut bei Angriff/Schaden/berechnetem SG ohne Übernahme fremder Genjutsu-Boni; D/C zulassen und höheren gewählten Rang ablehnen. Nicht ausgeführt.


### Genjutsu-Arbeitsfortschritt 16.10.2026

Genjutsu-Teilstand 16.10.: Syntax/statisches ESM-Linking von 164 Modulen und Lesen von 3 JSON-Dateien erfolgreich; Module nicht evaluiert. Auf Nutzerwunsch keine neuen automatisierten oder Foundry-/Browser-/visuellen Tests. Kein Laufzeitnachweis.


Weiterer Teilstand: 167 ESM-Dateien statisch geprüft und verknüpft, drei JSON-Dateien gelesen; keine Module evaluiert, keine Spiel-/Integrations-/visuellen Tests.


Aktueller Quellstand: 168 ESM-Dateien und drei JSON-Dateien; ausschließlich Syntax/statische lokale Importprüfung. Keine Unit-, Foundry-, visuellen oder Spieltests.


### Signature Work und zusätzliche Cast-Verstärkungen (Quellstand, 16.10.2026)

Signature Work speichert ein tatsächliches bekanntes E-/D-Genjutsu am ursprünglichen bezahlten Programm. Folgecasts kosten normal Chakra beim ursprünglichen Wirker und starten erst bei erfolgreicher Zahlung eine neue 60-Sekunden-Sperre. Auslöser, Illusionsort, Reichweite und Ziele werden bestätigt. Kein neuer Actor, keine automatische Aktion. Beschädigung/Bannung manuell beenden; technische Teilfehler verlangen GM-Prüfung ohne automatische Wiederholung.

Words Of Detriment und Illusionary Fury verändern nur die Cast-Kopie und bezahlen im nativen Batch. Zusätzliche Zielwirkungen: bestätigter Save und quelleneigene Conditions/Mali. Permeating Seals bezahlt 8 Chakra zusätzlich und speichert das Reaktionsverbot; Reaktionen bleiben manuell. Broken Reality verstärkt ausdrücklich ausgewählte bereits vorhandene Mali. Crest Of Psychosis enthält bestätigte Zielzug-Chakraschäden; AD-Escrow fehlt weiterhin. Distant Influence enthält zunächst nur die bestätigte Abwehr, nicht die True-Strike-Aura.

Weiterhin unvollständiger, nicht installierter Quellstand. Keine Gameplay-, Browser-, visuellen oder Integrationstests.


Sensory-/Insignia-/Folgecast-Teilstand weiterhin ohne Laufzeitprüfung. Die bloße Syntax-/ESM-Verknüpfung prüft weder Foundry-Modellmutationen noch Sichtweiten, Save-DC, Ressourcen, Ereignisreihenfolge, Mehrclientverhalten oder Temp-Chakra-Zahlungen. Die Gruppe prüft diese Abläufe später.


17.10.: Auch Skill-Lernpakete, Temporal-Grant, False Security und Fear-Condition-Anfragen sind nicht spiel-/integrationsgetestet. Später prüfen: Reihenfolge Pure/Fury/Overwhelming, ursprüngliche Condition-Dauer, nur gewählte Kreatur, Schutz von unrelated Effekten, Immunitätsausnahmen und Wegfall der Aura, Power-/Infusionsrouting, native Skill-Overrides und mehrfache Actor-Präparation.

17.10.2026: Fear-/Keeper-/Aura-/Sensory-Erweiterungen nur als Quellstand. Keine Gameplay-, Unit-, Foundry-, Browser- oder Visualtests auf Nutzerwunsch. Statische Prüfung separat protokolliert.

17.10.2026 nach Unterbrechung: Syntax aller 185 ESM-Dateien, statische lokale Importverknüpfung ohne Modulevaluation und drei JSON-Dateien erfolgreich. Keine Unit-, Gameplay-, Foundry-, Browser- oder Visualtests. Keine Installation. Diese Prüfung bestätigt kein Laufzeitverhalten.


17.10.2026 – Nutzerwunsch weiterhin eingehalten: keine Unit-, Gameplay-, Browser-, Visual- oder Foundry-Integrationstests. Die Gruppe prüft später unter anderem gemeinsamen Pure-Terror-Schaden, Crest-Rückgabe nach Rast/Erstattung, Phantom-Pain-Einmal-pro-Zug, Aura-Korrekturen, Darkness-Zielbindung, Blade-Kopien nach Reload und besondere Konzentration bei Delay-Freigabe. Noch keine Ausführungs- oder Freigabeaussage.

Statische Kontrolle dieses Zwischenstands: 195 ESM-Dateien syntaktisch geprüft, lokale ESM-Importverknüpfung ohne Auswertung erfolgreich, drei Konfigurations-JSON-Dateien gültig; git diff --check ohne Befund. Keine Laufzeit-/Spieltests.


0.15.0 Gruppenfassung (17.10.2026): zusätzlicher quelleneigener Beobachterkreis für Sensory-Markierungen über Token-Detection und bestätigte Wurfkontexte; parallele Song-Konzentrationsgruppe; Lucid-Effektauswahl/-Unterdrückung; Brawler-Virtualisierung; Mirage-Sonderdaten und Bedienelemente. Keine öffentlichen Schreib-APIs für diese internen Flags. Noch nicht spiel-/integrationsgeprüft. Grenzen nativer manueller Jutsu-Abläufe ausdrücklich in GENJUTSU-GRUPPENFASSUNG.md.

0.15.0 Abschlussstand: 202 ESM-Dateien syntaktisch geprüft, lokale statische ESM-Verknüpfung ohne Auswertung und drei Konfigurations-JSON-Dateien erfolgreich; keine Laufzeit-/Unit-/Spieltests. Ergänzt: besitzgeprüfter No-Light-Fracture-Zielmarker, tatsächliche Save-Trigger, gesenkte Wirkungsschwellen und persistente Monats-Erholung; Maddening-Pain-Angriffsfolge ohne doppelte Phantom-Pain-Anwendung. Jutsuspezifische narrative Regeln werden nicht erfunden.

## Medical-Nin — Entwicklung, 17.10.2026

Medical-Entwicklung ab 17.10.2026: auf ausdrücklichen Wunsch keine Unit-, Gameplay-, Foundry-, Browser- oder visuellen Tests. Ausschließlich Syntax-/statische lokale Import-/JSON-Prüfung. Keine Behauptung erfolgreicher Laufzeitintegration, keine Installation dieser unfertigen Änderungen.


### Medical-Fortsetzung · 17.10.2026

Medical-Fortsetzung: 227 ESM-Dateien syntaktisch geprüft und lokale Imports statisch verknüpft, ohne Modulauswertung; drei Modul-JSON-Dateien lesbar. Unit-, Gameplay-, Foundry-, Browser- und visuelle Tests wurden auf Nutzerwunsch nicht ausgeführt. Keine Welt oder Einstellung verändert.

### Taijutsu source milestone (18 October 2026)

Historical checkpoint: 283 ESM modules. On 19 October the expanded source passed static syntax/import linking for 296 ESM modules and parsing of three module JSON files; modules were not evaluated. No unit, gameplay, UI, browser or Foundry integration tests were executed, as requested. Installed 0.16.0 remains unchanged. Group verification must include mixed damage Devastating receipts, immunity/THP with Savage Force, selective Furious clones, numeric-only Precise compensation, cancellation/interruption of utility attack groups and Medical multiclass workflow selection. Also pending: paid/effective Flaming rank and upkeep, d12 cap, first-attack/save claims, Dynamic pair interruption, shared Matrix allowance/reset, timed flight and Neo senses, first two Enhanced Blows hits per action/cast, and opt-in save-preparation persistence across cancelled later dialogs. A successful static link is not evidence of runtime behavior. A subsequent small Matrix effect-deletion guard received syntax checking only.

### Disturbance source continuation · 20 October 2026

302 modules passed syntax and static local import linking, plus3 module JSON files parsed; no module evaluation. Follow-up source edits receive only static checks. No unit, gameplay, browser, visual or Foundry integration tests were run. Pending group checks include the corrected Taijutsu snapshot allow-list, two-attack cancellation/reservation, actual hit confirmation, shared Flurry limit, Endurance17 reductions, Barrage native uses and next typed damage, Shatter linked concentration/paid Chakra/old cards/custom macros, interrupted cast guards, and Disturbing/Furious/Talent composition. No world changed and no module installed.


20.10.2026: Neue Stancer/Ruin/Unterklassen-Quellen ausschließlich statisch auf Syntax/Importverknüpfung geprüft; keinerlei Auswertung der Foundry-Module oder Spiel-, Unit-, Browser-, visuelle oder Integrationstests. Die Nutzergruppe prüft später. Offene Quellumfänge sind keine getesteten Funktionen.

## Taijutsu-Fortsetzung · 21.10.2026

Unveröffentlichter Quellstand. Elemental Armor hängt seinen bestätigten Unterhalt an denselben nativen Combat-Recovery-Updatebatch nach der Martial-Pool-Erneuerung. Außerhalb des Kampfes führt die vorhandene bestätigte Zugerneuerung diese Schritte gemeinsam aus; Unterbrechungen verlangen GM-Prüfung ohne Wiederholung. Catalyst-Kurzschluss wartet bei einer laufenden Actor-Transaktion auf deren Freigabe. Der interne Hook `n5ese.castingActorUnlocked` signalisiert ausschließlich die freigegebene lokale Sperre und gewährt keine Ressourcen. Keine Spiel- oder Integrationstests.

21.10.2026: Weitere Taijutsu-Quellen ergänzt. Gemäß Nutzerwunsch keine Laufzeittests. Syntax-/Importprüfung prüft ausschließlich Parsing und statisches Verlinken, keinen Foundry-Ablauf.


21.10.2026: Source-Code-/Hurricane-Ergänzung ausschließlich statisch geprüft. Keine Gameplay- oder Integrationstests; keine Installation. Statischer Link prüft Imports/Exports ohne Module auszuwerten.
