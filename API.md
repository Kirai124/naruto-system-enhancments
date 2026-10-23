# Klassenfenster · 0.17.1

Die öffentliche API bleibt kompatibel. Martial `getFeatureActions` liefert nun nur Aktionen mit tatsächlich passenden Natur-/Formbedingungen; eine direkte Ausführung einer unpassenden Aktion wird ebenfalls zurückgewiesen. Fenster- und Panel-Registry sind interne UI-Bausteine ohne öffentliche Stabilitätszusage. Keine neue Abhängigkeit zur Class Mod Library.

## Frühere Entwicklungsnotizen

# Medical-Fenster · unveröffentlicht

Die öffentliche Klassen-API bleibt unverändert. Fenster-Registry, DOM-Builder und Waffen-Chatadapter sind interne Erweiterungspunkte ohne Stabilitätszusage. Öffnen verbraucht keine Ressourcen; Aktionen verwenden weiterhin dieselben Besitz-/GM-/Transaktionsprüfungen. [Prüfstand](MEDICAL-QA.md).

# Taijutsu API · 0.17.0

Zugriff: game.modules.get('naruto5e-system-enhancements').api.taijutsu. Fassade version1, status source-complete-unverified. Verändernde Methoden prüfen Featurebesitz, Klassenstufe, Automation und Actorrechte. Dieselben bestätigten Dialoge/Journale wie in der Oberfläche; kein Umgehen von GM-Rechten.

| Methode | Zweck |
| --- | --- |
| getFeatures / getProgression | Tatsächliche Quellfeatures, Stufe und nativer Martial-Pool |
| getFeatureActions / performFeatureAction / endFeatureAction | Verfügbare Klassenaktionen, persistente Einträge, bestätigte Aktivierung/Beendigung |
| castPreparedFeature | Native Oppressive-Aura-/Inversion-Casting-Tickets öffnen; Kosten erst bei Bestätigung |
| rollInversionDefense | Genau einen persistierten Abwehrwurf zum bezahlten Cast ausführen |
| castVersatility | Vorbereiteten Combo-Finisher nativ wirken |
| getLearningContext | Dragon-Soul-Zeitregel/Skillalternative und Nin-Tai-Attributskontext; keine automatischen Lernrechte |
| requestFeatureTarget / getRequests / applyRequest | Gespeicherte Zielanfragen, Status und berechtigte Anwendung |
| configureUnarmed / attackUnarmed / configureGuards | Tatsächliche Profile/Attributsoptionen und Guard-Siegel |
| activateFrenzy / endFrenzy | Persistenter Frenzy-Ablauf |

Die weiteren bereits dokumentierten Taijutsu-Fassadenmethoden bleiben erhalten. Original-Item-Kostenabfragen für tatsächlich gewählte Dragon-Soul-Jutsu verwenden eine konvertierte Kopie; Inventardaten bleiben unverändert. Interne Journalfelder und Wrapper sind keine stabile öffentliche Schnittstelle. Kompatibilitätsziel: Foundry14.364 / n5eb3.1.1.

## Historische Entwicklungs- und Release-Notizen

# Medical API · 0.16.0

Zugriff: game.modules.get('naruto5e-system-enhancements').api.medical. Fassade version: 1. Klassenautomation muss für verändernde Abläufe aktiv sein; Actorbesitz und Zielberechtigungen werden zusätzlich geprüft. Die API öffnet dieselben bestätigten Dialoge/Journale wie die Oberfläche, sie umgeht keine GM-Rechte.

| Methode | Parameter / Ergebnis |
| --- | --- |
| getFeatures | actor → tatsächlich vorhandene katalogisierte Features |
| getProgression | actor → Tabellenwerte, keine Ressourcenzahlung |
| configureJutsuSelection / configureReleases | actor, key bzw. actor → bestätigte Auswahloberfläche |
| requestHealing / requestClinical | actor, kind bzw. ruleId, options → gespeicherter bestätigter Ablauf |
| requestHit | Schadens-ChatMessage → kombinierter bestätigter Medical-Treffer |
| activateScalpel / endScalpel / attackScalpel | actor, gegebenenfalls options → vorhandene Scalpel-Abläufe |
| getCompanions | actor → Kopien aktiver Verknüpfungen |
| linkCompanion / dismissCompanion | actor, kind ('diamond'/'golem'/'summon') bzw. id → bestätigter Profilablauf |
| castThroughCompanion | actor, id → ursprünglicher Wirker-Cast mit Begleiterherkunft |
| rollSharedSave | actor, companionId → gemeinsamer nativer Save mit explizitem Empfänger |
| useProtector / requestRedirection | actor → bestätigter Protector-/Unbreakable-Ablauf |
| isConstructForMedicalFeatures | target → nur kontextspezifische Medical-Construct-Eignung; ändert keinen Kreaturentyp |
| getRequests | actor → Kopien normalisierter healing/clinical/hit/companion/structure/redirection-Anfragen |
| applyRequest | actor, kind, id → derselbe berechtigungsgeprüfte Zielworkflow |

