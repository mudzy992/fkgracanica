import { describe, expect, it } from 'vitest';
import { pickHeroConfig } from '../components/home/pick-hero-config';
import { isMatchLive, pickFeaturedMatch, pickLastResult } from '../components/home/pick-home-matches';
import { homeInset, homeRadius, homeSurface } from '../components/home/home-surface';
describe('mob-batch39 — P-MOB39 home picks/surface', () => {
  it('pickHeroConfig null bez hero', () => {
    expect(pickHeroConfig(null)).toBeNull(); expect(pickHeroConfig({ sections: [] } as any)).toBeNull();
    expect(pickHeroConfig({ sections: [{ enabled: false, widgetType: 'hero', config: {} }] } as any)).toBeNull();
  });
  it('pickHeroConfig mapira config', () => {
    const r = pickHeroConfig({ sections: [{ enabled: true, widgetType: 'hero', config: { title: 'T', subtitle: '  ', foundedYear: '1990', backgroundImage: 'img' } }] } as any);
    expect(r?.title).toBe('T'); expect(r?.subtitle).toBeUndefined(); expect(r?.foundedYear).toBe('1990');
  });
  it('pickHeroConfig trim prazno', () => {
    const r = pickHeroConfig({ sections: [{ enabled: true, widgetType: 'hero', config: { title: '   ' } }] } as any);
    expect(r?.title).toBeUndefined();
  });
  it('isMatchLive live/halftime', () => {
    expect(isMatchLive({ status: 'LIVE' } as any)).toBe(true); expect(isMatchLive({ status: 'HALFTIME' } as any)).toBe(true);
    expect(isMatchLive({ status: 'FINISHED' } as any)).toBe(false);
  });
  it('pickFeaturedMatch bira live pre upcoming', () => {
    const now = new Date('2026-06-01'); const orig = Date.now; Date.now = () => now.getTime();
    const live = { id: 'l1', status: 'LIVE', scheduledAt: '2026-06-01T10:00:00Z' } as any;
    const up = { id: 'u1', status: 'SCHEDULED', scheduledAt: new Date(now.getTime() + 100000).toISOString() } as any;
    expect(pickFeaturedMatch([up, live])?.id).toBe('l1'); Date.now = orig;
  });
  it('pickFeaturedMatch upcoming sort', () => {
    const now = new Date('2026-01-01'); const orig = Date.now; Date.now = () => now.getTime();
    const m1 = { id: '1', status: 'SCHEDULED', scheduledAt: new Date(now.getTime() + 200000).toISOString() } as any;
    const m2 = { id: '2', status: 'SCHEDULED', scheduledAt: new Date(now.getTime() + 100000).toISOString() } as any;
    expect(pickFeaturedMatch([m1, m2])?.id).toBe('2'); Date.now = orig;
  });
  it('pickFeaturedMatch nema live/upcoming null', () => {
    expect(pickFeaturedMatch([{ status: 'FINISHED', scheduledAt: '2026-01-01' } as any])).toBeNull();
  });
  it('pickLastResult najnoviji FINISHED', () => {
    const r = pickLastResult([{ id: '1', status: 'FINISHED', scheduledAt: '2026-01-01' } as any, { id: '2', status: 'FINISHED', scheduledAt: '2026-02-01' } as any, { id: '3', status: 'LIVE', scheduledAt: '2026-03-01' } as any]);
    expect(r?.id).toBe('2');
  });
  it('pickLastResult prazno null', () => { expect(pickLastResult([])).toBeNull(); });
  it('homeSurface live/shadow', () => {
    const colors = { background: '#fff', surface: '#eee' } as any;
    expect(homeSurface(colors, true).shadowOpacity).toBe(0.12); expect(homeSurface(colors, false).shadowOpacity).toBe(0.06);
    expect(homeSurface(colors).borderRadius).toBe(homeRadius);
  });
  it('homeInset koristi surface', () => {
    const c = { surface: '#abc' } as any; expect(homeInset(c).backgroundColor).toBe('#abc');
  });
});
