# Medical-Nin · 0.16.0

Stand 18.10.2026: Implementierungsrunde abgeschlossen, **nicht spielgeprüfte optionale Gruppenfassung**. Keine Unit-, Foundry-, Browser-, visuellen oder Gameplay-Tests ausgeführt. Kompatibilitätsbereich: Foundry 14.364 / n5eb 3.1.1. Die gemeinsame Prüfung übernimmt die Gruppe nach den Klassenimplementierungen.

## Bedienung

Nach Installation die lokale Welt neu laden und bei Bedarf die Weltoption „Medical-Nin: Klassenautomation“ aktivieren. Sie ist standardmäßig aus. Kostenrabatte benötigen zusätzlich dynamische Chakra-Kosten. Klassen- und Unterklassenfeatures müssen tatsächlich auf dem Actor vorhanden sein; reine Kompendiumseinträge verleihen nichts.

Im Features-Tab erscheinen passende Medical-Aktionen, gespeicherte Auswahlen, Scalpel-/Waffen- und Begleiterkontrollen. Castingoptionen ergänzen den bestehenden Dialog. Heilung oder Schaden zunächst würfeln und anschließend die passende Medical-Chataktion verwenden, bevor der Originalbetrag separat angewendet wird. Original und Zusatz werden gemeinsam durch die Zielverteidigungen geführt. Fremde Ziele erhalten gespeicherte Anfragen zur bestätigten GM-Anwendung. Unterbrochene Zahlungen/Teilanwendungen werden zur Prüfung gesperrt; nicht blind wiederholen.

## Implementierter Umfang

| Bereich | Quellseitige Einbindung |
| --- | --- |
| Grundklasse | Sichtbare Tabellenprogression; Medical-Attribut; Channeled Healing; Preserve-/Take-Life-Pool, Verteilung und Zielgrenzen; Rejuvenating Rest; Research-Kennzeichnung durch GM; Gifted-/Supreme-Heilwürfel; separate benannte temporäre HP |
| Doctrines | Long Life mit gemeinsamer Empfängergrenze/Rast; Not Allowed To Die mit tatsächlichem Auslöser; Until Their Heart Stops mit bestätigtem Condition-Beendigungswurf; Never On The Front Lines bleibt manuelle Bewegung/Aktionsökonomie |
| Shaman | Virtuelle Spiritual Weapons aus realen Waffenprofilen; Eigenschaften/WIS; Hex-Zuordnung, Transfer und Laufzeit; Hexing Smite; gezielte Vorteilsentfernung vor Take Life; Draining-Gegenangriff/Heilung; Master Of Hexes auch bei ausdrücklich mit aktiver Spiritual Weapon gewirktem Bukijutsu |
| Transmuter | Altered Strength, Auswahlen/Ressourcen, gemeinsame Empfängergrenze, Rebuilt Fortitude, Transmuted Self, kostenlose Selbstvorteile des Capstones; Trefferzusatz und Preserve-Variante |
| Combat Medic | Profizienzen, optionale WIS-AC, Scalpel-Angriffswechsel; Combat-Medic-Treffer; Yin-Motes, bezahlte Angriffsaktion, Release, Folgecast und Regeneration; Combat Prowess erst nach vollständigem auslösendem Treffer |
| Natural Medicine | Natural-Healing-Pool; bestehendes Summon-Profil für Transformation und Avatar; Dampen Pain; Guardian-Ziele; Protector-S-Rang-Reaktionscast mit eigenem Ressourcenjournal und bestehendem Profil |
| Black Medicine | Tainted Hands, Poison-/Acid-Modifikatoren, Toxic Tongue, Touch of Terror; gespeicherte Poisonous-Touch-SGs und Wiederholungs-Saves; Plague-/Venomous-Boni in unterstützten nativen/verwalteten Condition-Abläufen |
| Adept Medic | Vorhandene Jutsu-Grants erhalten; Breath/Talented, Healing Touch und Auswahlrabatte, Mending-Zusatzpool, Unmatched Release, tatsächliche Healing-Ascension-Auslöser und Over Heal |
| Elemental Medicine | Release-Auswahl; Beginning/Traces/Expert; benannte Earth-HP und andere Nature-Wirkungen; Adapt-Folgecast; Elemental-Power-Aufstufung; Master nimmt stärksten Rangbonus und beendet alle Marker; Regrowth-Verteilung |
| Counselor-Nin | Gespeicherte Skills, Therapeutic-Auswahlen/Attribut; Consolation/Caring Touch, Mindful Insight und Folgehaltung; Assisted Coping; Psyche-Zuordnung, Schaden/Immunitätsgrenzen; Mental Master |
| Chakra Scalpel Specialist | Studium, Medicine-Mastery, hälftiger HP-/Chakra-Schaden vor Verteidigungen, Chakra Sever, Combat Scalpel, bestätigte Surgical Precision, Sabre mit 15 Fuß und Chakra-Zusatzschaden |
| Diamond Heart | Tatsächliche Actor-Verknüpfung, Attribut-/Save-Boni, Platinum-Profil, Fist-Aktionen, Constructive-Reserven, Universal Restoration, Unbreakable, Requiem; gemeinsame Saves mit höherem Bonus und genau einem ausgewählten Empfänger |
| Spiritual Scribe | Fortifying AC/Resistenz/Unterhalt und Schadensaufteilung; bestehende Golem-Profile/Rollen, Echoes-Erholung, Litany, Disruption, Enchantment, Mastercraft-Gruppen/Kommando und Conjourer-Limit |

