import { describe, expect, it } from 'vitest';
import { appUpdateBs, appUpdateEn } from '../i18n/app-update';
import { commentatorBs, commentatorEn } from '../i18n/commentator-keys';
import { commonBs, commonEn } from '../i18n/common';
import { heritageBs, heritageEn } from '../i18n/heritage';
import { leagueBs, leagueEn } from '../i18n/league';
import { roleHomeBs, roleHomeEn } from '../i18n/role-home';
import { staffAdminBs, staffAdminEn } from '../i18n/staff-admin';
import { teamBs, teamEn } from '../i18n/team';
import { ticketsBs, ticketsEn } from '../i18n/tickets';
import { writerGalleryBs, writerGalleryEn } from '../i18n/writer-gallery';

function sameKeys<T extends Record<string, string>, U extends Record<string, string>>(bs: T, en: U): void {
  expect(Object.keys(bs).sort()).toEqual(Object.keys(en).sort());
  for (const k of Object.keys(bs)) {
    expect(typeof (bs as Record<string, string>)[k]).toBe('string');
    expect((bs as Record<string, string>)[k].length).toBeGreaterThan(0);
    expect(typeof (en as Record<string, string>)[k]).toBe('string');
    expect((en as Record<string, string>)[k].length).toBeGreaterThan(0);
  }
}

describe('mob-batch23 — P-MOB23 i18n preostali', () => {
  it('appUpdateBs/En isti ključevi', () => {
    sameKeys(appUpdateBs, appUpdateEn);
    expect(appUpdateBs.appUpdateTitle).toBe('Nova verzija aplikacije');
  });

  it('commentatorBs/En isti', () => {
    sameKeys(commentatorBs, commentatorEn);
    expect(commentatorBs.commentatorTitle).toBe('Komentator');
  });

  it('commonBs/En isti', () => {
    sameKeys(commonBs, commonEn);
    expect(commonBs.appName).toBe('FK Gračanica');
  });

  it('heritageBs/En isti', () => {
    sameKeys(heritageBs, heritageEn);
    expect(heritageBs.otherTrophies).toBe('Ostali trofeji');
  });

  it('leagueBs/En isti', () => {
    sameKeys(leagueBs, leagueEn);
    expect(leagueBs.leagueTitle).toBe('Liga');
  });

  it('roleHomeBs/En isti', () => {
    sameKeys(roleHomeBs, roleHomeEn);
    expect(roleHomeBs.drafts).toBe('Nacrti');
  });

  it('staffAdminBs/En isti', () => {
    sameKeys(staffAdminBs, staffAdminEn);
    expect(staffAdminBs.approve).toBe('Odobri');
  });

  it('teamBs/En isti', () => {
    sameKeys(teamBs, teamEn);
    expect(teamBs.teamKicker).toBe('Profesionalni kadar');
  });

  it('ticketsBs/En isti', () => {
    sameKeys(ticketsBs, ticketsEn);
    expect(ticketsBs.soldOut).toBe('Rasprodano');
  });

  it('writerGalleryBs/En isti', () => {
    sameKeys(writerGalleryBs, writerGalleryEn);
    expect(writerGalleryBs.writer).toBe('Writer');
  });
});
