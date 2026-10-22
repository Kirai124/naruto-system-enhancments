# Ninjutsu Specialist — Abschlusscheckliste

Stand: 0.14.0, 2026-10-15. Neue Abläufe sind implementiert, aber auf Nutzerwunsch nicht spielgetestet. Priorität auf ausdrücklichen Nutzerwunsch vor anderen Klassen.

Umfang: 9 Basisklassen-Grants und 116 Unterklassen-Grants in 16 installierten Traditionen. Das sind Inventareinträge, keine Zahl bestätigter Fehler. Die beiden früher unaufgelösten Basis-Grants sind Padded Cloth und D-Rank Jutsu Scroll (Startausrüstung). Weitere wählbare Efficient-Molding-Items müssen zusätzlich auf Vollständigkeit geprüft werden.

Die Liste ist eine vollständige Zuordnung der inventarisierten Klassen-Grants, keine Behauptung einer abgeschlossenen Regelprüfung oder Klassenautomation. Die neuen Zuordnungen beruhen auf Quellprüfung und Nutzerentscheidungen; der Laufzeitnachweis durch die Gruppe steht aus. Manuelle Anteile sind ausdrücklich benannt. Originalsystem und Class Mod Library bleiben unverändert.

## Umsetzung und bewusst manuelle Anteile

Die vollständige Bedienung und Einschränkungen stehen in [NINJUTSU-0.14-NUTZUNG.md](NINJUTSU-0.14-NUTZUNG.md). Alle 0.14-Einträge sind ohne Spiel-/Integrationstest. Ältere Moldings bleiben im Umfang von 0.13 erhalten.

## Ursprüngliche Reihenfolge

1. Chakra Recovery und stufenabhängige Nutzungen; native Ressourcen- und Abbruchtests.
2. Persistente Refined-Ninjutsu-Auswahl und optionaler SG-/Schadensbonus; später Ninjutsu Master auf derselben Auswahlgrundlage.
3. Castingverbrauch von Void Shards, Lightning Motes und Elemental Motes; Zielwirkungen mit GM-Anwendung.
4. Ember-DR und Efficient Molding einschließlich gemeinsamer Nutzungen, Alternativkosten und Unterklassen-Ausnahmen.
5. Übrige Traditionen featureweise prüfen, implementieren oder ausdrücklich als manuell/nativ geführt dokumentieren.

Aktionsökonomie bleibt manuell. Auswahl/Abbruch verbrauchen nichts. Unklare Mechaniken werden mit dem Nutzer abgestimmt. Refined: +1/+2/+3 SG oder Zusatzwürfel; Chakra Recovery: normale reduzierte Wirkkosten halbieren und abrunden, kein zusätzlicher Unterhaltsrabatt. Beide Regeln sind bestätigt.

## Basisklasse

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 1 | Padded Cloth | Nativ: Startausrüstung, kein fehlendes Klassenfeature. | `Compendium.n5eb.items.Item.PXA5xkWhB5D1y2ZL` |
| 1 | D-Rank Jutsu Scroll | Nativ: Startausrüstung, kein fehlendes Klassenfeature. | `Compendium.n5eb.items.Item.hJoSys7R14ImfKOs` |
| 1 | Chakra Recovery | 0.10.0: optionale Halbierung, Nutzungsstufen; Tests siehe TESTING.md. | `Compendium.n5eb.class.Item.n5ebChakraRec001` |
| 1 | Refined Ninjutsu | 0.14: Tai-/Buki-Berechtigung ergänzt; automatische Tai-/Summoning-Zusätze außerhalb des Limits. Ungetestet. | `Compendium.n5eb.class.Item.n5ebRefinedNin01` |
| 2 | Ninjutsu Tradition | Nativ: Unterklasse über vorhandene Advancements wählen. | `Compendium.n5eb.class.Item.8UOa5UYIlSPNBHAj` |
| 3 | Efficient Molding | 0.12/0.13: 17 normale sowie 27 Casting-/4 Adaptive-Unterklassen-Moldings; Drip/Ryo ausgenommen. | `Compendium.n5eb.class.Item.FsvDzBMGBKvUj93O` |
| 5 | Jutsu Breaker | 0.14: bestätigter Reaktions-Cast und nativer Clash, skalierende Nutzungen. Gegnersituation bestätigen. Ungetestet. | `Compendium.n5eb.class.Item.pSfnPm1YPdJ90FPq` |
| 20 | Ninjutsu Master | 0.14: persistente Auswahl; nur ursprüngliche Jutsu-Würfel maximieren. Ungetestet. | `Compendium.n5eb.class.Item.aNQYv3wrvql1jL5o` |
| 4 | Ability Score Improvement | Nativ: Attributssteigerungen/Feat-Wahl über vorhandene Advancements. | `Compendium.n5eb.class.Item.3R6ULWi6YDL3qyIf` |

