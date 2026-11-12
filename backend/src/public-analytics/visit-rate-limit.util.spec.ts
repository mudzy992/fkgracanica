import { isVisitRateLimited } from './visit-rate-limit.util';

/**
 * BE-05/B-05-01: prozor + limiti + sweep (ključevi se ne gomilaju).
 * Koriste se RAZLIČITI hash-ovi po testu jer je Map modulski singleton.
 */
describe('isVisitRateLimited (BE-05)', () => {
  let now = 0;
  const T0 = 1_000_000;

  beforeEach(() => {
    now = T0;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('web: 5 posjeta u prozoru prolazi, 6. je limitiran', () => {
    const h = 'web-limit-hash';
    for (let i = 0; i < 5; i++) {
      expect(isVisitRateLimited('web', h)).toBe(false);
    }
    expect(isVisitRateLimited('web', h)).toBe(true);
  });

  it('mobile: limit 15 (veći od web)', () => {
    const h = 'mobile-limit-hash';
    for (let i = 0; i < 15; i++) {
      expect(isVisitRateLimited('mobile', h)).toBe(false);
    }
    expect(isVisitRateLimited('mobile', h)).toBe(true);
  });

  it('istek prozora (60s) resetuje brojač', () => {
    const h = 'window-reset-hash';
    for (let i = 0; i < 5; i++) {
      isVisitRateLimited('web', h);
    }
    expect(isVisitRateLimited('web', h)).toBe(true);

    now += 61_000;
    expect(isVisitRateLimited('web', h)).toBe(false);
  });

  it('platforme su izolovane (web limit ne pogađa mobile)', () => {
    const h = 'platform-iso-hash';
    for (let i = 0; i < 5; i++) {
      isVisitRateLimited('web', h);
    }
    expect(isVisitRateLimited('web', h)).toBe(true);
    expect(isVisitRateLimited('mobile', h)).toBe(false);
  });

  it('sweep (B-05-01): mrtvi ključevi se ne vraćaju u zabranu nakon isteka', () => {
    const h = 'sweep-hash';
    for (let i = 0; i < 5; i++) {
      isVisitRateLimited('web', h);
    }
    expect(isVisitRateLimited('web', h)).toBe(true);

    // >60s prozor + >30s sweep interval → sljedeći poziv briše stari ključ
    // i ponašanje je svježi prozor (identično kao da ključa nikad nije bilo)
    now += 91_000;
    expect(isVisitRateLimited('web', h)).toBe(false);
    for (let i = 0; i < 4; i++) {
      expect(isVisitRateLimited('web', h)).toBe(false);
    }
    expect(isVisitRateLimited('web', h)).toBe(true);
  });
});
