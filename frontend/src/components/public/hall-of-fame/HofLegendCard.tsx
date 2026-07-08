import { mediaUrl } from '../../../lib/media';
import type { HallOfFameEntry } from '../../../types';

interface Props {
  entry: HallOfFameEntry;
}

export function HofLegendCard({ entry }: Props) {
  const photo = entry.photoPath ?? entry.imagePath;

  return (
    <article className="border-gradient-club glass-premium card-lift flex h-full flex-col items-center overflow-hidden rounded-2xl px-5 py-8 text-center">
      {photo ? (
        <img
          src={mediaUrl(photo, 'medium')}
          alt=""
          className="mb-5 h-28 w-28 rounded-full object-cover ring-2 ring-primary/40 ring-offset-2 ring-offset-transparent"
        />
      ) : (
        <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-primary/20 font-display text-3xl font-bold text-primary-light ring-2 ring-primary/30">
          {entry.name[0]}
        </div>
      )}
      <h2 className="font-display text-xl font-bold text-text">{entry.name}</h2>
      {entry.role && (
        <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary-light">
          {entry.role}
        </p>
      )}
      {entry.years && <p className="mt-1 text-sm tabular-nums text-text-muted">{entry.years}</p>}
      {entry.bio && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-text-muted">{entry.bio}</p>}
    </article>
  );
}
