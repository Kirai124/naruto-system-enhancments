# Taijutsu Specialist · Architektur 0.17.0

Native Actor-/Item-/Casting-/Damage-Pfade bleiben Grundlage. Reine Regeln in src/casting, Foundry-Adapter in src/foundry, Sheet-/Chatbedienung in src/ui und öffentliche Fassade in src/api/taijutsu-api.mjs. Persistente Journale verbinden Cast, Ressourcen, Abwehrwurf und Zielanwendung. Sondercast-Tickets geben native Casting-Locks vor dem Öffnen frei und verbuchen Kosten gemeinsam im nativen Update. Verzögerte Folgen, exakte Effektquellen, Teilbelege und GM-Prüfung verhindern blindes Wiederholen. Nachgelagerte Unlock-Aufgaben werden erst nach der aufrufenden Cast-Finalisierung eingeplant.

Originalsystem, Class Mod Library und Weltdaten bleiben unverändert. Keine Laufzeitprüfung; siehe [Bedienung und Grenzen](TAIJUTSU-GRUPPENFASSUNG.md).

## Historische Entwicklungs- und Release-Notizen

# Medical-Nin · Architekturstand 0.16.0

Regeln/Quellen liegen in src/casting/medical-*.mjs; native Foundry-Anbindung in src/foundry/medical-*.mjs; ergänzende Sheet-/Chataktionen in src/ui/medical-*.mjs. Exakte Source-IDs und Actorbesitz bestimmen Verfügbarkeit. Öffentliche Fassade: src/api/medical-api.mjs.

Native Würfe, Casting- und Ressourcenpfade bleiben Grundlage. Persistent gespeicherte Zahlungs- und Zieljournale sowie die gemeinsame subclass-molding-requests-Infrastruktur verhindern blindes Wiederholen unterbrochener Vorgänge und erlauben GM-Anwendung fremder Ziele. Form-/Companion-Profile referenzieren vorhandene Actors. Eigene Effekte und HP-Anteile behalten Herkunft und Laufzeit; keine originalen System-/Kompendiumsdaten werden umgeschrieben. Gemeinsame temporäre-HP-Buchhaltung verbindet bestehende Medical-, Genjutsu- und Ninjutsu-Anteile.

Aktionsökonomie und unstrukturierte Profilmechaniken bleiben manuell. Native APIs/Wrapper sind auf Foundry 14.364 / n5eb 3.1.1 begrenzt. Syntax-/Importprüfung ersetzt keine Laufzeitprüfung; alle neuen Pfade sind ungetestet. Historische Entwicklungsabschnitte folgen.

# Architekturvereinbarung

## Genjutsu-Erweiterung in Entwicklung

Source-/Eligibility-Katalog, gemeinsame Actualization-Batches, Cast-Snapshots und nachträgliche Save-Belege bleiben getrennt. Disruption nutzt einen eigenen späten Zuschlagsspeicher neben Void; Unterhalt ignoriert diese Zuschläge. Mirage-Preisrechte sind private Actor-/Item-/Feature-gebundene Laufzeittickets. Native temporäre Jutsu-Klone bewahren die Konzentrationsdaten ohne Inventarkopie. Duplicity/Stopwatch haben eigene Zustands- und Fehlerjournale. Waffenformen sind persistente Actor-Zustände mit nativen temporären Waffenprofilen; Originalwaffen und Munition bleiben unverändert. Phantasmal Force verwendet getrennte temporäre Feature-Angriffe. Smite verwendet den vorhandenen GM-Anfragemanager mit eigenem Speicher. Moment-Folgecasts erhalten private Berechtigungstickets und gemeinsame Actualization-Batches; eigene AC-/DEX-Vorteile teilen eine neutrale verwaltete Konzentration. Keine atomare serverseitige Mehrdokument-Transaktion behauptet.

## Klassenabschluss 0.14.0

Quellenkatalog und Eligibility liegen in casting/ninjutsu-feature-sources, ninjutsu-selections und ninjutsu-class-options. Castingregeln arbeiten auf nativen Item-Klonen; persistente Auswahlen und Journale gehören dem jeweiligen Actor/Feature oder der Castkarte. Originalsystem und Original-Jutsu werden nicht verändert.

Neue Foundry-Adapter trennen Klassen-Casting, Würfe/Saves, Zielanfragen, neutrale Effekte, THP-Anteile, Imbuement, Scroll, Folgecasts und Beschwörungsressourcen. Die bestehenden GM-Anfragen können über einen separaten Speicher/Context wiederverwendet werden. Technische Teilfehler enden in review; GM-Auflösung wiederholt keine Wirkungen. Folgepreis-Tickets bleiben private Laufzeitobjekte und sind keine öffentlich beschreibbaren Gratiscast-Flags.

Deadly Tradition umschließt die native synchrone Schadensberechnung: ursprüngliche Beträge werden vor Target-Verarbeitung erfasst, der Mindestbetrag wird nach sämtlichen nativen/verwalteten Reduktionen ergänzt. Native active.all.immunity / active.type.immunity entscheiden über Immunität einschließlich nativer Bypass-/Downgrade-Regeln. Chakra und HP werden getrennt bilanziert.

