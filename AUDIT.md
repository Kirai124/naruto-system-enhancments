# Vier-Klassen-Zwischenstand · 0.17.1

- **UI-01 · QUALITY OF LIFE · P1:** verstreute Sheet-Aktionsflächen. Betroffene Renderer in src/ui und src/foundry registrieren Panels in einer gemeinsamen klassenbezogenen Registry. Erwartet: ein Button je vorhandener aktiver Klasse, gleiche ausführbare Aktionen im Fenster. Tatsächlich an vier Testfiguren geprüft, keine Ressourcenänderung beim Öffnen. Wiederverwendbar für weitere Klassen.
- **TAI-UI-01 · BUG · P1:** availableFeatureActions prüfte nur Featurebesitz, nicht die konkrete Nin-Tai-Natur/Form. Deshalb erschienen fremde Lightning-/Wind-/Water-Folgeaktionen. Definitionen erhalten zusätzliche reine Verfügbarkeitsbedingungen; dieselben Bedingungen gelten bei direkter Ausführung. Tests: Fire gegenüber Wind/Lightning/Water, aktive Form, Armor und fehlender Featurebesitz erfolgreich. Bestehende gespeicherte Vorgänge werden nicht gelöscht.
- **CAST-ONLINE-01 · POTENTIAL ISSUE · P1:** Nutzer meldet Cast-Blockade mit älterer Online-Version. Neue lokale Fassung wirkt vier native Klassen-Casts erfolgreich. Ursache online noch unbekannt; Online-Welt unberührt. Dort nach Veröffentlichung mit passender Foundry-/Systemversion überprüfen; kein behaupteter Online-Funktionsnachweis.

## Frühere Befunde

# Medical-QA · bestätigte Befunde 23.10.2026

| ID | Klasse / Priorität | Quelle / Befund | Lösung / erforderliche Prüfung |
| --- | --- | --- | --- |
| MED-QA-01 | BUG · hoch | medical-companions.mjs: Collection.flatMap verhindert Vorbereitung | Array-Konvertierung; echte Level-20-Vorbereitung und Unit-Test erfolgreich |
| MED-QA-02 | BUG · hoch | medical-scalpel.mjs: fehlender Schadenszugang und Attributsbonus | Generischer Waffen-Schadenshelfer, explizites @mod; Angriff, Schaden, HP/THP und Wiederholung geprüft |
| MED-QA-03 | BUG · hoch | molding-chat.mjs: löscht fremde Klassenaktionen | Eigener Selektor; Medical-Heil-/Trefferkarten tatsächlich bedienbar |
| MED-QA-04 | BUG · mittel | ninjutsu-class-rolls.mjs / genjutsu-effects.mjs: null-Actor bei Kompendium-Profilen | Generische Guards; zwei echte Profile nach Reload fehlerfrei |
| MED-QA-05 | QUALITY OF LIFE · mittel | Sheet mit mehreren Medical-Panels | Gemeinsames Fenster, Ressourcen, Suche, Gruppen; UI geprüft |
| MED-QA-06 | BUG · mittel | medical-window.mjs: bringToFront vor Render | Nur bei gerendertem Fenster; erneutes Öffnen ohne Warnung |
| MED-QA-07 | BUG · mittel | medical-healing.mjs: Nullbetrag umging Truthiness-Guard | Explizite Validierung vor Zahlung; gültiger Zweierverbrauch im Spiel geprüft |
| MED-QA-08 | BUG · mittel | Never On The Front Lines: permanenter Dash-Transfer | Exakt quellgebundene Laufzeitunterdrückung; Bewegung 30 bleibt 30, Originaleffekt unverändert |
| MED-QA-09 | POTENTIAL ISSUE · hoch | Gesamttests: 34 ältere Fehlschläge, zuvor 35 | Keine neuen Fehler gegenüber Git-Baseline; weitere Analyse offen |

Evidenz, Verhalten und verbleibende Prüfungen: [Medical-QA](MEDICAL-QA.md). Der analoge Collection-Fix in taijutsu-condition-cleanup.mjs ist enthalten; dessen tatsächlicher Taijutsu-Ablauf bleibt ungeprüft.

# Taijutsu · Implementierungsabschluss 21.10.2026

135 Quellfeatures und 14 Unterklassen katalogisiert, Implementierungsrunde abgeschlossen. Einzelbefunde und Nachweise: [Einzelcheckliste](TAIJUTSU-SPECIALIST-CHECKLISTE.md), audit/TAIJUTSU-SOURCES.json, audit/TAIJUTSU-DECISIONS.json und audit/TAIJUTSU-IMPLEMENTATION-STATUS.json. BUG-Korrekturen für Heavy-Armor-Movement, Perfect Body und wiederholte Effektkeys bleiben quellseitig integriert; keine Aussage über Laufzeiterfolg. MISSING AUTOMATION und QUALITY OF LIFE sind entsprechend der manuellen Grenzen in der Gruppenfassung umgesetzt. POTENTIAL ISSUE: gemeinsame Gruppenprüfung, unstrukturierte Fremdmechaniken und klassenübergreifende Spezialtreffer. Native funktionierende Klassenwahl/Advancements bleiben WORKING AS INTENDED erhalten.

## Historische Entwicklungs- und Release-Notizen

# Taijutsu · erster Audit 18.10.2026

135 Features / 14 Unterklassen erfasst. BUG-Kandidaten mit Quellbeleg: Enhanced Movement ohne Heavy-Armor-Gate; Perfect Body mit falschen pauschalen DEX-Save-Ridern; mehrfach gleiche verwaltete Effektkeys wurden auf den ersten Wert abgebildet. Modulkorrekturen vorbereitet, Laufzeit ungeprüft. Martial-Defense-AC, Martial Technique und bestehende Zug-Recovery weiterverwenden. Guards, Martial-Techniken und Unterklassen enthalten MISSING AUTOMATION; vollständiger Einzelstatus und offene Fälle siehe TAIJUTSU-ARBEITSSTAND.md und audit/TAIJUTSU-IMPLEMENTATION-STATUS.json. Noch keine Taijutsu-Veröffentlichung.

# Medical-Nin · Abschlussstatus 18.10.2026

98 Quellfeatures, elf Unterklassen und vier Doctrines katalogisiert. Klassenprogression widerspricht teilweise gespeicherten Skalierungen; nach Nutzerentscheidung ist die sichtbare Tabelle Grundlage der optionalen Modulkorrekturen. Heilung, Ressourcen und Feature-/Begleiterabläufe sind als ungeprüfte Gruppenfassung eingebunden. Einzelstatus: MEDICAL-SPECIALIST-CHECKLISTE.md bzw. audit/MEDICAL-IMPLEMENTATION-STATUS.json.

Offene Daten-/Kompatibilitätsgrenzen: fehlende Tenet-Texte ausdrücklich ausgenommen; unstrukturierte Summon-/Waffen-/Jutsu-Sondermerkmale manuell; Protector-Niedrigchakra-Kombinationen mit optionalen Fremdmodi benötigen Regeln; Unbreakable mit bereits laufenden Medical-Spezialtreffern benötigt gemeinsame GM-Prüfung. Keine Aussagen über Fehlerfreiheit oder tatsächliches Rendering. Priorität nach Klassenimplementierungen: gemeinsame Gruppenprüfung der in MEDICAL-GRUPPENFASSUNG.md beschriebenen Abläufe.

# Initialer Systemaudit

## Genjutsu Specialist – neue Erstbefunde

GEN-001 BUG: Actualization-Skala 3→9 widerspricht Featuretext PB; exakte installierte Formel wird besitzgeprüft vorbereitet korrigiert, eigene Formeln bleiben erhalten. GEN-002 BUG: Shroud of Shadows hat 1 statt textlicher 2 Nutzungen; exakte installierte Max-Formel auf 2 vorbereiten. GEN-003 BUG: Illusionary Chronicle speichert LR statt textlichem SR/LR; eigener exakter Recovery-Eintrag wird transient korrigiert. GEN-004 POTENTIAL ISSUE: Beguiler enthält doppelte Grants und nennt Transform bei Affection-Verweis; keine stillen Grant-Löschungen. GEN-005 POTENTIAL ISSUE: Native direkte AE-Condition-Anwendung und Actor.applyCondition nutzen unterschiedliche Immunitäts-/Resistenzpfade; universelle Regelprüfung nach Klassenabschluss. Quellen: GENJUTSU-SOURCES.json, Original class-/subclass-/t7-Packs und module/conditions.mjs, documents/active-effect.mjs, applications/components/effect-application.mjs. Priorität GEN-001 hoch; 002/003 mittel; 004/005 weitere Prüfung. Wiederverwendbarkeit: Ressourcenadapter, Quelle/Featurebesitz, sichere Condition-Anwendung. Benötigte spätere Tests: Ressourcen/Rast, AE- und Condition-Ränge, Originalworkflow sowie deaktivierte Einstellungen. Noch keine Laufzeitverifikation.

## Abschlusszuordnung 0.14.0 — Quellprüfung, keine Laufzeitbestätigung

