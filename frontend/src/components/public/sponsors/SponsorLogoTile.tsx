import { mediaUrl } from '../../../lib/media';
import type { Sponsor } from '../../../types';
import type { SponsorTierMeta } from '../../../lib/sponsor-tiers';
import { cn } from '../../../lib/utils';

const TILE_STYLES = {
  hero: {
    wrap: 'border-gradient-club glass-premium card-lift rounded-2xl p-6 sm:p-10',
    logo: 'h-20 max-h-24 w-full object-contain sm:h-24 sm:max-h-28 md:h-32',
    name: 'text-lg font-semibold tracking-tight text-white sm:text-xl md:text-2xl',
  },
  gold: {
    wrap: 'border-gradient-club glass-premium card-lift rounded-xl p-5 sm:p-8',
    logo: 'h-14 w-full object-contain sm:h-16',
    name: 'text-sm font-semibold text-white sm:text-base',
  },
  silver: {
    wrap: 'glass-premium card-lift rounded-xl p-4 sm:p-6',
    logo: 'h-12 w-full object-contain sm:h-14',
    name: 'text-sm font-semibold text-white',
  },
  bronze: {
    wrap: 'glass-premium card-lift rounded-lg p-4 sm:p-5',
    logo: 'h-10 w-full object-contain sm:h-12',
    name: 'text-sm font-medium text-white/90',
  },
  partner: {
    wrap: 'glass-premium card-lift rounded-lg p-3 sm:p-4',
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
        'flex h-full w-full flex-col items-center justify-center gap-2 text-center sm:gap-3',
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
        <span className={styles.name}>{sponsor.name}</span>
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