Eigene Effekte persistieren neutrale Werte; reale Boni werden nur bei aktivem Setting vorbereitet. Gem-/Tenacity-THP und Professor-Chakra besitzen getrennte Anteile. Aufrechterhaltung, Ziele, Auslöser und freie Featureauswahl werden nicht aus unstrukturiertem Beschreibungstext geraten. Die neuen Adapter sind noch nicht unter Foundry ausgeführt worden.

## Unterklassen-Erweiterung

Quellenkatalog und reine Regeln liegen in casting/subclass-moldings, subclass-molding-effects, subclass-molding-damage, imbuement-master und molding-lifetimes. Foundry-Adapter bleiben getrennt von Dialog, Chatkarten und Tracker.

Casting verändert nur native Item-Klone und ergänzt native Ressourcenbatches. Final Lesson/Magnum prüfen beide Preise vor dem ersten Cast; kurzlebige, Actor-/Item-gebundene interne Tickets autorisieren Folgepreise. Solar speichert zulässige Ziele und seinen einmal gewürfelten Rabatt. Dokumentflags allein verleihen keinen Folgepreis.

Zielanfragen führen ein persistentes pending/applying/applied/review-Journal. Ergebnisse nativer Saves werden vor der letzten Anwendungsbestätigung gespeichert. Nach Teilfehlern gibt es keine automatische Wiederholung. HP-Schadensbelege werden nach Verteidigungen vor temporären HP erfasst. Gigawatt und Infusion ergänzen die native Schadensliste vor Verteidigungen; Infusion besitzt eine persistente einmalige Zuweisung je Cast. Imbuement bündelt tatsächliche native Angriffsschadenswürfe.

Eigene temporäre Active Effects speichern neutrale Änderungswerte und leere Statuslisten. Erst die aktive Modulvorbereitung stellt reale Werte/Conditions bereit; fremde Effekte werden nicht bereinigt. Actor-Neuberechnung nutzt Foundrys öffentliches reset(), damit bereits von anderen Modulen ergänzte vorbereitete Arrays nicht erneut als Quelldaten interpretiert werden.


Aktueller Stand 0.11.0: siehe den entsprechenden Erweiterungsabschnitt. Ältere Versionsabschnitte dokumentieren ihre damalige Basis; neue Felder/Verhalten sind unter 0.11.0 beschrieben.

## Ninjutsu-Ressourcen 0.10.0

src/casting/ninjutsu-resources.mjs enthält besitzgeprüfte Eligibility, Klassenstufen, Nutzungsmaxima, Ganzzahl-Halbierung und reine Ergänzung nativer Verbrauchsbatches. src/foundry/ninjutsu-resources.mjs erweitert die finale Feat-Vorbereitung. Eine WeakMap ordnet eigene vorbereitete Werte ihrer konkreten Feldinstanz und unveränderten Quelle zu, damit wiederholte native Vorbereitung und Setting-Abschalten keine Maxima akkumulieren oder behalten. Persistierte Quelldaten und spent werden nicht verändert. Custom-Formeln und erkennbare Overrides werden nicht überschrieben.

Der bestehende mode-adapter verwaltet den actorlokalen Cast-Kontext und ergänzt ausschließlich erfolgreiche native Verbrauchsbatches. cost-adapter und Castingdialog lesen die bestätigte Auswahl; das API liefert zusätzlich unrecoveredCost und chakraRecovery. maintain-adapter und own castingMode.upkeepChakraCost bewahren den normalen Unterhalt. Das native concentration.chakraCost bleibt der wirklich bezahlte Castingbetrag. Die Konzentration erhält einen normalen, persistenten Unterhaltsbasiswert, der bei späterer Zahlung weiterhin die vorhandenen passiven Unterhaltsregeln verwendet.

Native Resource-Commits bleiben zuständig; der Adapter schreibt nicht beim Vorschau-/Dialogaufbau. Dies ist keine atomare Mehrdokument-/Mehrclient-Transaktion. Aktionsökonomie wird nicht erweitert.


## Mark-Workflows 0.9.0

`src/trackers/mark-plan.mjs` berechnet reine, durch Featuretexte belegte Basispläne. Manager-Warteschlange umfasst Zähler, Request, Cancel und Apply. Requests liegen zusammen mit Gruppen im Ledger und speichern Eintrags-Snapshots, Quelle, Zieltoken/-Actor, Wirkungsplan, Nutzer, Zugkennung, Würfelergebnis, native Schadensmenge und Bearbeitungsstatus.

State machine: Pending → Applying → Applied; Pending → Cancelled; unterbrochene/fehlgeschlagene Anwendung → Review bzw. persistentes Applying; nach manueller GM-Prüfung → Resolved. Applying wird vor Zielmutation gespeichert. Abgeschlossene und unklare Zustände sind nicht wieder ausführbar. Die native dnd5e.applyDamage-Bestätigung unterscheidet erfolgreichen Nullschaden von abgebrochener Schadensanwendung. Eine GM-Korrektur löst keine Wirkung erneut aus.

