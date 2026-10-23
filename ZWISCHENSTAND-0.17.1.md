# 0.17.1 · Klassenfenster und lokale Cast-Prüfung

Diese Zwischenversion enthält die bisherigen Medical-Korrekturen sowie kompakte Fenster für Ninjutsu Specialist, Genjutsu Specialist, Medical-Nin und Taijutsu Specialist. Im Features-Tab steht pro vorhandener Klasse ein Button. Die jeweilige Enhancement-Kategorie muss in den Moduleinstellungen aktiviert sein; vorhandene Einstellungen und Standardwerte werden nicht automatisch verändert. Die Fenster ersetzen die großen Klassenflächen, enthalten aber dieselben bestätigten Aktionen und Journale. Aktionsökonomie bleibt manuell.

## Geprüft

- Vier echte Fenster: je ein Launcher, keine alten großen Aktionsflächen; Fensteröffnung ohne Ressourcenverbrauch.
- Native Casts aller vier Klassen: vorher 195, danach 190 Chakra, je eine gespeicherte Castkarte. Ninjutsu: Medical Release Healing Elixir; Genjutsu: Soft Spoken Song; Taijutsu: Ripple of Fire Falcon Kick; Medical: Healing Elixir. Diese Testfiguren sind von den Spielcharakteren getrennt.
- Taijutsu-Angriff und beide nativen Heilwürfe nach Cast ausgeführt; kein automatischer Zielschaden aus diesen Prüfungen.
- Ninjutsu-Popup: Void Shard nach bestätigtem passenden Cast von 0 auf 1; persistenter Zähler und Fenster aktualisieren sich. Suche ohne Treffer und farbige Darstellung geprüft.
- Fire-Nin-Tai: keine fremden Lightning-/Wind-/Water-Folgeaktionen; aktive Form/Armor und tatsächlicher Featurebesitz werden berücksichtigt.
- 17 gezielte Tests bestanden; Gesamttest 204/238, weiterhin 34 bekannte ältere Fehlschläge. Keine neu hinzugekommenen Fehlschläge gegenüber 2b02d88. Syntax/ESM: 361 Module.

## Grenzen

Kein vollständiger Einzeltest aller Klassenfähigkeiten und kein Funktionsnachweis auf FoundryServer.com. Die ältere Online-Castblockade wurde dort weder reproduziert noch auf eine bestimmte Ursache zurückgeführt. Diese Fassung setzt wie bisher Foundry 14.364 und N5eB 3.1.1 voraus. Originalsystem und Class Mod Library bleiben unverändert. Der Volltest ist wegen der dokumentierten älteren Fehler nicht grün.

## Für GitHub

Im lokalen Repository liegen der aktualisierte Quellstand und die Release-Dateien unter dist. Zuerst den vorbereiteten Commit mit GitHub Desktop pushen. Dann einen Release mit Tag **v0.17.1** auf diesem Commit anlegen. Die vorhandene Tag-Workflow erstellt die Assets; bei manueller Veröffentlichung ZIP und module.json aus dist als Release-Assets anhängen. Ein Git-Commit allein stellt noch keine Foundry-Download-Assets bereit.

Benötigte Assets: **naruto5e-system-enhancements-0.17.1.zip** und **module.json**. Der Manifest-Link bleibt https://github.com/Kirai124/naruto-system-enhancments/releases/latest/download/module.json. Er liefert 0.17.1 erst, wenn dieser Release mit seinen Assets veröffentlicht wurde. Kein automatisches Update der Produktionswelt durch diese Arbeit.