Jede Mutation kann wegen fehlender Berechtigung, nicht vorhandener Regelquelle, unzulässigem Zustand oder ausstehender GM-Prüfung abbrechen. Interne Flagformate sind kein öffentliches API; Ressourcen und Zielanwendungen nicht direkt umschreiben. Laufzeitkompatibilität wurde für diese Fassung nicht getestet. Vorherige API-Dokumentation folgt.

# Public API

## Genjutsu-Arbeitsstand – noch keine neue stabile API

previewJutsuCost bereitet zusätzliche Ergebnisfelder pendingCastingSurcharge und postReductionSurcharge vor. Der zweite Wert umfasst Void und Disruption. ignorePostCostSurcharge ignoriert beide, ignoreVoidSurcharge nur Void. ignoreMirageGrant dient intern der Unterhaltsbasis. Diese Erweiterungen sind noch nicht veröffentlicht; private Mirage-Tickets und interne Foundry-Adapter sind keine öffentliche Freicast-Schnittstelle.

## API 0.14.0 — zusätzliche Klassenabfragen

Alle bisherigen Aufrufe bleiben erhalten. Neue Abläufe sind noch nicht spielgetestet.

- getNinjutsuClassOptions(activity): verfügbare quellgeprüfte Optionen als einfache Objekte mit name, limited, multiple und choices. Bedingungen werden beim Cast erneut geprüft.
- getNinjutsuSelection(actor, key): tatsächlich vorhandene gewählte Item-IDs; key ist master, tai, buki oder fusion.
- configureNinjutsuSelection(actor, key): öffnet den bestätigten Auswahldialog; Besitz, Setting, Limits und zulässige Neuwahl gelten weiterhin.
- getNinjutsuClassRequests(actor), applyNinjutsuClassRequest(actor, id), cancelNinjutsuClassRequest(actor, id), resolveNinjutsuClassReview(actor, id): gespeicherte Zielanfragen lesen/anwenden/verwerfen bzw. nach manueller GM-Prüfung abschließen. Anwendung verlangt den aktiven GM; resolve führt nichts erneut aus.

previewJutsuCost(item, {classFeatures:{activityId, choices}}) berücksichtigt berechtigte Klassenoptionen; choice-Schlüssel sind die von getNinjutsuClassOptions gelieferten Namen. Für Mehrfachoptionen ein Objekt aus Optionswerten mit true verwenden, sonst den einzelnen Optionswert. Eine Vorschau verbraucht nichts. Interne Cast-/Scroll-/Link-Flags und Folgepreis-Tickets sind keine stabile öffentliche Schreibschnittstelle. Neue Integrationen sollen die bestätigten nativen Casting- und Sheetabläufe verwenden.

## Unterklassen-Moldings

- getAvailableMoldings(activity, options), previewMoldings(activity, configuration, rank): tatsächliche Auswahl und Bezahlung abfragen.
- requestSubclassMoldingTargets(actor, messageId, ruleId, targets, options): eigene bezahlte Castingquelle und bestätigte Token-Referenzen {uuid, tokenUuid, name}; erzeugt lediglich eine persistente Anfrage.
- getSubclassMoldingRequests(actor), cancelSubclassMoldingRequest(actor, id), applySubclassMoldingRequest(actor, id), resolveSubclassMoldingReview(actor, id): aktiver GM wendet Ziele an bzw. schließt einen geprüften Teilfehler ohne Wiederholung ab.
- useAdaptiveMolding(actor, id): nativer bestätigter Eigenablauf mit fünf Chakra.
- getSolarFinishers(actor), castSolarFinisher(actor, id, {discard:false}): persistente zulässige Folgecasts; Abbruch/Verwerfen unterstützt.
- getMoldingProtection(message): aktiver Generational-Schutz mit blocks, deadline und manualEnd; null nach Ablauf/Erstattung/Beenden. Externe Counter-/Dispel-Integrationen müssen diese Abfrage ausdrücklich berücksichtigen.

Das Molding-Registry ist noch kein öffentliches Registrierungsformat für beliebige neue Traditionstechniken. Interne Tickets, Snapshot- und Journalstrukturen sind keine stabile Fremdmodul-API. Bestehende Kostenmodifier-APIs bleiben separat verfügbar.


Aktueller Stand 0.12.0: siehe den entsprechenden Erweiterungsabschnitt. Ältere Versionsabschnitte dokumentieren ihre damalige Basis; neue Felder/Verhalten sind unter 0.11.0 beschrieben.

## Ergänzung 0.10.0

previewJutsuCost(item, {rank, chakraRecovery:true}) berechnet bei verifiziertem Featurebesitz und passendem Ninjutsu den bestätigten Recovery-Rabatt. Rückgabe: unrecoveredCost enthält den normalen reduzierten Kostenbetrag, finalCost den optional halbierten Betrag, chakraRecovery die tatsächlich angewendete Eligibility. Ohne ausgewählte Option bleiben finalCost und unrecoveredCost gleich. Reine Vorschau verbraucht keine Nutzung und prüft die Verfügbarkeit der Nutzung nicht verbindlich; der native Castingcommit validiert erneut.

Die Foundry-Integration ist durch ninjutsuClassAutomation plus dynamicChakraCosts geschützt. Interne usage.n5ese-Felder und vorbereitete Resource-Wrapper sind kein allgemeiner öffentlicher Commitvertrag. capabilities.castingCommit und generische castingModes bleiben false. Keine vollständige Ninjutsu-Klassenautomation.


