import { useTranslation } from 'react-i18next';

/** Status se najavljuje čitačima ekrana, dok layout i navigacija ostaju dostupni. */
export function RouteLoading() {
  const { t } = useTranslation();
  return <div role="status" className="py-8 text-sm text-text-muted">{t('common.loading')}</div>;
}