| ID | Einstufung | Mechanik / Evidenz | Umsetzung / Priorität / ausstehende Prüfung |
|---|---|---|---|
| NIN-SCOPE-02 | WORKING AS INTENDED | Die beiden bislang unaufgelösten Basis-Grants sind Padded Cloth und D-Rank Jutsu Scroll; Quellen in NINJUTSU-BASE-GRANTS.json. | Startausrüstung; keine Klassenregel ergänzen. Native Tradition/ASI-Advancements bleiben nativ. |
| NIN-SELECT-02 | MISSING AUTOMATION | Master-/Tai-/Buki-/Fusion-Auswahl und Summoning-Adept-Refined fehlen als strukturierter Ablauf. | P1, wiederverwendbare besitzgeprüfte Auswahl, transienter Casting-Kontext; native Inventar-/Rast-/Reload-Prüfung ausstehend. |
| NIN-POOL-02 | MISSING AUTOMATION | Fünf weitere Traditionen beschreiben endliche, zeitbegrenzte Pools; kein gemeinsamer Ziel-/Verbrauchsablauf. | P1, vorhandenes Ledger/GM-Journal erweitert. Gruppenminute vom Nutzer bestätigt. Ablauf/Parallelclients ungeprüft. |
| NIN-DEFENSE-02 | MISSING AUTOMATION | Deadly Tradition, Aegis und Ember-DR besitzen kontextabhängige Zielverteidigung. | P1, getrennte Adapter; Halbschaden mit fortbestehenden Immunitäten, stärkste Aegis mit anschließendem Ende aller Aegis bestätigt. Gemischte Schäden/Refunds ungeprüft. |
| NIN-LINK-02 | MISSING AUTOMATION | Imbuement, Scroll und Beschwörungszuordnung besitzen keine gemeinsame persistente Struktur; Slots sind nicht einheitlich modelliert. | P2, private Folgecast-Tickets, eigene Journale, ausdrücklich bestehende Actors/echte Ressourcenzähler. Teilfehler werden gesperrt. Mehrclient-Prüfung ausstehend. |
| NIN-RULE-02 | POTENTIAL ISSUE | Ink Affinity nennt auf Stufe 13 S statt A; Corroded besitzt keine native Schadensformel; Overcharge ist jutsuspezifisch unstrukturiert. | Wörtlich S−4 bestätigt. Corroded-Schaden und konkrete Overcharge-Wirkung ausdrücklich manuell. Keine Regel erfunden. |

Quellen: installierte Klassen-/Unterklassen-Items, natives Actor-/Activity-/Feat-/Spell-Modell; Implementierungsdateien und Status pro Grant stehen in der Klassencheckliste. Ältere Auditabschnitte dokumentieren ihren damaligen Stand.

## Ergänzungen 0.10.0 — Ninjutsu Specialist

| ID | Einstufung | Mechanik / Evidenz | Lösung / Tests |
|---|---|---|---|
| NIN-USES-01 | BUG | Chakra Recovery: Text nennt weitere Nutzungen auf Klassenstufe 6/11/17; installiertes max ist konstant 1. Native Feat-/Uses-Vorbereitung ergänzt diese Stufen nicht. Quelle Compendium.n5eb.class.Item.n5ebChakraRec001, module/data/item/feat.mjs und data/shared/uses-field.mjs. | P1: besitzgeprüfte vorbereitete Skalierung; native Stufen-/Quell-/Setting-/Rastprüfungen. Keine Kompendiumänderung. |
| NIN-USES-02 | BUG | Jutsu Breaker: Text nennt weitere Nutzungen auf Klassenstufe 11/17; max ist konstant 2. Quelle Compendium.n5eb.class.Item.pSfnPm1YPdJ90FPq. | P1: dieselbe vorbereitete Ressourceninfrastruktur. Clash-Automation bleibt offen. |
| NIN-CAST-01 | MISSING AUTOMATION | Chakra Recovery besitzt keine installierte Casting-Aktivität; Halbierung und Verbrauch waren manuell. | P1: bestehender Castingdialog und native Update-Batches; Rundung/Reihenfolge vom Nutzer bestätigt. Native Kosten-, Unterhalts-, Abbruch-/Fehlerprüfungen. |
| NIN-SCOPE-01 | POTENTIAL ISSUE | Gesamtinventar enthält 16 Traditionen, 116 Unterklassen-Grants und 2 nicht aufgelöste Basis-Grants. Suchsignale sind keine fertigen Regelaudits. | Separate NINJUTSU-SPECIALIST-CHECKLISTE.md hält jede Zuordnung und offene Prüfung fest. |


Stand: 11.10.2026. **Kein vollständiger Systemaudit und keine Laufzeit-Bugbestätigung.**

## Methode und Quellen

Das installierte `dnd5e.mjs` wurde direkt untersucht. Die mitgelieferte `dnd5e-compiled.mjs.map` enthält 372 Quellen mit eingebettetem Text; 371 `module/`-Dateien wurden in `work/reference-system/` rekonstruiert. Diese Pfade bezeichnen ursprüngliche Quellmodule, keine separat installierten Systemdateien. Relevante Verbrauchsstellen wurden zusätzlich im installierten Bundle gelesen. Die Source Map ersetzt keine Laufzeitprüfung und wurde nicht vollständig gegen das Bundle abgeglichen.

Vier Kompendiumdatenbanken wurden ausschließlich **aus Workspace-Kopien** mit Foundrys bestehendem `classic-level` gelesen: clan 2328, feats 292, class 575, jutsus 2309 Datenbankeinträge. Einträge umfassen auch Ordner und eingebettete Dokumente; dies sind keine Item-Anzahlen. Die Originaldatenbanken wurden nicht geöffnet oder verändert.

Priorität P0 = Voraussetzung/Integrationsschutz, P1 = hohe Spielrelevanz, P2 = spätere Verbesserung.

## AUD-001 — Kosten werden vor Verbrauch neu berechnet

- **Klasse:** POTENTIAL ISSUE; P0.
- **Mechanik/Quellen:** Casting; `module/documents/activity/mixin.mjs:817–834`; Bundle `dnd5e.mjs:22205–22224`.
- **Ist:** `_prepareUsageUpdates` ruft `item.system.getChakraCost({rank})` auf und überschreibt `config.chakra.cost`. Fehlerprüfung erfolgt vor `dnd5e.activityConsumption`.
- **Soll:** Modulvorschau und tatsächlicher Verbrauch verwenden dasselbe Ergebnis; bezahlbare reduzierte Casts werden nicht vorher anhand des unreduzierten Preises abgelehnt.
- **Evidenz:** Direkt gelesene Aufrufreihenfolge und Neuzuweisung.
- **Lösung:** Kostenberechnung vor der bestehenden Verfügbarkeitsprüfung integrieren. Ein alleiniger Dialog- oder nachgelagerter Consumption-Hook genügt nicht. Unterstützten Einstieg zuerst prüfen; begrenzten Wrapper erst nach Adapterprüfung wählen.
- **Wiederverwendung:** Alle passiven/optionalen Kostenmodifikatoren.
- **Tests:** Basispreis unerschwinglich, reduzierter Preis bezahlbar; Rangwechsel; Abbruch; Sofort-Cast; Vorschau/Verbrauch identisch.

## AUD-002 — Vorhandene Chakra- und Zustandslogik erhalten

- **Klasse:** WORKING AS INTENDED im statisch untersuchten Pfad; P0.
- **Mechanik/Quellen:** `module/data/item/spell.mjs:getChakraCost/getMaintainCost`, `module/documents/actor/actor.mjs:1429–1460`, `module/conditions.mjs:onActivityConsumption`; Bundle `27453–27488`, `6282–6308`.
- **Ist:** Formelkosten, Rangskalierung, Sealed-Zuschlag, Minion-/Festkosten-Ausnahmen, temporäres Chakra zuerst; Shocked kann nachträglich multiplizieren. Unterhalt wird aus Castkosten abgeleitet.
- **Soll:** Bestehende Logik einmalig erhalten; keine pauschale eigene zweite Chakra-Abbuchung.
- **Evidenz:** Methoden und vorhandener Zustands-Hook. Keine Integrationstests durchgeführt.
- **Lösung:** Originalkosten als Basis betrachten, bestehende Ressourcenmethoden wiederverwenden; Reihenfolge zu Shocked explizit prüfen. Keine weitere globale Mindestkostenregel erfinden.
- **Wiederverwendung:** Gesamter Casting-/Aktivierungskern.
- **Tests:** temp/value, Sealed, Shocked, Minion/Festkosten, Erhaltungskosten; Reihenfolge und Rundung gemäß bestätigten Regeln.

## AUD-003 — Amplified Flames: fehlende native Kostenautomation wahrscheinlich

- **Klasse:** MISSING AUTOMATION, statisch begründet; P1, Laufzeitbestätigung offen.
- **Mechanik/Quellen:** `Compendium.n5eb.clan.Item.xqFLFGRWFRamlGuy`; Effekt `8etg9GuDSpFpeI83`; SpellData und Conditions.
- **Ist:** Beschreibung verlangt Uchiha-Clan-Hijutsu UND Fire Release. D/C/B/A/S: Reduktion 1/2/3/4/5. Ab Stufe 13 zusätzlich +1 SG. Effekt hat `system.changes: []`, `transfer: true`, Drittanbieter-BABonus-Konfiguration und leeres DAE-Makro. Kein Treffer für `amplified-flames` oder `hijutsuFireReleaseDCBonus` in den rekonstruierten nativen Modulen.
- **Soll:** Nur berechtigte Jutsu des Actors erhalten die verifizierte Reduktion; Originalitem unverändert. SG-Bonus separat prüfen.
- **Evidenz:** Kompendiumbeschreibung plus Effektinhalt und gezielte Quelltextsuche. Drittanbieter-Metadaten bedeuten, dass ein leerer nativer Effekt allein keinen Bug beweist.
- **Lösung:** Deklarativer Modifier über die gemeinsame Registry; Actor-Feature-Identität und Jutsu-Zugehörigkeit prüfen. Nutzer bestätigt: Bei unklarer Zugehörigkeit Hinweis, keine automatische Reduktion.
- **Wiederverwendung:** Keyword-/Rank-/Feature-/Clan-Filter für weitere Fähigkeiten.
- **Tests:** Richtiger Clan + beide Keywords; fremder Clan; fehlendes Keyword; jedes definierte Rangniveau; kein Besitz; doppelte Registrierung. E-Rang und Art nicht aus Tabelle extrapolieren.

