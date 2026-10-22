# Taijutsu Specialist · Gruppenfassung 0.17.0

Implementierungsrunde abgeschlossen; nicht spielgeprüft. Aktueller verbindlicher Umfang: [Gruppenfassung](TAIJUTSU-GRUPPENFASSUNG.md), [135 Features](TAIJUTSU-SPECIALIST-CHECKLISTE.md), audit/TAIJUTSU-IMPLEMENTATION-STATUS.json. Die folgenden Einträge sind historische Zwischenstände und keine noch offenen Implementierungszusagen.

## Historische Entwicklungs- und Release-Notizen

# Taijutsu Specialist — Arbeitsstand

Stand: 18.10.2026. In Entwicklung, nicht vollständig, nicht veröffentlicht und nicht installiert. Installiert bleibt die Medical-Gruppenfassung 0.16.0. Keine Unit-, Spiel-, Browser-, visuellen oder Foundry-Integrationstests. Neue Taijutsu-Option standardmäßig aus.

135 Quellfeatures, 14 Unterklassen und zwei belegte externe Items katalogisiert. Keine Fähigkeiten durch reinen Kompendiumsbesitz. Quellen und Einzelstatus: audit/TAIJUTSU-SOURCES.json, audit/TAIJUTSU-IMPLEMENTATION-STATUS.json, Entscheidungen: audit/TAIJUTSU-DECISIONS.json.

## Erster Quellmeilenstein

- Bestehenden Martial-Adept-Pool und Zug-Recovery erweitert, keine zweite Ressource. Native Basisprogression und visuell gelesene Unnatural-Talent-Tabelle; individuelle Maxima/Recovery-Profile bleiben erhalten. Außerhalb des Kampfes echte Zugerneuerung bestätigen.
- Besitzgeprüfte Klassenoption, kompakter Sheet-Bereich und feste Flow-/Perfect-Mind-Wahlen. Native Martial-Defense-AC und vorhandene Advancement-Auswahlen bleiben bestehen.
- Gezielte Korrekturen der eingebauten Enhanced-Movement-/Perfect-Body-Effekte ohne System- oder Itemquellen zu ändern.
- Native Castingoptionen für Precise/Raw Taijutsu, Brutal Technique/Taijutsu, Raw Technique und Chakra Enhanced Strikes. Gemeinsame Zahlung mit Technical Technique/Force of Rage; Chat-Snapshots und erster Brutal-Schadenswurf.
- Half-DR verwendet bestehende universelle Reduktionsberechnung. Raw zieht nach einmaligen Verteidigungen den vollen Betrag von HP und THP ab.
- Master of Persistence/Step Of The Moon entfernen nur ausdrücklich ausgewählte native bzw. verwaltete Conditions; Ursprung/Rang bestätigen. Unterbrechungsjournale statt automatischer Wiederholung.
- Unbreakable Will mit nativer Save-Auswahl, bestätigtem Die und kostenloser Dialog-Abbruchbehandlung. Evasion unterstützt bestätigte Schadenswahl; Native und verwaltete Zielwirkungen werden nach bestätigtem erfolgreichem Save ausgeschlossen; den Abwehrablauf vor den Conditions behandeln, bei wiederholten Schadensinstanzen erneut bestätigen.
- Guard-Siegel: tatsächliche Full Rest bestätigen, native Slotkosten und zulässige Stufen prüfen, gleiche Grundform nicht doppelt. Originalprofile bleiben erhalten. Strukturierte passive Werte erst nach ausdrücklicher Aktivierung der Textbedingungen; nicht strukturierte oder aktive Siegelwirkungen bleiben manuell.
- Frenzy-Grundablauf mit dauerhaftem Zustand, Kosten, Schadenswürfel je Treffer, STR-Vorteil, Resistenzen, Self-Konzentration und Laufzeit. Nicht zuverlässig erkennbare Offensive am Zugende ausdrücklich bestätigen; sonst Boni zur Prüfung aussetzen. Force of Rage bezahlt den Aktivierungswürfel nicht erneut. Weitere Righteous-Fury-Features bleiben offen.
- Verwaltete Effekte mit mehrfach gleichem Schlüssel bekommen unterscheidbare Prioritäten, damit mehrere Resistenzen nicht denselben ersten Wert übernehmen. Historische Effekte werden nicht migriert.

