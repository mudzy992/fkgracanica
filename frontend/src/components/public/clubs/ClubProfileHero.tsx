import { mediaUrl } from '../../../lib/media';
import { clubCrestPath } from '../../../lib/club-utils';
import type { Club } from '../../../types';
import { Skeleton } from '../../ui/skeleton';

interface Props {
  club?: Club | null;
  isLoading?: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function ClubProfileHero({ club, isLoading, eyebrow, title, subtitle }: Props) {
  if (isLoading) {
    return (
      <header className="border-b border-slate-200/80 bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 md:py-20">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      </header>
    );
  }

  const crest = clubCrestPath(club);
  const meta = [club?.city, club?.stadium].filter(Boolean).join(' · ');

  return (
    <header className="border-b border-slate-200/80 bg-surface/60">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
        {crest && (
          <img
            src={mediaUrl(crest, 'medium')}
            alt={club?.name ?? ''}
            className="mx-auto mb-6 h-24 w-24 object-contain md:h-28 md:w-28"
          />
        )}
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-text md:text-5xl">
          {title ?? club?.name ?? 'Klub'}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
          {subtitle ?? club?.description ?? ''}
        </p>
        {meta && <p className="mt-3 text-sm text-text-muted">{meta}</p>}
      </div>
    </header>
  );
}