## Mark-Auslösung 0.9.0

- `previewMarkTrigger(actor, groupKey, options={})`: Basiswirkung ohne Verbrauch. Ember: `count`; Blade: `weaponUuid` und tatsächlicher `damageType`, alle Marks. Breeze: alle Marks.
- `requestMarkTrigger(actor, groupKey, options={})`: bestätigte Auslösung persistent speichern und Marks reservieren. Aufrufer müssen Gameplay-Auslösebedingung bestätigen lassen. Keine automatische Zielwirkung.
- `getMarkTriggerRequests(actor)`: Kopien der persistenten Anfrage-/Ergebnisdaten.
- `applyMarkTrigger(actor, requestId)`: ausdrücklich bestätigte GM-Anwendung; nur aktiver GM, Quellen-/Zielrechte und unveränderte Tokenzuordnung erforderlich. Native Schadens-/Condition-APIs; ein abgeschlossener oder unklarer Vorgang wird nicht erneut angewendet.
- `cancelMarkTrigger(actor, requestId)`: ausschließlich Pending-Anfrage ohne Zielwirkung abbrechen. Nur aktive Marks werden ohne Verlängerung zurückgegeben.
- `resolveMarkTriggerReview(actor, requestId)`: nach manueller GM-Korrektur nur die Sperre auflösen; keine Wirkung/Rückgabe.
- `getNinjutsuTrackerWarnings(actor, kind, phase='gain')`: auch `phase='trigger'` für Zugwarnungen. Ausnahmen bleiben ausdrücklich zu bestätigen.

`capabilities.markTriggers` gilt für Breeze-Bleeding, Ember-Fire-Schaden und Blade-Schaden/Prone. Ember-DR und Castingverbrauch sind noch nicht Bestandteil. `castingCommit` bleibt false. Anfragen teilen die lokale Quellen-Actor-Warteschlange mit Zähleränderungen. Anwendung beschränkt sich auf den aktiven GM; eine vollständige Mehrclient-Sperre ist nicht verifiziert. Bei entfernten Features kann ein GM die Pending-Anfrage über die API abbrechen; die zugehörige verwaiste Kartenansicht ist noch nicht implementiert.


## Ninjutsu-Tracker 0.8.0

- `getNinjutsuTrackers(actor)`: tatsächlich besessene Definitionen mit aktiven persönlichen/gezielten Gruppen.
- `getNinjutsuTrackerWarnings(actor, kind)`: Hinweise für bereits erfolgte Erzeugung im aktuellen Zug eines beteiligten Actors; Ausnahmen müssen vom Aufrufer bestätigt werden.
- `addNinjutsuTrackerEntry(actor, kind, target=null)`: einen Eintrag hinzufügen. `target` bei Marks: `{actorUuid, tokenUuid, name}`. Nur mit aktivierter Einstellung und Besitzrechten am Quellen-Actor; Zielflag-Schreibrechte sind nicht nötig.
- `removeNinjutsuTrackerEntries(actor, groupKey, count)`: Zählerkorrektur, ohne sekundäre Spielwirkung. Gruppenschlüssel aus der Query verwenden, keine internen Schlüssel erzeugen.

Kinds: `void-shards`, `lightning-motes`, `elemental-motes`, `breeze-marks`, `ember-marks`, `blade-marks`. Die API bietet keine automatische Bestätigung und keine vollständige Gameplay-Eligibility; Aufrufer müssen Erzeugungsbedingungen bestätigen lassen. Neue Einträge erneuern nur die aktive Gruppe, maximal fünf Einträge; Weltzeitdauer 60 Sekunden. Flags sind persistente Implementierungsdaten, keine öffentliche Schreibschnittstelle. Lokale Warteschlange, keine verifizierte Mehrclient-Sperre.

Nach Initialisierung auf Foundry 14.364 / N5eB 3.1.1:

```js
const api = game.modules.get("naruto5e-system-enhancements").api;
```

Bei nicht unterstütztem Versionspaar wird keine API bereitgestellt. Der Hook `naruto5e-system-enhancements.ready` liefert die API. Kein Class-Mod-Modul erforderlich.

## Verfügbare Methoden

- `registerCastingModifier(definition)` → eingefrorene Definition; ungültige oder doppelte Registrierung wirft Fehler.
- `unregisterCastingModifier(id)` → Boolean.
- `listCastingModifiers()` → unveränderliche Liste in Berechnungsreihenfolge.
- `calculateChakraCost(context)` → reines Ergebnis für explizit bereitgestellte normalisierte Daten.
- `previewJutsuCost(item, options)` → liest Actorbesitz, native Kosten, aktuelle Keywords und verifizierte Kompendiumherkunft; liefert Vorschau samt Diagnosecodes.

`capabilities` zeigt `costPreview/nativeCastingCosts/nativeMaintainCosts/featureChoices: true` und `castingCommit/castingModes: false, dojutsu: true`. `nativeCastingCosts` bedeutet integrierte passive Kostenberechnung; `castingCommit` bleibt false, weil keine eigene vollständige Ressourcen-/Nutzungslimit-Transaktion bereitsteht.

## Modifier

