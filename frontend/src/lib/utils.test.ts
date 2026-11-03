import { describe, expect, it } from 'vitest';
import { cn, formatDate, formatDateTime } from './utils';

describe('cn (FE-02)', () => {
  it('spaja klase i rješava konflikte Tailwind utilitija', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-text', false && 'hidden', undefined, 'font-bold')).toBe('text-text font-bold');
  });

  it('prihvata uslovne objekte i nizove', () => {
    expect(cn({ block: true, hidden: false }, ['a', 'b'])).toBe('block a b');
  });
});

describe('formatDate', () => {
  it('formatira datum kao dd.mm.yyyy', () => {
    expect(formatDate(new Date(2026, 10, 3, 14, 5))).toBe('03.11.2026');
  });

  it('vraća crticu za neispravan datum', () => {
    expect(formatDate('nije-datum')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('dodaje vrijeme na formatirani datum', () => {
    const out = formatDateTime(new Date(2026, 10, 3, 14, 5));
    expect(out.startsWith('03.11.2026 ')).toBe(true);
    expect(out).toMatch(/1?4[:.]05/);
  });

  it('vraća crticu za neispravan datum', () => {
    expect(formatDateTime('2026-13-45')).toBe('—');
  });
});
