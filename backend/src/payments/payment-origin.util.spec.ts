import {
  allowedOrigins,
  isAllowedPaymentOrigin,
  normalizeOrigin,
} from './payment-origin.util';

describe('payment-origin.util (BE-07 / P-B07-5)', () => {
  const allowed = allowedOrigins(
    'https://fkgracanica.ba, http://localhost:5173/',
    'https://api.fkgracanica.ba/api/v1',
  );

  it('builds allowlist from CORS_ORIGINS + API public url', () => {
    expect(allowed).toEqual([
      'https://fkgracanica.ba',
      'http://localhost:5173',
      'https://api.fkgracanica.ba',
    ]);
  });

  it('normalizes trailing slash and case', () => {
    expect(normalizeOrigin(' HTTPS://FKGRACANICA.BA/ ')).toBe(
      'https://fkgracanica.ba',
    );
  });

  it('accepts own origins', () => {
    expect(isAllowedPaymentOrigin('https://fkgracanica.ba', allowed)).toBe(
      true,
    );
    expect(isAllowedPaymentOrigin('https://fkgracanica.ba/', allowed)).toBe(
      true,
    );
  });

  it('rejects attacker origin (was signed form for any http host)', () => {
    expect(isAllowedPaymentOrigin('https://evil.example', allowed)).toBe(false);
    expect(
      isAllowedPaymentOrigin('https://fkgracanica.ba.evil.example', allowed),
    ).toBe(false);
  });

  it('rejects empty / non-origin / non-http values', () => {
    expect(isAllowedPaymentOrigin('', allowed)).toBe(false);
    expect(isAllowedPaymentOrigin('fkgracanica.ba', allowed)).toBe(false);
    expect(isAllowedPaymentOrigin('https://fkgracanica.ba/x', allowed)).toBe(
      false,
    );
  });
});
