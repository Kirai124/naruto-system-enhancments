# Aktuell · 0.17.1

Vier Klassen erhalten eigene Aktionsfenster: Ninjutsu orange, Genjutsu violett, Medical grün, Taijutsu rot. Nur tatsächlich vorhandene Klassen und aktivierte Enhancement-Kategorien erzeugen einen Button. Vorhandene Effekte auf anderen Empfängern und NPCs bleiben erreichbar. Nin-Tai-Naturaktionen werden vor der Anzeige auf konkrete Natur/Form geprüft. [Umfang und Prüfstand](ZWISCHENSTAND-0.17.1.md).

## Frühere Entwicklungsnotizen

# Unveröffentlicht · Medical-Bedienung und QA

Ein Sheet-Button öffnet die tatsächlich verfügbaren Medical-Klassenaktionen, Begleiter und gespeicherten Vorgänge in einem kompakten Fenster. Treffer-/Heilungsoptionen bleiben kontextbezogen an Chatkarten. Ein Scalpel-Angriff bietet den nativen Schadenswurf an. Bestätigte Kernabläufe und noch ungeprüfte Fähigkeiten: [Medical-QA](MEDICAL-QA.md).

# Aktuell: Taijutsu Specialist · Gruppenfassung 0.17.0

Grundklasse, Martial Techniques und 14 installierte Unterklassen sind quellseitig eingebunden. Details und manuelle Grenzen: [Gruppenfassung](TAIJUTSU-GRUPPENFASSUNG.md), [Einzelcheckliste](TAIJUTSU-SPECIALIST-CHECKLISTE.md). Optional, standardmäßig aus; Gruppenprüfung offen.

## Historische Entwicklungs- und Release-Notizen

## Unveröffentlicht · Fortsetzung 21.10.2026

Nin-Tai-Grundabläufe, automatischer Armor-Unterhalt und Catalyst-Kurzschluss sowie Tempest-/Realized-Soul-Teilabläufe ergänzt. Vollständiger aktueller Umfang und offene Punkte im [Arbeitsstand](TAIJUTSU-ARBEITSSTAND.md). Nicht installiert; keine Spielprüfung.

## Unveröffentlicht · Taijutsu-Arbeitsstand 20.10.2026

Stancer, Ruin-Treffer/Casting sowie Teile von Ironclad, Tempest und Matrix ergänzt. Gesamtklasse weiterhin unvollständig, nicht installiert und nicht spielgeprüft. Aktueller Umfang und Grenzen: [Arbeitsstand](TAIJUTSU-ARBEITSSTAND.md), [Einzelstatus](audit/TAIJUTSU-IMPLEMENTATION-STATUS.json). Installierte Version bleibt0.16.0.

# Aktuell: Medical-Nin 0.16.0

Quellseitig ergänzte Heilung, Scalpel-/Sabre-/Spiritual-Waffen, bestätigte Treffer und Conditions, Medical-Casting, Doctrines, elf Unterklassen, bestehende Begleiterprofile, Quellenbuchhaltung und GM-Anfragen. Details und ausdrückliche manuelle Grenzen stehen in MEDICAL-GRUPPENFASSUNG.md. Featurebesitz erforderlich, standardmäßig aus. Kein Laufzeit-/Spielnachweis. Ältere Entwicklungsnotizen unten sind historische Zwischenstände.

# Funktionsstatus

## 0.15.0 — Genjutsu Specialist, Gruppenfassung

Die Klassenabläufe sind als optionale, noch nicht spielgeprüfte Gruppenfassung integriert. Umfang, Bedienung und ausdrücklich verbleibende manuelle Jutsu-Mechaniken: [Gruppenfassung](GENJUTSU-GRUPPENFASSUNG.md), [Einzelcheckliste](GENJUTSU-SPECIALIST-CHECKLISTE.md). Kein Funktionsnachweis durch Spieltests; die Gruppe prüft später.

## 0.14.0 — Ninjutsu Specialist, Gruppenfassung

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

## Unterklassen-Moldings — 15.10.2026

27 Casting- und vier Adaptive-Techniken sind eingebunden. Drip Release und Ryo Master sind ausgeschlossen. Castingdialog, bestätigte native Zielwirkungen, persistente GM-Anfragen, Folgecasts und eigene temporäre Effekte verwenden gemeinsame Infrastruktur. Die vollständige Übersicht einschließlich bewusst manueller Teile steht in [SUBCLASS-MOLDINGS.md](SUBCLASS-MOLDINGS.md). Die Validierung dieses Stands wird in TESTING.md dokumentiert. Die gesamte Klasse ist weiterhin nicht abgeschlossen.


## Historischer Meilenstein 0.11.0 — Refined und Shard-/Mote-Casting

