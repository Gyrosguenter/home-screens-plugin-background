export type WeatherCategory = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog';
export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type MunichEvent = 'wiesn' | 'christkindlmarkt' | null;

function unsplashUrl(photoId: string): string {
  // w=2560 deckt auch die größte aktuell verbaute Display-Auflösung ab;
  // q=80 ist ein guter Kompromiss zwischen Bildqualität und Ladezeit für ein
  // Foto, das über Stunden im Hintergrund steht.
  return `https://images.unsplash.com/${photoId}?w=2560&q=80&fm=jpg&fit=crop&auto=format`;
}

/** Handverlesene, kostenlose (nicht Unsplash+) Fotos — Fotografen und
 *  Quellen siehe README. Absichtlich eine kleine, kuratierte Auswahl statt
 *  Unsplash-Live-Suche: bleibt stabil, lädt schnell, kein API-Key nötig. */
export const PHOTOS = {
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
export function categorizeWeatherCode(code: number): WeatherCategory {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  return 'cloudy';
}

/** Meteorologische Jahreszeiten (Nordhalbkugel). `month` ist 0-basiert
 *  (`Date#getMonth()`). */
export function getSeason(month: number): Season {
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
export function getMunichEvent(date: Date): MunichEvent {
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
export function pickPhoto(
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
