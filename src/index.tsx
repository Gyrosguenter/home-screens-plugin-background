import React from 'react';
import type { PluginComponentProps } from './hs-plugin';
import { hostFrameStyle } from './host-style';

const PLUGIN_ID = 'muenchen-hintergrund';

/** München-Koordinaten (Marienplatz-Nähe) — bewusst fest verdrahtet statt
 *  Config-Feld: dieses Plugin ist für genau ein Display (den Magic Mirror in
 *  München) gebaut, kein Mehrwert durch Konfigurierbarkeit hier. */
const LAT = 48.1371;
const LON = 11.5754;

type WeatherCategory = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog';
type Season = 'winter' | 'spring' | 'summer' | 'autumn';
type MunichEvent = 'wiesn' | 'christkindlmarkt' | null;

interface CurrentWeather {
  category: WeatherCategory;
  isDay: boolean;
}

function unsplashUrl(photoId: string): string {
  // w=2560 deckt auch die größte aktuell verbaute Display-Auflösung ab;
  // q=80 ist ein guter Kompromiss zwischen Bildqualität und Ladezeit für ein
  // Foto, das über Stunden im Hintergrund steht.
  return `https://images.unsplash.com/${photoId}?w=2560&q=80&fm=jpg&fit=crop&auto=format`;
}

/** Handverlesene, kostenlose (nicht Unsplash+) Fotos — Quelle/Lizenz siehe
 *  docs/background-plugin.md im Haupt-Repo. Absichtlich eine kleine,
 *  kuratierte Auswahl statt Unsplash-Live-Suche: bleibt stabil, lädt schnell,
 *  kein API-Key nötig. */
const PHOTOS = {
  autumnDay: unsplashUrl('photo-1757755489534-7a2733da54ed'),
  nightGeneric: unsplashUrl('photo-1770749058027-095a1b116c4c'),
  rainGeneric: unsplashUrl('photo-1585978075589-fc6561e20296'),
  winterSnow: unsplashUrl('photo-1611317621952-8317fc747166'),
  christkindlmarktNight: unsplashUrl('photo-1706806222680-c6a5c7eae9bd'),
  springDay: unsplashUrl('photo-1680124322596-c973b0881eea'),
  summerDay: unsplashUrl('photo-1609237756216-2d5448d96807'),
  wiesnDay: unsplashUrl('photo-1760822399066-029921fe429c'),
} as const;

/** WMO-Wettercode (Open-Meteo) grob in Bild-Kategorien gebündelt — für ein
 *  Hintergrundfoto reicht diese Auflösung, siehe
 *  https://open-meteo.com/en/docs#weathervariables */
function categorizeWeatherCode(code: number): WeatherCategory {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  return 'cloudy';
}

/** Meteorologische Jahreszeiten (Nordhalbkugel). `month` ist 0-basiert
 *  (`Date#getMonth()`). */