```js
api.registerCastingModifier({
  id: "my-module.example",
  source: "my-module",
  label: "Example modifier", // Beispiel, keine Naruto-Regel
  priority: 10,
  optional: true,
  filters: { featuresAll: ["example-feature"], keywordsAll: ["fire"], ranks: ["c"] },
  change: { operation: "add", value: -1 },
  stacking: { group: "example-group", mode: "exclusive" },
  usage: { key: "example-charge", required: 1 }
});
```

Erforderlich: `id`, `source`, `change`. Filter: `keywordsAll`, `keywordsAny`, `featuresAll`, `ranks`, `clans`; jeweils Arrays oder Sets kanonischer Keys. Unbekannte Felder werden zurückgewiesen. `change` unterstützt `add` und `multiply`. Priorität aufsteigend, dann ID lexikografisch; exklusive Gruppen wählen den ersten berechtigten Eintrag. Ohne Gruppe stapeln Modifier in dieser Reihenfolge. `optional` verlangt explizite Auswahl. Nutzungslimits reservieren verfügbare Nutzungen nur im lokalen Berechnungsergebnis und verändern keine Actorressource.

## Kontext und Ergebnis

```js
const result = api.calculateChakraCost({
  baseCost: 10,
  rank: "c",
  keywords: ["fire", "hijutsu"],
  features: ["Compendium.n5eb.clan.Item.xqFLFGRWFRamlGuy"],
  clan: "uchiha", // Vom Aufrufer verifiziert; reine API prüft keine Dokumente
  minimumCost: 0,
  selectedModifierIds: [],
  usageRemaining: {}
}); // finalCost: 8 mit eingebauter Amplified-Flames-Registrierung
```

Ergebnis: `baseCost`, `finalCost`, `minimumCost`, `breakdown`, `skipped`, `usageRemaining`, `roundingDelta`. Negative Zwischenwerte werden erst am Ende begrenzt; Registrierung und Priorität müssen die bestätigte Regelreihenfolge abbilden. Native Basis ist schon gerundet; der Kern rundet das Endergebnis ab und begrenzt es auf die explizite Mindestgrenze (Standard 0).

`previewJutsuCost(item, {rank, selectedModifierIds, usageRemaining})` ermittelt Clan-Zuordnung ausschließlich aus geprüften Quellen in der mitgelieferten Provenienzliste. Featurekeys enthalten Identifier und Kompendiumquellen tatsächlich besessener Actor-Items des Typs feat. Amplified Flames benötigt die geprüfte Standard-Featurequelle; ein identischer Identifier aus T7 oder Homebrew genügt nicht. Unklare Featureherkunft erzeugt `unverified-feature`. Fremde Clan-/T7-/Homebrew-Quellen erhalten ohne bestätigte Zuordnung keinen Rabatt.

Die Actor-Vorschau enthält `warnings`, `sourceUuid`, `scope`, `nativeCostOverride` und `includesPostConsumptionConditions: false`. Sie verwendet stets die erfasste native Basis ohne doppelte Modifikation. Minion-/Fixkosten-Ausnahmen umgehen Modifier. Nachgelagerte Shocked-Multiplikatoren bleiben ausgeschlossen; die Vorschau ist kein vollständiger Transaktionspreis. Kostenmethoden bezahlen kein Chakra, verbrauchen keine Nutzungen und erzeugen keine Effekte. configureFeatureChoice öffnet einen Auswahlworkflow und speichert bei Bestätigung einen Itemflag. Dojutsu sind nicht implementiert. Der native Castingablauf nutzt bei aktivierter Welteinstellung dieselbe passive Berechnung und übernimmt Validierung/Abbuchung. Optionale Modifier und Nutzungslimits bleiben Vorschaufunktionen. Castingmodi/Callbacks und spätere Workflow-Methoden sind noch nicht Teil des Vertrags.


## Neue Methoden 0.3.0

- registerMaintainModifier(definition), unregisterMaintainModifier(id), listMaintainModifiers(): separate Registry; nur additive Werte <= 0 oder Multiplikatoren <= 1.
- calculateMaintainCost(context): Kontext wie Kostenkern; jede berechtigte Reduktion einzeln, nur niedrigste Kosten angewendet. skipped enthält weaker-maintain-modifier. Bei Gleichstand entscheidet Registry-Reihenfolge.
- previewMaintainCost(item, {rank, cost, baseCost, selectedModifierIds, usageRemaining}): cost ist die tatsächliche Castingkostenbasis; ohne cost aktuelle getChakraCost. Ohne baseCost native getMaintainCost. Liefert Kostenaufschlüsselung und Diagnose.
- configureFeatureChoice(item): Promise<Boolean>; öffnet Auswahl für bekannte eingebettete Feats mit Eigentum; speichert bei Bestätigung flags.naruto5e-system-enhancements.costChoice. Gültige Bestandsauswahl nur GM korrigierbar. Kein frei definierbares Auswahlregistrierungssystem in 0.3.

Modifier erlauben zusätzlich minimumCost (nichtnegative Ganzzahl) und minimumCostRatio (0–1). Verhältnisgrenze: floor(baseCost * ratio); stärkste anwendbare Grenze gilt. Castingmodifier kombinieren diese Grenzen am Ende. Unterhaltsmodifier werden unabhängig ausgewertet. Native automatische Abläufe wählen keine optionalen Modifier und übergeben keine unverbuchten Nutzungslimits.

