import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-linking', () => ({
  parse: (url: string) => {
    try {
      const u = new URL(url);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => {
        params[k] = v;
      });
      return { queryParams: params };
    } catch {
      return { queryParams: {} };
    }
  },
  createURL: (p: string) => `fkgracanica://${p}`,
}));
vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: () => {},
  openAuthSessionAsync: async () => ({ type: 'dismiss' as const }),
}));
vi.mock('expo-secure-store', () => ({
  getItemAsync: async () => null,
  setItemAsync: async () => {},
  deleteItemAsync: async () => {},
}));
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Linking: { openURL: async () => {} },
}));

import { matchEventLabelKey } from './match-events';
import { brand, colors, darkColors, spacing, typography } from './theme';
import { finishCheckoutReturn, parseCheckoutKind } from './start-mobile-checkout';

describe('mob-batch05 — P-MOB05 lib', () => {
  it('matchEventLabelKey mapira poznate tipove', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('HALFTIME')).toBe('eventHalftime');
    expect(matchEventLabelKey('FULL_TIME')).toBe('eventFullTime');
  });

  it('matchEventLabelKey fallback na eventOther', () => {
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
    expect(matchEventLabelKey('')).toBe('eventOther');
    expect(matchEventLabelKey('goal')).toBe('eventOther');
  });

  it('theme brand i darkColors sadrže ključeve', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.accent).toBe('#2563EB');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(colors).toEqual(darkColors);
  });

  it('theme spacing i typography', () => {
    expect(spacing.md).toBe(16);
    expect(spacing.xl).toBe(32);
    expect(typography.title.fontSize).toBe(24);
    expect(typography.caption.fontSize).toBe(13);
  });

  it('parseCheckoutKind vraća validan kind ili tickets', () => {
    expect(parseCheckoutKind('tickets')).toBe('tickets');
    expect(parseCheckoutKind('membership')).toBe('membership');
    expect(parseCheckoutKind('season')).toBe('season');
    expect(parseCheckoutKind('unknown')).toBe('tickets');
    expect(parseCheckoutKind(undefined)).toBe('tickets');
    expect(parseCheckoutKind('')).toBe('tickets');
  });

  it('finishCheckoutReturn cancelled kad cancelled=1', async () => {
    // mock Linking.parse via expo-linking? use real parse with URL
    const res = await finishCheckoutReturn('tickets', 'fkgracanica://payment-return?cancelled=1');
    expect(res).toBe('cancelled');
  });

  it('finishCheckoutReturn dismissed kad nema session_id', async () => {
    const res = await finishCheckoutReturn('tickets', 'fkgracanica://payment-return?paid=1');
    expect(res).toBe('dismissed');
  });

  it('finishCheckoutReturn baca kad nema api mock ali cancelled već vraćen', async () => {
    // već pokriveno, samo provjeri da ne baca za cancelled
    const res = await finishCheckoutReturn('membership', 'fkgracanica://payment-return?cancelled=1&session_id=abc');
    expect(res).toBe('cancelled');
  });
});
