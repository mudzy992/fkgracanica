import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLatestAndroidRelease } from '../../hooks/use-latest-android-release';

export function FooterAppDownloadCta() {
  const { t } = useTranslation();
  const { data: latest } = useLatestAndroidRelease();
  if (!latest) return null;

  return (
    <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-white">{t('footer.appVersion', { version: latest.version })}</p>
      <Link
        to="/aplikacija"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-light"
      >
        {t('footer.appCta')}
      </Link>
    </div>
  );
}
