import { describe, expect, it } from 'vitest';
import {
  heroBackgroundImageClass,
  heroBackgroundOnDesktop,
  heroBackgroundOnMobile,
} from './hero-background-utils';
import { isHeroMatchDockVisible, pickNextAndLast } from './hero-match-utils';

const match = (over: Record<string, unknown>) => ({
  id: 'm1',
  status: 'SCHEDULED',
  scheduledAt: '2026-05-01T17:00:00Z',
  ...over,
});

describe('heroBackgroundImageClass', () => {
  it('mapira svaku opciju prikaza u klasu', () => {
    expect(heroBackgroundImageClass('all')).toBe('');
    expect(heroBackgroundImageClass('desktop')).toBe('hidden lg:block');
    expect(heroBackgroundImageClass('mobile')).toBe('lg:hidden');
    expect(heroBackgroundImageClass('none')).toBe('hidden');
  });

  it('bez argumenta koristi „all“', () => {
    expect(heroBackgroundImageClass()).toBe('');
    expect(heroBackgroundOnMobile()).toBe(true);
    expect(heroBackgroundOnDesktop()).toBe(true);
  });
});

describe('heroBackgroundOnMobile / OnDesktop', () => {
  it('mobitel vidi sliku za all i mobile', () => {
    expect(heroBackgroundOnMobile('all')).toBe(true);
    expect(heroBackgroundOnMobile('mobile')).toBe(true);
    expect(heroBackgroundOnMobile('desktop')).toBe(false);
    expect(heroBackgroundOnMobile('none')).toBe(false);
  });

  it('desktop vidi sliku za all i desktop', () => {
    expect(heroBackgroundOnDesktop('all')).toBe(true);
    expect(heroBackgroundOnDesktop('desktop')).toBe(true);
    expect(heroBackgroundOnDesktop('mobile')).toBe(false);
    expect(heroBackgroundOnDesktop('none')).toBe(false);
  });
});

describe('pickNextAndLast', () => {
  const future = '2099-05-01T17:00:00Z';
  const past = '2020-05-01T17:00:00Z';

  it('bez utakmica vraća prazno', () => {
    expect(pickNextAndLast(undefined)).toEqual({ next: undefined, last: undefined });
  });

  it('bira najbližu zakazanu utakmicu u budućnosti', () => {
    const data = [
      match({ id: 'dalja', scheduledAt: '2099-06-01T17:00:00Z' }),
      match({ id: 'bliža', scheduledAt: future }),
      match({ id: 'prošla', scheduledAt: past }),
    ] as never;
    expect(pickNextAndLast(data).next?.id).toBe('bliža');
  });

  it('ignoriše zakazane utakmice u prošlosti', () => {
    const data = [match({ id: 'stara', scheduledAt: past })] as never;
    expect(pickNextAndLast(data).next).toBeUndefined();
  });

  it('bira najnoviju završenu utakmicu', () => {
    const data = [
      match({ id: 'starija', status: 'FINISHED', scheduledAt: '2024-01-01T00:00:00Z' }),
      match({ id: 'novija', status: 'FINISHED', scheduledAt: '2024-03-01T00:00:00Z' }),
      match({ id: 'live', status: 'LIVE', scheduledAt: future }),
    ] as never;
    expect(pickNextAndLast(data).last?.id).toBe('novija');
  });
});

describe('isHeroMatchDockVisible', () => {
  it('sakriva dock kad su utakmice isključene', () => {
    const data = [match({ scheduledAt: '2099-05-01T17:00:00Z' })] as never;
    expect(isHeroMatchDockVisible(data, false, true)).toBe(false);
  });

  it('prikazuje dock kad postoji sljedeća utakmica', () => {
    const data = [match({ scheduledAt: '2099-05-01T17:00:00Z' })] as never;
    expect(isHeroMatchDockVisible(data, true, false)).toBe(true);
  });

  it('zadnji rezultat poštuje svoj prekidač', () => {
    const data = [match({ status: 'FINISHED', scheduledAt: '2020-05-01T17:00:00Z' })] as never;
    expect(isHeroMatchDockVisible(data, true, true)).toBe(true);
    expect(isHeroMatchDockVisible(data, true, false)).toBe(false);
  });

  it('bez utakmica dock je skriven', () => {
    expect(isHeroMatchDockVisible(undefined, true, true)).toBe(false);
    expect(isHeroMatchDockVisible([], true, true)).toBe(false);
  });
});
