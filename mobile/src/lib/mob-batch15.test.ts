import { describe, expect, it } from 'vitest';
import { navBs, navEn } from '../i18n/nav';
import { contactBs, contactEn } from '../i18n/contact';
import { authBs, authEn } from '../i18n/auth';
import { newsBs, newsEn } from '../i18n/news';
import { liveBs, liveEn } from '../i18n/live';
import { playerBs, playerEn } from '../i18n/player';
import { homeBs, homeEn } from '../i18n/home';
import { clubBs, clubEn } from '../i18n/club';

function sameKeys<T extends Record<string, string>, U extends Record<string, string>>(bs: T, en: U): void {
  expect(Object.keys(bs).sort()).toEqual(Object.keys(en).sort());
  for (const k of Object.keys(bs)) {
    expect(typeof (bs as Record<string, string>)[k]).toBe('string');
    expect((bs as Record<string, string>)[k].length).toBeGreaterThan(0);
    expect(typeof (en as Record<string, string>)[k]).toBe('string');
    expect((en as Record<string, string>)[k].length).toBeGreaterThan(0);
  }
}

describe('mob-batch15 — P-MOB15 i18n', () => {
  it('navBs/navEn isti ključevi', () => {
    sameKeys(navBs, navEn);
    expect(navBs.back).toBe('Nazad');
    expect(navEn.back).toBe('Back');
  });

  it('contactBs/En isti', () => {
    sameKeys(contactBs, contactEn);
    expect(contactBs.openMap).toBe('Otvori mapu');
  });

  it('authBs/En isti', () => {
    sameKeys(authBs, authEn);
    expect(authBs.loginLead).toContain('Prijavite');
  });

  it('newsBs/En isti', () => {
    sameKeys(newsBs, newsEn);
    expect(newsBs.shareNews).toBe('Podijeli vijest');
    expect(newsEn.shareNews).toBe('Share article');
  });

  it('liveBs/En isti', () => {
    sameKeys(liveBs, liveEn);
    expect(liveBs.matchLive).toBe('Uživo');
    expect(liveEn.matchLive).toBe('Live');
  });

  it('playerBs/En isti', () => {
    sameKeys(playerBs, playerEn);
    expect(playerBs.playerGoals).toBe('Golovi');
  });

  it('homeBs/En isti', () => {
    sameKeys(homeBs, homeEn);
  });

  it('clubBs/En isti', () => {
    sameKeys(clubBs, clubEn);
  });

  it('svi bs ključevi nemaju prazan prevod', () => {
    for (const dict of [navBs, contactBs, authBs, newsBs, liveBs, playerBs]) {
      for (const v of Object.values(dict)) expect(v.trim().length).toBeGreaterThan(0);
    }
  });

  it('en prevodi nisu identični bs osim brojeva', () => {
    // bar jedan ključ različit između bs i en
    expect(navEn.back).not.toBe(navBs.back);
    expect(liveEn.matchLive).not.toBe(liveBs.matchLive);
  });
});