Featurewahl wird als sourceUUID#choice=canonicalKey im Kontext abgebildet. Für Master Weaver liefert eine gültige Auswahl am Basisrang n5ese.master-weaver-base-jutsu. Missing-cost-choice ist eine zusätzliche Diagnose. Kernaufrufer müssen ihre expliziten Kontexte selbst verifizieren.

## Ergänzung 0.4.0

api.version ist 0.4.0. availableCastingModes(item, {rank}) liefert aktuell verfügbare eingebaute Modi mit id, label, resourceId, dice und die (Würfelseiten). capabilities.builtinCastingModes=true. capabilities.castingModes bleibt false: allgemeine Registrierung externer Modi fehlt. castingCommit bleibt false: keine vollständige atomare Transaktion bereitgestellt.

Native Nutzung: usageConfig.n5ese.technical oder usageConfig.n5ese.frenzy. Diese Auswahl ist nur bei verifizierter Eligibility gültig. Im normalen UI erfolgt sie über zwei native Checkboxfelder. consume=false wird bei gewähltem Modus abgelehnt; consume.chakra=false ermöglicht weiterhin manuelle Chakra-Bezahlung, Martial Dice werden für den ausdrücklich gewählten Modus verbraucht.

Eigene Effektflags flags.naruto5e-system-enhancements.castingMode speichern frenzy bzw. technicalResult für den konkreten Cast. getFlag(n5eb, concentration) liefert den effektiven Unterhalt auf Basis gespeicherter nativer Kosten. Item-Preview-Methoden berechnen weiterhin passive Kosten; sie führen keinen Moduswurf aus und sind keine aktive Effektabfrage. Legacy-Homebrew-Genjutsu-Adept ist ausschließlich mit bestätigter Standardpack-UUID eingebaut; beliebige Homebrew-Features erhalten dadurch keine Freigabe.

## Martial Technique und Regeneration 0.5.0

previewJutsuCost(item,{rank,martialTechnique:false}) verzichtet für diese Vorschau auf Martial Technique; ohne Opt-out gilt die feste Basis bei belegter Eligibility. Das Ergebnis enthält martialTechnique und nativeBaseCost; baseCost ist die effektive Basis vor weiteren zulässigen Erhöhungen. skipped kann cost-reduction-excluded enthalten. calculateChakraCost unterstützt excludeCostReductions für wiederverwendbare Basiskostenstrategien; dieser Schalter selbst gewährt keine Spielfähigkeit.

Native Activity.use-Konfiguration n5ese.martialTechnique:false wählt die feste Kostenstrategie für diesen Cast ab. Unterhaltsmodifier bleiben gemäß Nutzerentscheidung erlaubt. Keine eigene Action-Economy-Verbuchung. martialPoolRecovery ist eine separate opt-in Welteinstellung; keine öffentliche Fremdressourcen-Registrierung behauptet.

## Registry-Erweiterung 0.6.0

Castingmodifier können rankReduction:true deklarieren (ausschließlich negative add-Änderungen). exclusiveRankReduction:true verlangt zusätzlich rankReduction:true und aktiviert bei tatsächlicher Eligibility die stärkste Einzelreduktion aller passenden Rangmodifier. Default beider Felder ist false. Ohne passende exklusive Regel bleibt bestehende Stapelung erhalten. Fremde Module müssen ihre Rangrabatte ausdrücklich kennzeichnen; unmarkierte Rabatte gelten als gewöhnliche Änderungen.

Stärkste Regel: niedrigstes Einzelkostenergebnis gegen dieselbe native Basis einschließlich ihres Minimums; Gleichstand nach Priorität/ID. Optional nicht ausgewählte, mangels Nutzung oder Filtern unberechtigte Regeln lösen keinen Stapelungsausschluss aus. Andere Rangrabatte erscheinen in skipped mit reason:exclusive-rank-reduction. Nutzungsvorschau bleibt unverbindlich; native Casts wenden nach wie vor keine externen nutzungsbeschränkten/optionalen Modifier automatisch an.

Medical-Schadenskontext: n5ese.damage.acid, n5ese.damage.necrotic, n5ese.damage.poison. configureFeatureChoice unterstützt die Medical-Auswahl mit vorhandenen Ownership-/Duplikat-/Abbruchregeln. Mehrdeutige Typen liefern warnings:unverified-damage-type.

## Dojutsu-API 0.7.0

capabilities.dojutsu = true bezeichnet die erste Aktivierungs-/Chakra-Sicht-API. Zugriff über game.modules.get('naruto5e-system-enhancements').api.

