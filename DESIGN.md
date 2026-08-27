---
name: "DreamForum Archive"
description: "Ein konserviertes WoltLab-Forum als klassisches, öffentliches Read-only-Archiv."
colors:
  page-sky: "#426c82"
  shell: "#080b10"
  stage: "#0b0e14"
  row: "#0f151c"
  row-alt: "#0f131c"
  panel: "#1f2325"
  footer-panel: "#0a0f15"
  heading-top: "#063b58"
  heading-bottom: "#001724"
  cyan: "#3cbcff"
  text: "#a9dcf0"
  text-strong: "#dceeff"
  link: "#b2b7db"
  link-bright: "#72bfff"
  metadata: "#7f909d"
  button: "#326699"
  button-hover: "#3f7fbf"
  line: "#46505a"
  line-soft: "#26313a"
  like-positive: "#08751a"
  like-negative: "#d20f1b"
  white: "#ffffff"
  black: "#000000"
  counter-label: "#0b192f"
typography:
  body:
    fontFamily: "Trebuchet MS, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.28
  title:
    fontFamily: "Trebuchet MS, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
  page-title:
    fontFamily: "Trebuchet MS, Arial, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.1
  post-body:
    fontFamily: "Trebuchet MS, Arial, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.48
  metadata:
    fontFamily: "Trebuchet MS, Arial, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  square: "0"
  reaction: "11px"
components:
  nav-item:
    backgroundColor: "{colors.row-alt}"
    textColor: "{colors.text}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "0 18px"
    height: "44px"
  panel-header:
    backgroundColor: "{colors.heading-bottom}"
    textColor: "{colors.white}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "7px 9px"
  shout-row:
    backgroundColor: "{colors.row}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "5px 0"
  latest-row:
    backgroundColor: "{colors.row}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "6px 7px"
    height: "59px"
  board-entry:
    backgroundColor: "{colors.row}"
    textColor: "{colors.link}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "7px 10px"
    height: "58px"
  search-control:
    backgroundColor: "#151b24"
    textColor: "{colors.text-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 13px"
    height: "48px"
  pager-page:
    backgroundColor: "#151b24"
    textColor: "{colors.link}"
    typography: "{typography.metadata}"
    rounded: "{rounded.square}"
    padding: "5px 9px"
    height: "29px"
  post:
    backgroundColor: "{colors.row-alt}"
    textColor: "{colors.text}"
    typography: "{typography.post-body}"
    rounded: "{rounded.square}"
  post-score-positive:
    backgroundColor: "{colors.like-positive}"
    textColor: "{colors.white}"
    typography: "{typography.metadata}"
    rounded: "{rounded.reaction}"
    padding: "3px 6px"
  post-score-negative:
    backgroundColor: "{colors.like-negative}"
    textColor: "{colors.white}"
    typography: "{typography.metadata}"
    rounded: "{rounded.reaction}"
    padding: "3px 6px"
  read-position-mobile:
    backgroundColor: "{colors.button}"
    textColor: "{colors.white}"
    typography: "{typography.metadata}"
    rounded: "{rounded.square}"
    padding: "6px 10px"
    height: "44px"
  archive-banner:
    backgroundColor: "#030609"
    rounded: "{rounded.square}"
    width: "100%"
  visitor-counter:
    backgroundColor: "{colors.counter-label}"
    textColor: "{colors.link-bright}"
    rounded: "{rounded.square}"
    height: "20px"
---

# Design System: DreamForum Archive

## Overview

**Creative North Star: "Das konservierte Forum"**

DreamForum Archive rekonstruiert die belegte WoltLab-/DreamForum-Oberfläche von 2016/2017 als funktional bereinigtes, vollständig schreibgeschütztes Archiv. Der zentrierte Forenrahmen, Schwarzblau/Cyan, Trebuchet, enge Tabellen und extrahierte historische Grafiken lassen das Forum vertraut wirken, ohne Login, Posting, Administration oder andere tote Live-Funktionen vorzutäuschen.

Alle öffentlichen Daten bleiben normal durchsuchbar und verlinkt: Boards, Threads, Beiträge, Mitglieder, Profile, Shoutbox und Kommentare teilen eine konsistente Route- und Leselogik. Der Originalbanner steht auf jeder Seite über der Navigation. Datenschutz ist Teil des Produkts: Tabellen privater Nachrichten sowie die geschützten Boards `230` und `231` („Private Anliegen“) sind vom Export und der Suche ausgeschlossen und erhalten eine eigene erklärende Archivseite.