Zwei Dokumente lassen sich nicht atomar ändern; deshalb keine automatische Wiederholung/Rückabwicklung bei unklarem Erfolg. Nur aktiver GM darf anwenden; Warteschlange verhindert Doppelanwendung innerhalb desselben Clients. Keine verifizierte globale Sperre gegen alle Mehrclient-Zähleränderungen. Tenseigan-Vorbild nur gelesen; eigene DOM/CSS-Klassen und keine Abhängigkeit.


## Ninjutsu-Tracker 0.8.0

Rule-neutraler Ledger (src/trackers/ledger.mjs), sechs besitzgeprüfte Definitionen, Quellen-Actor-Manager und eigenes Sheet-UI. Flags ninjutsuTracker speichern persönliche Pools bzw. Gruppen mit Actor-/Token-UUID, Herkunftsitem, Eintrags-ID, Erzeugungs-/Ablaufzeit. Externe Actor-Dokumente bleiben beim Zählen unverändert. Nutzerbestätigte Gruppenverlängerung erneuert aktive Einträge auch am Maximum, ohne abgelaufene Einträge wiederzubeleben. Queries filtern nach Weltzeit; keine globale Zeitänderung.

Original-Featurezähler bleiben als Daten erhalten, werden nur bei aktivierter Einstellung in den verwalteten Sheetzeilen ausgeblendet. Native Aktivitäten dieser sechs exakten Quellen werden über preUseActivity vor Verbrauch zum Tracker umgeleitet. Setting-off stellt ursprüngliche Bedienung wieder her. Zusatzwarnungen für wiederholtes Erzeugen nutzen persistente Kampf-/Runden-/Zugkennung, nur bei Quellen-Actor im aktiven Kampf. Keine Actions/Bonus Actions und keine automatische Schaden-/Condition-Abbuchung in dieser ersten Stufe.

Lokale Actor-Warteschlange verhindert parallele verlorene Writes im selben Client. Kein verteilter Lock; mehrere Clients bleiben ungeprüft. Fremde/ungültige Schemaversion wird nicht überschrieben. Die Speicherung orientiert sich am lesend geprüften Rasengan-Tracker (eigene Actorflags, UUID-Referenzen), ohne dessen Code oder Daten zu ändern und ohne Pflichtabhängigkeit.

Vom Nutzer am 11.10.2026 als Grundlage akzeptiert. Domainkern, Registry und Vorschau-API bestehen seit 0.1.0. Version 0.2.0 ergänzt passive native Kosten und den Castingdialog. Eigene vollständige Transaktion, Effekte und Dojutsu bleiben Entwurf.

1. **Domain:** Foundry-unabhängige Auswertung von normalisierten Kontexten, Filtern, Rängen und Modifiern. Reine Berechnung ohne Dokumentänderungen; Ergebnis mit Kostenaufschlüsselung und Gründen für nicht angewendete Modifier.
2. **Registry:** Eindeutige IDs und Quellen; deklarative Bedingungen, Priorität und explizite Stapelgruppen. Doppelte Registrierung zurückweisen. Registrierung und Deregistrierung unterstützen. Kein Feature anhand einer bloßen Namensähnlichkeit gewähren.
3. **Foundry-Adapter:** Liest tatsächliche Actor-/Item-Daten und originale Chakra-Berechnung. Enger versionsgeschützter Wrapper auf SpellData.getChakraCost; kein nativer Kosten-Hook vorhanden. WeakMap hält Originalmethode und verhindert doppelte Installation. Vorschau ruft das Original auf, wodurch der Rabatt nicht zweimal wirkt. Ready installiert den Wrapper; eine deaktivierte Einstellung liefert native Kosten. Nach vollständigem Modul-Disable und Reload entfällt die Laufzeitänderung. Ressourcenwrites verbleiben beim System. Ein preUseActivity-Hook erweitert die vorhandene Dialogklasse je Cast.
4. **Casting-Kontext:** Temporäre Auswahl von Modi/Optionen je Vorgang; Original-Jutsu unverändert. Vorschau und Commit verwenden gleiche Berechnung. Nutzungslimits unmittelbar vor Commit prüfen.
5. **Ressourcenkoordination:** Vorgangs-IDs, Zustandsvalidierung, Fehlerprotokoll und sichere Wiederholung. Mehrere Clients benötigen eine Autorität; dies ist vor Laufzeitimplementierung zu untersuchen. Keine Behauptung atomarer Foundry-Transaktionen.
6. **Effektmanagement:** Nur eigene Effekte mit Modul-Namespace, Quell-ID, Instanz-ID und ggf. Vorgangs-ID verwalten. Fremde und gemeinsam verwendete Effekte erhalten. Reconciliation nach Reload ohne erneute Bezahlung.
7. **Dojutsu:** Map unabhängiger Instanzen statt globalem activeDojutsu. Instanz hält Quellitem, Stadium, Aktivzustand, optionale Augenzuordnung, Effekt-IDs, Nutzungen und ggf. bezahltes Zeitfenster. Augenbelegung ist Metadatum und keine erfundene Exklusivitätsregel.
8. **UI:** Bestehenden Castingdialog kontextuell ergänzen. Sheetintegration später nach tatsächlicher Sichtprüfung; keine umfassende Neugestaltung beschlossen.
9. **Public API:** Stabile, versionierte Fassade für Modifier, Modi, Definitionen, Kostenabfragen und Aktivierungsrequests. Keine Karma-/Divine-Arts-Regeln implementieren; nur generischen Erweiterungspunkt vorsehen.