## Storm Terror

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Wind Release | 0.14: situativer Ninshou-Würfel, Reichweiten-/Flächenauswahl. Lernen bleibt nativ/manuell. | `Compendium.n5eb.subclass.Item.ZbYbe11Y9Q7mZRLy` |
| 2 | Wind Adept | Breeze-Tracker / Bleeding; Auslöser und tatsächlich betroffene Ziele bestätigen. | `Compendium.n5eb.subclass.Item.XRQqZDduw90wOBMy` |
| 6 | Storm Herald | 0.14: native Condition-Schadensformeln bestätigter Ziele, Nutzung; ohne native Formel kein erfundener Schaden. | `Compendium.n5eb.subclass.Item.4mvSAXytajbEbUdf` |
| 6 | Swirling Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.1tECAZbpXI7zjOHn` |
| 10 | Unstoppable Gale | 0.14: bestätigte fliegende Ziele / Fluggeschwindigkeit; gegnerischen Fire-Clash-Vorteil manuell unterdrücken. | `Compendium.n5eb.subclass.Item.8k7hPdLfq6BCMiMu` |
| 14 | Wind Release Master | 0.14: Kosten ×2, Reichweite ×2, bestätigter Save-Fehlschlag um 5: Schaden ×2; zusammen mit Gale ×4. | `Compendium.n5eb.subclass.Item.hwIkW0YWjeYXblIm` |
| 18 | Storm Terror Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.flr5CUeuCg78QuYG` |

## Blaze Walker

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Fire Adept | 0.14: Ember-Schaden oder eine Marke für additive DR−4; außerhalb Kampf manuell beenden. | `Compendium.n5eb.subclass.Item.q2jgw4auBTlE79bk` |
| 2 | Fire Release | 0.14: Ninshou-Würfel, zusätzliche Fire-Würfel, bestätigtes Zurückstoßen; Tokenposition manuell. | `Compendium.n5eb.subclass.Item.m0LySRt20oFw78cs` |
| 6 | Crimson Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.jTSSx56FyWeoKTds` |
| 6 | Flash Fire | 0.14: optionale Nutzung, einmaliger Attribut-/Stufenzusatzschaden; verstärkte Variante wählbar. | `Compendium.n5eb.subclass.Item.9IBQmBuMcDM85Nri` |
| 10 | Inferno Fury | 0.14: bestätigter Plant-Multiplikator / Zusatzschaden; gegnerischer Water-Clash-Vorteil manuell. | `Compendium.n5eb.subclass.Item.dP9zaDf8dOqwRign` |
| 18 | Blaze Walker Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.qpAWP56V3NQDpLM8` |
| 14 | Fire Release Master | 0.14: Kosten ×2, Burned-Save-Nachteil und bestätigter Originalwürfel-Zusatzwurf. | `Compendium.n5eb.subclass.Item.f91fvWJPf30Lub25` |

