import * as SecureStore from 'expo-secure-store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonBs, commonEn } from './common';
import { commentatorBs, commentatorEn } from './commentator-keys';
import { homeBs, homeEn } from './home';
import { leagueBs, leagueEn } from './league';
import { playerBs, playerEn } from './player';
import { staffAdminBs, staffAdminEn } from './staff-admin';
import { clubBs, clubEn } from './club';
import { teamBs, teamEn } from './team';
import { roleHomeBs, roleHomeEn } from './role-home';
import { writerGalleryBs, writerGalleryEn } from './writer-gallery';

const LANG_KEY = 'app_language';

const bs = {
  ...commonBs,
  ...commentatorBs,
  ...staffAdminBs,
  ...writerGalleryBs,
  ...roleHomeBs,
  ...homeBs,
  ...playerBs,
  ...leagueBs,
  ...teamBs,
  ...clubBs,
};

const en: Record<keyof typeof bs, string> = {
  ...commonEn,
  ...commentatorEn,
  ...staffAdminEn,
  ...writerGalleryEn,
  ...roleHomeEn,
  ...homeEn,
  ...playerEn,
  ...leagueEn,
  ...teamEn,
  ...clubEn,
};

void i18n.use(initReactI18next).init({
  resources: {
    bs: { translation: bs },
    en: { translation: en },
  },
  lng: 'bs',
  fallbackLng: 'bs',
  interpolation: { escapeValue: false },
});

export async function hydrateLanguage(): Promise<void> {
  const stored = await SecureStore.getItemAsync(LANG_KEY);
  if (stored === 'bs' || stored === 'en') await i18n.changeLanguage(stored);
}

export async function setAppLanguage(lng: 'bs' | 'en'): Promise<void> {
  await i18n.changeLanguage(lng);
  await SecureStore.setItemAsync(LANG_KEY, lng);
}

export default i18n;