## Noch offen

Würfelersatz für weitere profiziente Inventarwaffen, weitere Standardtechniken, ausstehende Unterklassenabläufe einschließlich Savage Force/Tyrants Savagery, öffentliche Taijutsu-API, Abschlussdokumentation und Veröffentlichung. Nicht als fertige Klasse freigegeben. Aktionsökonomie bleibt manuell. Statische Syntax-/Importprüfung ist kein Laufzeitnachweis.

## Zweiter Quellschritt

Unarmed Technique mit bestätigtem STR-/DEX-Kontext, virtuellem nativem Unarmed-Profil, Taijutsu-/Skill-Attributswahl und tatsächlichen Talent-Waffenproperties ergänzt. Relentless Fury behandelt die vollständige noch nicht angewendete Schadenskarte vor 0 HP, erhöht den CON-Check-SG und bezahlt einmal; komplexe bereits bezahlte Medical-Spezialtreffer bleiben gemeinsame GM-Prüfung. Unstoppable-Fury-Reroll und Righteous-Fury-Immunitätsaktion samt Teilzahlungsprüfung ergänzt. Schwere Rüstung unterdrückt Enhanced Movement bei tatsächlichem Ironclad-Besitz nicht. Neue Pfade sind sämtlich laufzeitungeprüft.

## Dritter Quellschritt — bestätigte Treffer und Standardtechniken

- Furious/Precise/Devastating Technique und Furious/Devastating Taijutsu im vorhandenen Castingdialog samt gemeinsamer Martial-Dice-Zahlung. Precise kompensiert nur bestätigte Zahlenabzüge, Nachteil bleibt erhalten. Weitere Angriffe und Reaktionen bleiben manuell.
- Gespeicherte vollständige Treffer, Zusätze, native Schadensbelege und Zielanfragen. Furious berechnet nur mit den ausdrücklich ausgewählten Jutsu-Verteidigungen in einem temporären Actor; echte Zieleffekte werden nicht deaktiviert/gelöscht.
- Devastating verwendet genau einen bereits angewendeten Treffer und sein Ausgangsziel. Bestätigte halbe Schadensanteile müssen zusammen die abgerundete Hälfte ergeben. Native DEX-Saves, 0 bei Erfolg, eigene Zielverteidigungen bei Fehlschlag; 10-Fuß-Zielauswahl ausdrücklich bestätigen.
- Fists Of Iron nur für tatsächliche Unarmed-Strikes. Savage Force nur für bestätigten Unarmed-Schaden eines Nahkampf-Taijutsu; sein folgender Nahkampf-Nachteil behält Immunität und THP, umgeht übrige eigene Reduktionspfade. Vorschauen verbrauchen ihn nicht; unterbrochene Anwendungen sind gesperrt.
- Tyrants Savagery speichert bezahlte Würfe gegen den tatsächlichen Verursacher. Mehrere passende Boni addieren und bei bestätigtem verursachtem Schaden gemeinsam verbrauchen.
- Flurry Of Blows, Patient Offence und Step Of The Stars besitzen bezahlte persistente Angriffsgruppen; Step Of The Wind verdoppelt die vorbereitete Sprungweite. Hide/Dodge/Bewegungs-Reaktionsregeln sind als bestätigte Ressourcenabläufe enthalten, ihre situationsabhängigen Vorteile bleiben manuell.
- Medical-/Taijutsu-Trefferjournale verhindern parallele doppelte Originalanwendung. Ein gemeinsamer Multiclass-Ablauf für sämtliche Extras ist noch offen; nicht beide Pfade auf denselben Treffer anwenden.