## Sanguine Master

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Hemomantic Specialization | 0.14: Kontextcheck, zeitbegrenzte THP oder bestätigter zusätzlicher Corroded-Rang. | `Compendium.n5eb.subclass.Item.hX11srfvzgQlBhQb` |
| 2 | Lifeforce Casting | 0.14: Blood-Vial-Pool, Zusatzwürfel, SG oder Kostenrabatt. | `Compendium.n5eb.subclass.Item.aFZFPHSCAb8WgiKF` |
| 6 | Bloody Evocation | 0.14: Schadenskonversion / gespeicherte Condition-Konversion und Schadensart; Corroded-Schaden ausdrücklich manuell. | `Compendium.n5eb.subclass.Item.LlgdDqZHb7cG0NEP` |
| 6 | Macabre Techniques | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.0ZpgECWwswu7z3SF` |
| 10 | Destructive Ichor | 0.14: einmaliger Attributschaden, bestätigter Condition-Rang oder Clash mit einem Blood Vial. | `Compendium.n5eb.subclass.Item.Jo3jYL3zl4n0hQFT` |
| 14 | Sanguine Elite | 0.14: Ziele nach Vials, Kosten ×2 und Recovery-Sperre. | `Compendium.n5eb.subclass.Item.LySovDVhQ5wwRD2C` |
| 18 | Sanguine Master Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.JCOBMk3Fdp0LHQGV` |

## Lightning Breaker

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Lightning Release | 0.14: situativer Check, bis zwei bestätigte Angriffsboni / bestätigter Overcharge-Rabatt. | `Compendium.n5eb.subclass.Item.SnFB2RKnmhbkij5G` |
| 2 | Lightning Adept | Pool und Basisverbrauch; spezielle höhere Regeln in den zugehörigen Features. | `Compendium.n5eb.subclass.Item.zavWoZI5pO9y10nC` |
| 6 | Lightning Tamer | 0.14: Nutzung/Chakra Die und höhere Zusatzmotes; tatsächliche Overcharge-Wirkung ausdrücklich manuell. | `Compendium.n5eb.subclass.Item.UhpTUroozkJ2lyWK` |
| 6 | Gigawatt Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.IFp5CjcRfqXY2GzX` |
| 10 | Wrathful Jolts | 0.14: 18–20-Krit / bestätigter maximaler Originalschaden; gegnerischer Wind-Clash-Vorteil manuell. | `Compendium.n5eb.subclass.Item.ni3mPngYGx0BdL7O` |
| 14 | Lightning Release Master | 0.14: optionale Nutzung, Shocked-Kontext für Angriff/Save, native Shocked-Saves; Overcharge-Motes. | `Compendium.n5eb.subclass.Item.EJPTBEsUuQn6F9XE` |
| 18 | Lightning Breaker Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.YQ8A0n506YCmKB0w` |

## Tsunami

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Water Release | 0.14: Kontextcheck, gespeicherte Wasserquelle oder Rang-THP. | `Compendium.n5eb.subclass.Item.GjmoJoGDyoRRTQ4W` |
| 2 | Water Adept | 0.14: Rain-Blade-Pool; Chilled, Reaktions-DR, bestätigte manuelle Verschiebung. | `Compendium.n5eb.subclass.Item.J93qivZsfgmjOANW` |
| 6 | Frigid Deep | 0.14: bestätigte Bewegungsreduktion; mit Master auf 0. | `Compendium.n5eb.subclass.Item.ppFk6EhJgB3iJ49b` |
| 6 | Raining Vortex | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.z1yJZQP8vJj7465t` |
| 10 | Aqua Soul | 0.14: B-Rang-Wasserquelle mit zwei Nutzungen / einmaliger Zusatzschaden; gegnerischer Earth-Clash-Vorteil manuell. | `Compendium.n5eb.subclass.Item.5B09LQZNREV1GwVy` |
| 14 | Water Release Master | 0.14: Kosten ×2 und 3d20 niedrigstes Ergebnis; Water-Saves ohne Vorteil. | `Compendium.n5eb.subclass.Item.eeOzlCfC7uSYUyuN` |
| 18 | Tsunami Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.YHToxugNXeYhONgO` |

