import { mediaUrl } from '../../../lib/media';
import type { Sponsor } from '../../../types';
import type { SponsorTierMeta } from '../../../lib/sponsor-tiers';
import { cn } from '../../../lib/utils';

const TILE_STYLES = {
  hero: {
    wrap: 'rounded-xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:rounded-2xl sm:p-10 dark:border-white/15 dark:bg-slate-800/90',
    logo: 'h-20 max-h-24 w-full object-contain sm:h-24 sm:max-h-28 md:h-32',
    name: 'text-lg font-semibold tracking-tight text-text sm:text-xl md:text-2xl',
  },
  gold: {
    wrap: 'rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-background p-5 shadow-sm sm:p-8 dark:border-amber-500/25 dark:from-amber-950/40 dark:to-background',
    logo: 'h-14 w-full object-contain sm:h-16',
    name: 'text-sm font-semibold text-text sm:text-base',
  },
  silver: {
    wrap: 'rounded-xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm sm:p-6',
    logo: 'h-12 w-full object-contain sm:h-14',
    name: 'text-sm font-semibold text-text',
  },
  bronze: {
    wrap: 'rounded-lg border border-[var(--border-subtle)] bg-surface p-4 sm:p-5',
    logo: 'h-10 w-full object-contain sm:h-12',
    name: 'text-sm font-medium text-text',
  },
  partner: {
    wrap: 'rounded-lg border border-[var(--border-subtle)] bg-background p-3 sm:p-4',
    logo: 'h-9 w-full object-contain sm:h-10',
    name: 'text-xs font-medium text-text-muted',
  },
} as const;

interface Props {
  sponsor: Sponsor;
  meta: SponsorTierMeta;
}

export function SponsorLogoTile({ sponsor, meta }: Props) {
  const styles = TILE_STYLES[meta.variant];
  const inner = (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2 text-center transition hover:scale-[1.02] sm:gap-3',
        styles.wrap,
      )}
    >
      {sponsor.logoPath ? (
        <img
          src={mediaUrl(sponsor.logoPath, meta.variant === 'hero' ? 'medium' : 'thumb')}
          alt={sponsor.name}
          className={styles.logo}
        />
      ) : (
        <span className={styles.name}>{sponsor.name}</span>
      )}
      {sponsor.logoPath && meta.variant !== 'partner' && (
        <span className={cn(styles.name, meta.variant === 'hero' ? '' : 'text-text-muted')}>
          {sponsor.name}
        </span>
      )}
      {sponsor.logoPath && meta.variant === 'partner' && (
        <span className={cn(styles.name, 'line-clamp-2')}>{sponsor.name}</span>
      )}
    </div>
  );

  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noreferrer" className="block h-full w-full" title={sponsor.name}>
        {inner}
      </a>
    );
  }
  return inner;
}