Vorgesehene Trennung: `src/domain/`, `src/casting/`, `src/effects/`, `src/dojutsu/`, `src/foundry/`, `src/ui/`, `src/api/`, `src/settings/`, `tests/`.

Amplified Flames ist eine deklarative Regelregistrierung auf dem universellen Kern. Eligibility benötigt Featurebesitz, bestätigte Uchiha-Zugehörigkeit und passende Keywords. Der Adapter verwendet elf geprüfte Standard-Clan-Kompendium-UUIDs mit Uchiha-Importherkunft; die Belege stehen in UCHIHA-PROVENANCE.json. Unklare Zuordnung führt zu einem Diagnosecode ohne Reduktion. Die SG-Wirkung von Amplified Flames ist nicht implementiert; separate Unterhaltsregeln bestehen seit 0.3.0.

Der Kern unterstützt aktuell deklarative Filter, additive/multiplikative Änderungen, Auswahl optionaler Modifier und Vorschau von Nutzungslimits. Callbacks, sekundäre Effekte und Castingmodi werden nicht stillschweigend akzeptiert. Priorität aufsteigend, dann ID; exklusive Gruppen verwenden den ersten berechtigten Eintrag. Rundung und Mindestgrenze erfolgen einmal am Ende. Diese API-Semantik ist keine Festlegung unbestätigter Naruto-Regeln; jede Registrierung muss die korrekte Reihenfolge abbilden.


## Ergänzung 0.3.0

Separate deklarative Unterhaltsregistry und strongest-only-Auswertung. Mindestgrenzen können absolut oder als Verhältnis zur nativen Basis angegeben werden. Diese Registry erlaubt nur Reduktionen. Die native getMaintainCost-Methode liefert die Vorschau; vor Erstellung nativer Konzentrationseffekte wird deren unmodifizierte Unterhaltsbasis gespeichert. Beim Lesen des Konzentrationsflags entsteht eine Kopie mit aktuell effektivem Unterhalt. Native Zahlungs- und Konzentrationsfunktionen übernehmen Ressourcenwrites, Temp-Chakra-Reihenfolge und paidTurn. Keine eigenen parallelen Abbuchungen und keine zusätzlichen Effekte.

Kosten eines aktiven Konzentrationseffekts beruhen auf dessen gespeicherten Castingkosten/Rang; ein späterer Featwechsel berechnet Unterhaltsmodifier erneut, aber nicht den bereits bezahlten Cast. Setting aus liefert die gespeicherte Basis. Die Korrektur bereits unbekannt modifizierter Alt-Effekte wird nicht erfunden. Fremde Integrationen, die Konzentrationsflags ersetzen oder selbst reduzieren, benötigen explizite Kompatibilitätsprüfung.

feature-rules enthält geprüfte Standardquellen und ihre zulässigen Auswahlwerte. feature-choice verwaltet Dialog, serialized Erwerbsqueue, Nachvalidierung und Headerkontrolle. Player dürfen gültige Auswahl nicht frei ändern; GM darf korrigieren. Fehlende Auswahl erzeugt Diagnose und keinen Rabatt. Auswahl und Kosten bleiben getrennt; kein Jutsu wird dauerhaft umgeschrieben.

## Ergänzung 0.4.0

Aburame-Zuordnung durch zweite geprüfte Provenienzliste. Split Focus verwendet eine verifizierte Klasse und deren system.levels, keine Gesamtstufe. Genjutsu-Adept-Kontext liest rohe Itemreferenzen aktiver Konzentrationseffekte, um eine Rekursion durch den dynamischen Konzentrationsgetter zu verhindern; jede unbekannte Referenz schließt die Bedingung aus.

casting-modes enthält Eligibility, Martial-Die-Größe und reine stärkste-Kosten-Auswertung. mode-adapter erweitert die native _prepareUsageUpdates-Kette: erst ursprüngliche Validierung, dann Martial-Pool-/Modusprüfung, Wurf und zusätzliche native Itemupdates. Original-Jutsu bleibt unverändert. Die native Verbrauchskette wendet Chakra- und Itemupdates an; sie ist weiterhin nicht atomar. Falls spätere Writes scheitern, gibt es keinen garantierten Rollback. Kein Ressourcenverbrauch beim Dialogöffnen oder -abbruch.

Ein lokaler Actor-Kontext hält den konkreten Modus bis zur Erstellung des Konzentrationseffekts; finally räumt ihn auf. Während eines offenen lokalen Casts wird eine zweite Aktivierung desselben Actors abgelehnt. Dies ist kein Mehrclient-Lock. preCreateActiveEffect setzt nur den exakt zugehörigen Effekt auf native Basis plus Modusflag. Technical-Wurf bleibt für späteren Unterhalt erhalten; Force-Unterhalt wird nur für die bestätigte Frenzy-Castinginstanz befreit. Wo die konfigurierte native Bonus-Aktion einen Verbrauchspfad anbietet, kann der Modus diesen statt der gewöhnlichen Castingaktion verwenden; diese Variante ist im echten Kampf noch nicht geprüft.