## Trace Talent

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Void Specialization | 0.14: Kontextcheck; gespeicherter −3-Malus auf genau einen bestätigten betroffenen Konzentrations-/Clash-Check. | `Compendium.n5eb.subclass.Item.cpx0CkuwPFbPk8fW` |
| 2 | Void Adept | Shard-Pool und Basisverbrauch; Zuschläge pro Verursacher am Ende der Wirkkosten. | `Compendium.n5eb.subclass.Item.n6BSSlSie5m8osNz` |
| 6 | Limitless Casting | 0.14: bestätigtes Zwei-Jutsu-Paket, Nutzungen/Chakra Die, Zielbindung und Teilfehlerjournal. | `Compendium.n5eb.subclass.Item.CqCr7Qzb4Fzlw0cK` |
| 6 | Void Break Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.8v2XDdTFgHZxbrUV` |
| 10 | Pure Chakra | 0.14: eigene temporäre Resistenzaufhebung, einmaliger Zusatzschaden oder nativer Clash-Vorteil. | `Compendium.n5eb.subclass.Item.k8riVTzSwcL3La3q` |
| 14 | Kiyo | 0.14: bestätigter Verbündetenschutz für nächsten Nin-/Gen-Save; halber ursprünglicher Folgecast-Preis. | `Compendium.n5eb.subclass.Item.OVgkhADgCjTbeZmY` |
| 18 | Talent Voider | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.uQ6pcveomHxxR3bT` |

## Hijutsu Elitist

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Hijutsu Specialization | 0.14: Kontextcheck, Reichweite oder Rangrabatt. | `Compendium.n5eb.subclass.Item.M686HouImnr5mnBb` |
| 2 | Hijutsu Adept | 0.14: Inertia-Pool; Unterhalt, Komponenten, bestätigte reale Clan-Ressource. Konkrete Clanwirkung nativ/manuell. | `Compendium.n5eb.subclass.Item.avUVKt697NWEUl8R` |
| 6 | Deadly Tradition | 0.14: Schadensminimum Hälfte abgerundet, Immunitäten wirksam; begrenzter bestätigter Reaktions-Cast. | `Compendium.n5eb.subclass.Item.yxHNfgpzggl2wD39` |
| 6 | Generational Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.W2jgpr6lqO3PordB` |
| 10 | Generational Greatness | 0.14: bestätigte Inertia bis zweimal/Runde, doppelte Upcast-Schritte oder Clash-Vorteil. | `Compendium.n5eb.subclass.Item.WjgaDdUTeIcMVVRW` |
| 14 | Hijutsu Master | 0.14: Resistenz ignorieren, doppelte Reichweite/Fläche; Bonusaktions-Jutsu für bestätigte Deadly-Reaktion. | `Compendium.n5eb.subclass.Item.GsXzY40NXQv7tnjc` |
| 18 | Elitist Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.UFt8nmhcCFZTEbqq` |

## Summoner

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Empowered Summoning | 0.14: vorhandene Actors verknüpfen, Summoning-Rabatt/Angriffsboni, bestätigter Chakra-Die-Slotersatz. | `Compendium.n5eb.subclass.Item.t6B8MNIn54JOVGsw` |
| 2 | Summoners Will | 0.14: PB-Nutzungspool, echter Chakra Die und GM-bestätigte Wiederherstellung eines zugeordneten Slots. | `Compendium.n5eb.subclass.Item.xXoIERtvvLXAJUr8` |
| 6 | Summoning Adept | 0.14: Refined ohne Combination, zusätzliche gemappte Slots, schnelle Beschwörung mit Nutzung/CD. | `Compendium.n5eb.subclass.Item.MlSuzoqymVCEePFQ` |
| 6 | Combination Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.MuR98WjSrOwyAcHb` |
| 10 | Summoning Expert | Manuell: zwei verschiedene Ränge, 120-Fuß-Grenze und Kommandos. Zuordnungsdaten vorhanden; keine Aktionsökonomie. | `Compendium.n5eb.subclass.Item.7NjBk2HAHtYFsFC0` |
| 14 | Summoning Master | 0.14: bekannte Jutsu bis C auf verknüpfte bestehende Beschwörung übertragen; Initiative/Kommandos/Bonusaktion manuell. | `Compendium.n5eb.subclass.Item.Nwz3ERhVhfb4uuL3` |
| 18 | Synchronization Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.H4qC14P0PcyzR4yZ` |