## AUD-004 — Drittanbieter-Bonusfilter könnte zu weit greifen

- **Klasse:** POTENTIAL ISSUE; P1.
- **Mechanik/Quellen:** Amplified-Flames-Effekt, `flags.babonus.bonuses[0].filters.spellKeywords`.
- **Ist:** Keywords `hijutsu` und `fire` sind mit `match: ANY` gespeichert; Filter für spezifische Clan-Zugehörigkeit fehlt in dieser Konfiguration. Bonusformel referenziert ein natives Flag ohne gefundenen nativen Erzeuger.
- **Soll:** Keine breiteren SG-Boni als in der Itembeschreibung; keine doppelte Anwendung mit späterem Modulbonus.
- **Evidenz:** Gespeicherte Metadaten. BABonus-Laufzeitsemantik und fremde Modulunterstützung nicht untersucht.
- **Lösung:** Kompatibilitätsprüfung vor Bonusautomation; nicht ungeprüft bestehende Effekte löschen oder umschreiben.
- **Wiederverwendung:** Erkennung vorhandener Bonusanbieter und Konfliktberichte.
- **Tests:** Native-only versus externer Bonusanbieter; Hijutsu ohne Feuer, Feuer ohne Hijutsu, fremder Clan, Stufe 12/13.

## AUD-005 — Dojutsu benötigen mehr als Boolean-Toggles

- **Klasse:** MISSING AUTOMATION / POTENTIAL ISSUE; P1.
- **Mechanik/Quellen:** Sharingan `ac90epAKkDOLQy9v`, Byakugan `iEvrB8siPuzNdz48` im Clan-Pack; Actor-/ActiveEffect-Dokumente.
- **Ist:** Items und eigene Effekte existieren. Sharinganbeschreibung: Bonusaktion, 10 Minuten, gesonderte Nutzungen und Chakra-Reset. Byakuganbeschreibung: 5 Chakra, Bonusaktion, bis eine Stunde; innerhalb dieser Zeit De-/Reaktivierung ohne weitere Kosten. Kein dedizierter Dojutsu-Manager in der gezielten nativen Suche gefunden.
- **Soll:** Unabhängige Instanzen, Effekte, Aktivierungsfenster und Ressourcen; Besitznachweis am Actor. Deaktivierung darf das bezahlte Byakugan-Zeitfenster nicht blind vergessen.
- **Evidenz:** Kompendiumtexte; gezielte Suche ist kein vollständiger Ausschluss generischer Automation.
- **Lösung:** Gemeinsame Aktivierungsinfrastruktur mit getrennten Zuständen, Quellen und Ablaufzeiten; Aktivierungsregeln und tatsächliche Activities weiter prüfen. Keine Einschränkung gleichzeitiger Augen ohne belegte Regel.
- **Wiederverwendung:** Alle Dojutsu und spätere trackerbasierte Fähigkeiten.
- **Tests:** Zwei gleichzeitige Instanzen; selektives Entfernen; Reload; Ende der Dauer; Byakugan-Reaktivierung; Sharingan-Nutzungen separat von Aktivierung.

## AUD-006 — Verbrauch und Folgeschritte sind nicht atomar

- **Klasse:** POTENTIAL ISSUE; P1.
- **Mechanik/Quellen:** Activity-Mixin `consume/#applyUsageUpdates/use`, rekonstruierte Zeilen 467–583; Bundle `21858` ff.
- **Ist:** Actor-Update, Item-Erzeugung/-Löschung/-Update erfolgen nacheinander. Effekte und Chatnachricht folgen nach Verbrauch. Ein vorhandener Refund-Pfad nutzt gespeicherte Deltas. Ein explizites clientübergreifendes Transaktions-Lock wurde in diesem Pfad nicht gefunden.
- **Soll:** Fehler und Wiederholungen verursachen keine unbemerkten Teilzustände oder Doppelabzüge.
- **Evidenz:** Sequenzielle await-Aufrufe, Refund-Methode. Kein Fehlerfall im laufenden Server reproduziert.
- **Lösung:** Bestehenden Commit als einzigen Ressourcenschreiber erhalten; Vorgangs-IDs, geordnete Requests und Fehlerberichte entwerfen. Ein lokales Promise-Lock allein schützt nicht vor mehreren Clients; GM/Server-Koordination gesondert untersuchen. Rückerstattung darf zwischenzeitliche Änderungen nicht überschreiben.
- **Wiederverwendung:** Casting, Dojutsu, limitierte Fähigkeiten.
- **Tests:** Doppelbestätigung; zwei Clients; Chat-/Effektfehler nach Verbrauch; gescheiterter Item-Update; erneuter Request.

## AUD-007 — Konzentrations-Unterhalt und Anzeige synchronisieren

- **Klasse:** QUALITY OF LIFE / POTENTIAL ISSUE; P2.
- **Mechanik/Quellen:** `module/applications/activity/activity-usage-dialog.mjs:209–216,304–326`; Actor `getConcentration.../pay...`; SpellData `getMaintainCost`.
- **Ist:** Dialog und Konzentrationseffekt nutzen Castkosten zur Unterhaltsberechnung; existierende Unterhaltsverwaltung bereits vorhanden.
- **Soll:** Anzeige, Chat und gespeicherter Unterhalt stimmen nach zulässigen Modifikationen überein. Ob ein bestimmter Feature-Rabatt Unterhalt verändert, ist nicht allein aus der Kostenengine abzuleiten.
- **Evidenz:** Direkte Berechnung und persistierte Konzentrationsfelder.
- **Lösung:** Berechnungsherkunft sichtbar machen; Feature-spezifische Unterhaltswirkung bei Bedarf abstimmen, keine zweite Unterhaltsverwaltung bauen.
- **Wiederverwendung:** Alle temporären Kostenänderungen/Castingmodi.
- **Tests:** Rangwechsel, Rabatt, Shocked, nächster Zug, Unterhaltszahlung, Unterhaltsabbruch.

## AUD-008 — Daten- und Modulkompatibilität

- **Klasse:** POTENTIAL ISSUE; P0.
- **Mechanik/Quellen:** Manifest, Entry-Bundle, SpellData-Schema, importierte Effekte.
- **Ist:** D&D-5e-abgeleitete Activities und Hooks unter `dnd5e.*`; `game.n5eb = game.dnd5e`; Keywords als Set; `fire` ist kanonischer Key, Rangwerte e/d/c/b/a/s. `art` besitzt einen gesonderten Datenpfad. Historische DAE/Midi-QOL/BABonus-Metadaten sind vorhanden. Class Mod Library ist installiert.
- **Soll:** Versions- und Fähigkeitsprüfung statt Annahmen aus alten Naruto-/D&D-Versionen; keine notwendige Class-Mod-Abhängigkeit.
- **Evidenz:** Installierte Quellen und ausgewählte Packdaten; installierte Module sind nicht gleich aktivierte Module.
- **Lösung:** Kleine Adaptergrenze, sichere Defaults, Support zunächst nur für verifiziertes Versionspaar; später Matrix erweitern.
- **Wiederverwendung:** Öffentliche API und künftige Systemupdates.
- **Tests:** fehlende Methoden, inkompatible Version, Sprache, Art, externe Registrierung, Disable/Re-enable.

## Noch nicht abgeschlossen

Vollständige Prüfung aller Packinhalte, Clan-Zuordnungsfelder, Activities/Advancements, passiver/togglebarer Features, Rest-/Recovery-Automation, Action Economy, NPC/Token-Actor-Pfade, Zustandsstapel, Sheetvarianten und aktiver Testwelt-Module. Kein bestätigter BUG-Eintrag wird allein aus einer leeren Effektänderung abgeleitet.

Nächste Reihenfolge: Testzugriff herstellen → Audit der genannten Integrationsgrenzen vertiefen → Modulgrundlage/Kostenkern → geeignete Integration testen → Dojutsu.

## Vertiefung und aktueller Stand

Am 11.10.2026 wurden alle 43 Manifestkompendien aus Workspace-Kopien strukturell gelesen: 21520 Datenbankeinträge, 3010 Spell-Items auf Packwurzelebene, 3093 Effekt-Datensätze; davon 233 ohne native Änderungen. Letzteres ist **keine Bugzahl**: Status-/Marker-Effekte und Drittanbieterintegration müssen einzeln beurteilt werden. Details: PACK-COVERAGE.json.

Im Standard-Clan-Pack wurden 56 Jutsu mit fire + hijutsu gefunden; Beispiele stammen aus Uchiha, Futton, Keton und Shakuton. Die Clan-Jutsu haben kein befülltes sourceItem in den untersuchten Datensätzen. Elf Uchiha-Jutsu besitzen eine nachvollziehbare ursprüngliche Importherkunft unter uchiha/clan-hijutsu; UUIDs und Belege stehen in UCHIHA-PROVENANCE.json. Der neue lesende Adapter erkennt ausschließlich diese Standardquellen. Fremde/T7/Homebrew-Daten werden nicht ungeprüft gleichgesetzt.

