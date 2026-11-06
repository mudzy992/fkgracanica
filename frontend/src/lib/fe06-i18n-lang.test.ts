import { afterEach, describe, expect, it } from 'vitest';
import { persistLanguage, storedLanguage } from './i18n-lang';

afterEach(() => localStorage.clear());

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
