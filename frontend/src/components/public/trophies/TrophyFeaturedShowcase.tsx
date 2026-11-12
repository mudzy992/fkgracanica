import { mediaUrl } from '../../../lib/media';
import { RichContent } from '../RichContent';
import type { Trophy } from '../../../types';
import { cn } from '../../../lib/utils';

interface Props {
  trophy: Trophy;
  compact?: boolean;
}

export function TrophyFeaturedShowcase({ trophy, compact }: Props) {
  return (
    <article
      className={cn(
        'border-gradient-club glass-premium glow-blue relative overflow-hidden rounded-3xl',
        compact ? 'p-6 md:p-8' : 'p-8 md:p-12',
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-light/5" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-light/10 blur-3xl" />
      <div className={cn('relative grid items-center gap-8', compact ? 'md:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-2')}>
        <div className="flex justify-center">
          {trophy.imagePath ? (
            <img loading="lazy" decoding="async"
              src={mediaUrl(trophy.imagePath, compact ? 'medium' : 'original')}
              alt={trophy.name}
              className={cn('object-contain drop-shadow-2xl', compact ? 'max-h-48' : 'max-h-72')}
            />
          ) : (
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary font-bold text-white shadow-xl',
                compact ? 'h-36 w-36 text-4xl' : 'h-52 w-52 text-6xl',
              )}
            >
              {trophy.year}
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light">Najveći uspjeh</p>
          <p className="mt-2 font-display text-5xl font-bold tracking-tight text-gradient-club md:text-6xl">
            {trophy.year}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">{trophy.name}</h2>
          {trophy.competition && (
            <p className="mt-2 text-lg font-medium text-primary-light">{trophy.competition}</p>
          )}
          {trophy.description && (
            <RichContent html={trophy.description} className="mt-5 text-base text-text-muted" />
          )}
        </div>
      </div>
    </article>
  );
}
