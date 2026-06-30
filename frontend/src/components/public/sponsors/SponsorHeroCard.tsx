import { mediaUrl } from '../../../lib/media';
import { SPONSOR_TIER_META } from '../../../lib/sponsor-tiers';
import type { Sponsor } from '../../../types';

interface Props {
  sponsor: Sponsor;
  className?: string;
}

export function SponsorHeroCard({ sponsor, className }: Props) {
  const inner = (
    <div className="border-gradient-club glass-premium relative overflow-hidden rounded-3xl p-8 text-center md:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-light/5" />
      <div className="relative z-10">
        <span className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-primary-light">
          {SPONSOR_TIER_META.GENERAL.label}
        </span>
        {sponsor.logoPath ? (
          <img
            src={mediaUrl(sponsor.logoPath, 'medium')}
            alt={sponsor.name}
            className="mx-auto max-h-24 object-contain"
          />
        ) : (
          <p className="font-display text-3xl font-bold uppercase text-white">{sponsor.name}</p>
        )}
        {sponsor.logoPath && (
          <h3 className="font-display mt-4 text-2xl font-bold uppercase text-white">{sponsor.name}</h3>
        )}
      </div>
    </div>
  );
  const cls = `block card-lift ${className ?? ''}`.trim();
  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