Modulgrundlage und reiner Kostenkern 0.1.0 sind erstellt; 32 Tests bestanden. Foundry erkennt und lädt das neue Modul in test12. Drei tatsächliche API-Smoke-Fälle (8/10/10) wurden per Testmakro geprüft. Gameplay-Commit bleibt offen. Das Originalsystem hat beim Weltstart eine automatische Migration ausgeführt; eine lokale Sicherung von test12 wurde vorher erstellt. Auch die Featurequelle muss für die Standard-Amplified-Flames-Registrierung eindeutig sein; ein gleichnamiger T7-/Homebrew-Identifier genügt nicht.

Zusätzliche Automationsmöglichkeiten: klarer Hinweis bei fehlender Datenherkunft; Diagnose bestehender Drittanbieter-Bonuskonfiguration; Anzeige gespeicherter Unterhaltskosten; sichere Nachvollziehbarkeit von Refunds. Keine dieser Möglichkeiten rechtfertigt Änderungen an unbestätigten Regeln.


## Umsetzungsstand 0.2.0

Passive Kosten sind jetzt mit dem nativen Casting verbunden: SpellData.getChakraCost wird vor Prüfung/Abbuchung erweitert; die nachgelagerte Änderung im activityConsumption-Hook allein wäre zu spät. Native Casts und Ressourcenprüfungen sowie Dialogabbruch tatsächlich erfolgreich getestet (TESTING.md). Das ersetzt keinen vollständigen Audit aller Regeln.

### CAST-TXN-01 — POTENTIAL ISSUE

