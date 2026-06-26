import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSponsors } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { SPONSOR_TIER_META } from '../../lib/sponsor-tiers';
import { SponsorMarqueeItem } from '../../components/public/sponsors/SponsorsMarquee';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['sponsors'] };

export function SponsorsWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useSponsors();
  const items = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.sponsors');
  const viewAll = config.viewAllUrl ?? '/sponzori';
  const general = items.find((s) => s.tier === 'GENERAL');
  const rest = items.filter((s) => s.id !== general?.id);

  return (
    <section className="overflow-hidden border-y border-slate-200/60 bg-gradient-to-b from-surface via-background to-surface py-14 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Partneri</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text md:text-3xl">{title}</h2>
          </div>
          <Link to={viewAll} className="shrink-0 text-sm font-medium text-accent hover:underline">
            {t('actions.viewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="mx-auto h-28 max-w-md rounded-2xl" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        ) : items.length ? (
          <div className="space-y-8">
            {general && (
              <div className="mx-auto max-w-lg">
                {(() => {
                  const hero = (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                        {SPONSOR_TIER_META.GENERAL.label}
                      </p>
                      {general.logoPath ? (
                        <img
                          src={mediaUrl(general.logoPath, 'medium')}
                          alt={general.name}
                          className="mx-auto mt-4 max-h-20 object-contain"
                        />
                      ) : (
                        <p className="mt-4 text-xl font-bold text-text">{general.name}</p>
                      )}
                    </>
                  );
                  const cls =
                    'block rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center shadow-sm';
                  return general.url ? (
                    <a href={general.url} target="_blank" rel="noreferrer" className={cls}>
                      {hero}
                    </a>
                  ) : (
                    <div className={cls}>{hero}</div>
                  );
                })()}
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {rest.map((s) => (
                  <SponsorMarqueeItem key={s.id} sponsor={s} className="h-full w-full" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-text-muted">Nema sponzora.</p>
        )}
      </div>
    </section>
  );
}