Statisch geprüft: 277 ESM-Dateien und drei Modul-JSON-Dateien; Importgraph verlinkt, nicht ausgewertet. Keine Spiel-, Browser- oder Integrationstests. Noch keine Installation/Veröffentlichung. Weitere Standard-/Unterklassenfunktionen und API bleiben offen.

## Ergänzung — Waffenprofile und Flurry Of Guards

Unarmed-Kontext kann STR/DEX auch für native Specialist-Waffen verwenden. Freiwilliger Grundwürfelersatz bei profizienten normalen Waffenprofilen bewahrt zusätzliche Formelteile und Quelldaten; komplexe Custom-/ersetzende Munitionsprofile bleiben manuell. Flurry Of Guards hält die bestätigte wörtliche Abgrenzung ein: Schaden 1 Die, Angriff bis 1/2/3 je Klassenstufe. Das effektive Angriffsergebnis wird gesondert gespeichert, der Originalwurf nicht verändert; reduzierter Gesamtschaden wird nach bestätigten Anteilen vor normalen Verteidigungen einmal angewendet. Auch diese Ergänzungen sind laufzeitungeprüft.

## Vierter Quellschritt — Talent & Focus

Talented Technique und Focused Technique sind bezahlte native Castingoptionen. Talent zählt ausschließlich bestätigte Martial-Keywords einschließlich Talent/Focus/Technical; sein ursprünglicher Schadenswürfel-Zusatz gilt einmal je Cast. Focus speichert native CON-Saves und berechnet je fehlendem Punkt 2d12 und einen Weakened-Rang, mit ausdrücklich gewählter Schadensart und bestätigter Zielanwendung. Native Condition-Grenzen bleiben wirksam, eine nicht belegte Weakened-Dauer wird nicht erfunden.

Focused Adaptation konvertiert nur die ausdrücklich bestätigte ursprüngliche Unarmed-Schadensformel eines Nahkampfangriffs und endet am nächsten eigenen Zugbeginn. Focused Strike bezahlt drei Dice plus die native Nutzung, verwaltet STR-Save und Stunned-Laufzeit. Shatterpoint bezahlt einen Die, prüft einmal je Zug und wählt THP-Verlust oder bestätigte DR-Effekte: vor dem Trefferschaden, THP dauerhaft verloren, DR nur bis nächstem Zielzugbeginn unterdrückt. Originaleffekte bleiben gespeichert. Aufladeabläufe verwenden die nativen Feature-Zähler sowie tatsächlich bestätigte Ruhe/Zugbeginn; sie lösen keine allgemeine Rast aus. Redirected Aggression und die übrigen Unterklassen bleiben offen.

Git-Zwischencheckpoint 1762c77 sichert die bisherige Grundlage; vorübergehende automatische Freigabe-Störung ist behoben. Weiterhin kein installierter Taijutsu-Release und keine Spieltests.

## Fortsetzung · 19.10.2026

Passionate Flame ist im Quellstand eingebunden: Enhanced Blows für genau eine bestätigte Angriffsaktion bzw. einen Cast, Dynamic Set-Up mit Partnerauswahl und expliziter Folgesperre, Hand Wraps, Flaming Finishers sowie Sheer Will/Indignation und das kurzzeitige Combo-/Finisher-Keyword. Beide Jutsu eines Dynamic-Paars werden normal bezahlt; Zusatzoptionen des zweiten Dialogs werden dort erneut geprüft. Der Vorgang ist kein atomarer Doppelcast: ein bereits erfolgter erster Cast bleibt bei Unterbrechung erhalten und verlangt GM-Prüfung. Keine automatische Wiederholung.

Matrix: Unbreakable Will kostet bestätigt1 Die. Freedom hat einen bestätigten gemeinsamen WIS-Vorrat für Will/Persistence, lange Rast; Flug2 Dice/Minute und bestätigte Verlängerung1 Die. Neo-Wahrnehmung verwendet die neue Aufrundungsentscheidung; der situationsabhängige Angriffs-/Schadensbonus bleibt offen. Bereits ausdrücklich bestätigte Rundungen anderer Features bleiben erhalten.