Die Oberfläche zeigt keine technischen Datenbankkennungen. Fortlaufende Beitragsnummern bleiben als verständliche Lesereferenz innerhalb eines Threads erhalten, während interne Board-, Thread-, Post- und Nutzer-IDs ausschließlich Routing und Datenzuordnung dienen.

**Key Characteristics:**

- Ein einziger klassischer WoltLab-Leseraum in einem maximal 1000 Pixel breiten Forenrahmen.
- Trebuchet, Schwarzblau, Cyan, harte Tabellenlinien und extrahierte historische Rastergrafiken.
- Shoutbox, 16 letzte Threads und vollständige Forenübersicht bilden die Startseite.
- Threads verwenden echte Seitenlogik, reichhaltige Autorenspalten und nachvollziehbare Reaktions- und Bearbeitungshistorie.
- Kompakte, intern scrollende Shoutbox-Verläufe und automatisch angewendete Sortierungen halten dichte Archive bedienbar.
- Der öffentliche Datenstand umfasst `95` Boards, `4.393` Threads, `61.509` Beiträge, `2.926` Tags und `42.320` Reaktionen.
- `14.978` historische Emoticon-Vorkommen sind als Unicode-Emoji lesbar; `60` nicht treu abbildbare benutzerdefinierte Codes bleiben ehrliche Platzhalter.
- Originalbanner und Teamfarben bewahren historische Identität; deterministische SVG-Avatare kennzeichnen ehrlich die fehlenden Bilddateien.

## Colors

Die Palette ist dunkel, blaugetönt und tabellarisch. Cyan und helles Blau führen, Weiß reserviert sich für aktive oder besonders wichtige Zustände.

### Primary

- **Schwarzblauer Rahmen** (`shell`) und **Archivbühne** (`stage`): Äußerer Forenkörper und durchgehender Inhaltsgrund.
- **Cyan-Fokus** (`cyan`): Tastaturfokus, Mentions und präzise Statusakzente.
- **Aktionsblau** (`button`) und **Hoverblau** (`button-hover`): Buttons, aktive Seitenzahlen, Tabs und Suchaktionen.

### Secondary

- **Haupttext** (`text`) und **starker Text** (`text-strong`): Lesetext und hervorgehobene Beitragswerte.
- **Linktext** (`link`) und **heller Link** (`link-bright`): Navigierbare Inhalte und prominente Weiterleitungen.
- **Positives Like** (`like-positive`) und **negatives Like** (`like-negative`): Weiße Salden auf klar getrennten Grün-/Rotflächen.

### Tertiary

- **Kategoriekopf** (`heading-top` bis `heading-bottom`): Cyan-schwarzblauer Verlauf für Panel- und Root-Boardüberschriften.
- **Seitenhimmel** (`page-sky`): Historische Außenfläche hinter dem Desktop-Forenrahmen.

### Neutral

- **Tabellenzeile** (`row`) und **Alternativzeile** (`row-alt`): Enges Zeilenpaar für Shouts, Threads, Mitglieder und Boards.
- **Panel** (`panel`) und **Footerpanel** (`footer-panel`): Hover-, Autoren- und Reaktionsflächen.
- **Metadaten** (`metadata`): Sekundärtext auf dunklen Zeilen; besonders geprüft als `#7f909d` auf `#0f151c`.
- **Linie** (`line`) und **weiche Linie** (`line-soft`): Tabellenraster, Postkopf- und Footertrennung.
- **Weiß** (`white`) und **Schwarz** (`black`): Aktiver Text und harte historische Zellkanten.

### Historische Teamfarben

Teamnamen verwenden die validierte Farbe der höchstpriorisierten öffentlichen SQL-Teamgruppe. Eine feste dunkle Kontur hält auch sehr helle Originalfarben lesbar; normales Nutzer-Namenschwarz wird nicht künstlich eingefärbt.

### Named Rules

**Die Cyan-Führungsregel.** Cyan markiert Fokus, aktive Navigation und archivische Interaktion; Weiß dient Lesespitzen, Grün und Rot ausschließlich Reaktionswerten.

## Typography

