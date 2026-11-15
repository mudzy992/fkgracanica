import { describe, expect, it } from 'vitest';
import { kpiLabel } from './dashboard-kpi-labels';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { resolveListStatus } from './screen-state';
import { newsArticleUrl, webOrigin } from './web-origin';
import { youtubeEmbedHtml, youtubeEmbedSrc } from './youtube-embed';
import {
  flattenSearchResponse,
  groupSearchItems,
  searchItemHref,
} from './search-nav';

describe('mob-batch04 — P-MOB04 lib', () => {
  it('kpiLabel vraća labelu ili key', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('activeMemberships')).toBe('Aktivna članstva');
    expect(kpiLabel('unknownKey')).toBe('unknownKey');
  });

  it('deskCounts broji live/scheduled/reports', () => {
    const matches = [
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
      { status: 'FINISHED' },
    ];
    expect(deskCounts(matches)).toEqual({ live: 2, scheduled: 1, reports: 1 });
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });

  it('filterCommentatorDesk filtrira live/today/report', () => {
    const todayIso = new Date().toISOString();
    const matches = [
      { status: 'LIVE', id: 'a' },
      { status: 'SCHEDULED', scheduledAt: todayIso, id: 'b' },
      { status: 'SCHEDULED', scheduledAt: '2020-01-01T00:00:00.000Z', id: 'c' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL', id: 'd' },
      { status: 'FINISHED', reportStatus: 'APPROVED', id: 'e' },
    ];
    const res = filterCommentatorDesk(matches as never);
    expect(res.map((r: { id: string }) => r.id)).toEqual(['a', 'b', 'd']);
  });

  it('resolveListStatus prioritizira loading/error/empty/idle', () => {
    expect(resolveListStatus({ loading: true, error: 'err', itemCount: 0 })).toBe('loading');
    expect(resolveListStatus({ loading: false, error: 'greška', itemCount: 5 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 3 })).toBe('idle');
  });

  it('webOrigin vraća env ili default', () => {
    const prev = process.env.EXPO_PUBLIC_WEB_URL;
    process.env.EXPO_PUBLIC_WEB_URL = 'https://custom.test/';
    expect(webOrigin()).toBe('https://custom.test');
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
    if (prev !== undefined) process.env.EXPO_PUBLIC_WEB_URL = prev;
  });

  it('newsArticleUrl koristi webOrigin', () => {
    expect(newsArticleUrl('moja-vijest')).toBe('https://fkgracanica.ba101.top/vijesti/moja-vijest');
  });

  it('youtubeEmbedSrc gradi url sa origin i mute', () => {
    const src = youtubeEmbedSrc('dQw4w9WgXcQ', false);
    expect(src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ?');
    expect(src).toContain('autoplay=1');
    expect(src).toContain('mute=0');
    expect(src).toContain('origin=');
    const srcMuted = youtubeEmbedSrc('abc123', true);
    expect(srcMuted).toContain('mute=1');
  });

  it('youtubeEmbedHtml sadrži src i viewport', () => {
    const html = youtubeEmbedHtml('dQw4w9WgXcQ');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('youtube.com/embed/dQw4w9WgXcQ');
    expect(html).toContain('viewport');
  });

  it('flattenSearchResponse mapira sve tipove', () => {
    const data = {
      news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }, { title: 'bez id' }],
      players: [{ id: 'p1', firstName: 'Edin', lastName: 'Džeko' }],
      clubs: [{ id: 'c1', name: 'FK G' }],
      matches: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }],
      galleries: [{ id: 'g1', slug: 'gal' }],
      trophies: [{ id: 't1' }],
      timeline: [{ id: 'tl1' }],
      hallOfFame: [{ id: 'h1' }],
      unknown: [{ id: 'u1' }],
    };
    const res = flattenSearchResponse(data);
    expect(res.length).toBe(8);
    expect(res.find((r) => r.id === 'n1')?.title).toBe('Vijest');
    expect(res.find((r) => r.id === 'p1')?.title).toBe('Edin Džeko');
    expect(res.find((r) => r.id === 'm1')?.title).toBe('A vs B');
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });

  it('groupSearchItems grupiše po orderu', () => {
    const items = [
      { id: 'n1', type: 'news', title: 'a' },
      { id: 'p1', type: 'players', title: 'b' },
      { id: 'n2', type: 'news', title: 'c' },
    ];
    const grouped = groupSearchItems(items as never);
    expect(grouped.map((g) => g.type)).toEqual(['news', 'players']);
    expect(grouped[0].data.length).toBe(2);
    expect(groupSearchItems([])).toEqual([]);
  });

  it('searchItemHref vraća putanju po tipu', () => {
    expect(searchItemHref({ id: '1', type: 'news', title: 'a', slug: 'moja' } as never)).toBe('/news/moja');
    expect(searchItemHref({ id: '1', type: 'news', title: 'a' } as never)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: 'a' } as never)).toBe('/player/p1');
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: 'a', slug: 'gal' } as never)).toBe('/gallery/gal');
    expect(searchItemHref({ id: 'm1', type: 'matches', title: 'a' } as never)).toBe('/live/m1');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a', slug: 'club' } as never)).toBe('/clubs/club');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a' } as never)).toBe('/team');
    expect(searchItemHref({ id: '1', type: 'trophies', title: 'a' } as never)).toBe('/heritage');
    expect(searchItemHref({ id: '1', type: 'unknown', title: 'a' } as never)).toBeNull();
  });
});