- Refined Ninjutsu: bekannte Ninjutsu ohne Combination auswählen; Kapazität 2 ab Stufe 1, +1 alle drei Klassenstufen; Bonus +1/+2/+3 ab 1/9/17. Auswahl bleibt nach Reload gespeichert. Spieler können freie Plätze belegen, bestehende Auswahl nach langer/full Rast ersetzen; GM darf korrigieren. Pro Cast SG oder Zusatzwürfel einer eindeutigen Schadensformel. Original-Inventar-Jutsu bleibt unverändert. Casting-Snapshot hält gewählten Bonus für spätere Chatwürfe fest.
- Void Adept: maximal drei Shards für −2 Chakra je Shard (Minimum 0), vor Recovery; ein Shard für Chakra-Schaden aller vorbereiteten Schadenswürfe der gewählten Aktivität; oder +5 Chakra je Shard für genau eine ausdrücklich bestätigte betroffene Kreatur. Zielwirkung wird als GM-Anfrage gespeichert. Verschiedene Verursacher addieren; kein Ablauf bis zum nächsten bestätigten Jutsu oder GM-Entfernen. Addition nach finalen Reduktionen/Recovery, auch nach nativem Shocked-Multiplikator. Kein Unterhaltszuschlag.
- Lightning Adept: +3 Schaden je Mote auf die gewählte Formel, bei kritischem Treffer verdoppelt; −1 Unterhalt je zwei Motes konkurriert als stärkste Reduktion mit passiven/Technical-Regeln; bei normalerweise nicht schädigendem Jutsu Nd8 Lightning auf ausdrücklich bestätigte Kreaturen, später native GM-Anwendung.
- Elemental Adept: +floor(Motes/2) effektiver Casting-SG, Nd6 auf die gewählte Schadensformel oder 2 temporäre Professor-Chakra je Mote. Professor-Pool maximal 10 zusätzlich zu anderem temporären Chakra; zuerst verbraucht. Vergabe erst nach vollständiger nativer Kostenanwendung; nicht zum Bezahlen desselben Casts vorweggenommen.
- Bestätigter Cast übernimmt Poolverbrauch und Anfrage zusammen in den nativen Actor-Update-Batch. Abbruch, ungültige/abgelaufene Auswahl oder fehlendes Chakra bezahlen/verbrauchen nichts. Offene Pool-Anfragen blockieren weitere Änderungen derselben Gruppe. Anfrageabbruch stellt nur noch aktive persönliche Einträge als persönlichen Pool wieder her.

Noch offen: Refined-Unterklassen-Erweiterungen auf Buki/Tai einschließlich Ability-/Keyword-Konversion, Efficient Molding, Ninjutsu Master, Ember-DR, weitere Traditionen und native Mehrclient-Prüfung. Automatisierte Effekte unabhängiger sekundärer Aktivitäten eines Jutsu sind noch nicht vollständig abgedeckt. Aktionsökonomie bleibt manuell.


## Historischer Meilenstein 0.10.0 — Ninjutsu Specialist, erster Abschlussbaustein

Chakra Recovery erscheint als freiwillige Option im vorhandenen Castingdialog, nur bei tatsächlich besessenem, verifiziertem Feature, Ninjutsu Specialist und Ninjutsu ohne Combination. Nutzerregel: nach den normalen Kostenreduktionen halbieren und abrunden. Ein bestätigter Cast verbraucht eine native Feature-Nutzung; Abbruch, fehlendes Chakra oder erschöpfte Nutzungen verbrauchen nichts. Keine zusätzliche Unterhaltshalbierung. Native Konzentrationsdaten behalten den wirklich bezahlten Wirkkostenbetrag; die normale Unterhaltsbasis bleibt separat erhalten.

Chakra Recovery skaliert auf 1/2/3/4 Nutzungen bei Klassenstufe 1/6/11/17. Jutsu Breaker skaliert auf 2/3/4 bei 5/11/17. Das ist dessen Ressourcenmaximum, noch keine automatische Clash-Auslösung. Quellmaxima und spent bleiben unverändert; benutzerdefinierte Maximalformeln und erkannte andere Overrides werden erhalten. Setting ninjutsuClassAutomation ist standardmäßig aus. Casting braucht zusätzlich dynamicChakraCosts.

Die Klasse ist noch nicht abgeschlossen. Refined Ninjutsu, Efficient Molding, Ninjutsu Master, Shard-/Mote-Castingverbrauch, Ember-DR und weitere Traditionseffekte bleiben offen. Vollständige Grant-Zuordnung: NINJUTSU-SPECIALIST-CHECKLISTE.md (9 Basis-, 116 Unterklassen-Grants, 16 Traditionen; keine 125 bestätigten Fehler). Aktionsökonomie bleibt manuell.

## Historischer Stand vor 0.10.0


## Entwicklungsstand 0.9.0 — Karten und Mark-Auslösung

Tracker-Karten orientieren sich an den lesend geprüften Tenseigan-Karten und Orb-Pips der Class-Mod-Library: eigener Akzent, fünf Kreise, Pools und Zielgruppen, Restlaufzeit, kompakte Bedienelemente. Keine Abhängigkeit von der Library und keine Änderungen daran.

Implementierte Basiswirkungen: alle eigenen Breeze Marks → native additive Bleeding-Ränge; wählbare Ember-Anzahl → 1d12 Fire je Mark mit nativer Schadensanwendung; alle eigenen Blade Marks → 1d6 je Mark in einer ausgewählten tatsächlichen Schadensart einer besessenen Waffe, anschließend native Prone-Anwendung. Auslösebedingungen werden ausdrücklich bestätigt, nicht aus einem ungesicherten Schadensereignis geraten.