Redirected Aggression ist für normale native Originalprofile eingebunden. Komplexe gespeicherte/infundierte oder klassenabhängige Originalwirkungen werden vor Zahlung zur manuellen GM-Übertragung abgegrenzt. Persistente GM-Anfragen bleiben für fremde Ziele maßgeblich.

Taijutsu-Treffer/Focus/Devastating speichern einzelne Zufallsschritte schon vor weiteren Dialogen. Ein später abgebrochener Dialog würfelt frühere gespeicherte Saves nicht erneut. Ein technisch unterbrochener Würfelschritt bleibt zur GM-Prüfung gesperrt. Andere Klassen wurden dafür nicht auf einen neuen Ablauf umgestellt.

Gesamtklasse weiterhin **unvollständig, unveröffentlicht, nicht installiert und laufzeitungeprüft**. Maßgebliche aktuelle Restliste: audit/TAIJUTSU-IMPLEMENTATION-STATUS.json; ältere Fortschrittsabsätze sind historische Zwischenstände.

## Disturbance · 20.10.2026

Alle neun installierten Disturbance-Einträge haben jetzt einen Quellpfad bzw. die ausdrücklich manuell bleibende Aktionsdeklaration. Shatter bleibt wegen bereits abgewickelter oder fremder Sonderwirkungen teilweise manuell: bestätigte zwei Gegenangriffe, nativer CON-Save, GM-Unterbrechungsmarker, nur verknüpfte Konzentration entfernen, keine Chakra-Rückgabe. Native Folgeschäden/-effekte und Enhancement-Zielanfragen prüfen den Unterbrechungsmarker.

Unstable Core: zwei native Angriffe mit je einem Martial-Zusatzwürfel, anschließend ein STR-Save pro tatsächlich getroffener Kreatur. Flurry: gemeinsames Einmal-pro-Zug-Limit für beide Varianten; Bonusaktion/zusätzliche Reaktion bleiben manuell. Barrage: zwei ausdrücklich bestätigte Treffer einer Aktion und deren abgewickelter Schaden, native Nutzungsgrenze, CON-Save und nächste typbezogene Verwundbarkeit. Native Schadensupdates halten einen Verbrauchsmarker fest, bevor der Effekt separat bereinigt wird. Endurance senkt ausschließlich tatsächliche Disturbance-Preise über1 um1. Disturbing speichert den bestätigten verdoppelten Angriffsumfang und möglichst gleiche Zielverteilung; keine globale Aktionsökonomie.

Quellprüfung fand eine fehlende Snapshot-Freigabe im gemeinsamen Chat-Adapter: Taijutsu-Casts und virtuelle Unarmed-/Redirect-/Blows-/Disturbance-Profile sind nun ausdrücklich berücksichtigt. Das war ein bestätigter Codepfadfehler, kein behaupteter Laufzeittest. Vorbereitete Zufallswürfe lassen sich über Verwerfen/Neu-Anfragen nicht automatisch neu würfeln; Abbruch nach gespeicherten Würfen geht zur GM-Prüfung.

Keine Installation, keine Spiel-/Unit-/Browser-/Foundry-Tests. Taijutsu Specialist insgesamt weiterhin WIP; aktuelle Einzelstände in audit/TAIJUTSU-IMPLEMENTATION-STATUS.json.


## Stancer, Ruin und weitere Unterklassen · 20.10.2026

Stancer ist im Quellstand angebunden: bekannte primäre/gleichzeitige Stances, bestätigte Lernwahlen ohne Duplikate, Alpha Counter, Dodge Cancel, Muscle Memory, Blending, Stanced Combat und Stancer/The-Stancer-Castingoptionen. Die einzelnen Stance-Grundfähigkeiten bleiben ausdrücklich manuell. Auferlegte Kosten werden bei Stancer Technique ignoriert, freiwillige Zusätze bleiben bezahlt; ignorierte Void-/Disruption-Zuschläge werden beim erfolgreichen Cast verbraucht. Native Angriffsziel-AC wird nur um bestätigte Boni gesenkt, damit kein künstlicher Treffermargenbonus entsteht.

