import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { emptyWriterArticle, mapWriterArticle, writerWritePayload } from '../components/writer/writer-article';
import { filterEntityHits } from '../components/writer/entity-search';
import { newsBodyEditorHtml } from '../components/writer/news-body-html';

describe('mob-batch16 — P-MOB16 writer', () => {
  it('emptyWriterArticle vraća defaults', () => {
    const a = emptyWriterArticle();
    expect(a.id).toBe('');
    expect(a.status).toBe('DRAFT');
    expect(a.categoryId).toBeNull();
    expect(a.relatedPlayers).toEqual([]);
    expect(a.gallery).toBeNull();
  });

  it('mapWriterArticle mapira polja', () => {
    const raw = {
      id: 'n1',
      title: 'Naslov',
      slug: 'naslov',
      excerpt: 'Ex',
      content: '<p>Hi</p>',
      status: 'PUBLISHED',
      categoryId: 'c1',
      coverPath: '/cover.jpg',
      videoUrl: 'https://youtu.be/abc',
      tags: [{ name: 'tag1' }, { name: 'tag2' }],
      seoTitle: 'SEO',
      seoDesc: 'Desc',
      scheduledAt: '2024-01-15T12:00:00.000Z',
      galleryId: 'g1',
      gallery: { id: 'g1', title: 'Galerija' },
      relatedPlayers: [{ player: { id: 'p1', firstName: 'A', lastName: 'B' } }],
      relatedMatches: [{ match: { id: 'm1', homeClub: { name: 'H' }, awayClub: { name: 'A' }, scheduledAt: '2024-02-01T00:00:00Z' } }],
    };
    const res = mapWriterArticle(raw as never);
    expect(res.id).toBe('n1');
    expect(res.title).toBe('Naslov');
    expect(res.tagsCsv).toBe('tag1, tag2');
    expect(res.gallery?.id).toBe('g1');
    expect(res.gallery?.label).toBe('Galerija');
    expect(res.relatedPlayers[0].id).toBe('p1');
    expect(res.relatedPlayers[0].label).toBe('A B');
    expect(res.relatedMatches[0].label).toBe('H vs A · 2024-02-01');
    expect(res.scheduledAt).toBe('2024-01-15T12:00');
  });

  it('mapWriterArticle prazno i gallery fallback', () => {
    const res = mapWriterArticle({} as never);
    expect(res.id).toBe('');
    expect(res.status).toBe('DRAFT');
    expect(res.tagsCsv).toBe('');
    expect(res.gallery).toBeNull();
    expect(res.relatedPlayers).toEqual([]);
    expect(res.scheduledAt).toBe('');
  });

  it('mapWriterArticle tags i galleryId', () => {
    const res = mapWriterArticle({ galleryId: 'g2', gallery: {} } as never);
    expect(res.gallery?.id).toBe('g2');
    expect(res.gallery?.label).toBe('g2');
  });

  it('writerWritePayload trim i tags', () => {
    const article = emptyWriterArticle();
    article.title = '  Naslov  ';
    article.slug = '  naslov  ';
    article.content = '  <p>Hi</p>  ';
    article.tagsCsv = ' a, b , ,c ';
    article.scheduledAt = ' 2024-01-15T12:00 ';
    article.gallery = { id: 'g1', label: 'G' };
    article.relatedPlayers = [{ id: 'p1', label: 'A B' }];
    const payload = writerWritePayload(article);
    expect(payload.title).toBe('Naslov');
    expect(payload.slug).toBe('naslov');
    expect(payload.content).toBe('<p>Hi</p>');
    expect(payload.tags).toEqual(['a', 'b', 'c']);
    expect(payload.scheduledAt).toBe('2024-01-15T12:00');
    expect(payload.galleryId).toBe('g1');
    expect(payload.relatedPlayerIds).toEqual(['p1']);
  });

  it('writerWritePayload prazno title/content fallback', () => {
    const article = emptyWriterArticle();
    article.title = '   ';
    article.content = '   ';
    const payload = writerWritePayload(article);
    expect(payload.title).toBe('');
    expect(payload.content).toBe('<p></p>');
    expect(payload.slug).toBeUndefined();
    expect(payload.galleryId).toBeNull();
  });

  it('filterEntityHits prazan query vraća 40', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: String(i), label: `Item ${i}` }));
    expect(filterEntityHits(items, '').length).toBe(40);
    expect(filterEntityHits(items, '   ').length).toBe(40);
  });

  it('filterEntityHits filtrira case-insensitive', () => {
    const items = [
      { id: '1', label: 'FK Gračanica' },
      { id: '2', label: 'Hajduk' },
      { id: '3', label: 'gračanica test' },
    ];
    expect(filterEntityHits(items, 'gračanica').map((x) => x.id)).toEqual(['1', '3']);
    expect(filterEntityHits(items, 'GRAČANICA').map((x) => x.id)).toEqual(['1', '3']);
    expect(filterEntityHits(items, 'xyz')).toEqual([]);
  });

  it('filterEntityHits limit 40 i nakon filtera', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: String(i), label: 'test' }));
    expect(filterEntityHits(items, 'test').length).toBe(40);
  });

  it('newsBodyEditorHtml sadrži DOCTYPE i seed', () => {
    const html = newsBodyEditorHtml('<p>Hello</p>');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<meta name="viewport"');
    expect(html).toContain('Hello');
    expect(html).toContain('ReactNativeWebView');
    expect(html).toContain('contenteditable="true"');
  });

  it('newsBodyEditorHtml prazan fallback', () => {
    const html = newsBodyEditorHtml('');
    expect(html).toContain('<p></p>');
    expect(html).toContain('<!DOCTYPE html>');
  });
});