Der Long/Full-Rest-Hook bietet verfügbare regelkonforme Neuauswahl an. Eine normale Itemkopfkontrolle erlaubt Spielern weiterhin keine freie Neuwahl. Originalsystem und Class Mod Library bleiben unverändert.

## Ergänzung 0.5.0

martial-recovery ergänzt ausschließlich den nativen Updatebatch beim eigenen turnStart; keine zusätzlichen Dokumentwrites im Hook, keine System-/Kompendiummigration. Bekannte Quellen, Klassenlevel und gültige vorbereitete Uses werden geprüft. Bestehende native Profile/Updates werden respektiert. Eine Itemflag-Zugkennung ist gemeinsam mit dem Uses-Reset im nativen Itembatch gespeichert; mehrere Clients und rückwärts wiederholte Kampfabläufe sind keine geprüfte verteilte Transaktion.

martial-technique ist eine getrennte Basiskostenstrategie; der allgemeine Kern unterstützt excludeCostReductions und lässt Erhöhungen weiter zu. Basisrangkostentabelle plus Differenz der unveränderten nativen Rangkosten; Sonderkosten werden konservativ ausgeschlossen. API-Preview erlaubt martialTechnique:false. Der Castingadapter liest die laufende, nur im Speicher gehaltene Usage-Konfiguration des eigenen Items; Dialog und native Verbrauchsprüfung nutzen denselben Opt-out. Kontext wird im finally des Casts entfernt. Native Unterhaltsbasis und Wurfzustand bleiben am Konzentrationseffekt gespeichert.

Ab 0.5.0 entfällt die frühere Frenzy-Bonusaktionslogik vollständig auf Nutzerwunsch. Der Adapter übergibt die native Verbrauchskonfiguration unverändert.

## Ergänzung 0.6.0

Die unveränderliche Registry ergänzt rankReduction und exclusiveRankReduction. Der Kostenkern prüft zunächst die tatsächliche Eligibility; nur ein passender exklusiver Rangrabatt schaltet die Auswahl des stärksten einzelnen Rangrabatts ein. Auswahlminimum und Basiskosten werden berücksichtigt; Gleichstand verwendet Registry-Reihenfolge. Pauschale Rabatte bleiben in der normalen Prioritätskette. Bestehende exklusive Quellgruppen verhindern Duplikate.

Medical verwendet die vorhandene Erwerbsauswahl mit selection:damage. damage-types liest feste Typen aus damage.parts[].types und schneidet die Typmengen der schädigenden Aktivitäten. Der Kontext erzeugt n5ese.damage.TYPE-Featuretokens. Jutsutext, Itemname und Kompendiumexistenz gewähren keinen Rabatt. Originaldaten bleiben unverändert.

## Dojutsu 0.7.0

Separate Definitionen (src/dojutsu/registry.mjs), Instanzverwaltung (manager.mjs), eigene Effekte (src/effects/dojutsu-effects.mjs), Foundry-Hooks und CharacterActorSheet-Erweiterung (src/ui/dojutsu-controls.mjs). Instanz-ID ist die eingebettete Item-ID; Actorflags dojutsu.instances speichern Definition, Aktivität, Auge, bezahltes Zeitfenster und Transaktions-ID. Kein globales activeDojutsu.

Native getChakraSpendUpdates liefert die temporäres-Chakra-zuerst-Abbuchung. Ressourcen und eine einzelne Instanz werden in einem Actorupdate gespeichert. Eigene Effektmarker prüfen Actor, Quelle, Origin und Transaktion. Foundry 14 ActiveEffect.applyChange wird eng erweitert; persistent gespeicherte Änderungen sind add 0. Deshalb gewähren verbliebene Marker bei vollständig deaktiviertem Modul keinen Bonus. Reconciliation stellt fehlende eigene Effekte ohne Abbuchung wieder her und bereinigt abgelaufene oder verwaiste eigene Marker.

Lokale Actor-Warteschlangen verhindern parallele Doppelklicks im selben Client. Keine verifizierte Sperre zwischen unabhängigen Clients. Bei Effektfehlern wird Ressourcenkompensation nur ausgeführt, wenn Transaktions-ID und erwarteter Ressourcenstand noch stimmen; andernfalls bleibt der bezahlte Zustand für Wiederherstellung bestehen. Dies ist kein vollständig atomarer Mehrdokument-/Mehrclient-Commit. Aktiver GM übernimmt Hintergrundabgleich, ohne zusätzliche GM-Proxy-Berechtigungen für Benutzeraktionen.

## Tomoe und UI 0.7.1

