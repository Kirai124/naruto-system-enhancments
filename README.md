# Naruto 5e — System Enhancements

Optionale Erweiterungen für **N5eB – Naruto 5e Benni**, ohne Änderungen am Originalsystem.

**Version 0.17.0 · Foundry VTT 14.364 · N5eB 3.1.1**

Die vier vereinbarten Klassen sind als Implementierungsfassung integriert. **Die gemeinsame Spielprüfung durch die Gruppe steht aus.** Automationen sind standardmäßig deaktiviert und werden gezielt in den Moduleinstellungen eingeschaltet. Bekannte Grenzen sind dokumentiert; Aktionsökonomie bleibt manuell.

## Installation

In Foundrys Setup **Add-on Modules → Install Module** öffnen und diesen Link unter **Manifest URL** einfügen:

```text
https://github.com/Kirai124/naruto-system-enhancments/releases/latest/download/module.json
```

Anschließend das Modul in der Welt aktivieren und die gewünschten Kategorien konfigurieren. Die Class Mod Library ist keine Voraussetzung.

Spätere Versionen können über Foundrys Modulverwaltung aktualisiert werden. Bei einer bisher manuell installierten Fassung ohne Update-Verknüpfung einmal über den Manifest-Link installieren. Vor Updates eine eigene Weltsicherung anlegen. Die Veröffentlichung auf GitHub verändert keine lokale oder gehostete Welt.

## Enthaltene Erweiterungen

- Wiederverwendbare Chakra-Kostenberechnung und Unterhaltsreduktionen, Feature-Auswahlen und optionale Castingmodi.
- Unabhängige Dojutsu-Aktivierung, GM-Freischaltung der Sharingan-Stufen und verwaltete Effekte.
- Ninjutsu Specialist: persistente Pools und Zielzuordnungen, normale und unterstützte Unterklassen-Moldings, bestätigte Zielanwendung.
- Genjutsu Specialist: Actualization, Mirages und Klassen-/Unterklassenabläufe.
- Medical-Nin: Heilung, Chakra Scalpel, Doctrines und vorhandene Unterklassen.
- Taijutsu Specialist: Martial Dice, Martial Techniques und die 14 installierten Unterklassen.
- Persistente GM-Anfragen für Wirkungen auf fremde Actors sowie dokumentierte öffentliche Erweiterungs-APIs.

Drip Release und Ryo Master bleiben ausgeschlossen. Weitere ausgeschlossene Klassen stehen in [PROJEKTUMFANG.md](PROJEKTUMFANG.md). Nicht strukturierte Jutsu-/Stance-Grundwirkungen, Kartenphysik und dokumentierte Bestätigungen bleiben manuell.

## Bedienung und Dokumentation

| Bereich | Anleitung |
|---|---|
| Ninjutsu | [Gruppenfassung](NINJUTSU-0.14-NUTZUNG.md) · [Unterklassen-Moldings](SUBCLASS-MOLDINGS.md) |
| Genjutsu | [Gruppenfassung](GENJUTSU-GRUPPENFASSUNG.md) |
| Medical-Nin | [Gruppenfassung](MEDICAL-GRUPPENFASSUNG.md) |
| Taijutsu | [Gruppenfassung](TAIJUTSU-GRUPPENFASSUNG.md) |
| Erweiterung | [API](API.md) · [Architektur](ARCHITECTURE.md) |
| Status | [Features](FEATURES.md) · [Audit](AUDIT.md) · [Prüfstatus](TESTING.md) · [Changelog](CHANGELOG.md) |
| Veröffentlichungen | [Release-Ablauf](PUBLISHING.md) · [GitHub Releases](https://github.com/Kirai124/naruto-system-enhancments/releases) |

Fehler bitte mit Modul-, Foundry- und Systemversion sowie nachvollziehbarem Ablauf unter [Issues](https://github.com/Kirai124/naruto-system-enhancments/issues) melden; keine persönlichen Welt- oder Zugangsdaten anhängen.