function getSeason(month: number): Season {
  if (month === 11 || month === 0 || month === 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'autumn';
}

/** Grobe, bewusst großzügige Datumsfenster für wiederkehrende Münchner
 *  Events. Es gibt keine verlässliche kostenlose Live-API für "was ist gerade
 *  in München los" — die exakten Tage (v.a. der Wiesn) verschieben sich jedes
 *  Jahr etwas. Lieber ein paar Tage zu früh/spät das Themenfoto zeigen als
 *  jedes Jahr Code anfassen zu müssen; falls die Abweichung mal störend groß
 *  wird, hier nachschärfen. */
function getMunichEvent(date: Date): MunichEvent {
  const month = date.getMonth();
  const day = date.getDate();
  // Wiesn: Start Mitte/Ende September (ein Samstag), Ende ca. erster
  // Sonntag im Oktober.
  if ((month === 8 && day >= 15) || (month === 9 && day <= 5)) return 'wiesn';
  // Christkindlmarkt: ab letztem November-Freitag bis Heiligabend.
  if ((month === 10 && day >= 25) || (month === 11 && day <= 24)) return 'christkindlmarkt';
  return null;
}

/** Entscheidet, welches Foto gerade passt — Events zuerst (wenn aktiviert),
 *  dann auffällige Wetterlagen (Schnee/Regen fallen stärker ins Auge als
 *  "bewölkt"), dann Tag/Nacht, zuletzt die Jahreszeit als Basis-Look. */
function pickPhoto(
  season: Season,
  weather: WeatherCategory,
  isDay: boolean,
  event: MunichEvent,
): string {
  if (event === 'wiesn') return PHOTOS.wiesnDay;
  if (event === 'christkindlmarkt') return isDay ? PHOTOS.winterSnow : PHOTOS.christkindlmarktNight;
  if (weather === 'snow') return PHOTOS.winterSnow;
  if (weather === 'rain') return PHOTOS.rainGeneric;
  if (!isDay) return PHOTOS.nightGeneric;
  switch (season) {
    case 'winter':
      return PHOTOS.winterSnow;
    case 'spring':
      return PHOTOS.springDay;
    case 'summer':
      return PHOTOS.summerDay;
    case 'autumn':
    default:
      return PHOTOS.autumnDay;
  }
}

type PluginFetch = (
  pluginId: string,
  options: { url: string; method?: string; headers?: Record<string, string>; cacheTtlMs?: number },
) => Promise<Response>;

/** Pollt die aktuelle Wetterlage über Open-Meteo (kostenlos, kein API-Key —
 *  dieselbe Quelle, die auch das eingebaute Wetter-Modul standardmäßig
 *  nutzt). Schlägt der Abruf fehl, bleibt `null` — der Aufrufer fällt dann
 *  auf eine reine Jahreszeit/Uhrzeit-Schätzung zurück, das Hintergrundbild
 *  bleibt also auch ohne Netz/API nie leer. */
function useCurrentWeather(intervalMs: number): CurrentWeather | null {
  const [weather, setWeather] = React.useState<CurrentWeather | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const pluginFetch = window.__HS_SDK__?.pluginFetch as PluginFetch | undefined;
        if (!pluginFetch) return;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}`
          + '&current_weather=true&timezone=Europe%2FBerlin';
        const res = await pluginFetch(PLUGIN_ID, {
          url,
          // Wetterlage ändert sich nicht minütlich — Cache knapp unter dem
          // Poll-Intervall, damit mehrere Displays sich einen Request teilen.
          cacheTtlMs: Math.max(5 * 60 * 1000, intervalMs - 60 * 1000),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const cw = data?.current_weather;
        if (!cw) return;
        setWeather({
          category: categorizeWeatherCode(Number(cw.weathercode)),
          isDay: Number(cw.is_day) === 1,
        });
      } catch {
        // Stiller Fallback — siehe Funktionskommentar oben.
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return weather;
}

/** Aktuelles Datum, alle `intervalMs` neu gesetzt — treibt Jahreszeit/Event/
 *  Tag-Nacht-Fallback. Muss nicht sekundengenau sein. */
function useNow(intervalMs: number): Date {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const FADE_MS = 2500;

/** Rendert das aktuelle Hintergrundfoto und blendet beim Wechsel sanft zum
 *  neuen über, statt hart umzuschalten (Nutzerwunsch: "dezente Übergänge").
 *  Hält kurzzeitig zwei <img>-Ebenen übereinander; die neue blendet über der
 *  alten ein, danach wird die alte aus dem DOM entfernt. */
function BackgroundLayers({ url }: { url: string }) {
  const [layers, setLayers] = React.useState<{ url: string; key: number }[]>(() => [{ url, key: 0 }]);
  const nextKey = React.useRef(1);

  React.useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1]?.url === url) return prev;
      const layer = { url, key: nextKey.current };
      nextKey.current += 1;
      return [...prev, layer];
    });
  }, [url]);

  React.useEffect(() => {
    if (layers.length <= 1) return;
    const timer = setTimeout(() => {
      setLayers((prev) => (prev.length > 1 ? prev.slice(-1) : prev));
    }, FADE_MS + 300);
    return () => clearTimeout(timer);
  }, [layers]);

  return (
    <>
      <style>{'@keyframes hs-bg-fade-in { from { opacity: 0; } to { opacity: 1; } }'}</style>
      {layers.map((layer, i) => (
        <img
          key={layer.key}
          src={layer.url}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // Nur neu hinzukommende Ebenen blenden ein — das allererste Foto
            // beim Laden soll sofort da sein, nicht auch noch faden.
            animation: i > 0 ? `hs-bg-fade-in ${FADE_MS}ms ease forwards` : undefined,
          }}
        />
      ))}
    </>
  );
}

export default function MuenchenHintergrundPlugin({ config, style }: PluginComponentProps) {
  const showEvents = config.showEvents !== false;
  // Wetter alle 30 Minuten neu abfragen, Datum/Uhrzeit alle 15 — beides
  // ändert sich für die Foto-Auswahl nie schnell genug, um öfter zu pollen.
  const weather = useCurrentWeather(30 * 60 * 1000);
  const now = useNow(15 * 60 * 1000);

  const season = getSeason(now.getMonth());
  const event = showEvents ? getMunichEvent(now) : null;
  const isDay = weather?.isDay ?? (now.getHours() >= 7 && now.getHours() < 20);
  const weatherCategory = weather?.category ?? 'clear';

  const url = pickPhoto(season, weatherCategory, isDay, event);

  return (
    <div
      style={{
        ...hostFrameStyle(style, { chromeless: true }),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackgroundLayers url={url} />
    </div>
  );
}
