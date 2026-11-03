/**
 * BE-09/P-B09-4 (odobreno 2026-11-03): `đ/Đ`, `ß`, `æ/Æ`, `ø/Ø`, `ł/Ł` se ne
 * dekompoziraju NFD normalizacijom, pa ih je regex `[^a-z0-9]` pretvarao u `-`:
 * „Građanski” → `gra-anski`, „Đakovo” → `akovo`. Mapa se primjenjuje PRIJE
 * normalizacije.
 */
const TRANSLITERATIONS: Record<string, string> = {
  đ: 'd',
  ß: 'ss',
  æ: 'ae',
  ø: 'o',
  ł: 'l',
  œ: 'oe',
  þ: 'th',
  ð: 'd',
};

export function slugify(text: string): string {
  const transliterated = text
    .toLowerCase()
    .replace(/[đßæøłœþð]/g, (char) => TRANSLITERATIONS[char] ?? char);
  return transliterated
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