**Primary Font:** Trebuchet MS (mit Arial und Sans-Serif-Fallback)
**Symbol Font:** Georgia nur für das kleine historische Forensymbol.

**Character:** Trebuchet hält die 2017-WoltLab-Proportionen kompakt, freundlich und eindeutig bildschirmbezogen. Hierarchie entsteht durch Gewicht, Weiß/Cyan, dunkle Balken und Tabellenposition – nicht durch große Displaytypografie.

### Hierarchy

- **Page Title:** Trebuchet 700 in `1.55rem/1.1` für Seiten- und Abschnittstitel.
- **Title:** Trebuchet 700 in `1rem/1.2` für Panelköpfe, Navigation und starke Zeilentitel.
- **Body:** Trebuchet in `13px/1.28` für Tabellen, Controls und kompakte UI-Texte.
- **Post Body:** Trebuchet in `.92rem/1.48` für längere Beiträge; der leicht verdichtete Zeilen- und Absatzrhythmus bleibt klar vom Tabellenmetadaten-Satz getrennt.
- **Metadata:** Trebuchet um `.68rem` für Datum, Statistiken, Bearbeitung und Reaktionsdetails.

### Named Rules

**Die Trebuchet-Regel.** Die gesamte sichtbare Oberfläche bleibt bei Trebuchet/Arial; abweichende Displayfonts oder archivfremde UI-Schriften brechen die Rekonstruktion.

## Layout

Desktop zentriert die Oberfläche in einem maximal `1000px` breiten Forenkörper mit dunklem Rahmen und Umgebungsschatten. Auf die 34-Pixel-Utilityleiste folgen der unverzerrte Originalbanner im Verhältnis `5:1` und die 44-Pixel-Hauptnavigation. Derselbe Banner bleibt auf jeder Route sichtbar.

Die Startseite zeigt zuerst sechs Shoutbox-Einträge, danach exakt 16 nach letzter Aktivität sortierte Threads mit Thema, Antworten, Like-Saldo, Zugriffen und letzter Antwort. Die vollständige Boardhierarchie folgt unmittelbar darunter.

Die vollständige Shoutbox nutzt kompakte Gesprächszeilen in einem intern scrollenden Bereich von höchstens `min(68vh, 640px)`. So bleibt die Route in den Forenrahmen eingebunden, ohne lange Verläufe gegen die gesamte Seite auszuspielen.

Board-, Mitglieder- und Suchlisten nutzen kompakte Tabellenraster. Threads zeigen `20` Beiträge pro Seite. Derselbe nummerierte Pager steht direkt oberhalb und unterhalb der Beitragsliste; er enthält Zurück/Weiter, erste und letzte Seite, einen Bereich um die aktuelle Seite und Ellipsen für ausgelassene Bereiche.

Bei `800px` wird der Forenrahmen vollbreit, Außenränder schrumpfen und nachrangige Spalten entfallen. Unter `560px` stapeln sich Latest-Thread-Metriken, Posts werden einspaltig und die Autorendaten wechseln in ein kompaktes Dreispaltenraster. Die Lesepositionsaktion erhält dort mindestens `44px` Höhe.

## Elevation & Depth

Die Inhalte bleiben flach und tabellarisch. Tiefe entsteht durch schwarze Zellkanten, alternierende Schwarzblautöne und cyanfarbene Kopfverläufe. Nur der vollständige Desktop-Forenrahmen erhält einen kräftigen Umgebungsschatten (`0 0 22px rgba(0,0,0,.75)`), um ihn vor dem historischen Hintergrundbild zu fassen.

### Shadow Vocabulary

- **Forenrahmen** (`0 0 22px rgba(0,0,0,.75)`): Ausschließlich um den kompletten Desktop-Forenkörper.

### Named Rules

**Die eine-Schatten-Regel.** Panels, Posts und Controls schweben nie einzeln; der einzige Schatten gehört dem gesamten Forenrahmen.

## Shapes

Navigation, Panels, Boards, Posts, Controls und Pager sind rechtwinklig (`0` Radius). Harte 1-Pixel-Schwarzlinien bilden das historische Tabellenraster. Nur Like-Salden dürfen als kompakte 11-Pixel-Kapseln erscheinen. Avatare und der Originalbanner bleiben ebenfalls kantig; der Banner behält sein `5:1`-Format.

## Components

### Historic Banner