## Bestätigte Abgrenzungen

- Freie zusätzliche Rangstufen: Wirkkosten nach bezahltem Rang, normaler Unterhalt nach höherem Wirkungsrang. Scalpel-Tai wechselt nur den Angriff, nicht den gewählten Medical-Schadensmodifikator.
- Chakra-/HP-Aufteilung vor den getrennten Verteidigungen; ungerader Rest auf HP. Sabre-Zusatzchakra basiert auf HP-Schaden nach Verteidigungen vor temporären HP, danach eigene Chakra-Verteidigungen.
- Temporäre HP behalten Quellen. Stones Tenacity wird zuerst verbraucht, danach kurzlebige Anteile. Ablauf entfernt nur unverbrauchten eigenen Rest; fremde Heilung füllt Constructive-Reserven nicht auf.
- Yin Seal: Release benötigt tatsächlich sieben Motes, kein erfundenes Pool-Upgrade. Eine Zwei-Mote-Verstärkung gilt für eine manuell beendete Angriffsaktion.
- Diamondheart öffnet die ursprünglichen Wirkerabläufe und bezahlt dessen Ressourcen. Gemeinsamer Save: beide sind tatsächlich vom selben Effekt betroffen; einen Empfänger auswählen. Native Schäden und Effekt-Anwendung sowie verwaltete Zielanfragen berücksichtigen diese Auswahl.
- Stone Will halbiert bestätigte zusätzliche Construct-/Struktur-Anteile bzw. Multiplikatoren wörtlich abgerundet, Multiplikator mindestens eins. Echoes erstattet bei kurzer Rast die abgerundete Hälfte verbrauchter Nutzungen.

## Verbleibende manuelle Schritte und Grenzen

Diese Grenzen sind Teil des freigegebenen Umfangs, kein Laufzeitnachweis:

- Aktionsökonomie, Reichweiten/Sichtlinien, tatsächliche Treffer, Kampfsituationen, Bewegung, freie Hände und zusätzliche Angriffe werden von der Gruppe bestätigt. Außerhalb des Kampfes sind echte Zuggrenzen manuell zu bestätigen.
- Stance-/Klassenwahl, native Grants und Ability Score Improvements bleiben im ursprünglichen System. Die vier belegten Doctrines sind eingebunden; eigenständige fehlende Tenet-Texte sind ausdrücklich ausgenommen. Keine neuen Regeln aus Namen ableiten.
- Beschwörungen/Konstrukte benötigen vorhandene tatsächliche Actors. Token werden von euch platziert; Profile, unstrukturierte Jutsu-spezifische Sonderaktionen, Erscheinung und Transformationsmerkmale werden nicht erfunden. Strukturierte Attribute/Verteidigungen des bestätigten Profils werden angebunden; unstrukturierte Merkmale bleiben manuell. Avatar behält eigene HP/AC und erhöht nur tatsächlich höhere Attribute.
- Bedingter Vorteil/Nachteil muss im nativen Würfeldialog anhand der tatsächlichen Situation bestätigt werden. Gemischte/unbekannte externe Effekte und Conditions ohne Herkunft/Rang benötigen explizite GM-Bestätigung. Beliebige Fremdmodule sind nicht automatisch unterstützt.
- Unbreakable lehnt eingehende Karten mit bereits laufendem anderem Medical-Spezialtrefferjournal zur gemeinsamen GM-Prüfung ab, statt unvollständigen Originalschaden umzuleiten. Normale vollständige Schadenskarten besitzen den gespeicherten Umleitungsablauf.
- Protector bei höchstens 30 verfügbaren Chakra unterstützt zunächst den eigenen Alle-Chakra-Cast ohne zusätzliche optionale Molding-/Recovery-/Technical-/Frenzy-Kombination. Solche Kombinationen benötigen eine eigene Regelabgrenzung. Profil-/Gefahrenende wird ausdrücklich bestätigt.
- Vorhandene unklare überlappende Alt-HP-Pools werden zur GM-Prüfung gemeldet, nicht zerstörend migriert.

Die 98 Quellfeatures sind in MEDICAL-SPECIALIST-CHECKLISTE.md und audit/MEDICAL-IMPLEMENTATION-STATUS.json mit verbleibenden Grenzen erfasst. Regeln: audit/MEDICAL-DECISIONS.json. Externe Profile: audit/MEDICAL-EXTERNAL-SOURCES.json.
