import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { api } from './api';
import { emptyExtras, loadHomeExtras } from '../components/home/load-home-extras';
const get = vi.mocked(api.get);
function baseMock(o: Record<string, unknown> = {}) {
  get.mockImplementation(async (u: string) => {
    if (u in o) return { data: (o as any)[u] } as never;
    if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
    if (u === '/seasons' || u.includes('standings') || u === '/players') return { data: [] } as never;
    if (u.includes('stats') || u.includes('gallery') || u.includes('troph')) return { data: [] } as never;
    if (u === '/gallery' || u === '/trophies' || u === '/sponsors' || u === '/club-timeline') return { data: [] } as never;
    return { data: null } as never;
  });
}
describe('mob-batch32 — P-MOB32 load-home-extras', () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockReset(); get.mockResolvedValue({ data: null } as never); });
  it('emptyExtras ima očekivani oblik', () => {
    expect(emptyExtras.players).toEqual([]);
    expect(emptyExtras.leagueRows).toEqual([]);
    expect(emptyExtras.gallery).toEqual([]);
    expect(emptyExtras.trophies).toEqual([]);
    expect(emptyExtras.sponsors).toEqual([]);
    expect(emptyExtras.timeline).toEqual([]);
  });
  it('gallery mapira slice 3, title fallback Album i photoCount', async () => {
    baseMock({ '/gallery': [{ id: 'g1', slug: 's1', title: 'T1', coverPath: '/c1.jpg', photos: [{ path: '/p1.jpg' }, { path: '/p2.jpg' }] }, { id: 'g2', photos: [] }, { id: 'g3', title: '' }, { id: 'g4', title: 'T4' }] });
    const r = await loadHomeExtras();
    expect(r.gallery.length).toBe(3);
    expect(r.gallery[0].title).toBe('T1');
    expect(r.gallery[0].coverPath).toBe('/c1.jpg');
    expect(r.gallery[0].photoCount).toBe(2);
    expect(r.gallery[1].title).toBe('Album');
    expect(r.gallery[1].slug).toBe('');
  });
  it('gallery coverPath fallback heroPath i photos[0]', async () => {
    baseMock({ '/gallery': [{ id: 'g1', photos: [{ imagePath: '/img.jpg' }], heroPath: '/hero.jpg' }, { id: 'g2', photos: [{ path: '/p.jpg' }] }, { id: 'g3', photos: [{ imagePath: '/i2.jpg' }] }] });
    const r = await loadHomeExtras();
    expect(r.gallery[0].coverPath).toBe('/hero.jpg');
    expect(r.gallery[1].coverPath).toBe('/p.jpg');
    expect(r.gallery[2].coverPath).toBe('/i2.jpg');
  });
  it('gallery photoCount iz record.photoCount kad nema photos', async () => {
    baseMock({ '/gallery': [{ id: 'g1', photoCount: 5, photos: [] }] });
    expect((await loadHomeExtras()).gallery[0].photoCount).toBe(5);
  });
  it('trophies mapira year —, name fallback i featured', async () => {
    baseMock({ '/trophies': [{ id: 't1', year: '2020', name: 'Kup', featured: 1, imagePath: '/k.jpg', competition: 'Liga' }, { id: 't2', title: 'Titula' }, { id: 't3' }] });
    const r = await loadHomeExtras();
    expect(r.trophies.length).toBe(3);
    expect(r.trophies[0].year).toBe('2020');
    expect(r.trophies[0].featured).toBe(true);
    expect(r.trophies[0].competition).toBe('Liga');
    expect(r.trophies[1].name).toBe('Titula');
    expect(r.trophies[2].year).toBe('—');
    expect(r.trophies[2].name).toBe('Trofej');
    expect(r.trophies[2].featured).toBe(false);
  });
  it('sponsors mapira name fallback Sponzor', async () => {
    baseMock({ '/sponsors': [{ id: 's1', logoPath: '/l.jpg', url: '/u' }, { id: 's2' }] });
    const r = await loadHomeExtras();
    expect(r.sponsors[0].name).toBe('Sponzor');
    expect(r.sponsors[0].logoPath).toBe('/l.jpg');
    expect(r.sponsors[0].url).toBe('/u');
    expect(r.sponsors[1].logoPath).toBeUndefined();
  });
  it('timeline year parsira broj i string, filtrira bez imagePath', async () => {
    baseMock({ '/club-timeline': [{ id: 'a', year: 1990, title: 'A', imagePath: '/a.jpg' }, { id: 'b', year: '2000', title: 'B', photoPath: '/b.jpg' }, { id: 'c', year: 'abc', title: 'C', imagePath: '/c.jpg' }] });
    const r = await loadHomeExtras();
    const ids = r.timeline.map((t) => t.id);
    expect(ids).toContain('a'); expect(ids).toContain('b'); expect(ids).toContain('c'); expect(ids).not.toContain('f');
    const by = Object.fromEntries(r.timeline.map((t) => [t.id, t.year]));
    expect(by['a']).toBe(1990); expect(by['b']).toBe(2000); expect(by['c']).toBeUndefined();
    baseMock({ '/club-timeline': [{ id: 'd', year: 0, title: 'D', imagePath: '/d.jpg' }, { id: 'e', year: -5, title: 'E', imagePath: '/e.jpg' }] });
    const by2 = Object.fromEntries((await loadHomeExtras()).timeline.map((t) => [t.id, t.year]));
    expect(by2['d']).toBe(0); expect(by2['e']).toBe(-5);
  });
  it('timeline sortira po godini i slice 3, imagePath prioritet', async () => {
    baseMock({ '/club-timeline': [{ id: 'x', year: 2020, title: 'X', imagePath: '/x.jpg', photoPath: '/xp.jpg' }, { id: 'y', year: 1980, title: 'Y', photoPath: '/y.jpg' }, { id: 'z', year: 2000, title: 'Z', imagePath: '/z.jpg' }, { id: 'w', year: 1995, title: 'W', imagePath: '/w.jpg' }] });
    const r = await loadHomeExtras();
    expect(r.timeline.length).toBe(3);
    expect(r.timeline[0].id).toBe('y'); expect(r.timeline[0].imagePath).toBe('/y.jpg'); expect(r.timeline[1].id).toBe('w'); expect(r.timeline[0].year).toBe(1980);
  });
  it('timeline span start min, end max(currentYear, maxYear)', async () => {
    const cur = new Date().getFullYear();
    baseMock({ '/club-timeline': [{ id: 'a', year: 1990, title: 'A', imagePath: '/a.jpg' }, { id: 'b', year: cur - 1, title: 'B', imagePath: '/b.jpg' }] });
    const r = await loadHomeExtras();
    expect(r.timelineSpan?.start).toBe(1990); expect(r.timelineSpan?.end).toBe(cur);
    baseMock({ '/club-timeline': [{ id: 'a', year: cur + 5, title: 'A', imagePath: '/a.jpg' }] });
    expect((await loadHomeExtras()).timelineSpan?.end).toBe(cur + 5);
  });
  it('timeline bez godina nema span', async () => {
    baseMock({ '/club-timeline': [{ id: 'a', title: 'A', imagePath: '/a.jpg' }] });
    const r = await loadHomeExtras();
    expect(r.timelineSpan).toBeUndefined(); expect(r.timeline.length).toBe(1);
  });
  it('loadHomeExtras hvata greške i vraća prazno', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/gallery' || u === '/trophies' || u === '/sponsors' || u === '/club-timeline') throw new Error('fail ' + u);
      if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (u === '/seasons' || u.includes('standings') || u === '/players') return { data: [] } as never;
      return { data: null } as never;
    });
    const r = await loadHomeExtras();
    expect(r.gallery).toEqual([]); expect(r.trophies).toEqual([]); expect(r.sponsors).toEqual([]); expect(r.timeline).toEqual([]); expect(r.leagueRows).toEqual([]);
  });
});