## The Professor

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Versatile Release | 0.14: Release-Auswahl, Kontextcheck, bestätigte Angriffsboni oder typbezogene DR umgehen. | `Compendium.n5eb.subclass.Item.bWWP40HVjtgDOg9g` |
| 2 | Elemental Adept | Pool/Basisverbrauch einschließlich separat nachgeführter Professor-Chakra. | `Compendium.n5eb.subclass.Item.Odji8s2fVtc7WmOY` |
| 6 | Twin Cast | 0.14: Paket aus verschiedenen Releases, fünf Motes, Nutzungen/Short-Rest-Erholung; Initiative ausdrücklich opt-in. | `Compendium.n5eb.subclass.Item.4qlL2aqMQlyEWM6L` |
| 6 | Chakra Infusion Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.McL3TQgvNHkGErkF` |
| 10 | Force Of Nature | 0.14: zusätzlicher Mote/Runde, einmaliger PB-Schaden oder bestätigter einzelner Clash-Neuwurf. | `Compendium.n5eb.subclass.Item.A7TEFSlIvs3NFjSh` |
| 14 | Soshikage | 0.14: Drei-Jutsu-Paket mit verschiedenen Releases oder bestätigter Zusatzschaden beim Fünf-Mote-Cast. | `Compendium.n5eb.subclass.Item.PD4RsxqylJlRbJle` |
| 18 | The Final Lesson | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.nDuHM89lGdJG1YtX` |

## Stone Crusher

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Earth Release | 0.14: Kontextcheck, bestätigte Konstrukt-HP oder typbezogene DR. | `Compendium.n5eb.subclass.Item.6k3tzrVimrHisn7E` |
| 2 | Stone Adept | 0.14: ausdrücklich aktivierbarer HP-Bonus und Solid-Gem-Pool; keine doppelte manuelle HP-Erhöhung. | `Compendium.n5eb.subclass.Item.tQ7i0o9eKWejvMpR` |
| 6 | Mountain's Aegis | 0.14: Hälfte Klassenstufe abgerundet; stärkste Aegis reduziert, danach alle Aegis beendet. | `Compendium.n5eb.subclass.Item.ZbqnFIjuG7GgPHnT` |
| 6 | Tectonic Plate Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.JbLpz96Yy7nVH52c` |
| 10 | Stones Tenacity | 0.14: eigener zeitbegrenzter THP-Anteil, zuerst verbrauchen; Gem-THP bleiben erhalten. | `Compendium.n5eb.subclass.Item.p5DyeI5VLRmbgI3S` |
| 14 | Earth Release Master | 0.14: drei Aegis-Ziele, Kosten/Reichweite ×2 oder Konstrukt-HP/DR verdoppeln; Geländewege manuell. | `Compendium.n5eb.subclass.Item.aDQGlishJy4OPG9X` |
| 18 | Stone Crusher Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.88xcRl0tWX5LcA1c` |

## Scribe Master

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Fuinjutsu Specialization | 0.14: Kontextcheck, Komponenten ignorieren oder bestätigter Chakra-Schaden nach Sealed-Rang. | `Compendium.n5eb.subclass.Item.sCDQl1K2kbtDdBcN` |
| 2 | Awakened Scroll | 0.14: persistente Seals mit Quellen, gehaltenem Zustand, Castingkopien, Verbrauch und Kontext-Konzentrationsvorteil. | `Compendium.n5eb.subclass.Item.VdcDjo20kTnNAk9i` |
| 6 | Seal Consumption | 0.14: bestätigter feindlicher Ursprung, nativer Check und Nutzung; Counter/ursprünglichen Schaden manuell abgleichen. | `Compendium.n5eb.subclass.Item.gSpIje044gB1Fski` |
| 6 | Seal Break | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.JDRPCzXornnoYkx6` |
| 10 | Realized Scroll | 0.14: einmaliges Behalten, Rangrabatt oder Clash-Vorteil; Kommunikations-/Handhabungsregeln manuell. | `Compendium.n5eb.subclass.Item.En8NLtBmpFoZwAJX` |
| 14 | Fuinjutsu Sennin | 0.14: Source-Release-Konversion / bestätigter unmittelbarer Rückcast; Telepathie/Position manuell. | `Compendium.n5eb.subclass.Item.6aavhj02FAWj8WL6` |
| 18 | Scribe Master | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.subclass.Item.KCzg0AOoJJckf1om` |

