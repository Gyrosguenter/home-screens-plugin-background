import React from 'react';
import type { PluginComponentProps } from './hs-plugin';
import { hostFrameStyle } from './host-style';
import {
  categorizeWeatherCode,
  getMunichEvent,
  getSeason,
  pickPhoto,
  type WeatherCategory,
} from './photo-logic';

const PLUGIN_ID = 'muenchen-hintergrund';

/** München-Koordinaten (Marienplatz-Nähe) — bewusst fest verdrahtet statt
 *  Config-Feld: dieses Plugin ist für genau ein Display (den Magic Mirror in
 *  München) gebaut, kein Mehrwert durch Konfigurierbarkeit hier. */
const LAT = 48.1371;
const LON = 11.5754;

const DEFAULT_DIM = 0.3;
const MAX_DIM = 0.7;

interface CurrentWeather {
  category: WeatherCategory;
  isDay: boolean;
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

function readDim(value: unknown): number {
  const n = typeof value === 'number' ? value : DEFAULT_DIM;
  return Number.isFinite(n) ? Math.min(MAX_DIM, Math.max(0, n)) : DEFAULT_DIM;
}

export default function MuenchenHintergrundPlugin({ config, style }: PluginComponentProps) {
  const showEvents = config.showEvents !== false;
  const dim = readDim(config.dim);
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
      {/* Dezenter Verlauf, oben schwächer als unten: hält die Module auch auf
          sehr hellen Fotos (z. B. Wiesn bei Sonnenschein) gut lesbar, ohne
          das Foto flach zu drücken. */}
      {dim > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(to bottom, rgba(0, 0, 0, ${dim * 0.6}), rgba(0, 0, 0, ${dim}))`,
          }}
        />
      )}
    </div>
  );
}
