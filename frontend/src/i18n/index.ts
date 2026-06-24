import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bs from '../locales/bs/common.json';
import en from '../locales/en/common.json';

void i18n.use(initReactI18next).init({
  resources: {
    bs: { common: bs },
    en: { common: en },
  },
  lng: 'bs',
  fallbackLng: 'bs',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