src/dojutsu/tomoe.mjs berechnet freigegebene/effective/levelverfügbare Stufe. Flags dojutsu.unlocks.<instanceId>.maxTomoe werden ausschließlich über die GM-geprüfte API gesetzt. Aktivierungszustand und bezahltes Zeitfenster bleiben unabhängig; Stufenänderung verbraucht kein Chakra. Es gibt keine Item-Neuschreibung und keine destructive Migration alter Augenflags. API assignDojutsuEye bleibt ausschließlich zur Rückwärtskompatibilität erhalten; der Tracker verwendet sie nicht mehr.

Passive Wahrnehmung nutzt einen neutral gespeicherten add-0-Änderungseintrag auf system.skills.prc.passive in Foundrys final-Phase. Runtime ersetzt nur beim ersten nach ID sortierten berechtigten eigenen aktiven Sharingan die 0 durch 5. Initiale Formelboni werden nicht verändert: natives Retesting belegte sonst Akkumulation bei prepareData. Bereits vorhandene eigene Marker werden beim Abgleich um den neutralen final-Eintrag ergänzt. Originalsystem und Class Mod Library unverändert.

## Casting-Erweiterungen 0.11.0

Die reinen Regeln liegen in casting/refined-ninjutsu.mjs, casting/ninjutsu-pools.mjs und trackers/pool-targets.mjs. Foundry-Adapter ergänzen native Castingklone, Verbrauchsplanung und den vorhandenen Dialog. Original-Jutsu werden nicht für einen einzelnen Bonus umgeschrieben. Nach updateSource werden finale native Aktivitätsdaten vorbereitet; andernfalls fehlen abgeleitete SG- und Duration-Methoden. Der eigene castingSnapshot am Chat enthält Auswahl und Quelle. Chat-Damage-Würfe übernehmen den Snapshot; DamageConfig ergänzt jede Konfiguration höchstens einmal.

Native Chakra-Validierung/-Abbuchung bleibt maßgeblich. Poolentnahme, Professor-Anteil, Void-Zuschlagsverbrauch und Zielanfrage werden im selben vorbereiteten Actor-Batch gespeichert. Das ist keine serverseitige Transaktion über mehrere Actors. Zielmutationen werden erst durch den aktiven GM durchgeführt: vorher applying speichern, Ziele erneut auf Token-/Actor-Identität und Ownership prüfen, nach jedem Ziel einen Beleg speichern. Teilfehler bleiben review, keine automatische Wiederholung.

Professor-Zuteilung wird am Ende des activityConsumption-Hooks nach Zusatzkosten nachgeführt. Gespeicherte Void-Zuschläge werden im nativen Shocked-Ablauf aus der Multiplikationsbasis genommen und danach wieder dem angezeigten Betrag zugerechnet; ihr Ressourcenverbrauch gehört bereits zum nativen Batch. Unterhaltsbasis bleibt getrennt.

Lokale gleichzeitige Castingvorgänge desselben Actors sind gesperrt. Mehrclient-Rennen oder extern gleichzeitig veränderte Tracker sind nicht durch eine Server-CAS abgesichert; native Mehrclient-Tests stehen aus. Bei deaktivierter Automation bleiben Flags erhalten und werden nicht automatisch gelöscht. Fremde Ressourcenadapter müssen dieselben nativen Updates/Hooks respektieren.


## Efficient Molding 0.12.0 — 2026-10-13

Alle 17 normalen Moldings sind an den vorhandenen Castingdialog, native Würfe und Chatkarten angeschlossen. Gemeinsamer Pool mit nativer Rast, frei zuordenbare kostenlose Nutzungen, separate Chakra-Zusätze, kompakter Sheet-Zähler und GM-Korrektur. Unterklassen-Moldings folgen separat. Aktionsökonomie bleibt manuell.

Reine Regeln/Eligibility/Bezahlung: casting/efficient-molding.mjs; Clone-Transformationen: molding-transforms.mjs; ursprüngliche Würfel: molding-damage.mjs. Foundry-Adapter: efficient-molding, molding-defenses, molding-attacks, molding-actions, molding-saves, molding-echo. Dialog, Zähler und Chatbedienung liegen separat unter ui. Casting ergänzt native Actor-/Item-Batches; spätere Aktionen führen ein persistentes applying/applied/review-Journal. Teilfehler werden durch GM geprüft, nie automatisch erneut bezahlt. Echo hat einen eigenen einmaligen Zustand. Native Erstattung beendet eigene Castingboni. Clientlokale Sperren ersetzen keine serverseitige Mehrclient-Transaktion.

Die installierte Efficient-Molding-Formel @scale.nin-spec.efficient-moldings verweist auf eine fehlende Klassenkennung. Ein nur für dieses verifizierte Feature bereitgestellter transienter Roll-Data-Alias löst den Wert aus der echten Klassenstufe auf; vorbereiteter Fallback, Disable-Rücksetzung und eigene AE-Overrides bleiben geschützt. Quelldaten werden nicht verändert.

Alternative Molding-Kosten bleiben auch unter Shocked separat. Der native Consumption-Hook verdoppelt nur den Jutsu-Anteil; die bezahlten separaten Zusätze werden danach in den angezeigten Betrag zurückgesetzt. Reactive ergänzt ausschließlich die durch die geänderte Wirkzeit sonst verpasste native Shocked-Reaktionsprüfung. Native Dauer wird in Minuten gespeichert, damit die originale DurationField-Umrechnung auf Effekte erhalten bleibt.