- Mechanik: fehlende zugesicherte Atomizität bei parallelen Casts oder Fehlern nach Abbuchung.
- Quellen: module/documents/activity/mixin.mjs (consume, #applyUsageUpdates, postActivityConsumption, _finalizeUsage); source-map Referenz.
- Verhalten/Beleg: Akteurs- und Itemupdates erfolgen sequenziell; nach Ressourcenwrites können Hooks/Schablonenschritte scheitern. Keine globale Cast-Sperre oder Gesamtrollback in diesem Pfad festgestellt. Gleichzeitige Clients noch nicht reproduziert.
- Erwartung: konsistente Bezahlung je erfolgreich bestätigtem Vorgang; keine doppelte/überschriebene Ressource.
- Empfehlung: separate Ressourcenkoordination mit Vorgangsidentität und autorisiertem Client entwerfen; keine pauschalen Rückbuchungen, die fremde Änderungen überschreiben könnten.
- Priorität: hoch vor produktiver breiter Automatik. Wiederverwendung: sämtliche ressourcenpflichtige Aktivierungen.
- Tests: zwei Clients mit konkurrierenden Casts, eingebettete Itemupdates, Hook-Abbruch nach Abbuchung, Verbindungsabbruch, sichere Wiederholung.
- Aktueller Schutz: Öffnen/Ändern/Abbrechen ohne Ressourcenänderung und fehlende Ressourcen ohne Abzug geprüft; keine umfassende Transaktionsgarantie.

## Ergänzung: Kosten/Unterhalt, 0.3.0

| ID / Klassifikation | Mechanik / Quelle | Befund, Lösung und Beleg | Priorität / Tests |
|---|---|---|---|
| COST-CHOICE-01 / MISSING AUTOMATION | Standard-Feats Elemental/Non-Elemental/Sensory; native SpellData.getChakraCost | Auswahl und Rabatt nicht nativ verbunden. Verifizierte UUID-Regeln, Itemflag-Auswahl, kontextuelle Modifier; installierte Featuretexte maßgeblich. 0.3 implementiert. | Hoch; Quellen-/Keyword-/Duplikatprüfung, Erwerb/Reload/UI |
| MAINTAIN-01 / MISSING AUTOMATION | SpellData.getMaintainCost, N5eBActiveEffect.createConcentrationEffectData, Actor.getConcentrationMaintainData/payConcentrationMaintainCost | Native Basis floor(Castkosten/2), fehlende passive Featureanbindung. Separate Registry, stärkster Rabatt, gespeicherte Basis und lesend berechneter Flagwert; tatsächliche Tests 3->2. 0.3 implementiert. | Hoch; Minima/Befreiung, Temp-Chakra, paidTurn, Abbruch, Setting |
| MAINTAIN-02 / POTENTIAL ISSUE | Refined Chakra Network; allgemeine Stapelung | Unklare Hälfte/Stapelung. Nutzer bestätigte floor(Hälfte normaler Unterhalt) und nur stärkste Reduktion. Implementiert; keine universelle veröffentlichte Regel behauptet. | Hoch; gerade/ungerade/kleine Kosten |
| MAINTAIN-03 / POTENTIAL ISSUE | Insect Nest Integrity, Split Focus, Genjutsu Adept, Signature Control | Herkunft, Klassenlevel, gemeinsame Konzentration bzw. Auswahl erforderlich. Keine pauschale Namens-/Besitzautomation. Zurückgestellt; Wiederverwendung der Registry möglich. | Mittel/hoch; korrekte Clanzuordnung/Level/Kontext vor Implementierung |
| CHOICE-REST-01 / QUALITY OF LIFE | Master Weaver | Erwerbsauswahl und Basisrangbefreiung implementiert; zulässiger Wechsel nach Langrast bislang GM-Korrektur, keine Rastintegration. | Mittel; Basisrang/Upcast unit-geprüft, echter Rastworkflow offen |

Originalsystem unverändert. Die übrigen Vorteile dieser Feats (Schaden, Hand Seals, Würfel, Action Economy) sind nicht Teil der Kostenumsetzung. Features ohne bewiesene Quelle erhalten keine Fähigkeiten durch bloße Kompendiumexistenz.

## Kostenfortsetzung 0.4.0

- MAINTAIN-03: Insect Nest Integrity und Split-Focus-Kostenanteil nun integriert; Quellenbeleg ABURAME-PROVENANCE.json, verifizierte Genjutsu-Klassen-UUID. Unit- und Foundry-Preview-Prüfungen bestanden.
- COST-LATENT-I / POTENTIAL ISSUE geklärt: Nutzer bestimmt nur Wirkkosten. Eingebaut mit Konzentrationsbedingung und D–S-Rang.
- COST-ADEPT / POTENTIAL ISSUE geklärt: installierte Homebrew-Variante freigegeben; gemeinsame Konzentrationsbedingung integriert. Erstellungs-/Modifikationsrabatte und übrige Adept-Boni weiter außerhalb des Kostenumfangs.
- COST-SIGNATURE / MISSING AUTOMATION: Auswahl und Wirk-/Unterhaltsrabatt integriert; Auswahlwechsel bei verifiziertem Lernen durch Scout-Levelaufstieg braucht weiter GM-Korrektur.
- CHOICE-REST-01: Master-Weaver-Rastauswahl integriert; echte Full Rest löst beide passenden Auswahldialoge aus.
- COST-OPTIONAL / MISSING AUTOMATION: Technical Technique und Force of Rage als konkrete Castingoptionen mit Martial-Verbrauch, gespeicherter Unterhaltswirkung und Eligibility. Technical-Rundung auf Nutzerentscheidung aufwärts. Frenzy-Aktivierungsbestätigung vom Nutzer zugelassen. Keine Behauptung, dass damit alle Frenzy-Effekte automatisiert sind.
- RESOURCE-MARTIAL / MISSING AUTOMATION: Poolregeneration am Turnbeginn nicht Teil dieser Änderung; genaue bestehende Ressourcen-/Kampfautomation vor Implementierung prüfen, damit keine doppelte Regeneration entsteht.
- RESOURCE-CLASSMOD / POTENTIAL ISSUE: konkrete Mod-/Ressourcenliste vom Nutzer angefragt; keine pauschale Umdeutung der Chakra-Währung und keine Änderung der Class Mod Library.

## Kostenabschluss und weiterer Abgleich 0.5.0

### RESOURCE-MARTIAL — MISSING AUTOMATION, P1; ergänzt
- Quelle: Compendium.n5eb.class.Item.ucEljLiJZkch29oz; Taijutsu-Klasse Ipg5bKh1zS3Yfn2I. Installiertes Feature manifestiert den Pool zu Beginn jedes eigenen Zuges und verwirft unbenutzte Dice. Native Klassenskalierung 2/6/10/ 14/18 => 1/2/3/4/5 Dice.
- Systemquellen: documents/combat.mjs, documents/combatant.mjs, data/item/templates/activities.mjs, data/shared/uses-field.mjs. Allgemeine Regeneration vorhanden, importiertes Martial-Adept-Feature ohne turnStart-Recovery-Profil.
- Lösung: Enhancement src/foundry/martial-recovery.mjs ergänzt fehlende Recovery im nativen Batch. Bestehende Profile behalten Vorrang. Einstellung default false; eigener Zug, Quellen-/Levelprüfung und persistente Zugkennung. Keine Änderung am Originalfeature.
- Wiederverwendung: native Ressourcen-Recovery-Batches; weitere Ressourcen erst nach Quellenprüfung registrieren. Tests: eigene/fremde Züge, neue Runde, Duplikat, native Profile, disabled Setting, Provenienz und Maximalwert.

### COST-MARTIAL-TECHNIQUE — MISSING AUTOMATION, P1; ergänzt
- Quelle: Compendium.n5eb.class.Item.S1TglFLRvVSLZHNL; native SpellData.getChakraCost ohne Featureanbindung. Feste Taijutsu-Basiskosten, optionaler Verzicht, Ausschluss anderer Reduktionen; Upcast steigt wie Jutsutext.
- Nutzerklärung: Ausschluss nur für Wirkkosten, Unterhalt weiterhin reduzierbar. Lösung: getrennte Basiskostenstrategie und Dialogoption; allgemeiner Reduktionsausschluss im Kostenkern. Sonderkostentext/E-/Art-Basisrang unverändert. Keine Änderungen am Original-Jutsu.
- Tests: Tabelle, Basisrang/Upcast, Opt-out, Reduktionsausschluss/Erhöhungen, bestehende Unterhaltsregeln, native Abbuchung und Dialog.

### ACTION-ECONOMY — WORKING AS INTENDED / bewusster manueller Umfang
Keine Enhancement-Automatisierung gewünscht. Eigene Frenzy-Aktionslogik entfernt; vorhandene native Verbrauchskonfiguration erhalten. Kein offener Auftrag zur Aktionsökonomie-Automatisierung.

### COST-COVERAGE — POTENTIAL ISSUE, P2/P3
COST-COVERAGE.json gleicht die frühere Featuretext-Extraktion mit 24 implementierten Kostenquellen ab. 99 weitere Nicht-Class-Mod- und 41 Class-Mod-Treffer sind ungeprüfte Kandidaten; darunter auch andere Ressourcen, Rückerstattungen und Texttreffer ohne Jutsu-Kostenrabatt. Nicht als bestätigte Fehler oder 140 fehlende Rabatte interpretieren. Empfehlung: Empowered Taijutsu und Medical Specialization seit 0.6.0 integriert; weitere einfache Pauschalrabatte einzeln prüfen; situative Water-Release-Expert-Bedingungen benötigen bestätigten Castingkontext. Class-Mod-Ressourcen bleiben getrennt und verändern die Class Mod Library nicht. Allgemeine Quellen-/Eligibility-/Stacking-/Ressourcen-/Persistenztests sind je tatsächlichem Befund erforderlich.

## Spezialisierungsabgleich 0.6.0

### COST-EMPOWERED — MISSING AUTOMATION, P1; Kostenanteil ergänzt
- Quelle: Compendium.n5eb.feats.Item.Iz3IvHteq5JpIwSL; kein passiver Kostenpfad im nativen SpellData.getChakraCost.
- Befund/Erwartung: Taijutsu mit Combo oder Finisher D–S minus 1–5; keine Stapelung mehrerer rangabhängiger Reduktionen. Nutzer bestätigt stärkste passende Rangreduktion.
- Lösung: feature-rules.mjs registriert quellenverifizierte Keyword-/Rangfilter; cost-engine.mjs setzt wiederverwendbaren bedingten Rangrabatt-Ausschluss um. Keine Nutzung oder Aktion für den passiven Rabatt verbuchen.
- Tests: alle fünf Ränge, Combo/Finisher, falsche Keywords/Quelle, Duplikate, Efficient Breathing, pauschale Rabatte, native Kosten und unveränderte Feat-Nutzungen.

### COST-MEDICAL — MISSING AUTOMATION, P1; Kostenanteil ergänzt
- Quelle: Compendium.n5eb.feats.Item.Qe9VhMIJWCjLljBE. Medical-Ninjutsu mit gewähltem Acid/Necrotic/Poison D–S minus 1–5; ausdrücklicher Stapelungsausschluss.
- Beleg: unverändertes Kompendiumjutsu 07IZPYzzZ1XfUb0I (Metallic Rust) hat nach nativer Migration Angriff UND Rettungswurf, beide mit Acid.
- Lösung: Erwerbsauswahl in feature-choice.mjs; dauerhafte Auswahl am Feature; damage-types.mjs liest gemeinsame feste Aktivitätstypen; reine Kontext-/Kostenregistrierung. Mehrdeutigkeit wird angezeigt, ohne eine Zuordnung zu erfinden.
- Wiederverwendung: Schadensart-Auswahl, typabhängige Kontexttoken und bedingte stärkste Rangreduktion. Tests: jede Auswahl, doppelte Feats mit verschiedenen Typen, fehlende Auswahl, falscher Typ/Keyword, alternative Aktivitäten, Erwerbsdialog, native Abbuchung, Abbruch und Reload.
- Nicht Bestandteil: Schadensbonus, HS-Erleichterung, Aktionsökonomie und allgemeine Dojutsu-Verwaltung.

## DOJO-001 — MISSING AUTOMATION — unabhängige Aktivierung (P1)

Quellen: Standardpack n5eb.clan Sharingan ac90epAKkDOLQy9v, Byakugan iEvrB8siPuzNdz48, Latent Sharingan I j4LmUpUb5FeuH0qg und Latent Byakugan I fog7EqfLDDdqHK9q; native Actor-Chakra-Methoden, CharacterActorSheet, Foundry ActiveEffect.applyChange. Installierte Texte definieren Gebühren, Reichweiten und Laufzeiten; eingebettete Effekte besitzen teils alte cp-/Sense-Pfade, leere Sharingan-Reichweite oder abweichende Rundendauer. Leere Effekte allein sind kein Beweis für eine fehlende Gesamtfähigkeit. Erwartung: getrennte Instanzen, keine doppelten Boni/Gebühren, kompatible eigene Effekte. Lösung 0.7.0: wiederverwendbare Definitionen und Manager, vier geprüfte Aktivierungsvarianten; Details siehe FEATURES.

Latent Sharingan I: Dauer und frühe Chakra-Sicht waren textlich mehrdeutig. Nutzer bestätigt 10 Minuten und 30 Fuß bereits ab I. Wiederverwendbarkeit hoch; 16 neue Unit-Tests und 18 native Prüfungen einschließlich Modul-Deaktivierung. Rest: weitere Stufen/Einzelfähigkeiten, vollständige Voraussetzungen und Mehrclient-Sperren. Status: erster Teil umgesetzt und getestet.

## DOJO-002 — POTENTIAL ISSUE — Stufenboni / optionale Fähigkeiten (P2)

2-/3-Tomoe, Sharingan Adaptation/Dodge und Latent-II–IV-Texte enthalten weitere Boni/Optionen. Kein automatisches Kopieren pauschaler Effekte. Empfohlen: unabhängige optionale Fähigkeiten/Stufenadapter auf vorhandenem Manager; genaue Auswahl und Stapelung pro installiertem Text prüfen. Erforderliche Tests: jeweilige Eligibility, Ressourcen, Aktivierung/Entfernung und Erhalt fremder Boni. Noch nicht umgesetzt.

## DOJO-003 — QUALITY OF LIFE — Tracker und DM-Freigabe (P1), umgesetzt 0.7.1

Nutzer verlangt Entfernung der Augen-Auswahl, höchste DM-freigegebene Tomoe automatisch und optische Nähe zum Class-Mod-Kāma-Tracker. Read-only Vorbild: n5eb-classmod-library/scripts/main.js renderKamaTrackerStrip und styles/main.css. Lösung: unabhängige eigene kompakte Streifen; GM-Freigabe 1..3, verifizierte native/Latent-Levelgrenzen und doppelungsfreier aktiver 3-Tomoe-Wahrnehmungsbonus. Quellen: 1/2/3 Tomoe Sharingan 2B09h9ByO7heBR21, fIPSKWrWlLcqMey3, kE197NR2GIECvnM4; Latent I/II/III. Wiederverwendbare unabhängige Instanzfreigaben; einzelne Fähigkeiten bleiben offen.

DOJO-004 — BUG — initialer Formelbonus akkumulierte bei prepareData im Entwicklungsstand. Native Probe zeigte 5 + 5 + 5 statt einmal 5. Vor Veröffentlichung korrigiert: abgeleitete passive Wahrnehmung ausschließlich in final-Phase; elf native Prüfungen, zehn wiederholte Vorbereitungen und Reload erfolgreich. Regressionsassertion für final-Phase und neutralen gespeicherten Eintrag vorhanden.

## Klassen-Audit — 11.10.2026, Kandidaten vor weiterer Umsetzung

Siehe [KLASSEN-AUTOMATISIERUNG.md](KLASSEN-AUTOMATISIERUNG.md): alle 13 installierten Grundklassen inhaltlich geprüft; 167 Unterklassen und 2.461 Feature-Dokumente inventarisiert und auf Kandidaten durchsucht. Nicht jedes Unterklassenfeature einzeln regelvalidiert. Quellen, Suchhinweise und native Uses/Effekte stehen in CLASS-AUTOMATION-INVENTORY.json; vollständiger Unterklassenindex in KLASSEN-UNTERKLASSEN-INDEX.md. Die leeren kopierten hb-class/hb-subclass-Packs wurden ebenfalls geprüft.

CLASS-001 bis CLASS-006 beschreiben priorisierte MISSING-AUTOMATION-/QUALITY-OF-LIFE-Kandidaten: gemeinsame Ressourcenabläufe, Auswahlhelfer, optionale Castingboni, Aktivierungszustände, Zielmarkierungen sowie stärkere Mehr-Actor-Abläufe. Das verknüpfte Dokument enthält gewünschtes Verhalten, Quellen, Wiederverwendbarkeit, Tests und offene Nutzerentscheidungen. Native Zähler/Effekte bleiben Ausgangspunkt; keine Duplikate und keine automatisierte Aktionsökonomie.

POTENTIAL ISSUE: Chakra-Recovery-Maximum trotz zusätzlicher textlicher Nutzungen; CCD-Gesamtlevel-/Rastprofil; Mindestnutzungen bei Calculated Response; unvollständige/wiederholte Void-Walker-Grants. Diese Befunde wurden nicht am importierten Actor reproduziert und sind ausdrücklich keine bestätigten Bugs. Weitere Regelfragen betreffen Rundungen, SG-/Würfelbonusformulierungen und konkrete Rastdefinitionen.

Auditverifikation: 13/167/2461 Einträge und eindeutige Feature-UUIDs geprüft; 66 außerhalb dieser sechs Packs nicht aufgelöste bzw. unvollständige Grants ausgewiesen. Bundle-/Manifesthash unverändert. Keine Implementierung oder Gameplay-/UI-Tests in diesem Arbeitsschritt. CLASS-AUDIT-VERIFICATION.json dokumentiert Umfang und Grenzen.

## CLASS-005a — QUALITY OF LIFE / MISSING AUTOMATION — persistente Ninjutsu-Gruppen (P1), erste Stufe 0.8.0

Quellen: Void Adept n6BSSlSie5m8osNz, Lightning Adept zavWoZI5pO9y10nC, Elemental Adept Odji8s2fVtc7WmOY, Wind Adept XRQqZDduw90wOBMy, Fire Adept q2jgw4auBTlE79bk aus n5eb.subclass; Intelligent Swordplay ftFrng5S6dTSZC9r aus n5eb.t7-subclass. Vorbild lesend: n5eb-classmod-library/scripts/rasengan.js und rasengan-rules.js, Actorflags mit UUID-Zielreferenzen.

Beleg: persönliche Shards/Motes und zielbezogene Marks mit maximal fünf Einträgen und einminütiger Dauer stehen in den Featuretexten. Native Importmigration erzeugt teilweise generische 5/5-Uses, ohne mehrere Zielgruppen samt Dauer zu verwalten. Ziel: reloadbeständige Zuordnung und bestätigte Bedienung, ohne zweiten unabhängigen sichtbaren Zähler. Nutzer bestätigt: alle sechs Mechaniken, Bestätigung, Erneuerung der gesamten aktiven Gruppe auch am Maximum, warnende statt blockierende Zugprüfung, Tracker maßgeblich. Lunar Slayer/Jujutsu Sorcerer samt Unterklassen entfallen aus weiterer Umsetzung.

Lösung: generischer Ledger, Quellen-Actorflags, Actor-/Token-Referenzen, opt-in Controls/API, Erhalt alter Zählerdaten und Umleitung der verwalteten nativen Aktivierung. Wiederverwendbarkeit hoch für weitere Marker/Pools. Tests: sieben neue Unit-Tests, insgesamt 111 bestanden; elf native Prüfungen und reale UI-/Reloadprüfung. Rest: sekundäre Kosten-/Schadens-/Condition-Wirkungen, vollständige Verbrauchslimits, Sonderfeatures, Mehrclient-Sicherheit und Modul-Aus-/Einschalten. Diese erste Stufe ist keine vollständige Automatisierung der sechs Features.

## CLASS-005b — MISSING AUTOMATION / QUALITY OF LIFE — Mark-Auslösung, Basiswirkungen 0.9.0

Quellen wie CLASS-005a: Wind Adept, Fire Adept und Intelligent Swordplay. Erwartet: alle eigenen Breeze/Blade Marks auslösen; beliebige Ember-Anzahl für 1d12 Fire je Mark. Native Bleeding/Prone und typisierte Schadens-APIs behalten Resistenzen/Immunitäten. Waffenschadensart wird aus tatsächlichem Besitz ausgewählt; Berechtigung des verursachenden Treffers/Casts ausdrücklich bestätigt.

Lösung: persistente reservierende Anfrage, bestätigte aktive-GM-Anwendung, Status vor Mutation und gespeicherte Schritte; kein Replay unklarer Vorgänge. Eigenes Sheet-UI mit Tenseigan-orientierten Karten/Pips. Priorität P1, Wiederverwendbarkeit hoch. 121 Unit-Tests und neun native Basisprüfungen plus vier UI-/Reloadprüfungen. Rest: Ember-DR, Sondermoldings, Castingverbrauch, Mehrclient-/Deaktivierungstests und verwaiste Anfragekarten bei Featurelöschung.

## Meilenstein 0.11.0 — bestätigte Ninjutsu-Automation

| ID | Klasse / Priorität | Befund und Lösung | Evidenz / Dateien | Tests / Wiederverwendung |
|---|---|---|---|---|
| NS-011-REFINED | MISSING AUTOMATION / hoch | Installiertes Refined Ninjutsu beschreibt bekannte Jutsuauswahl und Wahl je Cast. Persistente Auswahl, Klassenprogression, optionale SG-/Würfel-Erweiterung am Castingklon implementiert. Buki/Tai-Unterklassen-Erweiterungen offen. | Compendium.n5eb.class.Item.n5ebRefinedNin01; casting/refined-ninjutsu.mjs, foundry/refined-ninjutsu.mjs, casting-augmentation.mjs | Quellenbesitz, Auswahlgrenzen/Rast, Formelambiguity, Clone-/Chat-Persistenz; Auswahlmodell wiederverwendbar. |
| NS-011-POOLS | MISSING AUTOMATION / hoch | Shards/Motes bisher nur gezählt. Native Castingoptionen und bestätigte Zielanfragen umgesetzt. Ressourcenplan verhindert Vorabverbrauch im Dialog. | Void/Lightning/Elemental Adept: n6BSSlSie5m8osNz / zavWoZI5pO9y10nC / Odji8s2fVtc7WmOY; casting/ninjutsu-pools.mjs, foundry/ninjutsu-pools.mjs, trackers/pool-targets.mjs | Kostenreihenfolge, typed Damage, Temp-Pool, Ablauf, GM-Queue und Abbruch. Gemeinsame bestehende Anfrage-/Ledgerinfrastruktur. |
| NS-011-CLONE | BUG / hoch | Erstes eigenes Clone-Update verlor native Finaldaten; SG undefined und duration.getEffectData fehlten. Finale Vorbereitung nach Source-Update/Chat-Rekonstruktion ergänzt. | Native Item.clone/prepareFinalAttributes, Activity/DurationField; eigener casting-augmentation-Adapter | Echte Chat-Damage-/Reload- und Konzentrationstests. |
| NS-011-SELECT | BUG / mittel | Natives Consumption-Template gibt options nicht an formInput weiter. Options werden über eigenen Inputcallback geschlossen übergeben. | Original templates/activity/activity-usage-consumption.hbs nur gelesen; eigener casting-dialog.mjs | Regression für Callback und tatsächliche Auswahlfelder im Browser. |

Regelentscheidungen: Void-Zuschlag ganz am Ende nach Recovery; genau eine bestätigte Kreatur; Lightning ohne normalen Schaden nur auf ausdrücklich bestätigte Ziele; Professor-Chakra additiv und zuerst verbraucht; Void-Rabatt vor Recovery. Keine Übertragung auf unbekannte Features anhand des Namens. Kein Abschluss der Gesamtklasse behauptet.


## Efficient Molding 0.12.0 — 2026-10-13

Alle 17 normalen Moldings sind an den vorhandenen Castingdialog, native Würfe und Chatkarten angeschlossen. Gemeinsamer Pool mit nativer Rast, frei zuordenbare kostenlose Nutzungen, separate Chakra-Zusätze, kompakter Sheet-Zähler und GM-Korrektur. Unterklassen-Moldings folgen separat. Aktionsökonomie bleibt manuell.

**MOLD-01 — MISSING AUTOMATION / hoch, umgesetzt:** Verifizierte 17 Standardoptionen, ursprünglicher Auswahlpool und Nutzungstext; keine spezielle Molding-Verarbeitung im ursprünglichen System gefunden. Wiederverwendbarer Besitz-/Eligibility-/Ressourcenplan, Clone-Adapter, zielbezogene Verteidigungen und Chataktionen. Evidenz: EFFICIENT-MOLDING-PLAN.md sowie native Testprotokolle.

**MOLD-02 — POTENTIAL ISSUE / hoch, abgesichert:** Spätere Auslöser dürfen nicht beim Öffnen bezahlt werden. Bestätigung, Neuprüfung, clientlokale Sperre und persistenter Fehlerstatus umgesetzt. Mehrclient-CAS bleibt eine dokumentierte Grenze.

**MOLD-03 — WORKING AS INTENDED:** Aktionsökonomie bleibt manuell; Quickened/Reactive zeigen nur die bestätigte Wirkzeit am Clone.

**MOLD-04 — BUG / hoch, korrigiert:** Installiertes Basisfeature FsvDzBMGBKvUj93O erwartet @scale.nin-spec.efficient-moldings; der tatsächliche Ninjutsu-Specialist-Identifier ist ninjutsu-specialist. Erstes natives Fixture hatte auf Klassenstufe 17 max=0, daher wurden beide Moldings trotz vorgesehenem Pool über Chakra bezahlt. Transienter Roll-Data-Alias und vorbereiteter Ressourcenfallback ergeben bestätigte 4 Nutzungen; Quelle, spent und vorhandene Overrides bleiben erhalten. Tests: nativer Cast, native Rast, Disable/Enable, tatsächlicher Reload, Unit-Tests.


## Unterklassen-Moldings — 15.10.2026

Drip Release und Ryo Master sind auf Nutzerwunsch ausgeschlossen. Die Einstufung beschreibt den ursprünglichen Auditbefund; der Umsetzungsstand steht jeweils bei der Lösung.

### NIN-MOLD-01 — Unterklassen-Moldings

- Klasse: **MISSING AUTOMATION**; Priorität: **P1**.
- Quellen/Evidenz: Installierte subclass-/t7-subclass-Featuretexte sowie SUBCLASS-MOLDING-SOURCES.json; Originalbundle data/activity und documents/activity.
- Ursprüngliches Verhalten: Die zusätzlichen Techniken besitzen Regeltexte, sind aber nicht vollständig mit dem Casting verbunden.
- Erwartung: Tatsächlich besessene Techniken anbieten, gemeinsam bezahlen und die jeweils bestätigten Wirkungen ausführen.
- Umsetzung/Empfehlung: 31 quellverifizierte Definitionen, getrennter Opt-in-Adapter und wiederverwendbare Ziel-/Effektabläufe.
- Wiederverwendung: Hoch: Quellenkatalog, Eligibility und Zahlungsplan tragen alle 27 Casting- und vier Adaptive-Techniken.
- Tests: Katalog/Eligibility/Bezahlung als Unit-Tests; native Casting-, Ziel-, Adaptive- und Folgecast-Makros.

### NIN-MOLD-02 — Bezahlter Rang, Wirkungsrang und Folgepreise

- Klasse: **MISSING AUTOMATION**; Priorität: **P1**.
- Quellen/Evidenz: Blaze Walker, Elitist, Final Lesson, Magnum Opus, Solar Interflow; foundry/efficient-molding.mjs und shared-molding-casts.mjs.
- Ursprüngliches Verhalten: Die installierten Regeltexte verlangen verschiedene Preis- und Wirkungsränge; ein bloßes Umschreiben des Inventaritems würde Preis und Unterhalt vermischen.
- Erwartung: Inventar-Jutsu erhalten; Cast-Klone skalieren und getrennte Zusatzkosten führen. Magnum/Solar senken den Unterhalt nicht zusätzlich.
- Umsetzung/Empfehlung: Native Clone-Skalierung, kurzlebige interne Folgecast-Tickets, Kostenprüfung vor dem ersten Paar-Cast und persistente GM-Prüfung bei Teilfehlern.
- Wiederverwendung: Hoch: dieselbe Trennung trägt Upcasts, Zusatzkosten und Folgecasts.
- Tests: Native Rang-/Preis-/Originalitem-Prüfungen, Magnum-Unterhalt und einmaliger Solar-Finisher.

### NIN-MOLD-03 — Zielgebundene temporäre Wirkungen

- Klasse: **MISSING AUTOMATION**; Priorität: **P1**.
- Quellen/Evidenz: Sanguine, Stone Crusher, Tsunami, Void/Talent, Painter, Adaptive; effects/molding-effects.mjs und casting/molding-lifetimes.mjs.
- Ursprüngliches Verhalten: Eine allgemeine gespeicherte AE-Änderung bliebe bei deaktiviertem Modul wirksam; ungezieltes Löschen gefährdete fremde Effekte.
- Erwartung: Eigene Effekte eindeutig zuordnen, richtige Fristen beachten und fremde Wirkungen erhalten.
- Umsetzung/Empfehlung: Persistierte neutrale Änderungen/Statuslisten; tatsächliche Werte nur bei aktiver Vorbereitung. Eigene Zugfristen, einzelne Minutenfristen und manuelles Ende ohne zuordenbaren Kampf.
- Wiederverwendung: Hoch: gemeinsames Ownership-/Fristenmodell.
- Tests: Neutrale Quellen, Aus/Ein, echter Modul-Neustart, HP-Maximum ohne Heilung und Unit-Grenzfälle zur Zugfolge.

### NIN-MOLD-04 — Zusatzschaden und Schadensreduktion

- Klasse: **POTENTIAL ISSUE**; Priorität: **P1**.
- Quellen/Evidenz: Native Actor.calculateDamage/applyDamage im Originalbundle; foundry/gigawatt-molding.mjs, infusion-damage.mjs und imbuement-master.mjs.
- Ursprüngliches Verhalten: Getrennte Schadensanwendung für jeden Featurewürfel könnte denselben DR-Betrag mehrfach abziehen. Schadensvorschauen dürfen keine neuen Würfe erzeugen.
- Erwartung: Gemäß bestätigter Imbuement-Regel zusammengefasster Schaden vor einer DR-Anwendung; Zusatzwürfel reproduzierbar speichern.
- Umsetzung/Empfehlung: Gigawatt/Infusion ergänzen die native Schadensliste vor Verteidigungen; Infusion einmal pro Cast. Imbuement bündelt tatsächliche native Angriffswürfe.
- Wiederverwendung: Hoch: wiederverwendbare gespeicherte Zusatzwürfel und native Schadensbelege.
- Tests: Native Vorschau/Anwendung, stabile Folge-Vorschau, passende Kreaturentypen, Infusion nur einmal und genau ein kritischer Imbuement-Angriff.

### NIN-MOLD-05 — Erneute Vorbereitung bereits ergänzter Actor-Daten

- Klasse: **BUG**; Priorität: **P1**.
- Quellen/Evidenz: Native ArrayField-_index-Fehler bei zwei vorhandenen Waffen nach erneuter prepareData-Vorbereitung; Originalbundle und foundry/actor-preparation.mjs.
- Ursprüngliches Verhalten: Erneute Vorbereitung derselben bereits von anderen Modulen ergänzten Arrays erzeugte ungültige doppelte Array-Indizes. Betroffene bestehende Waffen wurden nicht verändert.
- Erwartung: Vorbereitung von den unveränderten Quelldaten neu aufbauen.
- Umsetzung/Empfehlung: Öffentliches Actor.reset() für eigene Neuberechnungen verwenden; zusätzlich bestätigte Molding-Zusätze vor Clone-Transformationen binden, damit Zwischenzustände nicht erneut auf Eligibility geprüft werden.
- Wiederverwendung: Hoch: zentraler Vorbereitungsadapter und transaktionsgebundene Kosten.
- Tests: Native Reload-/Casting-Regression und Konsole; Unit-Test für unvollständige Aktivitäten ohne Kostenverlust oder spätere Kostenlecks.

### NIN-MOLD-06 — Generational und externe Counter-/Dispel-Abläufe

- Klasse: **POTENTIAL ISSUE**; Priorität: **P2**.
- Quellen/Evidenz: Generational Molding; installierter Clash-Workflow, kein allgemeiner auslesbarer Counter-/Dispel-Mechanismus.
- Ursprüngliches Verhalten: Es existiert keine belegte zentrale Schnittstelle, über die sämtliche Counter-/Dispel-Aktionen automatisch gesperrt werden könnten.
- Erwartung: Verifizierten Schutz sichtbar und zeitlich korrekt führen; keine fremden oder erfundenen Regeln überschreiben.
- Umsetzung/Empfehlung: Schutzstatus, manuelles Ende außerhalb des Kampfes und getMoldingProtection(message). Externe Abläufe müssen die API abfragen.
- Wiederverwendung: Hoch: abfragbarer zeitgebundener Schutz für künftige Integrationen.
- Tests: Native API-Abfrage, Unit-Ablauf/Erstattung; echte fremde Counter-Integration nicht ausgeführt.

### NIN-MOLD-07 — Combination-Grundworkflow

- Klasse: **MISSING AUTOMATION**; Priorität: **P2**.
- Quellen/Evidenz: Combination/Synchronization-Texte; installierte Daten/Automation.
- Ursprüngliches Verhalten: Bestätigte Helfer- und Modifikatorregeln liegen vor; die übrige Combination-Berechnung ist nicht durch eine verifizierte installierte Automation belegt.
- Erwartung: Nur belegte Teile automatisieren und übrige Grundregeln entsprechend Nutzerentscheidung manuell lassen.
- Umsetzung/Empfehlung: Helfer und Reichweite bestätigen; CHA-Modifikator +1/+3 anzeigen. Keine erfundene Gesamtrechnung.
- Wiederverwendung: Mittel: Zielbestätigung später für vollständigen belegten Workflow wiederverwendbar.
- Tests: Native Helfer-Speicherung und Kosten; vollständige Combination-Grundberechnung ausdrücklich nicht implementiert.

### NIN-MOLD-08 — Chat-Bedienung nach System-Rendering

- Klasse: **BUG**; Priorität: **P1**.
- Quellen: nativer ChatMessage.renderHTML im Originalbundle; ui/molding-chat.mjs, ui/gigawatt-damage.mjs und foundry/infusion-damage.mjs.
- Evidenz: eigene Bedienelemente fehlten auf nativen Usage-Karten, obwohl Casting-Flags gespeichert waren; eine einfache Painter-Karte behielt sie.
- Ursache: der Core-Render-Hook lag vor dem nachträglichen System-Inhaltstausch.
- Erwartung/Lösung: nachgelagerten dnd5e.renderChatMessage-Hook nutzen und bereits montierte eigene Karten nach ready gezielt aktualisieren. Native synchrone Message-Finalisierung bleibt synchron.
- Wiederverwendung: hoch für Castingaktionen, Save-Bedienung und Zusatzschadenanzeigen.
- Prüfung: nach echtem Reload 97 eigene montierte Panels und gesperrte native Imbuement-Angriffs-/Schadensbuttons beobachtet; synchrone Flag-Erstellung automatisch und nativ geprüft.

### Genjutsu-Ergänzung vom 16.10.2026

- **MISSING AUTOMATION:** Illusionary Weapon hat im Quellenpaket keinen vollständigen nativen Waffenablauf. Eigenes persistentes Profil-/Zustandsmanagement mit nativen temporären Waffen ergänzt; keine Originalwaffenänderung. Smite und Angriffs-Rückgewinnung besitzen eigene Zahlungs-/GM-Journale. Waffen-Infusion und allgemeine Mirage-Interaktionen bleiben offen.
- **MISSING AUTOMATION:** Phantasmal Force besitzt im Quellenexport keine getrennten Strahlen. Expliziter eigener Ablauf für 1/2/3/4 Strahlen mit nativen Angriffen und gespeicherten Belegen ergänzt; weitere Mirage-Verknüpfungen offen.
- **MISSING AUTOMATION:** Moment/Temporal Mastery: gemeinsame neutrale Konzentration, eigene Effect-Ownership, aufgerundeter AC-Bonus, DEX-Zusatz und nativer bezahlter Folgecast ergänzt. Keine Laufzeitprüfung.
- **BUG im eigenen bisherigen WIP:** Klassenfeld für WIS/CHA wird vom nativen Actor-Quellfeld übersteuert. Auswahl auf das native Actor-Genjutsu-Attribut korrigiert. Nur durch Quellvergleich belegt, nicht in Foundry geprüft.

Relevante Quellen liegen in `outputs/GENJUTSU-SOURCES.json`; Implementierung in `casting/genjutsu-weapons`, `foundry/genjutsu-weapons`, `genjutsu-smite`, `genjutsu-phantasmal`, `genjutsu-attack-recovery` und `genjutsu-moment`. Hohe Wiederverwendbarkeit der bestehenden GM-Zielanfragen und neutralen verwalteten Effekte. Spiel-/Integrationstests ausdrücklich verschoben.

**MISSING AUTOMATION – Supreme-Infusion / Illusionary Bukijutsu:** Quellen `Compendium.n5eb.class.Item.6QsCfwqnpJ09q3aX` und `Compendium.n5eb.class.Item.kDNTE4BuXSokmkBS`; neuer versionsgebundener Adapter in `foundry/genjutsu-weapon-casting`, Ziel-/Restdauer-Anfragen in `genjutsu-infusion-targets`. Bestätigte Einzelzielbindung, ein Speicher je Form und Attributumrechnung; kritischer Genjutsu-Schaden noch offen. Hohe Wiederverwendung nativer Casts/Saves und bestehender GM-Anfragen; keine Originaländerung. Erforderliche spätere Prüfungen in TESTING.md; bislang keine Laufzeitprüfung.


### Genjutsu-Arbeitsfortschritt 16.10.2026

Genjutsu-Quellstand 16.10.: mehrfach vorhandene eigene Fähigkeiten benötigen stärkste-Wert-Gruppierung; native Condition-Einzelablage reicht für getrennte Quellen und lokale Immunitätsausnahmen nicht aus. Neue Verwaltung als Teilstand ergänzt, Integrationsnachweis ausstehend.


Native Konzentration speichert bei Inventar-Jutsu standardmäßig keinen vollständigen Item-Snapshot. Für verzögerte Brain-Worm-Casts wird dieser ausdrücklich mitgegeben, damit der eigene Unterhaltsmodifier beim späteren Bezahlen erhalten bleibt.


Konzentrationsausnahmen benötigen getrennte Behandlung von Limit und unfreiwilligem Verlust. Gemeinsame Abläufe mit verzögertem Wirken bleiben offen; fremde Lösch-/Dispel-Abläufe sind später in Foundry zu prüfen.


Genjutsu-Teilstand: Signature Work hatte keinen programmierten Folgecast; bestätigte normale Wirkerkosten nun als persistenten nativen Ablauf ergänzt. Words Of Detriment/Fury/Permeating Seals bislang nur Texte; opt-in Cast-Verstärkungen ergänzt. Keine Laufzeitbelege, Details und Restumfang in der Genjutsu-Checkliste.


### GEN-SKILL-001 · BUG · Hohe Wiederverwendbarkeit

Installierte Beguiling-Influence-/Illusionary-Vigor-Effekte addieren jeweils +1 auf beide Skill-Werte (`wpLjO2nSO6OiMN0E`, `4WfVfe8ba1gxCiPv`). Native `normalizeSkillToolProficiency` bildet Werte ab 2 auf Mastery ab; bei bereits beherrschten Skills würden dadurch beide steigen, obwohl der Text die Wahl eines einzigen verlangt. Enhancement ersetzt nur diese belegten Änderungen durch gespeicherte Lernpakete und wahrt höhere Werte. Benötigte spätere Prüfung: vorher unbeherrscht/beide beherrscht, einzelne Auswahl, bestehende höhere Mastery, Modul aus/an und mehrfaches Vorbereiten. Bislang ausschließlich Quellbelege; keine Laufzeitprüfung.


17.10.2026 – Genjutsu-Quellfortsetzung: Lücken in Fear-Schadensreihenfolge, Crest-Rückgabe, Phantom-Pain-Angriff, Void Slash, True-Strike-Aura und Casting-Ursprüngen bearbeitet; genaue Teilabdeckung siehe Einzelcheckliste. Sensory-Markierungsdauer vom Nutzer ausdrücklich bis manueller Beendigung bestätigt. Empfängerkreis des Sichtbarkeitsausschlusses noch ungeklärt. Keine Feststellung runtime-verifizierter Bugbehebung.


0.15.0 Gruppenfassung (17.10.2026): zusätzlicher quelleneigener Beobachterkreis für Sensory-Markierungen über Token-Detection und bestätigte Wurfkontexte; parallele Song-Konzentrationsgruppe; Lucid-Effektauswahl/-Unterdrückung; Brawler-Virtualisierung; Mirage-Sonderdaten und Bedienelemente. Keine öffentlichen Schreib-APIs für diese internen Flags. Noch nicht spiel-/integrationsgeprüft. Grenzen nativer manueller Jutsu-Abläufe ausdrücklich in GENJUTSU-GRUPPENFASSUNG.md.

0.15.0 Abschlussstand: 202 ESM-Dateien syntaktisch geprüft, lokale statische ESM-Verknüpfung ohne Auswertung und drei Konfigurations-JSON-Dateien erfolgreich; keine Laufzeit-/Unit-/Spieltests. Ergänzt: besitzgeprüfter No-Light-Fracture-Zielmarker, tatsächliche Save-Trigger, gesenkte Wirkungsschwellen und persistente Monats-Erholung; Maddening-Pain-Angriffsfolge ohne doppelte Phantom-Pain-Anwendung. Jutsuspezifische narrative Regeln werden nicht erfunden.

## Medical-Nin — Entwicklung, 17.10.2026

MED-001 (BUG): sichtbare Medical-Klassentabelle, Featuretext und ScaleValue-Progression widersprechen sich bei Channeled Healing und Chakra Scalpel. Nutzerentscheidung: sichtbare Tabelle maßgeblich; vorbereitete Ressourcen/Scalpel-Formeln werden im Modul korrigiert. MED-002 (MISSING AUTOMATION): gemeinsame Heilung, Empfängergrenzen und Preserve-/Take-Life-Pool benötigen eine zentrale bestätigte Zielanwendung. MED-003 (POTENTIAL ISSUE): Tenets of Medicine enthält keine ausgearbeiteten Auswahloptionen im untersuchten Bestand; auf Nutzerwunsch ausgenommen. Weitere 98 Featurequellen/elf Unterklassen sind indexiert, aber nicht vollständig integriert; siehe MEDICAL-ARBEITSSTAND.md und Status-JSON. Nachgelagerte Gameplay-Validierung bleibt offen.


### Medical-Fortsetzung · 17.10.2026

Medical-Fortschritt: native Chakra-/HP-Schritte benötigen einen beobachteten Abschluss-Hook. Mehrere unabhängige temporäre-HP-Zähler durften denselben Schaden doppelt verbuchen; gemeinsame Buchhaltung ergänzt. Übereinanderliegende Altdaten verlangen GM-Korrektur. Laufzeitnachweis steht aus.

## Taijutsu follow-up · 20 October 2026

- **TAI-SNAPSHOT-001 · BUG · high:** src/foundry/casting-augmentation.mjs accepted prior class snapshots but omitted Taijutsu and generated unarmed markers. Static source evidence: the module's snapshot predicate rejected those markers, allowing native inventory/stored-data fallback instead of explicitly reconstructing the enhancement cast and reapplying its save changes; generated factory IDs are also absent from inventory. Native fallback may recover some virtual profiles but does not replace the enhancement-specific reconstruction path. Corrected the shared predicate for Taijutsu cast/unarmed/redirect/blows/Disturbance/interruption markers. Reusable fix for all Taijutsu chat workflows; runtime group verification pending.
- **TAI-DISTURBANCE-001 · MISSING AUTOMATION:** nine installed subclass entries have0 activities and no effects in TAIJUTSU-SOURCES.json. Added module-only paid workflows, source aliases, saved saves/target requests and agreed manual action declarations. Source IDs/rules and individual limitations remain in TAIJUTSU-SOURCES.json and TAIJUTSU-IMPLEMENTATION-STATUS.json. Required later checks: source ownership, once-per-turn limits, shared native counters, interrupted payments/rolls, typed vulnerability consumption and Shatter concentration isolation.
