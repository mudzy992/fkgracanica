import { afterEach, describe, expect, it, vi } from 'vitest';
import { persistLanguage, storedLanguage } from './i18n-lang';

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('i18n-lang', () => {
  it('bez pohranjenog izbora vraća bosanski', () => {
    expect(storedLanguage()).toBe('bs');
  });

  it('pamti engleski i vraća ga iz localStorage', () => {
    persistLanguage('en');
    expect(localStorage.getItem('fk_lang')).toBe('en');
    expect(storedLanguage()).toBe('en');
  });

  it('nepoznata vrijednost se normalizuje na bosanski', () => {
    localStorage.setItem('fk_lang', 'de');
    expect(storedLanguage()).toBe('bs');
    persistLanguage('bs');
    expect(storedLanguage()).toBe('bs');
  });
});

describe('i18n-lang bez window', () => {
  it('na serveru vraća bosanski bez čitanja localStorage', () => {
    vi.stubGlobal('window', undefined);
    expect(storedLanguage()).toBe('bs');
  });
});