Ruin: Catalyst-Tragebestätigung, Keyword-Auswahl, Chakra/Focus Break, Disruptive Assault, Overdrive-Boni und Zusatzkeywords sowie Ruin-Conditions. Overdrive-Kurzschluss bleibt bis zur zweiten Benutzerantwort offen. Focus Break ersetzt nur für den gespeicherten Schaden den nativen Konzentrationscheck und beendet Konzentrationen nur nach tatsächlichem HP-/THP-Verlust.

Iron Heart verwendet Originalschaden vor Verteidigungen, danach die Verteidigungen des Beschützers; eigentümerspezifische GM-Anfragen, Schaden-Umleitungsmarker, tatsächlicher Original-Save bei Flächenschaden. Bewegung, nicht strukturierte Flächenwirkungen und gemischte Psychic-/Chakra-Übernahmen bleiben ausdrücklich manuell; Iron-Fury-Gegenangriffe noch offen. Hail/Gale und Matrix-Neo-Kampfboni ergänzt. Neo lässt tatsächliche Gegnerzahl/Reichweite pro passendem Wurf bestätigen. Deconstruction verdoppelt einmal bei Construct/THP; Source-Code-Ausbau bleibt offen.

Gemeinsame neue Aktionsjournale speichern Kosten, native Nutzungen, Würfelschritte, Angriffsgruppen und GM-Anfragen. Unterbrechungen werden nicht automatisch wiederholt. Originalsystem und installierte Modulversion0.16.0 unverändert. Keine Spiel-/Unit-/Browser-/Foundry-Prüfung; statische Kontrolle wird separat protokolliert. Gesamt-Taijutsu-Klasse weiterhin unvollständig.

## Fortsetzung · 21.10.2026

Tempest: Cyclone/Typhoon-Wahl, zusätzliche native Angriffsgruppen, Tornado und gezieltes Hurricane-Cleanup ergänzt. Realized Soul: Manifestation, optionale CHA-Auswahlen, Autonomous Defense/Soul Heart und Soul Flurry; eingehende Originalschäden behalten ihre Zusätze und werden gemeinsam reduziert. Lernwahl-Unterbrechungen für Stancer/Legacy lassen sich vom GM ohne erneute Item-Erzeugung abgleichen.

Nin-Tai: feste Natur, getrennte Basis-/Armor-Laufzeit, bestätigte Elemental Rush/Crush-Abläufe, Recharge und elementare Grundwerte. Elemental Armor bezahlt im Kampf automatisch nach der nativen Pool-Erneuerung einen Martial Die; fehlender Die beendet die Form. Normale Earth-THP werden nicht zusätzlich zu fremden THP addiert. Catalyst-Kurzschluss endet Overdrive und sperrt es für zehn Minuten Weltzeit; Unbreakable Catalyst verhindert den Kurzschluss. Manuelle Bestätigung für nicht strukturiert erfasste Zustände vorhanden.

Weiterhin offen: restliche Nin-Tai-/Soul-/Tempest-Wirkungen, Martial Combat, Grappler, Ultimate Battle und weitere Teilabläufe. Dies ist keine fertige oder installierte Taijutsu-Fassung. Keine Spiel-/Integrationstests; statische Prüfungen sind kein Funktionsnachweis.

### Weitere Quellfortsetzung · Martial Combat / Soul

Martial Focus, feste Master-Wahl, Seismic-Strikes-Zustand und bestätigte Expert-Trefferzähler ergänzt. Quarterstaff verdoppelt bestätigte einfache ursprüngliche Unarmed-Grundwürfel; komplexe Formeln werden nicht geraten. Nunchaku-/Tonfa-Folgeaktionen und Quarterstaff-Expert-Abwehrregeln sind noch offen. Shattering Blast speichert die gemeinsame Verteidigungszahlung und gegebenenfalls eine davon bezahlte Soul-Aktivierung als verknüpften Vorgang. Teilanwendungen verlangen GM-Prüfung. Grapple-Vergleiche bleiben auf Nutzerentscheidung ausdrücklich bestätigte tatsächlich gelungene Grapples; Chain-Grab-Abfolge noch offen. Kein Klassenabschluss und keine Spielprüfung.