## Ink Painter

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Ink Affinity | 0.14: literal S−4 auf Stufe 13, Checkvorteil, bestätigte Summon-THP; Lernzeiten manuell. | `Compendium.n5eb.t7-subclass.Item.BnCSSaBzRPvi3owW` |
| 2 | Ink Adept | 0.14: Sketch-Pool, Cast-/Kommandoschaden, GM-bestätigtes Help/Dodge; Disengage/Position manuell. | `Compendium.n5eb.t7-subclass.Item.o2AdqhbWnCNvYDBe` |
| 6 | Refined Art | 0.14: verknüpfte Ink-Summon-AC/Angriff/Schaden/DR/Bewegung; keine automatischen neuen Actors. | `Compendium.n5eb.t7-subclass.Item.OfNFL1iaJt0azxlO` |
| 6 | Painter's Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.syr9JG8aqbCA9IWg` |
| 10 | Glorious Art | 0.14: verknüpfte HP, ASI-Punkte vermerkt, bestätigter Ersatzcast mit Nutzung; ASI-Verteilung/Position manuell. | `Compendium.n5eb.t7-subclass.Item.xK3vAwukEI115z5r` |
| 14 | Art Master | 0.14: bestätigte Ink-Konzentration nicht verlieren; Zwei-Summon-Kommando bleibt manuell. | `Compendium.n5eb.t7-subclass.Item.1K0Jv8ywSxm1GMzm` |
| 18 | Magnum Opus Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.ULKCwvSmNpwN2OXr` |

## Drip Release

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Drip Incarnate | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.RMqX1YzqBttvTmJO` |
| 2 | Dressed for Success | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.ODgExY9iSKD4YPX9` |
| 6 | Passion for Fashion | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.6MgiLBlQtKzGjgBW` |
| 6 | Exuding Awesomeness | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.MUtINGrgJxts55Uy` |
| 10 | Dripping with Swagger | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.TXUTjuoE5Rls8HUC` |
| 14 | Fashionably Late | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.eDUJchxri2LynaKt` |
| 18 | Drip Ascendant | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.T3aTj0CZl6exM3P6` |

