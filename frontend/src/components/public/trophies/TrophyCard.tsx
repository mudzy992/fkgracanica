import { mediaUrl } from '../../../lib/media';
import type { Trophy } from '../../../types';

interface Props {
  trophy: Trophy;
}

export function TrophyCard({ trophy }: Props) {
  return (
    <div className="glass-premium card-lift h-full overflow-hidden rounded-2xl p-5">
      <div className="flex gap-4">
        {trophy.imagePath ? (
          <img loading="lazy" decoding="async"
            src={mediaUrl(trophy.imagePath, 'thumb')}
            alt=""
            className="h-16 w-16 shrink-0 object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/30 font-display text-lg font-bold text-primary-light">
            {trophy.year}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-primary-light">{trophy.year}</p>
          <p className="font-semibold text-white">{trophy.name}</p>
          {trophy.competition && <p className="text-sm text-text-muted">{trophy.competition}</p>}
        </div>
      </div>
    </div>
  );
}
