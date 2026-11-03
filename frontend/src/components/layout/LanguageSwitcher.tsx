import { useTranslation } from 'react-i18next';

import { persistLanguage } from '../../lib/i18n-lang';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage === 'en' ? 'en' : 'bs';

  const setLang = (lng: 'bs' | 'en') => {
    void i18n.changeLanguage(lng);
    persistLanguage(lng);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setLang(current === 'bs' ? 'en' : 'bs')}
        className="rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted hover:bg-surface hover:text-text"
        aria-label={t('actions.language')}
      >
        {current === 'bs' ? 'EN' : 'BS'}
      </button>
    </div>
  );
}