`dream-banner.png` liegt auf jeder Route zwischen Utilityleiste und Hauptnavigation, verlinkt zur Startseite und wird im Verhältnis `5:1` unverzerrt dargestellt. `classic-background.jpg`, `classic-menu.jpg` und `classic-menu-button.png` ergänzen den belegten historischen Rahmen und die Navigation.

### Navigation

Die horizontale 44-Pixel-Navigation enthält Forum, Mitglieder, Shoutbox und Suche. Links verwenden das historische Menu-Tile, Cyantext und schwarze Zellkanten; die aktive Route wird dunkelblau mit weißem Text. Auf kleinen Screens bleibt die Leiste horizontal scrollbar.

### Homepage Panels

Panelköpfe verwenden den Cyan-Schwarzblau-Verlauf. Die Shoutbox steht immer zuerst und zeigt sechs kompakte Avatarzeilen. Das zweite Panel enthält exakt 16 Latest-Thread-Zeilen mit fünf Spalten. Positive Like-Salden stehen weiß auf `#08751a`; Metadaten nutzen `#7f909d` auf `#0f151c`. Danach folgt die vollständige Forenübersicht.

### Shoutbox Conversation List

Die vollständige Shoutbox verdichtet Autor, Zeit und Inhalt in eng gesetzten Gesprächszeilen. Ihr Listenbereich scrollt intern und bleibt auf `min(68vh, 640px)` begrenzt; stabile Scrollbarfläche verhindert horizontales Springen.

### Board Registry Entry

Root-Bereiche erscheinen als kompakte Verlaufsköpfe; Unterforen als dunkle 58-Pixel-Zeilen mit 30-Pixel-Forensymbol, Titel, Beschreibung, Threadzahl und letzter Aktivität. Technische Kennzeichnungen wie `BRD-…` oder `BEREICH/UNTERFORUM` sind unsichtbar. Titelose Boards heißen „Archivbereich ohne überlieferten Titel“.

Threadzeilen innerhalb eines Boards zeigen Thema, Autor, Aktivität und Metriken, wiederholen aber nicht den bereits im Seitenkopf und Breadcrumb sichtbaren Boardtitel. Keine Oberfläche gibt interne Board-, Thread-, Post- oder Nutzerkennungen als sichtbare Archivlabels aus.

### Search and Member Controls

Suche und Filter nutzen dunkelblaue 48-Pixel-Felder mit schwarzer Kontur und `metadata`-Labels. Das zentrale Suchfeld setzt starken hellen Eingabetext (`text-strong`) und einen deutlich sichtbaren Platzhalter auf den dunklen Feldgrund. Sortierauswahlen für Boards und Mitglieder senden ihr Formular bei Änderung automatisch ab; Mitglieder lassen sich nach Beiträgen, Likes, Name, letzter Aktivität und Registrierung sortieren. Die Privacy-Route erklärt ausdrücklich, dass private Nachrichten und die geschützten Boards `230` und `231` weder Inhalt noch Suchtreffer beitragen.

### Numbered Pager

Pager stehen bei Threads oben und unten. Seiten- und Schrittschaltflächen sind mindestens `29px` groß, dunkel konturiert und markieren die aktuelle Seite mit Hoverblau. Ellipsen kürzen große Seitenräume; deaktivierte Zurück-/Weiter-Links bleiben sichtbar, aber inaktiv.

### Forum Post

Jeder Beitrag ist eine zweispaltige Tabelle aus 155-Pixel-Autorenspalte und flexiblem Inhalt. Der Postkopf zeigt Beitragstitel und Datum links; Like-Saldo, fortlaufende `#Nummer` und Lesepositionsaktion stehen rechts. Der Inhalt nutzt eine Mindesthöhe von `150px`, `.92rem/1.48` und kompakte Absatzabstände, damit kurze und lange Beiträge einen dichten, aber gut lesbaren historischen Rhythmus behalten.

### Post Author Column

Die Autorenspalte zeigt Namen, deterministischen Avatar und Rolle. Darunter folgen Likes erhalten, Punkte, Beiträge und Registrierung als Definition-List mit feinen Zeilentrennern. Teamnamen behalten validierte SQL-Gruppenfarben und dunkle Kontur. Mobil liegen Avatar und Name oben; Likes, Punkte und Beiträge bilden das Dreispaltenraster, während Registrierung aus Platzgründen entfällt.

