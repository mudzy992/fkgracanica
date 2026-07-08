import { RichContent } from '../RichContent';
import { mediaUrl } from '../../../lib/media';
import { museumCategoryLabel } from '../../../lib/museum-categories';
import type { MuseumItem } from '../../../types';

interface Props {
  item: MuseumItem;
}

export function MuseumExhibitCard({ item }: Props) {
  return (
    <article className="border-gradient-club glass-premium card-lift h-full overflow-hidden rounded-2xl">
      {item.imagePath ? (
        <img
          src={mediaUrl(item.imagePath, 'medium')}
          alt=""
          className="h-44 w-full object-cover sm:h-48"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-primary/10 sm:h-48">
          <span className="font-display text-3xl font-bold text-primary-light/40">
            {item.year ?? '·'}
          </span>
        </div>
      )}
      <div className="p-5">
        {item.year != null && (
          <p className="text-sm font-bold tabular-nums text-primary-light">{item.year}</p>
        )}
        <h2 className="font-display mt-1 text-lg font-semibold text-text">{item.title}</h2>
        {item.category && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
            {museumCategoryLabel(item.category)}
          </p>
        )}
        {item.description && (
          <RichContent html={item.description} className="mt-3 text-sm text-text-muted" />
        )}
      </div>
    </article>
  );
}
