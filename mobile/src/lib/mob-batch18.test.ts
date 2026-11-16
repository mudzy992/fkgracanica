import { describe, expect, it } from 'vitest';
import {
  clubsConfig,
  hallOfFameConfig,
  museumConfig,
  sponsorsConfig,
  timelineConfig,
  trophiesConfig,
} from '../components/staff/entity-configs';

describe('mob-batch18 — P-MOB18 entity-configs', () => {
  it('sponsorsConfig buildBody trims i fallback tier', () => {
    const body = sponsorsConfig.buildBody({ name: '  FK G  ', tier: '', url: '  https://x.com  ', logoPath: '  ' });
    expect(body.name).toBe('FK G');
    expect(body.tier).toBe('PARTNER');
    expect(body.url).toBe('https://x.com');
    expect(body.logoPath).toBeUndefined();
    const body2 = sponsorsConfig.buildBody({ name: 'A', tier: 'GOLD', url: '', logoPath: '/logo.png' });
    expect(body2.tier).toBe('GOLD');
    expect(body2.logoPath).toBe('/logo.png');
    expect(body2.url).toBeUndefined();
  });

  it('sponsorsConfig itemTitle/itemSubtitle', () => {
    expect(sponsorsConfig.itemTitle({ name: 'FK' } as never)).toBe('FK');
    expect(sponsorsConfig.itemTitle({} as never)).toBe('');
    expect(sponsorsConfig.itemSubtitle?.({ tier: 'GOLD' } as never)).toBe('GOLD');
    expect(sponsorsConfig.endpoint).toBe('/sponsors');
    expect(sponsorsConfig.permission).toBe('sponsors.manage');
  });

  it('trophiesConfig buildBody name trim i year broj', () => {
    const body = trophiesConfig.buildBody({ name: '  Kup  ', year: '2020', competition: ' Liga ', description: '  desc  ', imagePath: '  ' });
    expect(body.name).toBe('Kup');
    expect(body.year).toBe(2020);
    expect(body.competition).toBe('Liga');
    expect(body.description).toBe('desc');
    expect(body.imagePath).toBeUndefined();
  });

  it('trophiesConfig buildBody year fallback na trenutnu godinu kad nevažeće', () => {
    const cur = new Date().getFullYear();
    const body = trophiesConfig.buildBody({ name: 'T', year: 'abc', competition: ' ', description: '', imagePath: '' });
    expect(body.year).toBe(cur);
    expect(body.competition).toBeUndefined();
    const body2 = trophiesConfig.buildBody({ name: 'T', year: '', competition: '', description: '', imagePath: '' });
    expect(body2.year).toBe(0);
  });

  it('trophiesConfig itemTitle/itemSubtitle', () => {
    expect(trophiesConfig.itemTitle({ name: 'Trofej' } as never)).toBe('Trofej');
    expect(trophiesConfig.itemSubtitle?.({ year: 2023 } as never)).toBe('2023');
    expect(trophiesConfig.itemSubtitle?.({} as never)).toBe('');
  });

  it('timelineConfig buildBody year fallback i trim title', () => {
    const cur = new Date().getFullYear();
    const body = timelineConfig.buildBody({ year: '1999', title: '  Događaj  ', description: '  opis ', imagePath: ' /img.jpg ' });
    expect(body.year).toBe(1999);
    expect(body.title).toBe('Događaj');
    expect(body.description).toBe('opis');
    expect(body.imagePath).toBe('/img.jpg');
    const body2 = timelineConfig.buildBody({ year: 'ne', title: 'X', description: ' ', imagePath: '' });
    expect(body2.year).toBe(cur);
    expect(body2.description).toBeUndefined();
  });

  it('timelineConfig itemTitle/itemSubtitle', () => {
    expect(timelineConfig.itemTitle({ title: 'T' } as never)).toBe('T');
    expect(timelineConfig.itemSubtitle?.({ year: 2020 } as never)).toBe('2020');
  });

  it('hallOfFameConfig buildBody trim name/role i opt', () => {
    const body = hallOfFameConfig.buildBody({ name: '  Ime  ', role: '  Kapiten  ', years: ' 2020-2021 ', bio: '  bio ', imagePath: '  ' });
    expect(body.name).toBe('Ime');
    expect(body.role).toBe('Kapiten');
    expect(body.years).toBe('2020-2021');
    expect(body.bio).toBe('bio');
    expect(body.imagePath).toBeUndefined();
    const body2 = hallOfFameConfig.buildBody({ name: 'A', role: 'B', years: ' ', bio: '', imagePath: '' });
    expect(body2.years).toBeUndefined();
    expect(body2.bio).toBeUndefined();
  });

  it('hallOfFameConfig itemTitle/itemSubtitle', () => {
    expect(hallOfFameConfig.itemTitle({ name: 'N' } as never)).toBe('N');
    expect(hallOfFameConfig.itemSubtitle?.({ role: 'R' } as never)).toBe('R');
  });

  it('museumConfig buildBody category fallback i year', () => {
    const body = museumConfig.buildBody({ title: '  Eksponat  ', category: '', year: '2021', description: '  ', imagePath: '' });
    expect(body.title).toBe('Eksponat');
    expect(body.category).toBe('other');
    expect(body.year).toBe(2021);
    expect(body.description).toBeUndefined();
    const body2 = museumConfig.buildBody({ title: 'T', category: 'photo', year: 'abc', description: 'd', imagePath: '/x.jpg' });
    expect(body2.category).toBe('photo');
    expect(body2.year).toBeUndefined();
    expect(body2.description).toBe('d');
    expect(body2.imagePath).toBe('/x.jpg');
  });

  it('museumConfig itemTitle/itemSubtitle i permission', () => {
    expect(museumConfig.itemTitle({ title: 'M' } as never)).toBe('M');
    expect(museumConfig.itemSubtitle?.({ category: 'photo' } as never)).toBe('photo');
    expect(museumConfig.permission).toBe('museum.manage');
    expect(museumConfig.fields.some((f) => f.key === 'category')).toBe(true);
  });

  it('clubsConfig buildBody city/stadium opt i fields', () => {
    const body = clubsConfig.buildBody({ name: '  FK  ', city: '  Gračanica ', stadium: '  ', description: ' ', crestPath: '/crest.png' });
    expect(body.name).toBe('FK');
    expect(body.city).toBe('Gračanica');
    expect(body.stadium).toBeUndefined();
    expect(body.description).toBeUndefined();
    expect(body.crestPath).toBe('/crest.png');
    const body2 = clubsConfig.buildBody({ name: 'A', city: '', stadium: 'Stadion', description: 'opis', crestPath: ' ' });
    expect(body2.stadium).toBe('Stadion');
    expect(body2.crestPath).toBeUndefined();
    expect(clubsConfig.itemTitle({ name: 'FK' } as never)).toBe('FK');
    expect(clubsConfig.itemSubtitle?.({ city: 'G' } as never)).toBe('G');
    expect(clubsConfig.endpoint).toBe('/clubs');
  });
});