- registerDojutsuDefinition({id,label,source,minimumLevel=1,activationCost=0,durationSeconds,freeReactivation=false,sight:{outOfCombat,inCombat}}): immutable Definition; Kosten/Reichweiten nichtnegative Integer, positive Dauer in Sekunden; exakte Compendium-Quelle und eindeutige ID/Quelle erforderlich. Sicht immer in Fuß, zur Vorbereitung in native Einheiten umgerechnet.
- unregisterDojutsuDefinition(id), listDojutsuDefinitions(). Externe Module registrieren Definitionen bei naruto5e-system-enhancements.ready und erneut nach jedem Reload.
- getDojutsuInstances(actor): besessene Instanzen mit instanceId, active, eye, remainingSeconds, nextCost, eligible, externalActive.
- activateDojutsu(actor,instanceId), deactivateDojutsu(actor,instanceId): Promise; Ownership erforderlich; Aktivierung benötigt die aktivierte Weltoption. Deaktivierung bleibt zur Bereinigung erlaubt.
- assignDojutsuEye(actor,instanceId,eye): Promise; left/right/both/unassigned; Zuordnung ist Metadatum ohne exklusive Augen-Sperre.
- reconcileDojutsu(actor): Promise; eigener Zustands-/Effektabgleich ohne Aktivierungsabbuchung.

Keine freien Regeln per Namensmatching, beliebigen Effektcallbacks oder allgemeinen Fremdressourcen. Stufenwechsel/Transformationen und die generische Conditional-Effects-API sind geplant. Versionsbindung Foundry 14.364 / n5eb 3.1.1 bleibt bestehen.


## Tomoe 0.7.1

setDojutsuTomoeUnlock(actor,instanceId,maxTomoe): Promise; Owner und game.user.isGM erforderlich, Integer 1..3, eingebaute normale/Latent-Sharingan-Definition. Speichert die maximale DM-Freigabe; effektive Stufe wird anhand des nativen Charakterlevels begrenzt. getDojutsuInstances liefert zusätzlich tomoe:{unlocked,effective,available} oder null, image und durationSeconds. API-/UI-GM-Prüfung ist keine zusätzliche serverseitige Sicherheitsgrenze gegenüber manuell manipulierten Actorflags durch berechtigte Dokumentbesitzer.

assignDojutsuEye/eye sind Legacy-Kompatibilitätsdaten; keine Augen-Auswahl in der Oberfläche und keine mechanischen Einschränkungen. Eigene Tomoe-Definitionen für Fremdmodule sind noch nicht registrierbar.

## Refined und Pools 0.11.0

- getRefinedNinjutsu(actor) → {ids,maximum,bonus}; nur aktuell berechtigte besessene Jutsu. configureRefinedNinjutsu(actor) → Promise<boolean>; native Auswahl, Ownership, Rast-/GM-Prüfung.
- previewJutsuCost(item,{pools,now,chakraRecovery,...}) unterstützt Pools: {'void-shards':'cost:3:0'}; Rabatt wird nach normalen Modifikatoren, vor Recovery berechnet. Neu: castingPoolReduction, voidSurcharge und unrecoveredCost. finalCost enthält den abschließenden Zuschlag. ignoreVoidSurcharge:true ist für interne Unterhaltsberechnung vorgesehen. API-Vorschau ist unverbindlich und verbraucht nichts.
- getVoidSurcharges(actor) → defensive Kopie gespeicherter Quellen-Zuschläge. removeVoidSurcharge(actor,id) → Promise; GM und Ownership erforderlich. Daten: {id,sourceActorUuid,sourceItemUuid,amount}.
- Native usage.n5ese.refined: none | save | damage:<index>. usage.n5ese.pools: Objekt mit void-shards, lightning-motes, elemental-motes. Werte entsprechen ausschließlich den aktuell angebotenen Optionen. Source, Keywords, Laufzeit, Bestand und Wahl werden beim Cast erneut geprüft. Das ist eine interne, versionsgebundene native Usage-Integration, keine generische Casting-Mode-Registrierungs-API.
- getMarkTriggerRequests, applyMarkTrigger und cancelMarkTrigger arbeiten zusätzlich mit bestätigten Pool-Zielanfragen: next-cost auf genau eine Kreatur oder zap auf ausdrücklich bestätigte eindeutige Kreaturen. Zielzuordnung und Anfrageentstehung erfolgen im bestätigten nativen Cast; keine unbestätigte Fremdschadensanwendung.

Persistente Daten: Feature.flags.naruto5e-system-enhancements.refinedJutsu; Actorflags professorChakra, voidSurcharges und ninjutsuTracker.requests. Eigene Castingklone/Chat-Snapshots enthalten castingAugmentation. Berechtigte Dokumentbesitzer können Flags außerhalb der API verändern; UI-Prüfungen sind keine zusätzliche serverseitige Sicherheitsgrenze.

## Efficient Molding 0.12.0

- `getAvailableMoldings(activity,{phase="cast"})`: eigene, passende Definitionen mit stabilen IDs/Quelle; Phasen cast/concentration/miss/clash.
- `previewMoldings(activity,configuration,rank)`: reine Vorschau `{ids,freeIds,uses,additionalCost}`; kein Ressourcenverbrauch. Configuration pro ID: `{enabled:true,count:1,payment:"auto"|"free"|"chakra",freeCount?,axis?,ability?}`. count/freeCount sind Zahlen; freeCount ermöglicht teilweise Zuordnung bei Careful/Precise. Kein allgemeiner Commitvertrag.
- `previewJutsuCost(item,{moldings,moldingActivityId,rank,chakraRecovery,...})`: zusätzlicher Rückgabewert moldingAdditionalCost; Bestandteil von finalCost nach Recovery, neben Void-Zuschlägen. Native Conditions sind weiterhin Post-Consumption-Schritte.
- `useMoldingAction(message,"focused"|"redirected"|"tenacious")`: führt Besitz-/Kontextprüfung und Bestätigungsdialog durch; kann wegen Abbruch ohne Ergebnis zurückkehren.
- `castMoldingEcho(message,{discard:false})`: bestätigter einmaliger Folgecast; discard:true verwirft das Echo.