Persistente Anfrage auf dem Quellen-Actor reserviert/entfernt bestätigte Marks in einem Update. Der aktive GM bestätigt die Zielanwendung im Tracker. Pending-Anfragen lösen selbst keinen Schaden aus und bleiben nach Reload sichtbar. Abbruch gibt nur noch aktive reservierte Einträge ohne Laufzeitverlängerung zurück. Zieltoken und Actor-Zuordnung werden vor Anwendung erneut geprüft. Native Schäden, Würfe, Bearbeitungsstatus und abgeschlossene Schritte bleiben gespeichert; die zuletzt angewendete Wirkung erscheint auf der Karte.

Fehler oder unterbrochener Applying-Zustand bleiben gesperrt zur manuellen GM-Prüfung. Keine automatische Wiederholung oder automatische Rückabwicklung bereits angewendeter Zielwirkungen. Nach manueller Korrektur kann der GM die Sperre ausdrücklich abschließen. Weitere Änderungen derselben Zielgruppe warten auf Bearbeitung der Anfrage. Zuglimits warnen; Ember-Erzeugung nach Auslösung warnt zusätzlich. Aktionsökonomie bleibt manuell.

Verifiziert: 121 Unit-Tests, neun native Basisprüfungen und vier native Bestätigungen der tatsächlich bedienten UI-/Reloadabläufe. Noch offen: Ember-DR, höhere Molding-Sonderregeln, Shard-/Mote-Verbrauch, vollständige Mehrclient-Prüfung, Featurelöschung während offener Anfrage und Modul-Aus-/Einschalten. Zwei getrennte Spieler-/GM-Clients wurden nicht getestet. Keine Behauptung vollständiger Klassenautomation.

## Frühere Meilensteine


## Entwicklungsstand 0.8.0 — Ninjutsu-Tracker

Persistente Grundlage für Void Shards, Lightning Motes, Elemental Motes sowie Breeze-, Ember- und Blade-Marks. Besessene Features werden anhand exakter Kompendiumquellen erkannt. Speicherung auf dem Besitzer-Actor; Zielreferenzen enthalten Actor-/Token-UUID und Namen. Persönliche Pools und Zielgruppen sind getrennt. Marks sind je verursachendem Charakter und Ziel auf fünf aktive Einträge begrenzt; andere Verursacher werden weder mitgezählt noch mitverbraucht. Nutzerentscheidung: neue Einträge erneuern ihre aktive Gruppe auf eine Minute Foundry-Weltzeit; abgelaufene Einträge werden nicht wiederbelebt.

Sheet-Kontrollen zum bestätigten Hinzufügen und Korrigieren sind implementiert, Welteinstellung `ninjutsuTrackers` standardmäßig false. 112 Unit-Tests und Syntax-/Manifestprüfungen bestehen. Elf native Prüfungen, tatsächliche Tokenauswahl, UI-Abbruch/Bestätigung/Korrektur und echte Reload-Persistenz wurden in test12 geprüft. Native Prüfung siehe TESTING.md.

Auch am Maximum von fünf erneuert ein weiterer bestätigter Eintrag die Gruppenlaufzeit. Neueintrag im selben Zug erzeugt einen bestätigbaren Warnhinweis bei den fünf Definitionen mit entsprechendem Erzeugungslimit; Blade-Mark-Erzeugung wird nicht künstlich so beschränkt. Zugkennung wird für tatsächlich am aktiven Kampf beteiligte Quellen-Actors gespeichert. Bereits vorhandene generische Zähler und Aktivitätszeilen der sechs verwalteten Features werden ausgeblendet, native Featurebenutzung wird vor Verbrauch zum Tracker umgeleitet. Alte Daten bleiben unverändert.

Nicht implementiert: automatische Ereigniserkennung, Castingverbrauch mit sekundären Kosten-/Schadens-/Condition-Wirkungen, vollständige Verbrauchs-/Rundenlimits und Sonderfeatures. Die Korrektur reduziert ausschließlich den Zähler. Keine automatisierte Aktionsökonomie. Lunar Slayer/Jujutsu Sorcerer und ihre Unterklassen sind auf Nutzerwunsch vom weiteren Ausbau ausgeschlossen; t7-Unterklassen anderer Klassen, etwa Imbuement Master, bleiben im Umfang.

## Abgeschlossen

- Lesende Umgebungsprüfung und erste Quellcodeanalyse.
- Sichere Workspace-Kopien ausgewählter Kompendien und initialer Audit.
- Nutzerabstimmung zu Testwelt, Regelquellen, Reihenfolge und Architektur.
- Modulmanifest 0.6.0, Init/Ready, Sprachdateien, sichere Einstellungen und Versionsschutz.
- Reiner Kostenkern: Filter, Rangprüfung, Priorität, exklusive Gruppen, optionale Auswahl, Nutzungsvorschau und Aufschlüsselung.
- Modifier-Registry mit Validierung, Duplikatschutz und unveränderlichen Definitionen.
- Amplified-Flames-Kostenregistrierung und lesender Actor-/Jutsu-Adapter mit belegten Standard-Uchiha-Quellen.
- Strukturelle Prüfung aller 43 Systemkompendien; vollständiger Regelaudit weiterhin offen.
- 83 automatisierte Tests und Syntax-/Manifestprüfungen bestanden.
- Lokale Installation durch Foundry in der Paketliste erkannt.
- Aktivierung und Reload in test12, registrierter sicherer Setting-Default sowie drei tatsächliche API-Smoke-Prüfungen in Foundry bestanden.

