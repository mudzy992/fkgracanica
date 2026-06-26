import { mediaUrl } from '../../../lib/media';
import type { Sponsor } from '../../../types';
import { cn } from '../../../lib/utils';

interface Props {
  sponsor: Sponsor;
  className?: string;
}

export function SponsorMarqueeItem({ sponsor, className }: Props) {
  const content = (
    <div
      className={cn(
        'flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-background px-6 shadow-sm transition hover:border-accent/30 hover:shadow-md dark:border-slate-700',
        className,
      )}
    >
      {sponsor.logoPath ? (
        <img src={mediaUrl(sponsor.logoPath, 'thumb')} alt={sponsor.name} className="max-h-12 max-w-full object-contain" />
      ) : (
        <span className="text-center text-sm font-semibold text-text-muted">{sponsor.name}</span>
      )}
    </div>
  );

  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noreferrer" title={sponsor.name} className="shrink-0">
        {content}
      </a>
    );
  }
  return content;
}

interface MarqueeProps {
  sponsors: Sponsor[];
  reverse?: boolean;
}

export function SponsorsMarquee({ sponsors, reverse }: MarqueeProps) {
  if (!sponsors.length) return null;
  const loop = [...sponsors, ...sponsors];

  return (
    <div className="sponsors-marquee-mask relative overflow-hidden py-2">
      <div className={cn('sponsors-marquee-track flex w-max gap-6', reverse && 'sponsors-marquee-reverse')}>
        {loop.map((s, i) => (
          <SponsorMarqueeItem key={`${s.id}-${i}`} sponsor={s} />
        ))}
      </div>
    </div>
  );
}
