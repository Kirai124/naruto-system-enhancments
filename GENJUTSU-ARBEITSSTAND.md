# Aktueller Stand: Gruppenfassung 0.15.0

Implementierungsarbeit zur Gruppenfassung zusammengeführt. Keine Laufzeitabnahme; maßgeblich sind GENJUTSU-GRUPPENFASSUNG.md und die aktualisierte Einzelcheckliste, einschließlich Fracture-Automation und verbleibender narrativer Grenzen. Die bisherigen Zwischenberichte folgen als Historie und beschreiben nicht den aktuellen Installationsstand.

## Historische Zwischenstände

# Genjutsu Specialist – unveröffentlichter Arbeitsstand

Die neue Einstellung ist standardmäßig aus. Manifest/API bleiben bei 0.14.0; dieser Quellstand wurde nicht in die lokale Foundry-Installation kopiert. Ninjutsu Specialist, Drip/Ryō-Ausschlüsse und manuelle Aktionsökonomie bleiben bestehen. Featureweise offene Punkte: [GENJUTSU-SPECIALIST-CHECKLISTE.md](GENJUTSU-SPECIALIST-CHECKLISTE.md).

## Bestätigte Regeln

- Actualization-Pool gleich PB, d4/d6 ab Klassenstufe 9/d8 ab 17; Schaden und Save-Malus kombinierbar mit gemeinsamem Pool. Nur tatsächlich betroffene feindliche Ziele. Ursprünglich schadensverursachendes Genjutsu: seine Save-Schadensregel; sonst voller Psychic-Zusatzschaden. Native Zielverteidigungen danach.
- Disruption verwendet den ungekürzten gewählten Rangpreis. Mehrere Wirker addieren; Zuschläge ganz am Ende, gemeinsam beim nächsten bezahlten bestätigten Jutsu verbrauchen; kein Unterhaltszuschlag. Ende des nächsten tatsächlichen Zielzugs, ohne eindeutigen Kampfablauf manuell.
- Genjutsu-Save-Ergebnisse ausschließlich nach SG-Abstand: −5/+5, mit Greater Mastery −2 bzw. Higher Understanding +10. Keine zusätzliche natürliche 1/20. The Turn/Perception ändern gespeicherte Belege, nicht heimlich bereits angewendete ursprüngliche Jutsu-Effekte.
- Perception: halbe Dice-Summe aufgerundet, mindestens 1. Perfection: E/D/C.
- Halbe Mirage-Preise: ungekürzten Rangpreis halbieren/abrunden, dann erlaubte Rabatte; fremde Zuschläge zuletzt. Preisvorteil gilt nur beim Wirken; explizit freier Unterhalt bei Brawler/Song bleibt frei. Berserk Thoughts ist wie vom Nutzer bestätigt kostenlos.
- Evil Thoughts → Psionics Mind Crunch!; Shroud of Shadows → Sealing Art Darkness, beide Zuordnungen vom Nutzer bestätigt und beide Original-Jutsu C-Rang.
- Misty Kit: d8→d6→d4→1→0; je Charge nacheinander mit aktuellem Würfel, Abbau bei 1/2. Bestätigte Technik wirkt auch vollständig, wenn das Kit vor der letzten Charge leer wird. E-Rang nicht im Text genannt und deshalb vorerst nicht angeboten.
- Temporal Stopwatch: Abbau am Beginn jedes Kampfteilnehmer-Zuges, bei 1/2/3; eine Stunde Sperre. Verschobene feindliche Conditions behalten ihre ursprüngliche Laufzeit. Native Condition-Aufrufe und direkte neue Condition-AEs werden erfasst; nachträgliche direkte Flag-/Rangänderungen anderer Module sind noch kein verifizierter Integrationsweg.
- A Moment in Time (halber Wurf als AC) und Genjutsu Insignia (halber Gen-Mod als Dispel-Malus): beide aufrunden. Moment-AC ist im Quellstand ergänzt; Genjutsu Insignia bleibt offen.
- Illusionary Weapon: höchste Stufe +1/+2/+3, reale Waffenprofile, Psychic mit Genjutsu-Attribut. Fernkampfmunition ist illusionär; echte Munition wird nicht verbraucht. Loading/Aktionsökonomie bleiben manuell. Smite: 2d8 für 3 Chakra, eine anfängliche Steigerung und weitere auf 5/9/13/17, maximal 7d8 für 13; bei kritischem Treffer Würfel verdoppeln.
- Moment/Temporal Mastery: ein gemeinsamer Konzentrationsplatz je Aktivierung; neue Aktivierung ersetzt nur bisherige eigene Moment-Wirkungen.
- Duplicity: vorhandenen eigenen Doppelgänger-Token verknüpfen; keine ungefragte Actor-/Token-Erzeugung. Angriffsbonus nur nach bestätigten 5-Fuß-/Sichtbedingungen.