## Geplant, nicht implementiert

- Casting-Commit einschließlich bestehender nachgelagerter Zustandskosten.
- Frei registrierbare Castingmodi, sekundäre Effekte und verbindliche Nutzungslimit-Verbuchung.
- Dojutsu-Instanzen, Aktivierungsworkflow und eigene Effektverwaltung.
- Dojutsu-/Effekt-API und vollständige Gameplay-Integrationstests.

## Castingintegration 0.2.0

Der Adapter erweitert die native getChakraCost-Methode. Passive verifizierte Modifikatoren wirken bei aktivierter Einstellung auf Dialog, native Prüfung und Abbuchung. Das Originalsystem führt sämtliche Ressourcenänderungen aus. Eigene Minion-/Fixkosten-Sonderfälle bleiben erhalten. Optional gewählte und nutzungsbeschränkte Modifier werden noch nicht automatisch angewendet.

Der ursprüngliche Dialog erhält eine kleine Kostenaufschlüsselung und Diagnose unbestätigter Zuordnungen. Die gewählte Dialogklasse anderer Module bleibt die Basisklasse. Aktuelle Keys: `debugLogging` (client), `dynamicChakraCosts` und `martialPoolRecovery` (world), alle standardmäßig false.

In test12 tatsächlich geprüft: native Kosten ohne Automatik, Reduktion genau einmal, bezahlbarer Cast trotz höherer nativer Kosten, temporäres Chakra zuerst, unzureichende Ressourcen unverändert, Verbrauch aus, Rangwechsel und Dialogabbruch. Mehrclient-Parallelität, Fehler nach erfolgter nativer Abbuchung, Nutzungslimit-Verbuchung und vollständige Zustandsregression sind noch offen. Seit 0.3.0 wird diese native Unterhaltsbasis zusätzlich durch belegte Unterhaltsregeln erweitert.


## Unterhalt und Auswahl 0.3.0

| Feature | Automatisierter Kostenanteil |
|---|---|
| Elemental Specialization | Auswahl Earth/Wind/Fire/Water/Lightning; Ninjutsu-Wirkkosten D–S minus 1–5; additiv zu Amplified Flames |
| Non-Elemental Specialization | Auswahl Fuinjutsu/Medical; Ninjutsu-Wirkkosten D–S minus 1–5 |
| Sensory Specialization | Auswahl Auditory/Visual/Inhaled; Genjutsu-Wirkkosten D–S minus 1–5 |
| Latent Plasma Release III | Auswahl Fire/Lightning; Wirkkosten minus 1, Minimum 1 |
| Latent Swift Release III | Auswahl Wind/Lightning; Wirkkosten minus 1 |
| Streamlined Chakra Efficiency | Kategorieauswahl; Unterhalt minus 1, Minimum 1 |
| Shinobi Edge | Unterhalt minus 1, Minimum 1 |
| Refined Chakra Network | Taijutsu/Medical-Unterhalt minus 2; Minimum floor(normaler Unterhalt / 2) |
| Genjutsu Specialty, Reality Marble, Latent Genjutsu Specialty II | Genjutsu-Unterhalt D–S minus 1–5 |
| Efficient Breathing | Heavenly-Breath-Taijutsu ohne Unterhalt; Featureherkunft geprüft, Jutsuerkennung nach expliziter Namensbedingung |
| Master Weaver | Auswahl eines besessenen Konzentrationsjutsu bis C; Unterhalt am Basisrang 0 |

Mehrere Unterhaltsreduktionen werden einzeln gegen dieselbe Basis ausgewertet; gewählt wird das niedrigste zulässige Ergebnis. Wiederholte Kopien derselben Spezialisierung geben keinen doppelten Rabatt. Unterschiedliche Elemental-Auswahlen bleiben möglich. Original-Jutsu und Kompendien bleiben unverändert. Nur Kostenanteile der genannten Features sind integriert, nicht sämtliche übrigen Vorteile.

Auswahl bei Erwerb, Abbruch ohne Flagänderung, persistente Auswahl und GM-Korrektur sind implementiert. Seit 0.4.0 erscheint eine neue Auswahl nach erfolgreicher langer Rast bzw. Full Rest. Feats ohne passenden bekannten Konzentrationsjutsu lassen sich später am Item konfigurieren.

Die zuvor zurückgestellten Kostenmechaniken sind im folgenden Abschnitt 0.4.0 aktualisiert.

## Zusätzliche Kostenmechaniken 0.4.0

