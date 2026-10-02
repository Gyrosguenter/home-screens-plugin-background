import { describe, expect, it } from 'vitest';
import {
  PHOTOS,
  categorizeWeatherCode,
  getMunichEvent,
  getSeason,
  pickPhoto,
} from './photo-logic';

describe('categorizeWeatherCode', () => {
  it('bündelt WMO-Codes in Bild-Kategorien', () => {
    expect(categorizeWeatherCode(0)).toBe('clear');
    expect(categorizeWeatherCode(1)).toBe('clear');
    expect(categorizeWeatherCode(2)).toBe('cloudy');
    expect(categorizeWeatherCode(3)).toBe('cloudy');
    expect(categorizeWeatherCode(45)).toBe('fog');
    expect(categorizeWeatherCode(61)).toBe('rain');
    expect(categorizeWeatherCode(81)).toBe('rain');
    expect(categorizeWeatherCode(95)).toBe('rain');
    expect(categorizeWeatherCode(73)).toBe('snow');
    expect(categorizeWeatherCode(86)).toBe('snow');
  });

  it('fällt bei unbekannten Codes auf "cloudy" zurück', () => {
    expect(categorizeWeatherCode(42)).toBe('cloudy');
  });
});

describe('getSeason', () => {
  it('nutzt meteorologische Jahreszeiten (0-basierter Monat)', () => {
    expect(getSeason(11)).toBe('winter');
    expect(getSeason(0)).toBe('winter');
    expect(getSeason(1)).toBe('winter');
    expect(getSeason(2)).toBe('spring');
    expect(getSeason(4)).toBe('spring');
    expect(getSeason(5)).toBe('summer');
    expect(getSeason(7)).toBe('summer');
    expect(getSeason(8)).toBe('autumn');
    expect(getSeason(10)).toBe('autumn');
  });
});

describe('getMunichEvent', () => {
  it('erkennt das Wiesn-Fenster (15.9.–5.10.)', () => {
    expect(getMunichEvent(new Date(2026, 8, 14))).toBeNull();
    expect(getMunichEvent(new Date(2026, 8, 15))).toBe('wiesn');
    expect(getMunichEvent(new Date(2026, 9, 2))).toBe('wiesn');
    expect(getMunichEvent(new Date(2026, 9, 5))).toBe('wiesn');
    expect(getMunichEvent(new Date(2026, 9, 6))).toBeNull();
  });

  it('erkennt das Christkindlmarkt-Fenster (25.11.–24.12.)', () => {
    expect(getMunichEvent(new Date(2026, 10, 24))).toBeNull();
    expect(getMunichEvent(new Date(2026, 10, 25))).toBe('christkindlmarkt');
    expect(getMunichEvent(new Date(2026, 11, 24))).toBe('christkindlmarkt');
    expect(getMunichEvent(new Date(2026, 11, 25))).toBeNull();
  });
});

describe('pickPhoto', () => {
  it('Events haben Vorrang vor Wetter und Tageszeit', () => {
    expect(pickPhoto('autumn', 'rain', false, 'wiesn')).toBe(PHOTOS.wiesnDay);
    expect(pickPhoto('winter', 'snow', true, 'christkindlmarkt')).toBe(PHOTOS.winterSnow);
    expect(pickPhoto('winter', 'clear', false, 'christkindlmarkt')).toBe(PHOTOS.christkindlmarktNight);
  });

  it('Schnee und Regen schlagen Tageszeit und Jahreszeit', () => {
    expect(pickPhoto('summer', 'snow', false, null)).toBe(PHOTOS.winterSnow);
    expect(pickPhoto('summer', 'rain', true, null)).toBe(PHOTOS.rainGeneric);
    expect(pickPhoto('spring', 'rain', false, null)).toBe(PHOTOS.rainGeneric);
  });

  it('nachts ohne besonderes Wetter gibt es das Nachtfoto', () => {
    expect(pickPhoto('summer', 'clear', false, null)).toBe(PHOTOS.nightGeneric);
    expect(pickPhoto('autumn', 'cloudy', false, null)).toBe(PHOTOS.nightGeneric);
  });

  it('tagsüber richtet sich das Foto nach der Jahreszeit', () => {
    expect(pickPhoto('winter', 'clear', true, null)).toBe(PHOTOS.winterSnow);
    expect(pickPhoto('spring', 'cloudy', true, null)).toBe(PHOTOS.springDay);
    expect(pickPhoto('summer', 'fog', true, null)).toBe(PHOTOS.summerDay);
    expect(pickPhoto('autumn', 'clear', true, null)).toBe(PHOTOS.autumnDay);
  });
});
