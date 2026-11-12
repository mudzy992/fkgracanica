import { slugify } from './slug.util';

/**
 * BE-09/P-B09-4 (odobreno 2026-11-03): `đ/Đ` se ne dekompozira NFD-om —
 * prije je „Građanski” davalo `gra-anski`, a „Đakovo” → `akovo`.
 */
describe('slugify (BE-09 / P-B09-4)', () => {
  it('pretvara đ/Đ u d', () => {
    expect(slugify('Građanski derbi')).toBe('gradanski-derbi');
    expect(slugify('Đakovo')).toBe('dakovo');
    expect(slugify('NAĐA')).toBe('nada');
  });

  it('zadržava ispravno ponašanje za č/ć/š/ž', () => {
    expect(slugify('Čelični Željezničar Šantić')).toBe(
      'celicni-zeljeznicar-santic',
    );
  });

  it('transliterira ß/æ/ø/ł/œ', () => {
    expect(slugify('Straße')).toBe('strasse');
    expect(slugify('Ærø')).toBe('aero');
    expect(slugify('Łódź')).toBe('lodz');
    expect(slugify('Œuvre')).toBe('oeuvre');
  });

  it('sklanja interpunkciju i trimuje crtice', () => {
    expect(slugify('  — FK Gračanica!  ')).toBe('fk-gracanica');
  });

  it('prazan/nevalidan unos daje prazan string (fallback je na pozivaocu)', () => {
    expect(slugify('')).toBe('');
    expect(slugify('!!!')).toBe('');
  });
});