### Reactions and Edit History

Der Postfooter zeigt den Like-Saldo zusätzlich als grüne, rote oder neutrale Kapsel im Kopf und führt alle positiven sowie negativen Nutzer getrennt auf. Bis acht Personen stehen direkt in der Zeile; größere Gruppen zeigen vier Namen und öffnen die vollständige Attribution über ein `details`-Element. Bearbeitete Beiträge nennen Anzahl, letzten Editor, Zeitpunkt und – sofern überliefert – den Grund.

### Read Position Action

„Bis hier gelesen“ speichert die Post-ID lokal pro Thread, markiert die Leseposition und ermöglicht später das direkte Weiterlesen auf der richtigen 20er-Seite. Auf Mobilgeräten spannt die Aktion die volle Aktionszeile und bleibt mindestens `44px` hoch.

### Archive Quote and Mentions

WoltLab-Zitate verwenden ein dunkelblaues Cite-Feld; fehlender eingebetteter Quote-Inhalt wird ausdrücklich benannt. Mentions erscheinen cyan und inline ohne Chip-Hintergrund. Häufige historische Emoticon- und Bild-Alt-Codes werden zu Unicode-Emoji konvertiert (`14.978` Vorkommen). Die `60` benutzerdefinierten Codes ohne treue Standardentsprechung bleiben als beschriftete Platzhalter sichtbar; fehlende Medien und Anhangsdateien bleiben ebenfalls ehrlich als Metadatenzustand erkennbar.

### Public Visitor Counter

Der Footer zeigt den öffentlichen `visitorbadge.io`-Zähler als 20-Pixel-hohes SVG mit dunkelblauem Label und hellblauem Zählfeld. Das Bild benötigt weder Schlüssel noch eigenes Backend und wird mit `referrerpolicy="no-referrer"` geladen. Ein Seitenabruf zählt einmal; Hash-Routenwechsel innerhalb der bereits geladenen Anwendung erzeugen keinen weiteren Abruf.

## Do's and Don'ts

### Do:

- **Do** bewahre den 1000-Pixel-Forenrahmen, Trebuchet, Schwarzblau/Cyan und die extrahierten historischen Grafiken.
- **Do** zeige den Originalbanner auf jeder Route und die Startseite in der Reihenfolge Shoutbox, 16 letzte Threads, alle Foren.
- **Do** halte Threads bei 20 Beiträgen pro Seite und den nummerierten Pager ober- wie unterhalb der Posts.
- **Do** zeige vollständige positive und negative Nutzerattribution sowie Editor, Zeit und Grund bei Bearbeitungen.
- **Do** halte Autorendaten, Leseposition und Privacy-Ausschlüsse sichtbar und ehrlich.
- **Do** wende Board- und Mitgliedersortierungen direkt an und halte Sucheingaben auf dem dunklen Feld kontraststark.
- **Do** übersetze nur historisch eindeutig zuordenbare Codes in Unicode-Emoji und erhalte alle übrigen als beschriftete Platzhalter.
- **Do** halte private Nachrichtentabellen und die geschützten Boards `230` und `231` vollständig außerhalb des öffentlichen Exports und Suchindexes.
- **Do** verwende für den Footer ausschließlich den öffentlichen SVG-Zähler ohne Schlüssel oder eigenes Backend und unterdrücke den Referrer.

### Don't:

- **Don't** füge alternative Ansichten oder Darstellungsmodi hinzu.
- **Don't** verstecke den historischen Banner auf Unterrouten oder ersetze die extrahierten Rastergrafiken durch Nachzeichnungen.
- **Don't** zeige technische Boardkennzeichnungen, erfundene Titel, Schreibaktionen, Login oder private Nachrichten.
- **Don't** wiederhole den Boardtitel in jeder Threadzeile oder gib interne Datenbankkennungen als sichtbare UI-Metadaten aus.
- **Don't** kürze Reaktionsnutzer dauerhaft; lange Gruppen dürfen nur hinter einem aufklappbaren vollständigen Nachweis liegen.
- **Don't** verkleinere die mobile Lesepositionsaktion unter `44px` oder entferne sichtbare Tastaturfokusringe.
- **Don't** veröffentliche ohne erfolgreichen `check.py`-Lauf oder lade andere Pfade als `site/` in das GitHub-Pages-Artefakt.