| Mechanik | Implementierter Kostenworkflow |
|---|---|
| Insect Nest Integrity | Aburame-Unterhalt D–S minus 1–5; acht belegte Standard-Jutsu-Quellen, keine Zuordnung allein nach Name/Keyword |
| Split Focus | Genjutsu-Unterhalt minus 1/2/3 bei tatsächlichem Genjutsu-Specialist-Level 6/10/19, Minimum 1; nur Kostenanteil |
| Latent Genjutsu Specialty I | Nutzerbestätigt: nur Wirkkosten minus 1 für Konzentrations-Genjutsu D–S |
| Genjutsu Adept | Nutzerfreigegebene installierte Homebrew-Variante: Unterhalt minus 1 nur wenn ausschließlich Genjutsu konzentriert werden; unbekannte Konzentrationsquellen schließen Rabatt aus |
| Signature Control | Besessenes Jutsu bis B auswählen; dessen Wirkkosten minus 2, Minimum 1; Unterhalt minus 2; auch Upcasts |
| Efficient Breathing | Ergänzend zum freien Unterhalt: Heavenly-Breath-Taijutsu-Wirkkosten D–S minus 1–5 |
| Master Weaver | Neue Auswahl nach erfolgreicher Long/Full Rest; abbrechen behält vorherige Auswahl |
| Technical Technique | Option im nativen Castingdialog; 1 Martial Die verbrauchen; Wurf erst nach Bestätigung/Prüfung; Unterhaltsreduktion ceil(Wurf/2), stärkster Rabatt; gespeicherter Effektzustand |
| Force of Rage | Erwerbs-/Full-Rest-Auswahl eines geeigneten Self-Jutsu, mindestens 1 Minute, Action/Bonus Action. Explizite Frenzy-Castingoption; Voraussetzungen: Feature, Chakra Frenzy, verifizierte Taijutsu-Klasse ab Level 6, Martial-Adept-Pool, keine getragene schwere Rüstung. Kosten: 1 Frenzy-Die + rangabhängig 1/2/3 zusätzliche Dice; Wirkkosten unverändert, Unterhalt 0. |

Kostenanteile sind integriert; Split-Focus-Konzentrationslimit, übrige Schadens-/SG-Boni und vollständige Frenzy-Effekte werden nicht automatisch gewährt. Technical-Zustand liegt am Konzentrationseffekt, nicht am Original-Jutsu. Andere Automationen des Technical-Keywords sind nicht damit verbunden. Martial-Pool-Regeneration am Zugbeginn bleibt außerhalb dieses Kostenworkflows. Signature-Wechsel beim Lernen eines neuen Jutsu durch Scout-Levelaufstieg wird derzeit per GM-Korrektur verwaltet.

Offen: konkrete alternative Class-Mod-Ressourcen (Rückfrage an Nutzer), allgemeine API zum Registrieren fremder Castingmodi, automatische Martial-Pool-Regeneration, native Action-Economy-Prüfung im echten Kampf, vollständige Mehrclient-/Rollback-Absicherung. Die zwei eingebauten Modi ersetzen keine frei registrierbaren Class-Mod-Modi.

## Aktueller Stand 0.5.0

- Martial Technique: verifizierter Featurebesitz und Taijutsu-Klasse; feste Basiskosten D 3 / C 5 / B 9 / A 14 / S 20, anhand des Basisrangs. Native Upcast-Zuschläge bleiben erhalten. Andere Wirkkostenreduktionen ausgeschlossen; Kostensteigerungen bleiben möglich. Nutzerbestätigt: Unterhaltsreduktionen weiterhin erlaubt. Abwählbare, standardmäßig aktive Checkbox; Sonderkostentext sowie E-/Art-Basisränge ausgenommen. Kein dauerhafter Itemwrite.
- martialPoolRecovery: eigene Welteinstellung, default false. Über den nativen dnd5e.combatRecovery-Hook wird ein verifizierter Martial-Adept-Pool am eigenen Zugbeginn auf seinen vorbereiteten Maximalwert erneuert. Native Klassen-Skalierung verwendet; keine Änderung der Maximalwertformel. Bestehende passende Regenerationsprofile und vorbereitete Uses-Updates behalten Vorrang. Persistente Zugkennung verhindert nochmaliges Auffüllen nach Verbrauch im selben Zug. Keine Auffüllung außerhalb des Kampfes oder am Zug eines anderen Combatants.
- Aktionsökonomie bleibt auf Nutzerwunsch manuell. Das Modul ergänzt keine Aktions-/Bonusaktionsabbuchung und verändert keine nativen Verbrauchsoptionen. Bereits vorhandenes Systemverhalten wird erhalten.
- Reload/Modul-Aus-/Einschalten werden im eigenen Fixture mit erhaltenen Ressourcen, Auswahl und Effektzustand geprüft; Details in TESTING.md.

Die vorherigen Abschnitte 0.3/0.4 dokumentieren den jeweiligen damaligen Stand. Zusätzliche Kostenkandidaten sind in COST-COVERAGE.json erfasst: 24 Quellen mit integriertem Kostenanteil, 99 weitere ungeprüfte Nicht-Class-Mod-Kandidaten und 41 Class-Mod-Kandidaten. Diese Textsuche ist weder vollständiger Regelaudit noch bestätigte Bugliste. Empowered Taijutsu und Medical Specialization sind seit 0.6.0 im Kostenanteil integriert; situative Release-Expert-Rabatte bleiben ungeprüft. Vollständige Frenzy-Boni, Mehrclient-Koordination und Gesamtrollback bleiben offen; Dojutsu-Grundlage ab 0.7.0; weitere Stufen noch offen.