### Grappler-Grundabläufe

German Suplex, Hip Throw und Headlock verwenden ausdrücklich bestätigte eigene Grapples. Ein konkret gewählter fremder Beitrag wird nicht pauschal entfernt; Headlock hängt an seinem gewählten Grapple-Anker. Native virtuelle Unarmed-Profile lassen sich ohne Angriffswurf für gespeicherten Submission-Schaden verwenden. Eigene verwaltete Taijutsu-Zielwirkungen können über einen bestätigten Eigentümer-/GM-Antrag beendet werden. Weitere Grappler-Fähigkeiten bleiben offen. Die gemeinsame Castingdialog-Erweiterung lässt sich nun auch mit ausschließlich aktivierter Taijutsu-Kategorie öffnen. Keine Spieltests.

### Weitere Quellen · Typhoon / Dragon Soul

Typhoon gewährt die belegten Grappled-/Restrained-Immunitäten als vorübergehend berechnete passive Effekte. Sein bezahlter Trefferzusatz geht gemeinsam mit dem Originalschaden durch die Zielverteidigungen und wendet Prone über denselben gespeicherten Zielvorgang an. Martial Focus ergänzt nur die drei konkret gewährten Waffenproficiencies. Revelations gibt Vorteil beim nativen Death Save; nicht auslesbare Todesauslöser bleiben offen.

Dragon Soul speichert tatsächlich vorhandene bekannte Angriffs-Ninjutsu; Auswahlgrenze und Austausch pro Klassenstufe werden geprüft. Native Casting-Klone werden vor dem Dialog umgewandelt, Inventareinträge bleiben unverändert. Tatsächliche Finisher erhalten die gewählten zwei zusätzlichen ursprünglichen Schadenswürfel. Native Lernzeit/-Checks und die öffentliche Kostenabfrage unveränderter Originalitems sind noch offen. Nature-Release-Keywords werden ebenfalls vor der Kostenanzeige an den Casting-Klon angehängt. Keine Laufzeitverifikation.

### Ultra-Instinct-Grundform

Feste ursprüngliche Sign-Wahl, normale native Nutzung oder bestätigte erneute Zahlung von 2 Martial Dice plus 5 Chakra Dice. Kami erlaubt beide Zeichen; The Ultimate Battle verlängert auf 120 Sekunden. Offensive vergrößert den tatsächlich vorbereiteten Martial-Pool und ersetzt den normalen einfachen Unarmed-Attributsbeitrag durch 1,5 × Modifikator, aufgerundet. Defensive verdoppelt Bewegung, gewährt normalen THP-Mindestwert 7 am bestätigten Zugbeginn, addiert einen Martial Die auf DEX-Saves und zieht die aufgerundete Hälfte eines Martial Die bei eingehenden Angriffen ab. Enden bei 0 verfügbaren Chakra wird für die konkrete Aktivierung hinter laufende Zahlungen gestellt, damit ein alter Journaleintrag die Form nicht erneut aktivieren kann. Dieses Verfahren wird auch für das bestätigte Soul-Ende verwendet. Weitere Ultra-Instinct-Wirkungen sind offen, insbesondere Counter, Treffermarge, zusätzliche Dice nach fehlgeschlagenem Save und kritische Treffer. Kein Runtime-Nachweis.

## Quellergänzung 21.10.2026 — Waffen, Grappler und Ultra Instinct