## Grenzen und ausstehende Arbeit

- Noch kein Klassenabschluss. Die meisten Unterklassen-Zielwirkungen und nicht castenden Mirages bleiben offen; ein Preisweg allein ist kein fertiges Feature.
- Mirage-Sonderwirkungen wie Song-Konzentrationsbündelung, Evil-Thoughts-AC, zusätzliche Kopien/Ziele, Signature-Programmierung, Superior Thoughts sind noch zu ergänzen; Waffen-Infusion ist als eigener Teilstand beschrieben.
- Perfection für unstrukturierte DR-/THP-Formeln, Save-basierte Inception-Rückgewinnung und Elemental-Auswahl fehlen noch. Waffen-/Strahl-Basisabläufe und bestätigte Angriffs-Rückgewinnung sind ergänzt; allgemeine Mirage-Verknüpfungen bleiben teilweise offen.
- Bei Conditions mit gemischten Effektmodifikatoren muss die Abgrenzung zwischen Condition und unabhängiger Jutsu-Wirkung noch abschließend geprüft werden. Unbestimmte bzw. nicht auslesbare Laufzeiten verlangen GM-Handhabung.
- Keine Server-Transaktion über mehrere Dokumente: Journale sperren erkennbare Teilfehler; gleichzeitige Änderungen mehrerer Clients sind weiterhin in Foundry zu prüfen. Keine automatische Wiederholung zur GM-Prüfung gesperrter Vorgänge.
- Save-Belege und Journale bleiben dauerhaft erhalten; spätere Aufräum-/Archivstrategie offen. Geheimwürfe werden nicht über die öffentliche Castkarte enthüllt.
- Originalsystem und Class-Mod-Library unverändert. Noch keine Installation, kein Welt-Reload und keine neuen Test-Actors für diesen Arbeitsstand.

## Ergänzung vom 16.10.2026

Neue Quelldateien für persistente Waffenformen, Smite, Phantasmal Force, Angriffs-Rückgewinnung und Moment/Temporal Mastery. WIS/CHA-Auswahl schreibt jetzt das maßgebliche native Actor-Feld. Kombinierte eigene Actualization-Beiträge werden im selben nativen Ressourcenbatch summiert. Technische Teilfehler werden zur GM-Prüfung gespeichert; keine automatische Wiederholung. Nicht installiert und nicht laufzeitgeprüft.

Smite-Abgrenzung vom 16.10.: Waffen- und Smite-Schaden gemeinsam anwenden, DR einmal für den gesamten Treffer. Dafür den tatsächlichen, noch unbenutzten nativen Waffenschadenswurf bestätigen. Bereits ausgewürfelte Anteile werden nach Schadensart/Eigenschaften gruppiert und nicht neu gewürfelt. Die native Einzelanwendung des reservierten Waffenschadens am bestätigten Ziel ist gesperrt; manuelle HP-Änderungen und fremde Drittmodul-Abläufe bleiben Verantwortung der Gruppe. Keine Laufzeitprüfung.

### Waffen-Infusion und Illusionary Bukijutsu (WIP, 16.10.2026)