## Spezialisierungen 0.6.0

- Empowered Taijutsu: tatsächliches Standardfeature erforderlich; Taijutsu mit Combo oder Finisher reduziert Wirkkosten D/C/B/A/S um 1/2/3/4/5. Der passive Rabatt verbraucht keine Nutzungen des getrennten Schadensbonus.
- Medical Specialization: beim Erwerb Acid, Necrotic oder Poison wählen. Wiederholte Feats verlangen unterschiedliche Schadensarten. Medical-Ninjutsu mit passender fest hinterlegter Schadensart erhalten dieselbe Rangreduktion. Auswahl bleibt am Feature gespeichert; vorhandene unkonfigurierte Feats können über den Itemkopf eingerichtet werden.
- Nutzerbestätigte Stapelung: sobald eines dieser Features tatsächlich passt, gilt nur die stärkste passende rangabhängige Wirkkostenreduktion. Pauschale Reduktionen wie Signature Control bleiben zusätzlich möglich. Elemental Specialization + Amplified Flames bleiben bei anderen Jutsu additiv. Martial Technique schließt diese Wirkkostenreduktionen weiter aus. Unterhaltsregeln bleiben unverändert.
- Schadensarten werden aus nativen Aktivitätsdaten gelesen. Identische Schadensarten in Angriff und Rettungswurf sind unterstützt. Bei verschiedenen Aktivitäten gilt nur die gemeinsame feste Schadensart; wählbare Typen werden nicht geraten und erzeugen einen Hinweis.
- Schadensboni, Hand-Seal-Vorteile, zusätzliche Aktionen und übrige Vorteile dieser Feats sind nicht automatisiert.

## Dojutsu 0.7.0 — erste Ausbaustufe

| Definition | Mindestlevel | Aktivierung | Dauer | Chakra-Sicht außerhalb / im Kampf |
|---|---:|---:|---|---|
| Sharingan | 3 | 0 Chakra | 10 Minuten | 30 / 30 Fuß |
| Byakugan | 1 | 5 Chakra | 1 Stunde | 500 / 250 Fuß |
| Latent Sharingan I | 7 | 10 Chakra | 10 Minuten | 30 / 30 Fuß |
| Latent Byakugan I | 3 | 10 Chakra | 10 Minuten | 120 / 60 Fuß |

Erkennung ausschließlich anhand tatsächlich besessener Feats mit exakter Standardpack-Provenienz. Mindestlevel wird geprüft; das besessene freigeschaltete Feature ist Voraussetzung, weitere Clan-/Feat-Voraussetzungen werden nicht aus Namen geraten. Mehrere Instanzen und identische Augen-Zuordnungen sind erlaubt. Byakugan-Varianten können innerhalb des bereits bezahlten Zeitfensters kostenlos reaktiviert werden; Laufzeit wird dabei nicht verlängert. Sharingan-Fähigkeitsnutzungen werden durch die Aktivierung nicht verbraucht.

Dauer folgt Foundry-Weltzeit, nicht realer Uhrzeit. Chakra-Sicht wird als native Sense ergänzt; dadurch werden keine Wände durchlässig gemacht und keine 360°-Token-Sicht gesetzt. Überlappende Reichweiten ergeben die höchste Reichweite. Fremde Effekte bleiben erhalten; aktive externe Effekte derselben Quelle blockieren eine parallele Modulaktivierung.

Nicht umgesetzt: Tomoe-/Stufenboni, Wahrnehmungsbonus, einzelne Sharingan-Reaktionen, Nachfüllen von Fähigkeiten, optionale Latent-Upgrades, Mangekyō/Rinnegan/Tenseigan-Regeln, allgemeine bedingte Effekte oder Ressourcentracker. Keine Action-Economy-Automatisierung. Mehrclient-Transaktionen bleiben eine offene Grenze.

## Aktueller Tracker 0.7.1

Keine Augen-Auswahl mehr. Sharingan-/Byakugan-Zeilen mit Featurebild, farblichem Aktivzustand, Kosten/Laufzeit und direktem Schalter. Sharingan zeigt drei Tomoe-Punkte und die automatisch effektive Stufe. Nur der GM sieht die Freigabe-Auswahl; höchstens 1/2/3 Tomoe. Default ist die bereits über das Aktivierungsfeature gewährte erste Stufe. Höhere Tomoe benötigen explizite GM-Freigabe und Level 7/11 beim normalen Sharingan bzw. 11/15 beim Latent Sharingan; erste Stufe bleibt an Level 3 bzw. 7 gebunden.

3 Tomoe: installierter +5-Bonus auf passive Wahrnehmung nur während Aktivierung. Mehrere aktive normale/Latent-Instanzen gewähren diesen Bonus insgesamt einmal; fremde Boni bleiben erhalten. Herabstufung/Deaktivierung entfernt ihn; verbleibende berechtigte Instanz übernimmt ihn. Zusätzliche Aktionen, Reaktionen und einzelne wählbare Tomoe-Fähigkeiten bleiben manuell. Frühere Augenflags bleiben als inaktive Kompatibilitätsdaten gespeichert und beeinflussen keine Regeln.