Eigene Chataktionen hängen am belegten dnd5e.renderChatMessage-Hook nach dem nativen Inhaltstausch. Beim ready-Ereignis werden nur bereits montierte eigene Karten aktualisiert, nicht die komplette Historie nachgeladen. Der native synchrone _finalizeMessageConfig-Vertrag bleibt synchron. Infusion verwendet dieselbe Konversions-/Würfelsteigerungsfunktion wie der Jutsu-Grundschaden, jedoch ohne einen zweiten angriffsgebundenen Schadensbonus.

Infusion/Bukijutsu: `genjutsu-weapon-casting` validiert Waffen-/Castingauswahl und schreibt den Infusionszustand im nativen Ressourcenbatch. `genjutsu-infusion-targets` verwendet den bestehenden GM-Anfragemanager mit eigenem Speicher; native Saves binden −1d4 an den gespeicherten Treffer. Cast-Snapshots und Quellkarten tragen `genjutsuWeaponCasting`. Keine zusätzliche Original-Jutsu-/Actor-Erzeugung.


### Genjutsu-Arbeitsfortschritt 16.10.2026

Genjutsu-Teilstand: datenbasierte Aktionen und eigene Condition-Beiträge verwenden neutrale eigene Effekte; persistente Quellenzahlungen, GM-Zielanfragen und separate Zugereignisse verhindern automatische Wiederholung nach Teilfehlern. Gleiche Fähigkeiten liefern grundsätzlich den stärksten Beitrag.


Verzögerte Genjutsu verwenden einen eigenen Zustandsautomaten: Zahlung → Speicherungssave → gespeichert → Auslöseanfrage → GM-Freigabe. Dauer/Konzentration starten erst bei Freigabe; Ressourcen-Teilfehler sperren den Vorgang. Dynamischer Brain-Worm-Unterhalt liest den gespeicherten Jutsu-Snapshot statt unmarkierter Inventardaten.


Konzentrationsausnahmen besitzen eigene source-gebundene Effektmarker. Nur der gewählte ausgenommene Cast überspringt die native Limitvalidierung; der reguläre Konzentrationsbeginn bleibt erhalten. Die effektive Kapazität wird anschließend abgeleitet um aktive Ausnahmen ergänzt.


Unreleased: `genjutsu-programs.mjs` trennt Programmzustand, native Folgecast-Tickets und UI. Zahlungen/Minutensperre werden im nativen Ressourcenbatch markiert; technische Unterbrechungen blockieren Wiederholung bis GM-Abschluss. Cast-Verstärkungen liegen separat in `genjutsu-cast-augmentations.mjs`. Mehrclient-Synchronisierung nicht laufzeitgeprüft.


17.10. WIP: `genjutsu-fear.mjs` verwendet den vorhandenen persistenten GM-Anfragemanager für native Condition-Transformationen. `managedGenjutsuConditionData` akzeptiert interne Condition-Transformation und lokale Immunitätsausnahmen. `genjutsu-skill-packages.mjs` kapselt belegte native Skill-Paketfehler und Lernentscheidungen; keine Originaldateien oder Actor-Basiswerte werden migriert.

Genjutsu-Fortsetzung: genjutsu-psionic.mjs kapselt die begrenzte Distant-Soul-Zulassung, ohne Ninjutsu global als Genjutsu zu behandeln. genjutsu-retarget.mjs, genjutsu-night-terror.mjs und genjutsu-umbral.mjs verwenden persistente Phasen und dieselbe GM-Zielanfrage-Infrastruktur. Keine automatische Wiederholung nach potenziell teilweiser Zielmutation. genjutsu-rituals.mjs verwaltet die bestätigte Chronicle-Rastauswahl. Laufzeitintegration noch ungeprüft.


Genjutsu-Fortsetzung: getrennte Module für Fear-Schadenspakete, Crest-Escrow, Kontextchecks, True-Strike-Korrekturen, Echo-Abbruch, Darkness-Wellen, Blade-Kopien, Utility-Perfection und bestätigte Casting-Ursprünge. Änderungen betreffen virtuelle Itemkopien und eigene Journale. Phantom-Pain-Angriffe haben absichtlich keinen nativen Sofortschadensanteil. Besondere Konzentrationskosten verzögerter Casts werden erst bei Freigabe geplant/bezahlt. Syntax-/Importprüfung ersetzt keine Laufzeitprüfung.


0.15.0 Gruppenfassung (17.10.2026): zusätzlicher quelleneigener Beobachterkreis für Sensory-Markierungen über Token-Detection und bestätigte Wurfkontexte; parallele Song-Konzentrationsgruppe; Lucid-Effektauswahl/-Unterdrückung; Brawler-Virtualisierung; Mirage-Sonderdaten und Bedienelemente. Keine öffentlichen Schreib-APIs für diese internen Flags. Noch nicht spiel-/integrationsgeprüft. Grenzen nativer manueller Jutsu-Abläufe ausdrücklich in GENJUTSU-GRUPPENFASSUNG.md.