## Brawl Master

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Taijutsu Incorporation | 0.14: zusätzliche Auswahl, Refined/Nin-Kontext und bestätigter Angriff +1d4 oder kurze AC. | `Compendium.n5eb.t7-subclass.Item.2vq7lY1Ytp8583RO` |
| 2 | Brain over Brawn | 0.14: INT für Unarmed, opt-in Stance-Würfel und Refined-Tai; Stance/Lernwert selbst wählen. | `Compendium.n5eb.t7-subclass.Item.r7ObdarsQjUXQ6SE` |
| 6 | Breath of Life | 0.14: gewählte tatsächliche Schadensart und HD-Größe; Nutzungen/CD, pro passendem Schaden neu würfeln. | `Compendium.n5eb.t7-subclass.Item.GCTDEZvvGFW0ws37` |
| 6 | Adaptive Techniques | 0.13/0.14: vier Adaptive-Aktionen; Fusion verwendet dieselben Boni ohne zusätzliche Chakra, tatsächlicher HD bleibt erforderlich. | `Compendium.n5eb.t7-subclass.Item.njdeVw3m9UcrSMcv` |
| 10 | Battle Tendency | 0.14: nativer Clash-Vorteil; zusätzliche Angriffe sowie Push/zugehöriger STR-Save manuell im nativen Ablauf. | `Compendium.n5eb.t7-subclass.Item.3jSk4oJoXOr0jUrr` |
| 14 | Fusion of the Body and Soul | 0.14: Tai-Auswahl, Kosten/Force/Reichweite/Würfel, kostenlose Adaptive-Boni, tatsächlicher Rejuvenating-HD. | `Compendium.n5eb.t7-subclass.Item.wXNTAbQEtmFRKHPB` |
| 18 | Solar Interflow Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.PAIFTWRL665S3Y7n` |
| 2 | Rejuvenating Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.Dbu5JsjsOkvxxbXg` |
| 2 | Overdrive Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.vHQI5r0og2lnSHlw` |
| 2 | Survival Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.wQNrRLLtq6bPk2Yn` |
| 2 | Tactical Molding | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.XgUSV5PunbU3mmib` |

## Ryo Master

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Money Release | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.2G6Uy2KX6hKgs9MA` |
| 2 | Flash the Cash | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.kftRB6e9vgAdBGhL` |
| 6 | Blood Money | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.G65Ox1jJ0owqWJSw` |
| 6 | Monopolize | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.DhbgvPfhIBfp4STR` |
| 10 | Flaunt Your Wealth | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.bwgGneMAn3HP0eJs` |
| 14 | The Power of Money | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.TjelZZ6jVkDYCfAV` |
| 18 | Bankruptcy Technique | Ausgenommen: auf ausdrücklichen Nutzerwunsch keine Automation. | `Compendium.n5eb.t7-subclass.Item.5hMHsNjnxsb0RILE` |

## Imbuement Master

| Stufe | Feature | Stand | Quellen-UUID |
|---|---|---|---|
| 2 | Bukijutsu Incorporation | 0.14: Auswahl und Nin-Kontext, einmaliger Zusatzwürfel; Disengage manuell. | `Compendium.n5eb.t7-subclass.Item.JsMnafVUDd3twtGf` |
| 2 | Intelligent Swordplay | 0.14: Refined-Buki mit Nin-Attribut/Keyword, Potent ausgeschlossen; vorhandene Blade Marks. | `Compendium.n5eb.t7-subclass.Item.ftFrng5S6dTSZC9r` |
| 6 | Ninjutsu Imbuement | 0.14: tatsächliche Waffe/Schadensart, gespeichertes Jutsu und eigene Konzentration ohne Unterhalt; Zusatzwürfel einmal/Cast. | `Compendium.n5eb.t7-subclass.Item.H55NvZTNkz1CXFfx` |
| 6 | Charged Blade Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.Gk0lVndj3PM3LnDR` |
| 10 | Pure Skill | 0.14: bestätigter PB-Zusatzschaden, STR-/CON-Save und Clash-Vorteil; tatsächliche Waffe und deren Schadensart ausdrücklich auswählen. | `Compendium.n5eb.t7-subclass.Item.wHKsDFheQjHhuKBi` |
| 14 | Enhancement Master | 0.14: zwei Imbuements, höherer gemeinsamer Rang, Minute erneuern; gewählter Finisher mehrfach bis Zugende. | `Compendium.n5eb.t7-subclass.Item.nAU6NMDayxK0Thc6` |
| 18 | Imbuement Master Technique | 0.13.0: Unterklassen-Molding implementiert; Ablauf und Grenzen siehe SUBCLASS-MOLDINGS.md. | `Compendium.n5eb.t7-subclass.Item.g3EU4nDePwBgIbxY` |

## Abnahmekriterien

Je Feature: verifizierter Besitz/Quelle, explizite Regel, Ausschluss von Doppelanwendung, passende Unit-Tests, tatsächliche Foundry-Prüfung für UI/Ressourcen/Effekte und dokumentierte Grenzen. Tracker-Korrekturen gelten nicht als automatisierter Gameplay-Verbrauch. Bereits vorhandene native Automatisierung zuerst prüfen; Features ohne Effekte nicht pauschal als defekt ansehen.