Workflows benötigen eingeschaltete Automation und Actor-/Chatberechtigungen. Subclass-Molding-Registrierung ist noch kein öffentlicher Vertrag. Interne usage-Flags, vorbereitete Updates und Journalfelder dürfen von Drittmodulen nicht direkt als stabiler Commit benutzt werden. Mehrclient-Parallelität wird nicht als serverseitig atomar garantiert.

### Weitere private Genjutsu-Zustände (WIP, 16.10.2026)

`genjutsuIllusionaryWeapons`, `genjutsuMomentJournal`, `genjutsuSmitePayments`, `genjutsuSmiteRequests`, `genjutsuPhantasmalJournal` und `genjutsuAttackRecovery` sind Actor-interne Zustände/Journale. Temporäre Profile tragen `genjutsuWeapon` bzw. `genjutsuPhantasmal`; Chatkarten speichern Angriffssnapshots. Diese Felder sind keine öffentlichen Gratiscast-/Ressourcen-APIs. Keine stabile externe Schnittstelle oder Laufzeitkompatibilität zugesichert.

Weitere private WIP-Felder: `genjutsuWeaponCasting`, Actor-`genjutsuInfusionHits`, Actor-`genjutsuInfusionRequests` und `genjutsuIllusionaryWeapons[].infusion`. Kein öffentlicher Berechtigungs-/Gratiscastvertrag.


### Genjutsu-Arbeitsfortschritt 16.10.2026

Genjutsu-Aktionen/-Effekte/-Auswahlen sind unveröffentlichte interne Module; dafür wird noch keine stabile öffentliche API zugesichert.


Verzögerte Genjutsu und private Wurfbelege bleiben interne, unveröffentlichte Erweiterungen.


Marker und Korrekturoptionen der Konzentrationsverwaltung bleiben interne WIP-Details.


Unreleased intern: `genjutsuPrograms` ist ein persistentes Actor-Journal für Signature-Work-Programme. `programTicket` ist nur ein kurzlebiges internes Cast-Ticket, kein öffentlicher Integrationsvertrag.


17.10. WIP intern: `genjutsuConditionRequests`, `genjutsuFearCast`, `genjutsuSkillPackage` und `genjutsuTemporalGrant` sind interne Dokumentmarker, kein stabiler öffentlicher API-Vertrag. Vorhandene Casting-/Maintain-API bleibt bestehen. Sensory-Type-Kostenfreiheit wird über einen besitzgeprüften Maintain-Modifier vermittelt.

Die zusätzlichen Genjutsu-Workflow-Flags (Psionic, Retarget, Night Terror, Umbral und Chronicle-Ritual) sind interne persistente Journale und keine stabile öffentliche Schreib-API. Externe Module dürfen sie nicht direkt verändern. Die dokumentierte Registrierung von Kosten-/Effektdefinitionen bleibt der Integrationsweg. Keine neue allgemeine Genjutsu-Berechtigung durch Psionic Scrivener.


Weitere interne, unveröffentlichte Marker: genjutsuFearDamage, genjutsuTrueStrikeReceipts, genjutsuEchoFear, genjutsuEndedEchoes, genjutsuDarknessWave, genjutsuBladeCopies, genjutsuCastingOrigin sowie crest am verzögerten Cast. Diese Flags sind keine öffentliche Schreib-API. Neue Actor-/Activity-Wrapper werden einmal installiert und respektieren genjutsuClassAutomation. Keine Ressourcen beim bloßen Öffnen der Konfiguration. Zielabhängige Sichtbarkeit wird nicht global als Invisible/Hidden verändert.


0.15.0 Gruppenfassung (17.10.2026): zusätzlicher quelleneigener Beobachterkreis für Sensory-Markierungen über Token-Detection und bestätigte Wurfkontexte; parallele Song-Konzentrationsgruppe; Lucid-Effektauswahl/-Unterdrückung; Brawler-Virtualisierung; Mirage-Sonderdaten und Bedienelemente. Keine öffentlichen Schreib-APIs für diese internen Flags. Noch nicht spiel-/integrationsgeprüft. Grenzen nativer manueller Jutsu-Abläufe ausdrücklich in GENJUTSU-GRUPPENFASSUNG.md.

0.15.0: previewJutsuCost liefert zusätzlich fractureMultiplier (1 oder 2). Interne Maintain-Aufrufer verwenden ignoreFractureCosts, da dieser Fluch nur die Wirkkosten verdoppelt. Casting erhöht den Jutsu-Anteil vor Recovery und vor späten fremden/Molding-Zusätzen. Neue Fracture-/Lucid-/Sensory-/Song-Marker bleiben interne Implementierungsdetails und dürfen nicht direkt von Drittmodulen geschrieben werden.

## Medical-Nin — Entwicklung, 17.10.2026

