# Genjutsu Specialist – Gruppenfassung 0.15.0

Die implementierten Klassenabläufe sind als optionale Gruppenfassung zusammengestellt. Dies ist ausdrücklich kein Laufzeit- oder Regelabnahme-Nachweis. Keine Unit-, Gameplay-, Browser-, Visual- oder Foundry-Integrationstests: die Prüfung folgt auf Nutzerwunsch erst nach den Klassen.

## Aktivierung und Bedienung

Nach Installation Foundry vollständig neu laden. In den Moduleinstellungen „Genjutsu Specialist: Klassenautomation“ sowie für Casting „Dynamische Chakra-Kosten“ einschalten. Die Voreinstellungen bleiben aus; Weltdaten und Produktionen werden dadurch nicht automatisch geändert.

- Charakterbogen: Actualization, gespeicherte Auswahlen, Feature-Casts, Waffenformen, Misty Kit, Stopwatch und bestätigte Klassenaktionen. Es werden nur tatsächlich vorhandene Features angeboten.
- Bestehender Castingdialog: belegte Optionen wählen, tatsächliche Ziele bestätigen. Abbrechen verbraucht nichts; der native Cast bezahlt Ressourcen.
- Chatkarten: tatsächlich eingetretene Treffer-/Save-/Folgeauslöser bestätigen. Fremde Zieländerungen werden als gespeicherte GM-Anfrage angewendet. Unterbrochene Vorgänge zuerst prüfen; kein automatisches erneutes Anwenden.
- Sensory Mode: einmal tatsächliche Verbündete im Sheet festlegen. Eigene Markierungen sind für diesen Kreis sichtbar und bleiben bis manuell beendet, auch nach Verlassen der Aktivierungsreichweite. Sichtlinie bleibt die native Foundry-LOS; administrativ GM-versteckte Tokens werden nicht enthüllt. Ausschließlich aus Unsichtbarkeit/Verstecken stammende Wurfvorteile können zielbezogen entfernt werden; andere Ursachen bleiben erhalten.
- Song of the End: parallele eigene Instanzen teilen einen Konzentrationsplatz und gemeinsames Konzentrationsende.
- Lucid Dreamer: nur konkret zugeordnete Genjutsu-Zieleffekte auswählen; bestätigte Release-Eignung entfernt sie, sonst befristete Unterdrückung mit Wiederherstellung noch gültiger Effekte.

## Bewusst manuell oder begrenzt unterstützt

Dies ist eine Klassen-Erweiterung, keine Neuimplementierung sämtlicher Jutsu. Die ursprüngliche jutsuspezifische Schadens-/Zielwirkung bleibt erhalten, soweit sie im Originalsystem manuell ist.

- Aktionsökonomie, Sichtlinie-/Reichweitenbestätigung, tatsächliche Teleport-/Schablonen-/Waffenposition, Bewegung, Umleitung von Aktionen und narrative Informationen bleiben manuell.
- **No Light At The End:** Fracture-Zielmarker an der Castkarte bestätigen. Tatsächliche Zielzug-Saves, 1/2/3/4-Zuwächse, gesenkte Rang-/Konzentrations-/HS-Schwellen und Wirkkostenverdopplung werden gespeichert/berücksichtigt. Verdopplung nach normalen Rabatten vor Chakra Recovery; Molding- und fremde späte Zuschläge bleiben separat, Unterhalt wird nicht zusätzlich verdoppelt. Bestehende überzählige Konzentrationen selbst auswählen/beenden. Feindselige Zielentscheidungen und die nicht genauer definierte dauerhafte narrative Einschränkung bleiben beim GM. Dauerhafte Fractures speichern 30-Tage-Erholung, Erfolg −3; abweichenden Kalender/unterbrochenen Monatswurf vom GM bestätigen.
- Blade-Song-Paraden speichern/verbrauchen die Kopie und geben 0/halben Schaden vor; ursprünglichen Treffer entsprechend anwenden. Den ursprünglichen 1d10-Psionics-/Blade-Trefferzusatz mit dem Treffer gemeinsam abwickeln.
- Maddening Pain maximiert den bestätigten strukturierten Wurf und bezahlt fünf Chakra. Tatsächliche weitere Angriffs-Trigger bis Zugende werden als bestätigte Pain-Anfrage vorgemerkt; eine vorhandene Phantom-Pain-Wiederholung wird nicht zusätzlich verdoppelt. Nicht eindeutig zugeordnete ursprüngliche Pain-Zieleffekte gegebenenfalls manuell beenden.
- Gemischte oder nicht eindeutig zugeordnete native Jutsu-Effekte werden nicht geraten. Insbesondere unstrukturierte Conditions, bereits numerisch voraufgelöste Attributboni und Drittmodul-Eingriffe verlangen GM-Prüfung.
- Identifikation, Gedanken/Clanwissen, Verkleidung, Geräusch-/Bildgestaltung und Lern-/Downtime-Regeln benötigen den ursprünglichen manuellen Regelablauf.

Einzelumfang aller Quellen: [Featurecheckliste](GENJUTSU-SPECIALIST-CHECKLISTE.md). Aktionsökonomie bleibt ausdrücklich manuell. Jujutsu Sorcerer, Lunar Slayer, Drip Release und Ryo Master sind nicht Teil dieser Arbeit.