Supreme-Infusion speichert einen bezahlten nativen Genjutsu-Cast in genau einer aktiven Waffenform. Jede Form hat einen eigenen Speicher; Ersetzen wird ausdrücklich bestätigt. Ein bestätigter erfolgreicher Treffer gibt den Cast für genau eine Kreatur frei und verbraucht den Speicher. Fehlschläge verbrauchen ihn nicht. Selbst Flächen-Genjutsu betreffen hierbei nur die getroffene Kreatur; kein vorzeitiges Template. Vorhandene Jutsudauer/Konzentration beginnt beim ursprünglichen Cast. Saves erhalten −1d4; eigene GM-Anfragen übernehmen native Effekte mit verbleibender Laufzeit. Bereits bezahlte zielgebundene Actualization-/Power-/Prestige-Optionen können nicht heimlich auf andere Ziele verschoben werden. Originale Angriffs-/Schadens-/Effektanwendung vor Trefferfreigabe wird abgefangen. Bestätigt: Der infundierte Genjutsu-Schaden bleibt auch bei kritischem Waffentreffer normal; nur der eigentliche Waffenschaden ist kritisch.

Illusionary Bukijutsu verwendet nach ausdrücklicher Waffenwahl bis C-Rang das Genjutsu-Attribut für Angriff, attributsabhängigen Schaden und berechneten SG. Native Bukijutsu-Kosten und Jutsu-Klassifikation bleiben erhalten. Ein manueller fester SG wird nicht ohne belegte Formel umgerechnet. Neue Casts starten über das ursprüngliche Inventar-Jutsu; alte Chat-Snapshots bleiben Belege ihres ursprünglichen Casts.

Keine Installation und keine Laufzeit-/Spieltests. Grenzen: fehlende/gelöschte Ursprungs-Chatkarten, technische Teilfehler während der nativen Konzentrationserzeugung und Mehrclient-Änderungen verlangen spätere Prüfung bzw. GM-Handhabung. Nicht strukturierte Jutsu-Wirkungen bleiben über ihren tatsächlichen Regeltext zu handhaben. Genjutsu Specialist ist weiterhin unvollständig.

### Gemeinsame Genjutsu-Effekte und Unterklassen-Aktionen (16.10.2026)

Bestätigt: Sonstige Halbierungen abrunden; die ausdrücklich bestätigten Aufrundungen bleiben bestehen. Dieselbe Fähigkeit ohne besondere Stapelungsregel wirkt mit dem stärksten Wert; unterschiedliche Fähigkeiten können zusammenwirken. Ausdrückliche Stapelgrenzen (z. B. Corrupt Influence) bleiben erhalten.

43 Quellen sind an eine gemeinsame bestätigte Aktions-/Zielanfrage angebunden. Ressourcen und Ergebnisse werden gespeichert; abgebrochene Anwendung würfelt gespeicherte Ergebnisse nicht erneut. Selbstwirkungen dürfen vom Quellenbesitzer angewendet werden, fremde Ziele erfordern weiterhin den aktiven GM. Teilfehler werden gesperrt und verlangen GM-Prüfung. Wiederkehrende Wirkungen und Wiederholungswürfe werden als private bestätigbare Vorgänge vorgemerkt. Außerhalb des Kampfes tatsächliche Zugereignisse manuell bestätigen. Dies automatisiert keine Aktionsökonomie.

Condition-Anteile gehören ihren jeweiligen Effekten, Immunitätsausnahmen bleiben auf die eigene Actualized-Power-Anwendung begrenzt. Gemeinsame Rollmodifikatoren, Bewegungsreduktionen und getrennte temporäre HP sind ergänzt. Unlesbare Ausgangswürfe, native Mischwirkungen und Drittmodul-Eingriffe verlangen weiterhin manuelle Abgrenzung. Narrative Bewegung, Informationsgewinn und Umleitung von Aktionen werden ausdrücklich bestätigt und manuell ausgeführt. Zahlreiche weitere Fähigkeiten sind noch offen; siehe Einzelcheckliste.

164 ESM-Dateien auf Syntax und lokale Importverknüpfung geprüft, drei JSON-Dateien gelesen. Kein Modulcode dafür ausgeführt; keine Unit-, Spiel-, visuellen oder Integrationstests. Nicht installiert, kein Welt-Reload.

### Verzögerte Genjutsu (weiterer Teilstand, 16.10.2026)

