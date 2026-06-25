import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSponsors } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['sponsors'] };

export function SponsorsWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useSponsors();
  const items = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.sponsors');
  const viewAll = config.viewAllUrl ?? '/sponzori';

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">{title}</h2>
        <Link to={viewAll} className="text-sm text-accent hover:underline">
          {t('actions.viewAll')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: config.limit }).map((_, i) => <Skeleton key={i} className="h-16" />)
          : items.map((s) => (
              <a
                key={s.id}
                href={s.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center rounded-lg border border-slate-200 bg-background p-4"
              >
                {s.logoPath ? (
                  <img src={mediaUrl(s.logoPath, 'thumb')} alt={s.name} className="max-h-12 object-contain" />
                ) : (
                  <span className="text-sm font-medium text-text-muted">{s.name}</span>
                )}
              </a>
            ))}
      </div>
    </section>
  );
}
