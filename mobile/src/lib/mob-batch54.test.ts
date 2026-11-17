import { describe, expect, it } from 'vitest';
import { appUpdateBs, appUpdateEn } from '../i18n/app-update';
import { authBs, authEn } from '../i18n/auth';
import { clubBs, clubEn } from '../i18n/club';
import { contactBs, contactEn } from '../i18n/contact';
import { navBs, navEn } from '../i18n/nav';
describe('mob-batch54 — P-MOB54 i18n batch1', () => {
  it('appUpdateBs', () => { expect(appUpdateBs.appUpdateTitle).toContain('Nova'); expect(appUpdateBs.appUpdateAvailable).toContain('{{version}}'); });
  it('appUpdateEn mirrors', () => { expect(Object.keys(appUpdateEn)).toEqual(Object.keys(appUpdateBs)); expect(appUpdateEn.appUpdateTitle).toBe('App update'); });
  it('authBs', () => { expect(authBs.loginLead).toContain('Prijavite'); });
  it('authEn mirrors', () => { expect(Object.keys(authEn)).toEqual(Object.keys(authBs)); expect(authEn.forgotPassword).toContain('Forgot'); });
  it('clubBs', () => { expect(clubBs.clubKicker).toBe('Klub'); expect(clubBs.clubStadium).toBe('Stadion'); });
  it('clubEn mirrors', () => { expect(Object.keys(clubEn)).toEqual(Object.keys(clubBs)); expect(clubEn.clubKicker).toBe('Club'); });
  it('contactBs', () => { expect(contactBs.contactInfo).toBe('Informacije'); expect(contactBs.openMap).toBe('Otvori mapu'); });
  it('contactEn mirrors', () => { expect(Object.keys(contactEn)).toEqual(Object.keys(contactBs)); expect(contactEn.openMap).toBe('Open map'); });
  it('navBs', () => { expect(navBs.back).toBe('Nazad'); });
  it('navEn mirrors', () => { expect(navEn.back).toBe('Back'); expect(Object.keys(navEn)).toEqual(Object.keys(navBs)); });
  it('appUpdateBs hints', () => { expect(appUpdateBs.livePushHint).toContain('Golovi'); });
});