Neue ausdrückliche Entscheidung: Remote Trigger und Brain Worm speichern höchstens 24 Stunden; die eigentliche Jutsu-Dauer, Konzentration und der Unterhalt beginnen erst beim Auslösen. Der Cast bezahlt die normalen Wirkkosten vorab. Speicherzustand, Träger und Auslöser bleiben erhalten. Brain Worm bezahlt zusätzlich zwei Actualization Dice und beim Auslösen 8 Chakra; der Speicherungssave erhält Nachteil. Remote Trigger erlaubt einen freiwilligen Fehlschlag und zusätzliche Ziele mit CHA-Save beim Auslösen. Freigabe durch GM, Zielanwendung anschließend über die ursprüngliche Karte. Eigene Fehlerzustände verhindern automatisches erneutes Auslösen. Noch keine vollständige Crest-Reservierung/Rückgabe.

Vicious Mockery und Mental Placebo ergänzen den Aktionskatalog auf 45 Einträge. Fremde Feature-Save-Zahlen werden in separaten privaten GM-Belegen gespeichert, die Quellenanfrage enthält keine Save-Zahlen; diese Sichtbarkeit ist noch nicht im Mehrclientbetrieb geprüft. Unterbrochene Würfe ohne gesicherten Beleg verlangen manuelle GM-Auflösung. Neue Zugereignisse werden lokal serialisiert und beim Speichern mit bestehenden Einträgen zusammengeführt.

Weiterhin kein Klassenabschluss, keine Installation und keine Laufzeit-/Spieltests.

### Konzentrationsausnahmen und Critical Moment (weiterer Teilstand, 16.10.2026)

Words Of Resonance und Temporal Disassociation bezahlen je einen Actualization Die im normalen Cast-Batch; Split Focus bezahlt seine native Nutzung. Je Fähigkeit höchstens ein belegter eigener Vorteil. Die abgeleitete Konzentrationskapazität berücksichtigt ausgenommene Effekte, ohne den gespeicherten Actor-Grundwert zu ändern. Geschützte Konzentrationen verlangen ausdrückliches freiwilliges Beenden; direkter unfreiwilliger Löschung wird widersprochen. Normale Konzentrationen und Unterhalt bleiben erhalten. Ein bewusst beendeter besonderer Vorteil beendet nicht automatisch das Jutsu; überzähliges Jutsu anschließend selbst beenden. Gemeinsame automatische Auswahl mit verzögerten Casts bleibt offen.

Critical Moment wurde ausdrücklich auf den aktuellen Zug begrenzt: +3 kritischer Bereich für Genjutsu-Angriffe, danach drei Concussed-Ränge. Der normale Kampfwechsel beendet die Wirkung; außerhalb des Kampfes das echte Zugende bestätigen. Gemeinsame Aktionsdefinitionen vorhanden; die inzwischen bestätigten normalen Signature-Work-Folgecastkosten sind weiter unten umgesetzt.

Weiterhin unvollständig, nicht installiert und nicht laufzeitgeprüft.

Critical Confusion: bestätigter bezahlter Wiederholungswurf, ersetzter alter Beleg und Begrenzung des neuen Ergebnisses auf höchstens regulären Erfolg. GM-erstellte Outcome-Anfragen speichern ursprüngliche Save-Zahlen in privaten GM-Belegen; die Quellenanfrage hält nur die Referenz. Sichtbare Beleglisten zeigen keine ersetzten Saves mehr und erfordern bei numerischen Ergebnissen tatsächliche native Chat-Sichtbarkeit. Keine Laufzeit-/Mehrclientprüfung.


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

Statische Kontrolle dieses Zwischenstands: 195 ESM-Dateien syntaktisch geprüft, lokale ESM-Importverknüpfung ohne Auswertung erfolgreich, drei Konfigurations-JSON-Dateien gültig; git diff --check ohne Befund. Keine Laufzeit-/Spieltests.


Finaler Quell-/Paketstand 0.15.0: 202 ESM-Dateien syntaktisch geprüft; lokale Importverknüpfung ohne Auswertung und drei Konfigurations-JSON-Dateien erfolgreich. Keine Unit-, Gameplay-, Visual-, Browser- oder Foundry-Integrationstests. No-Light-Fractures sind inzwischen einschließlich gespeicherter tatsächlicher Zielzug-/Monats-Saves, Rangsperren, Konzentrationsgrenze, Wirkkosten und HS-Sperre angebunden. Historische offene Angaben weiter oben sind damit überholt.
