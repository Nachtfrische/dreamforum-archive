# DreamForum Archive

Statische, vollständig schreibgeschützte Web-Ausgabe des DreamForum-Dumps im rekonstruierten klassischen WoltLab-/DreamForum-Design von 2016/2017. Die Site läuft ohne Framework, Datenbankserver, Login oder Schreibfunktionen und kann direkt über GitHub Pages ausgeliefert werden.

Der extrahierte historische Dream-Banner bleibt auf jeder Route sichtbar. Die Startseite zeigt zuerst die Shoutbox, danach exakt die 16 zuletzt aktiven Threads mit Antworten, Like-Saldo, Zugriffen und letzter Antwort sowie anschließend die vollständige Forenübersicht.

Die eigenständige Shoutbox hält auch lange Verläufe durch kompakte Einträge und ein begrenztes, internes Scrollfenster übersichtlich. Sichtbare technische Datenbankkennungen sind aus der Oberfläche entfernt; die fortlaufende Nummer an einem Beitrag bleibt als verständliche Lesereferenz innerhalb des Threads erhalten.

## Lokal ansehen

`Start Preview.cmd` doppelklicken oder im Terminal:

```powershell
python -m http.server 8766 --directory site
```

Danach `http://127.0.0.1:8766/` öffnen. Direktes Öffnen der `index.html` reicht wegen der JSON-Dateien nicht aus.

## Enthaltene Archivbereiche

- Vollständige Boardhierarchie, Threads und öffentliche Beiträge
- Volltextsuche nach Threads, Beiträgen und Mitgliedern
- Mitgliederverzeichnis und Profile mit Beiträgen, Punkten und Likes
- Shoutbox und Kommentare
- Tags, Umfragen und Metadaten öffentlicher Dateianhänge
- Eigene Datenschutzseite für ausgeschlossene private Nachrichten

Sortierauswahlen in Boards und im Mitgliederverzeichnis werden unmittelbar angewendet, ohne einen zusätzlichen Bestätigungsklick. Threadzeilen innerhalb eines Boards wiederholen dessen bereits sichtbaren Titel nicht. Das Suchfeld verwendet hellen Eingabe- und Platzhaltertext auf dunkelblauem Grund für belastbaren Kontrast.

Threads zeigen 20 Beiträge pro Seite. Ein nummerierter Pager steht ober- und unterhalb der Beiträge. Jeder Beitrag enthält Autor, Rolle, Likes, Punkte, Beitragszahl, Registrierung, Titel, Datum, fortlaufende Nummer und Like-Saldo. Der Beitragstext ist gegenüber den übrigen Archivtabellen etwas luftiger, bleibt mit dichterem Absatz- und Zeilenrhythmus aber klar im historischen Forenraster. Positive und negative Reaktionen werden vollständig mit Nutzernamen ausgewiesen; bei langen Listen lassen sie sich aufklappen. Bearbeitungshinweise nennen – soweit überliefert – Editor, Zeitpunkt und Grund. Auf Mobilgeräten bleibt „Bis hier gelesen“ als mindestens `44px` hohe Aktion erreichbar.

## Daten neu exportieren und prüfen

```powershell
python -X utf8 build_data.py
python -X utf8 check.py
```

Der Export umfasst ausschließlich öffentliche Inhalte. Die Tabellen privater Nachrichten sowie die zugriffsbeschränkten Boards `230` und `231` („Private Anliegen“) werden weder exportiert noch durchsucht. Die eigentlichen Anhangsdateien waren nicht im Dump; die Oberfläche kennzeichnet daher vorhandene Metadaten ohne eine Wiederherstellung vorzutäuschen. Titelose Boards heißen ausdrücklich „Archivbereich ohne überlieferten Titel“.

Der veröffentlichte Datenstand umfasst `95` Boards, `4.393` Threads, `61.509` Beiträge, `2.926` Tags und `42.320` Reaktionen.

Häufige historische Emoticon- und Bild-Alt-Codes werden beim Export in passende Unicode-Emoji übersetzt; der veröffentlichte Stand umfasst `14.978` ersetzte Vorkommen. `60` benutzerdefinierte Codes ohne treue Standardentsprechung bleiben bewusst als beschriftete Platzhalter sichtbar, statt durch irreführende Emoji ersetzt zu werden.

## Aufrufzähler

Der Footer enthält einen öffentlichen SVG-Gesamtaufrufzähler von `visitorbadge.io`. Er benötigt weder Schlüssel noch eigenes Backend und zählt einen Abruf der statischen Seite; reine Navigation innerhalb der Hash-Routen erhöht ihn nicht erneut. Die Anfrage überträgt durch `referrerpolicy="no-referrer"` keinen Referrer.

## Veröffentlichung

Ein Push auf `main` veröffentlicht den Inhalt von `site/` automatisch über GitHub Pages. Der Workflow unter `.github/workflows/pages.yml` führt zuerst `python3 -X utf8 check.py` aus, lädt danach ausschließlich `site/` als Pages-Artefakt hoch und deployt erst nach erfolgreicher Prüfung. Die öffentliche Adresse ist `https://nachtfrische.github.io/dreamforum-archive/`.

## Historische Gestaltung und Assets

Die Oberfläche verwendet Trebuchet MS, einen zentrierten `1000px`-Forenrahmen, Schwarzblau/Cyan, enge Tabellen und die extrahierten historischen Grafiken `dream-banner.png`, `classic-background.jpg`, `classic-menu.jpg` und `classic-menu-button.png`. Sie wurden aus dem vom Nutzer bereitgestellten lokalen Snapshot „DREAM Gaming Community Forum _ we love gaming(1).html“ übernommen; fremde Skripte und Wayback-Inhalte wurden nicht übernommen.

Deterministische SVG-Avatare ersetzen fehlende Bilddateien, ohne historische Avatare zu erfinden. Teamnamen übernehmen ausschließlich validierte Farben ihrer höchsten öffentlichen SQL-Teamgruppe.
