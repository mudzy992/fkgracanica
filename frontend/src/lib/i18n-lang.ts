const LANG_KEY = 'fk_lang';

export function storedLanguage() {
  if (typeof window === 'undefined') return 'bs';
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'bs';
}

export function persistLanguage(lng: 'bs' | 'en') {
  localStorage.setItem(LANG_KEY, lng);
}