Medical-Nin: interne Quellen-/Regelmodule und Kostenregistrierungen sind in Entwicklung. Noch keine neue stabile Medical-Aktions-API zugesagt; vorhandene öffentliche Casting-/Unterhaltsabfragen berücksichtigen Medical-Regeln nur bei aktivierter neuer Einstellung und passender Eligibility. Keine Compendium-Definition verleiht Besitz oder Lernrechte.


### Medical-Fortsetzung · 17.10.2026

Medical-Helfer sind weiterhin interne Entwicklungsfunktionen. Neue Traces-/Alteration-/THP-Funktionen sind noch nicht als stabile öffentliche API freigegeben.

### Unreleased Taijutsu source API

The installed 0.16.0 release does not include this API. The work-in-progress source exposes `game.modules.get("naruto5e-system-enhancements").api.taijutsu`, with `version:1` and `status:"work-in-progress"`. This does not imply that the class or all subclasses are complete.

- `getProgression(actor)`, `getFeatures(actor)`: read actual owned sources, native pool and expected progression; grant nothing.
- `configureUnarmed(actor)`, `attackUnarmed(actor)`, `configureGuards(actor)`: open the same confirmed native workflows as the sheet.
- `activateFrenzy(actor)`, `endFrenzy(actor)`: use ownership, resource, armor and managed-effect validation.
- `requestHit(message)`, `requestDevastating(message)`, `requestFocus(message)`: use explicitly selected current user targets and confirmed paid casting records.
- `beginRedirect(actor)`, `rollRedirect(actor,id)`, `confirmRedirectHit(actor,id)`: persistent paid counterattack and GM original-effect request. Complex stored/infused or separately target-locked original attacks require manual GM transfer before payment.
- `recharge(actor,name,{rest:false})`, `useUtility(actor,name)`, `rollUtilityAttack(actor,id)`: same actual-trigger and native resource checks as UI.
- `getRequests(actor)`, `applyRequest(actor,kind,id)`: kinds `hit`, `devastating`, `focus`, `redirect`. Ownership and active-GM requirements still apply; interrupted requests do not retry.
- `isSavageForcePending(actor)`: owner-readable next-melee drawback state.

Do not write internal flags directly or assume their journal schema is public. Calls requiring interaction can open confirmation/native roll dialogs. Runtime verification is deferred by user request.

### Additional unreleased Taijutsu calls

The experimental source-only taijutsu API also exposes requestFlamingSave(message), getMatrixFreedom(actor), activateMatrixBuff(actor, 'flight' | 'neo', {renew:false}), endMatrixBuff(actor,kind), declareEnhancedBlows(actor), rollEnhancedBlowsAttack(actor,id), and endEnhancedBlows(actor,id). These use the same confirmation dialogs, ownership and resource checks as the sheet. Request kind flamingSave records the first original Jutsu save; it does not apply damage or original effects. No internal Dynamic Set-Up bypass ticket is public. None of these source additions are available in the installed0.16.0 release yet.

### Disturbance source API (unreleased)

The experimental taijutsu namespace adds getDisturbanceActions(actor), beginDisturbance(actor,kind), rollDisturbanceAttack(actor,id), endDisturbance(actor,id), requestDisturbanceTargets(actor,id), beginBarrage(actor), and resumeBarrageTargets(actor,id). Begin kinds: shatter/core/flurry/reflexes. getRequests/applyRequest accept request kind disturbance. These invoke actual-source, owner, resource and confirmation checks; target application requires the active GM. They do not grant global actions or reactions. Interrupted-cast mutation is internal and is not exposed as an unchecked public command.


### Unveröffentlichte Taijutsu-Erweiterungen

Die WIP-taijutsu-API bietet getFeatureActions, performFeatureAction, endFeatureAction, getStances, selectPrimaryStance, requestFeatureTarget und requestRuinTechnique. getRequests/applyRequest kennen martialTarget und ruin. Eigentümer-/Besitzprüfungen entsprechen den Sheet-Aktionen; fremde Ziele benötigen die gespeicherte GM-Anwendung. Noch kein stabiler Release-Vertrag.

Modifier akzeptieren optional imposedCostIncrease (Boolean; Standard !optional). Bei Stancer Technique überspringt excludeCostIncreases ausschließlich positive als auferlegt markierte Änderungen; freiwillige Modifier bleiben erhalten. skipped.reason ist cost-increase-excluded. Die bloße Kostenberechnung verbraucht keine Ressourcen.

## Taijutsu-Fortsetzung · 21.10.2026

Unveröffentlichter Quellstand. Elemental Armor hängt seinen bestätigten Unterhalt an denselben nativen Combat-Recovery-Updatebatch nach der Martial-Pool-Erneuerung. Außerhalb des Kampfes führt die vorhandene bestätigte Zugerneuerung diese Schritte gemeinsam aus; Unterbrechungen verlangen GM-Prüfung ohne Wiederholung. Catalyst-Kurzschluss wartet bei einer laufenden Actor-Transaktion auf deren Freigabe. Der interne Hook `n5ese.castingActorUnlocked` signalisiert ausschließlich die freigegebene lokale Sperre und gewährt keine Ressourcen. Keine Spiel- oder Integrationstests.
