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
        'trophy-featured-glow relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-background to-primary/5 dark:border-amber-500/20 dark:from-amber-950/40',
        compact ? 'p-6 md:p-8' : 'p-8 md:p-12',
      )}
    >
      <div className={cn('grid items-center gap-8', compact ? 'md:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-2')}>
        <div className="flex justify-center">
          {trophy.imagePath ? (
            <img
              src={mediaUrl(trophy.imagePath, compact ? 'medium' : 'original')}
              alt={trophy.name}
              className={cn('object-contain drop-shadow-2xl', compact ? 'max-h-48' : 'max-h-72')}
            />
          ) : (
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-bold text-white shadow-xl',
                compact ? 'h-36 w-36 text-4xl' : 'h-52 w-52 text-6xl',
              )}
            >
              {trophy.year}
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
            Najveći uspjeh
          </p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-primary md:text-6xl">{trophy.year}</p>
          <h2 className="mt-3 text-2xl font-bold text-text md:text-3xl">{trophy.name}</h2>
          {trophy.competition && (
            <p className="mt-2 text-lg font-medium text-accent">{trophy.competition}</p>
          )}
          {trophy.description && (
            <RichContent html={trophy.description} className="mt-5 text-base text-text-muted" />
          )}
        </div>
      </div>
    </article>
  );
}
