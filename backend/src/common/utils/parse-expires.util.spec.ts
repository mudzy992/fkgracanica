import { MAX_EXPIRES_MS, parseExpiresToMs } from './parse-expires.util';

describe('parse-expires.util (BE-09 / P-B09-5)', () => {
  it('parsira sve jedinice', () => {
    expect(parseExpiresToMs('45s')).toBe(45_000);
    expect(parseExpiresToMs('30m')).toBe(30 * 60_000);
    expect(parseExpiresToMs('12h')).toBe(12 * 3_600_000);
    expect(parseExpiresToMs('7d')).toBe(7 * 86_400_000);
  });

  it('trimuje razmake', () => {
    expect(parseExpiresToMs('  7d  ')).toBe(7 * 86_400_000);
    expect(parseExpiresToMs('7d ')).toBe(7 * 86_400_000);
  });

  it('baca grešku na neispravan format (prije: tihi default 15 min)', () => {
    for (const bad of ['', 'abc', '7', 'd7', '7w', '7d5h', '--7d', '1.5d']) {
      expect(() => parseExpiresToMs(bad)).toThrow(/Neispravno trajanje/);
    }
  });

  it('odbija nulu (token koji ističe odmah)', () => {
    expect(() => parseExpiresToMs('0s')).toThrow(/veće od nule/);
    expect(() => parseExpiresToMs('0d')).toThrow(/veće od nule/);
  });

  it('odbija trajanje preko gornje granice (90 dana)', () => {
    expect(() => parseExpiresToMs('91d')).toThrow(/preveliko/);
    expect(() => parseExpiresToMs('999999d')).toThrow(/preveliko/);
  });

  it('dozvoljava tačno 90 dana', () => {
    expect(parseExpiresToMs('90d')).toBe(MAX_EXPIRES_MS);
  });

  it('ne prihvata ne-string', () => {
    expect(() => parseExpiresToMs(undefined as unknown as string)).toThrow(
      /Neispravno trajanje/,
    );
    expect(() => parseExpiresToMs(7 as unknown as string)).toThrow(
      /Neispravno trajanje/,
    );
  });

  it('gornja granica je 90 dana u ms', () => {
    expect(MAX_EXPIRES_MS).toBe(90 * 24 * 60 * 60 * 1000);
  });
});
