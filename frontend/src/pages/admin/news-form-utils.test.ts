import { describe, expect, it } from 'vitest';
import { emptyNewsForm, formToNewsBody, newsItemToForm } from './news-form-utils';

describe('video polje pri spremanju vijesti', () => {
  it('prazno polje eksplicitno uklanja prethodni video', () => {
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }).videoUrl).toBeNull();
  });
  it('čuva i neizmijenjeni prazni string iz starog zapisa', () => {
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }, '').videoUrl).toBe('');
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }, null).videoUrl).toBeNull();
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }, 'https://legacy.invalid').videoUrl).toBeNull();
  });
  it('ne prepisuje neizmijenjeni legacy URL na klijentu', () => {
    const legacy = ' https://notyoutube.com/watch?v=abc123XYZ01 ';
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: legacy }).videoUrl).toBe(legacy);
  });

  it('mapira zapis vijesti u formu sa tagovima i povezanim zapisima', () => {
    const form = newsItemToForm({
      title: 'Naslov', slug: 'naslov', excerpt: null, content: '<p>x</p>', coverPath: null,
      videoUrl: null, categoryId: null, category: { id: 'cat-1' },
      tags: [{ id: 't1', name: 'derbi' }, { id: 't2', name: 'kup' }],
      seoTitle: null, seoDesc: null, galleryId: null,
      scheduledAt: '2026-11-06T18:30:00.000Z',
      relatedMatches: [
        { matchId: 'm1' }, { match: { id: 'm2' } }, { match: null, matchId: null },
      ],
      relatedPlayers: [{ player: { id: 'p1' } }],
    } as never);
    expect(form.tagsCsv).toBe('derbi, kup');
    expect(form.categoryId).toBe('cat-1');
    expect(form.scheduledAt).toBe('2026-11-06T18:30');
    expect(form.relatedMatchIds).toEqual(['m1', 'm2']);
    expect(form.relatedPlayerIds).toEqual(['p1']);
  });
});
