# GitHub-Veröffentlichung

Das öffentliche Repository enthält das Modul direkt im Hauptverzeichnis. Lokale Welten, Sicherungen, Rohdaten des Systemaudits und Entwicklungsprotokolle gehören nicht hinein. Das installierbare ZIP enthält die Laufzeitdateien und Moduldokumentation; GitHub-Workflows und Buildskripte bleiben außerhalb des ZIP.

## Installation und Updates

Manifest: https://github.com/Kirai124/naruto-system-enhancments/releases/latest/download/module.json

Der Manifest-Link bleibt gleich. `download` verweist immer auf das ZIP einer bestimmten Version. Die ID `naruto5e-system-enhancements` bleibt unverändert, damit bestehende Einstellungen und Actor-Flags zugeordnet bleiben. Die Online-Welt wird durch das Veröffentlichen nicht aktualisiert; der Betreiber startet Installation/Update selbst in Foundrys Setup. Die vorhandene Foundry-/Systemkompatibilität ist keine Zusage für andere Versionen.

## Nächste Version veröffentlichen

1. Moduländerungen vornehmen und `module.json` aktualisieren: höhere `version` und dazu passender versionierter `download`-Link.
2. `CHANGELOG.md`, `README.md` und `RELEASE-NOTES.md` auf den neuen Stand bringen.
3. Optional lokal `python scripts/build_release.py vVERSION` ausführen. Dies prüft nur das Paket, keine Spielmechaniken.
4. Änderungen committen und mit GitHub Desktop über **Push origin** hochladen.
5. In GitHub Desktop beim Release-Commit in **History → Rechtsklick → Create Tag** den passenden Tag `vVERSION` erstellen und mit **Push origin** hochladen. Alternativ `git tag vVERSION` und `git push origin vVERSION`.
6. Unter **Actions** den erfolgreichen Lauf „Publish Foundry release“ abwarten. Er veröffentlicht `module.json`, das Modul-ZIP und `SHA256SUMS.txt` als Assets eines Releases. Einen Versions-Tag niemals zum Überschreiben bestehender Veröffentlichungen verschieben; für Änderungen eine neue Version nehmen.

Die Action nutzt ausschließlich das von GitHub bereitgestellte `GITHUB_TOKEN` mit Schreibrecht für Repository-Inhalte. Eigene Tokens oder lokale Zugangsdaten müssen nicht in Dateien eingetragen werden. Ein fehlgeschlagener Lauf wird unter Actions untersucht; vorhandene Release-Assets werden nicht automatisch überschrieben.

## Grundlagen

- [Foundry: Module Development](https://foundryvtt.com/article/module-development/)
- [GitHub: GITHUB_TOKEN](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
- [GitHub CLI: Release erstellen](https://cli.github.com/manual/gh_release_create)