## Efficient Molding 0.12.0 — 2026-10-13

Alle 17 normalen Moldings sind an den vorhandenen Castingdialog, native Würfe und Chatkarten angeschlossen. Gemeinsamer Pool mit nativer Rast, frei zuordenbare kostenlose Nutzungen, separate Chakra-Zusätze, kompakter Sheet-Zähler und GM-Korrektur. Unterklassen-Moldings folgen separat. Aktionsökonomie bleibt manuell.

Distant, Extended, Widened, Quickened, Reactive, Subtle und Transmogrified verändern nur den Castingklon. Careful schützt bestätigte Kreaturen vor Schaden und nativer Effektanwendung. Heightened speichert den ersten Rettungswurf am betroffenen Actor. Piercing behandelt Resistenz, Immunität und temporäre HP nur für den Cast bis Zugende. Potent maximiert nur die ursprüngliche Schadensformel je Teil, keine Actor-/Item-Bonuswürfel, Refined- oder Mote-Würfel. Precise verwaltet bezahlte Angriffe mit Vorteil. Doubled speichert zwei bestätigte Ziele. Echoing speichert einen einmaligen kostenlosen Folgecast gleicher Kreatur und gleichen Ranges im folgenden eigenen Zug, mit aufgerundetem halbem Schaden des ursprünglichen Jutsu; Refined- und Mote-Cast-Boni werden nicht erneut übernommen. Außerhalb des Kampfes wird der Zeitpunkt ausdrücklich bestätigt.

Focused und Redirected sind bestätigte Folgeaktionen; beim Redirect ist der zweite native Angriff verbindlich. Tenacious bietet Clash (+1d10 mit gewähltem gegnerischen Rang/nativer Rundenzahl) oder Counter/Dispel/Interrupt (bestätigter Basis-SG +3). Ein Counter-SG wird nicht aus unbekannten Regeln erfunden.

Opt-in: „Ninjutsu Specialist: Efficient Molding“ plus dynamische Chakra-Kosten. Ausschließlich tatsächlicher Quellenbesitz zählt; native Klassenauswahl bleibt zuständig. Originalitems, fremde Effekte und Aktionsressourcen werden nicht für Moldings umgeschrieben. Sonderformeln, unklare Zielbeschränkungen, andere Flächenformen und metrische Flächen brauchen weiterhin verifizierte Daten bzw. ausdrückliche Bestätigung.

### Genjutsu-Ergänzung vom 16.10.2026 (unveröffentlicht)

Illusionary-Weapon-Basis, höchste Waffenverbesserung, Doubled Weapon, illusionäre Munition, Smite-Ressourcen/GM-Anfragen, getrennte Phantasmal-Force-Strahlen mit Agonizing, bestätigte Angriffs-Rückgewinnung ab 11 und Moment/Temporal Mastery sind im Quellstand ergänzt. Waffen-Infusion und viele weitere Mirages bleiben offen. Keine Spiel- oder Integrationstests und keine Installation.

Smite-Abgrenzung vom 16.10.: Waffen- und Smite-Schaden gemeinsam anwenden, DR einmal für den gesamten Treffer. Dafür den tatsächlichen, noch unbenutzten nativen Waffenschadenswurf bestätigen. Bereits ausgewürfelte Anteile werden nach Schadensart/Eigenschaften gruppiert und nicht neu gewürfelt. Die native Einzelanwendung des reservierten Waffenschadens am bestätigten Ziel ist gesperrt; manuelle HP-Änderungen und fremde Drittmodul-Abläufe bleiben Verantwortung der Gruppe. Keine Laufzeitprüfung.

### Waffen-Infusion und Illusionary Bukijutsu (WIP, 16.10.2026)

Supreme-Infusion speichert einen bezahlten nativen Genjutsu-Cast in genau einer aktiven Waffenform. Jede Form hat einen eigenen Speicher; Ersetzen wird ausdrücklich bestätigt. Ein bestätigter erfolgreicher Treffer gibt den Cast für genau eine Kreatur frei und verbraucht den Speicher. Fehlschläge verbrauchen ihn nicht. Selbst Flächen-Genjutsu betreffen hierbei nur die getroffene Kreatur; kein vorzeitiges Template. Vorhandene Jutsudauer/Konzentration beginnt beim ursprünglichen Cast. Saves erhalten −1d4; eigene GM-Anfragen übernehmen native Effekte mit verbleibender Laufzeit. Bereits bezahlte zielgebundene Actualization-/Power-/Prestige-Optionen können nicht heimlich auf andere Ziele verschoben werden. Originale Angriffs-/Schadens-/Effektanwendung vor Trefferfreigabe wird abgefangen. Die Entscheidung zur kritischen Behandlung des infundierten Genjutsu-Schadens steht noch aus.

