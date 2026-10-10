# München Hintergrund · Munich Background

**[Deutsch](#deutsch) · [English](#english)** · Plugin für / for [Home Screens](https://github.com/home-screens/home-screens) · v1.1.0

## Deutsch

Ein **vollflächiges Hintergrundfoto von München**, das sich automatisch an **Tageszeit, Wetterlage, Jahreszeit und Münchner Events** (Wiesn, Christkindlmarkt) anpasst und sanft überblendet.

### Was kann das Plugin?

- Foto-Auswahl: Event → Regen/Schnee → Nacht → Jahreszeit
- 8 kuratierte, frei lizenzierte Fotos (Unsplash)
- Abdunklung einstellbar, damit Module gut lesbar bleiben
- Funktioniert auch ohne Internet-Wetter (Fallback nach Jahreszeit/Uhrzeit)

### Installation – Schritt für Schritt

**Voraussetzung:** Du hast Home Screens bereits laufen (Server erreichbar im Browser).

1. Öffne den **Editor** deines Home-Screens-Servers im Browser an einem Computer (nicht am Handy; er braucht mindestens 768 Pixel Breite). Die Adresse ist meist `http://<Adresse-deines-Servers>:3000/editor`.
2. Klicke oben in der Leiste auf **Plugins** (neben „Einstellungen“ und „Vorschau“).
3. Klicke auf **Aus URL installieren …**.
4. Füge im Feld **Tarball-URL** diesen Link ein und klicke auf **Installieren**:

   ```
   https://github.com/Gyrosguenter/home-screens-plugin-background/releases/latest/download/muenchen-hintergrund.tar.gz
   ```

   Home Screens weist darauf hin, dass das Plugin „nicht vom Home-Screens-Team geprüft“ ist. Das ist normal, denn es stammt nicht aus dem Marktplatz. Du siehst eine Übersicht, was das Plugin darf.
5. Warte, bis die Installation fertig ist, und klicke auf **Fertig**. Falls das Modul nicht sofort in der Liste auftaucht, lade die Seite neu (F5).
6. Ziehe das Modul auf den Bildschirm: Links in der Liste **MODULE** (Hinweis „Auf den Bildschirm ziehen“) findest du unter **MEDIEN & ANZEIGE** das Modul **München Hintergrund** (mit der Markierung „Plug-in“). Ziehe es auf deinen Bildschirm und passe Größe und Position an.
7. Klicke das Modul an: rechts erscheinen die **Einstellungen**. Der Editor **speichert automatisch**, einen Speichern-Knopf gibt es nicht.

### Einstellungen

| Einstellung | Bedeutung |
|---|---|
| Münchner Events zeigen | Zu bestimmten Terminen (Wiesn, Christkindlmarkt) ein Themenfoto zeigen. |
| Abdunklung | 0 = Originalfoto, 0,3 = Standard; je höher, desto dunkler. |

### Aktualisieren

Wiederhole einfach die Installation mit **demselben Link** (Schritte 2–4). Er zeigt immer auf die neueste Version; deine Einstellungen bleiben erhalten.

### Hilfe bei Problemen

- **Als Hintergrund einrichten:** Modul auf den Bildschirm ziehen, auf volle Bildschirmgröße (z. B. 2560×1440) und Position 0/0 stellen, dann **nach hinten** legen, damit die anderen Module darüber liegen.
- **Nur für München gedacht:** Fotos und Wetter-Standort sind fest München.
- **Installation schlägt fehl?** Dein Home-Screens-Server muss auf `github.com` zugreifen können (Internet). Prüfe, ob der Link vollständig kopiert wurde.
- **Modul bleibt leer nach dem Ziehen?** Seite neu laden (F5). Ein paar Sekunden warten, manche Module laden Daten erst nach dem Einfügen.

### Datenschutz und Hinweise

Das Modul fragt über den Server-Proxy `api.open-meteo.com` die aktuelle Wetterlage für München ab und lädt die Fotos von Unsplash. Es werden keine persönlichen Daten gesendet.

---

## English

A **full-screen photo of Munich** that automatically adapts to **time of day, weather, season and Munich events** (Oktoberfest, Christmas market) and cross-fades smoothly.

### What does it do?

- Photo selection: event → rain/snow → night → season
- 8 curated, freely licensed photos (Unsplash)
- Adjustable dimming so modules stay readable
- Still works without weather data (falls back to season/time of day)

### Installation – step by step

**Prerequisite:** Home Screens is already running (server reachable in the browser).

1. Open the **editor** of your Home Screens server in a browser on a computer (not a phone; it needs at least 768 pixels width). The address is usually `http://<address-of-your-server>:3000/editor`.
2. Click **Plugins** in the top bar (next to "Settings" and "Preview").
3. Click **Install from URL…**.
4. Paste this link into the **Tarball URL** field and click **Install**:

   ```
   https://github.com/Gyrosguenter/home-screens-plugin-background/releases/latest/download/muenchen-hintergrund.tar.gz
   ```

   Home Screens warns that the plugin "has not been reviewed by the Home Screens team". That is normal because it does not come from the marketplace. You will see an overview of what the plugin may do.
5. Wait until the installation has finished and click **Done**. If the module does not show up in the list immediately, reload the page (F5).
6. Drag the module onto the screen: in the **MODULES** list on the left ("Drag onto the screen") find **München Hintergrund** under **MEDIA & DISPLAY** (marked "Plugin"). Drag it onto your screen and adjust size and position.
7. Click the module: the **settings** appear on the right. The editor **saves automatically**; there is no save button.

### Settings

| Setting | Meaning |
|---|---|
| Show Munich events | Show a themed photo on certain dates (Oktoberfest, Christmas market). |
| Dimming | 0 = original photo, 0.3 = default; higher = darker. |

### Updating

Simply repeat the installation with the **same link** (steps 2–4). It always points to the latest version; your settings are kept.

### Troubleshooting

- **Using it as a background:** drag the module onto the screen, set it to full screen size (e.g. 2560×1440) at position 0/0, then send it **to the back** so other modules sit on top.
- **Munich only:** the photos and weather location are fixed to Munich.
- **Installation fails?** Your Home Screens server must be able to reach `github.com` (internet). Check that the link was copied completely.
- **Module stays empty after dragging?** Reload the page (F5). Wait a few seconds; some modules fetch data only after being added.

### Privacy and notes

The module queries `api.open-meteo.com` through the server proxy for the current weather in Munich and loads photos from Unsplash. No personal data is sent.

---

## Technik / Technical notes

- **ID / Manifest:** `muenchen-hintergrund` – Version 1.1.0, License MIT
- Bauen / Build: `npm install && npm run build && npm test`
- Release-Archiv für die Installation / Release archive used for installation: `muenchen-hintergrund.tar.gz` (enthält / contains `muenchen-hintergrund/manifest.json` + `muenchen-hintergrund/dist/bundle.js`)
- Teil eines privaten Heim-Projekts (Magic-Mirror-Ersatz); als eigenes öffentliches Repo geführt, damit die Installations-URL ohne Anmeldung erreichbar ist / Part of a private home project (Magic Mirror replacement); kept as its own public repo so the install URL works without login.
- Dieses Plugin ist ein inoffizielles Community-Plugin und steht in keiner Verbindung zum Home-Screens-Team / This is an unofficial community plugin and is not affiliated with the Home Screens team.

MIT