0.15.0 Abschlussstand: 202 ESM-Dateien syntaktisch geprüft, lokale statische ESM-Verknüpfung ohne Auswertung und drei Konfigurations-JSON-Dateien erfolgreich; keine Laufzeit-/Unit-/Spieltests. Ergänzt: besitzgeprüfter No-Light-Fracture-Zielmarker, tatsächliche Save-Trigger, gesenkte Wirkungsschwellen und persistente Monats-Erholung; Maddening-Pain-Angriffsfolge ohne doppelte Phantom-Pain-Anwendung. Jutsuspezifische narrative Regeln werden nicht erfunden.

## Medical-Nin — Entwicklung, 17.10.2026

Medical-Entwicklung trennt Quellen/Klassenkontext, Regeln, native Integration, bestätigte Heilungs-/klinische Anfragen, Folgeereignisse und UI. Sie verwendet die bestehende ModifierRegistry, Actor-Sperre, persistente Zielanfragen und verwaltete Conditions/Effekte. Herkunft und Laufzeiten liegen unter dem Modul-Namensraum; keine Systemdatei wird verändert. Die Medical-Integration ist noch unvollständig und nicht veröffentlicht.


### Medical-Fortsetzung · 17.10.2026

Medical-Zielschritte verwenden persistente Anfragen und Native-Completion-Receipts. temporary-hp-accounting verteilt einen HP-Verlust genau einmal über benannte Quellen. medical-traces bündelt Naturvorteile; medical-alteration prüft Instanz-/Empfängergrenzen und hält Ressourcen-/Effektanwendung getrennt.

### Taijutsu work in progress

The native Martial Adept item remains the single pool. Casting options merge spending into the native usage transaction. Taijutsu hit payments and target requests are separate persistent journals; interrupted mutation requires GM review rather than retry. Damage receipts record calculated typed parts and completion. Furious defense selection uses a transient prepared Actor clone with selected effects disabled; stored target effects remain unchanged. Savage Force journals its one incoming melee application before changing HP. Utility attack groups reserve each native attack before rolling; cancellation returns the unrolled attack, technical interruption requires review. This source milestone is not installed or released; runtime and UI verification are deferred by user request.
# Unreleased Taijutsu continuation

Passionate Flame separates casting choices, paid action groups, original-hit requests, and temporary effects. Dynamic Set-Up grants a private one-use partner ticket only to the selected actor/item/activity. It preserves a completed first cast if the second fails and records GM review instead of replaying it. The pair is not an atomic transaction. General action economy remains manual; the explicit subsequent action/bonus-action restriction is checked separately.

Matrix uses one confirmed shared allowance for free Will/Persistence applications and separate paid timed flight/Neo states. Native resource counters remain authoritative where present. Timed markers require matching active source state. Unspecified halves in remaining Taijutsu additions round up by user decision; previously confirmed exceptions remain unchanged.

Target requests may opt into `journalPreparation`. These persist the preparing phase and every random result before proceeding to another dialog. Later cancellation reuses saved results; interrupted random steps require GM review. Existing workflows that do not opt in retain their previous preparation behavior. No runtime verification or module release is implied by these source changes.


Unveröffentlicht: taijutsu-feature-actions verwaltet konkrete besitzgeprüfte Aktionsdefinitionen und Zahlungsjournale; taijutsu-action-targets führt bestätigte Zieländerungen über die vorhandenen GM-Anfragen aus. Stancer-Lernwahl und Stance-Registry sind vom manuellen Basis-Stance-Regeltext getrennt. Ruin-Hit-Erweiterungen verwenden den gemeinsamen ursprünglichen Treffer und den bestehenden Schadensbeleg; Focus Break unterdrückt nur während dieses Schadens die native zusätzliche Konzentrationsaufforderung. Keine Änderungen am Originalsystem.

## Taijutsu-Fortsetzung · 21.10.2026

Unveröffentlichter Quellstand. Elemental Armor hängt seinen bestätigten Unterhalt an denselben nativen Combat-Recovery-Updatebatch nach der Martial-Pool-Erneuerung. Außerhalb des Kampfes führt die vorhandene bestätigte Zugerneuerung diese Schritte gemeinsam aus; Unterbrechungen verlangen GM-Prüfung ohne Wiederholung. Catalyst-Kurzschluss wartet bei einer laufenden Actor-Transaktion auf deren Freigabe. Der interne Hook `n5ese.castingActorUnlocked` signalisiert ausschließlich die freigegebene lokale Sperre und gewährt keine Ressourcen. Keine Spiel- oder Integrationstests.


Taijutsu-Ergänzung: Zielanwendungen können persistente Teilbelege speichern, bevor ein weiterer Empfänger verändert wird. Verzögerte Folgen nutzen ein eigenes Pending/Applying/Review-Journal. Native D20-Terme bleiben beim nachträglichen Ultra-Save-Bonus ausgewertet erhalten. Source Code darf ausschließlich mit ausdrücklich bezahltem Deconstruction-Override einen verwalteten Konzentrationsschutz übergehen.
