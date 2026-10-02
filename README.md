# München Hintergrund — Home Screens Plugin

Natives [Home Screens](https://homescreens.dev)-Plugin, das ein vollflächiges Hintergrundfoto zeigt und es automatisch an **Tageszeit, Wetterlage, Jahreszeit und Münchner Events** anpasst — mit sanftem Überblenden beim Wechsel.

Teil des Projekts [home-screens-magic-mirror](https://github.com/Gyrosguenter/home-screens-magic-mirror) (privates Repo) — als eigenes, öffentliches Repo geführt, damit die Plugin-Tarball-URL für die Home-Screens-Installation ohne Authentifizierung erreichbar ist.

## Funktionsweise

Das Plugin wird als Modul auf die gesamte Fläche des Screens gezogen und per „Nach hinten“ unter alle anderen Module gelegt. Es wählt das Foto nach dieser Rangfolge:

1. **Event** (abschaltbar): Wiesn (ca. 15.9.–5.10.) → Wiesn-Foto; Christkindlmarkt (ca. 25.11.–24.12.) → Marienplatz-Weihnachtsbaum nachts bzw. Winterfoto tagsüber
2. **Wetterlage**: Schnee → Winterfoto, Regen/Gewitter → Regenfoto
3. **Tag/Nacht**: nachts → Nachtfoto
4. **Jahreszeit**: Frühling / Sommer / Herbst / Winter

Wetterdaten kommen von [Open-Meteo](https://open-meteo.com) (kostenlos, kein API-Key) über den serverseitigen `pluginFetch`-Proxy des Hosts, 30-Minuten-Intervall. Schlägt der Abruf fehl, fällt das Plugin auf Datum/Uhrzeit zurück — der Hintergrund bleibt nie leer.

Die Event-Zeiträume sind bewusst grobe, großzügige Datumsfenster (es gibt keine verlässliche kostenlose Event-API); siehe `getMunichEvent()` in `src/index.tsx`.

## Fotos

Kuratierte Auswahl kostenloser Fotos von [Unsplash](https://unsplash.com) (Unsplash-Lizenz, kein Unsplash+), direkt vom Unsplash-CDN geladen — es werden keine Bilddateien in diesem Repo mitgeliefert.

| Situation | Fotograf |
|---|---|
| Herbst, Tag (Frauenkirche + Alpen) | Julian Ostarek |
| Nacht (Olympiaturm) | Heliao |
| Regen | James Harrison |
| Winter / Schnee | Herr Bohn |
| Christkindlmarkt, nachts (Marienplatz) | Luca |
| Frühling (Kirschblüte) | Nk Ni |
| Sommer (Englischer Garten) | Vinay Chavan |
| Wiesn | Manoa Angelo |

## Konfiguration

| Feld | Beschreibung |
|---|---|
| Münchner Events zeigen | Themenfotos zu Wiesn/Christkindlmarkt ein-/ausschalten (Standard: an) |
| Abdunklung | 0–0,7, Standard 0,3 — dezenter Verlauf über dem Foto, damit Module darüber lesbar bleiben |

## Build & Deployment

```bash
npm install
npm run build   # erzeugt dist/bundle.js
```

Release-Tarball (`manifest.json` + `dist/`) als Asset an ein GitHub-Release hängen; in Home Screens unter *Plugins → Aus URL installieren* die Asset-URL eintragen.

## Lizenz

MIT