Illusionary Bukijutsu verwendet nach ausdrücklicher Waffenwahl bis C-Rang das Genjutsu-Attribut für Angriff, attributsabhängigen Schaden und berechneten SG. Native Bukijutsu-Kosten und Jutsu-Klassifikation bleiben erhalten. Ein manueller fester SG wird nicht ohne belegte Formel umgerechnet. Neue Casts starten über das ursprüngliche Inventar-Jutsu; alte Chat-Snapshots bleiben Belege ihres ursprünglichen Casts.

Keine Installation und keine Laufzeit-/Spieltests. Grenzen: fehlende/gelöschte Ursprungs-Chatkarten, technische Teilfehler während der nativen Konzentrationserzeugung und Mehrclient-Änderungen verlangen spätere Prüfung bzw. GM-Handhabung. Nicht strukturierte Jutsu-Wirkungen bleiben über ihren tatsächlichen Regeltext zu handhaben. Genjutsu Specialist ist weiterhin unvollständig.


### Genjutsu-Arbeitsfortschritt 16.10.2026

Genjutsu bleibt unvollständig und nicht installiert. Neue gemeinsame Aktionswege und individuelle Grenzen sind in GENJUTSU-SPECIALIST-CHECKLISTE.md aufgelistet.


Remote Trigger/Brain Worm sind als verzögerte Teilabläufe ergänzt; Crest-Die-Reservierung/Rückgabe ist weiter offen. 45 bestätigte allgemeine Genjutsu-Aktionen im Quellstand.


Konzentrationsausnahmen für Words Of Resonance, Temporal Disassociation und Split Focus sowie Critical Moment im Quellstand ergänzt; keine Laufzeitfreigabe.

Critical Confusion im Quellstand ergänzt, noch ohne Foundry-Funktionsnachweis. Signature-Work-Kostenentscheidung weiter offen.


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

## Medical-Nin — Entwicklung, 17.10.2026

Medical-Nin ist in Entwicklung. Vorhandener Code ist ausdrücklich keine vollständige Klassenfreigabe. MEDICAL-ARBEITSSTAND.md und MEDICAL-IMPLEMENTATION-STATUS.json unterscheiden die implementierte Grundlage von fehlenden Sekundärwirkungen, offenen Regeln und noch nicht integrierten Features.


### Medical-Fortsetzung · 17.10.2026

Zusätzlicher Medical-Quellcode: Scalpel/Sabre-Treffer, Biological Knowledge, Poisonous Touch, Elemental Traces, Natures Avatar, Black-Medicine-Passiven, Mending Presence, Healing Ascension und Altered Strength mit Ausbauten. Keine vollständige Klassenfreigabe; offene Sekundärwirkungen und Grenzen stehen in MEDICAL-ARBEITSSTAND.md.

### Taijutsu Specialist — uninstalled work in progress

Native pool/turn recovery, core casting modifiers, guard selections, confirmed hit requests, initial Righteous Fury flows and standard utility techniques exist in source. Devastating targets are confirmed from one recorded hit; Savage Force retains immunity/THP; Tyrants Savagery bonuses persist by source creature. Dodge/Hide/reactions and action economy remain manual. The class and its subclasses are not complete. Individual source statuses are in audit/TAIJUTSU-IMPLEMENTATION-STATUS.json. No runtime verification or release claim.

### Disturbance · unreleased source, 20 October

Paid Shatter/Core native attack groups, confirmed Flurry/Reflexes declarations, Untouchable native attack prompt, Barrage typed next-damage vulnerability and native limits, Endurance cost reduction, and Disturbing attack distribution are implemented in source. Shatter cannot automatically undo already applied or untraceable external special effects; those require explicit GM handling. General action economy, movement and attack allocation remain manual. No runtime verification or installed release yet.


## Quellergänzung 21.10.2026 — Matrix und verbleibende Zielabläufe

Source Code mit Bullet Time, exaktem No-Chakra-Konzentrationscheck und bestätigtem Schutzdurchbruch; ursprüngliche Würfe und getrennte Flurry-Guards-Abzüge bleiben nachvollziehbar. Automatischer Bewegungsmarker nach nativem Taijutsu; unstrukturierten Martial-Technique-Einsatz ausdrücklich bestätigen. The One mit gespeicherter Folge nach einer Minute, Serene-Soul-Folgeverwaltung, Ultra-Save-Zusatzwürfe ohne Neuwürfeln des ursprünglichen Saves, Grapple-Verknüpfungen und Combat-Versatility-Casting-Ticket ergänzt. Iron Fury erhält seine zwei Gegenangriffe nach tatsächlicher Iron-Heart-Anwendung. Hurricane erhält bestätigte Kollisionen, gespeicherten Schaden, native Saves und Prone. Wind-Kartenphysik bleibt nach Absprache manuell.

Oppressive Aura: CON-Wiederholung am Zielzugende bestätigt. Entwurf außerhalb des Moduls; Kosten-/Konzentrationsablauf noch nicht freigegeben. Klassenabschluss, Veröffentlichung und Installation weiterhin offen. Ausschließlich statische Syntax-/Importprüfung; keine Spiel-, Unit-, Foundry-, Browser- oder visuellen Tests. Maßgeblicher aktueller Einzelstatus: audit/TAIJUTSU-IMPLEMENTATION-STATUS.json.