- Nunchaku-Folgeangriff mit nativem Waffen-Angriff und unverstärktem 1d6-Paket, auch kritisch. Gespeicherte Zielanfrage statt separater doppelter Schadensanwendung; höchstens zwei Auslöser pro gespeichertem Kampfzug.
- Break ’em Down und Martial Combat Technique ergänzt; keine künstliche Erhöhung des Angriffsergebnisses für den garantierten Treffer.
- Flying Armbar, Twister, Hammerlock und Chain-Grab-Folgeablauf mit bestätigten tatsächlichen Grapples, gespeicherten Würfen, eigenen Conditions, Befreiungsaktionen und Zielzugereignissen. Fremde Effekte bleiben erhalten.
- Mystic Awakening verwendet ausschließlich seine eigene native Nutzung, aktiviert Ultra Instinct ohne zweite Zahlung und bestätigt die exakten Auslösereffekte. Sofortzug und Angriffsnegierung manuell; Finisher erhalten den bestätigten ursprünglichen Zusatzwürfel und +1 SG.
- Klassenabschluss weiterhin offen; genauer Einzelstatus in audit/TAIJUTSU-IMPLEMENTATION-STATUS.json. Keine Spiel-, Unit-, Foundry-, Browser- oder visuellen Tests; keine Installation.

## Weitere Quellergänzung 21.10.2026 — Ironclad, Ultimate Battle und Soul

Ironclad Technique: bestätigter Reaktionscast, 1–3 Dice, normale quellenbezogene temporäre HP und Aufladungsjournal. Instinctual Defiance: eigene native Nutzungen einschließlich zweiter Nutzung ab Stufe 14, konkrete Auslösereffekte und Vorteil gegen den bestätigten Verursacher. Instinctual Strikes: bestätigte zusätzliche AC, keine Erhöhung des Angriffswerts; Ultimate-Battle-Preis halbiert und aufgerundet. Soul Heart: Casting-Klon-Reichweite und native mentale Abzüge; eigene Condition-Konversion und Soul Shatter. Serene Soul: eigene Zahlung, Soul Heart, bestätigte beseelte Gegner und gespeicherte Weakened-Folge. Soul-Force und Offensive-Sign-Margenschaden im gemeinsamen ursprünglichen Treffer. Earth Wrath / blutige Defensive Sign verhindern kritische Schadenskonfiguration vor dem Würfeln, sofern alle aktuell markierten Ziele geschützt sind; gemischte Zielgruppen bleiben manuell. Ein vorzeitiger Zugriff auf die noch nicht erstellte Treffer-Dialogantwort wurde korrigiert.

Keine Laufzeittests und weiterhin keine Veröffentlichung/Installation. Die offenen Punkte stehen im Einzelstatus.


## Quellergänzung 21.10.2026 — Matrix und verbleibende Zielabläufe

Source Code mit Bullet Time, exaktem No-Chakra-Konzentrationscheck und bestätigtem Schutzdurchbruch; ursprüngliche Würfe und getrennte Flurry-Guards-Abzüge bleiben nachvollziehbar. Automatischer Bewegungsmarker nach nativem Taijutsu; unstrukturierten Martial-Technique-Einsatz ausdrücklich bestätigen. The One mit gespeicherter Folge nach einer Minute, Serene-Soul-Folgeverwaltung, Ultra-Save-Zusatzwürfe ohne Neuwürfeln des ursprünglichen Saves, Grapple-Verknüpfungen und Combat-Versatility-Casting-Ticket ergänzt. Iron Fury erhält seine zwei Gegenangriffe nach tatsächlicher Iron-Heart-Anwendung. Hurricane erhält bestätigte Kollisionen, gespeicherten Schaden, native Saves und Prone. Wind-Kartenphysik bleibt nach Absprache manuell.

Oppressive Aura: CON-Wiederholung am Zielzugende bestätigt. Entwurf außerhalb des Moduls; Kosten-/Konzentrationsablauf noch nicht freigegeben. Klassenabschluss, Veröffentlichung und Installation weiterhin offen. Ausschließlich statische Syntax-/Importprüfung; keine Spiel-, Unit-, Foundry-, Browser- oder visuellen Tests. Maßgeblicher aktueller Einzelstatus: audit/TAIJUTSU-IMPLEMENTATION-STATUS.json.
