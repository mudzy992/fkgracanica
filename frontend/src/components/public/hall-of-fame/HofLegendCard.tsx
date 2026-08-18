import { mediaUrl } from '../../../lib/media';
import type { HallOfFameEntry } from '../../../types';

interface Props {
  entry: HallOfFameEntry;
}

export function HofLegendCard({ entry }: Props) {
  const photo = entry.photoPath ?? entry.imagePath;

  return (
    <article className="card-lift flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(10,14,23,0.98))] px-5 py-8 text-center shadow-[0_22px_60px_rgba(2,6,23,0.35)]">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/70">Kuća slavnih</p>
          {entry.years && <p className="mt-2 text-sm tabular-nums text-slate-400">{entry.years}</p>}
        </div>
        {entry.role && (
          <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100">
            {entry.role}
          </div>
        )}
      </div>
      {photo ? (
        <img
          src={mediaUrl(photo, 'medium')}
          alt=""
          className="mx-auto mb-5 h-28 w-28 rounded-full object-cover ring-2 ring-amber-300/50 ring-offset-2 ring-offset-transparent"
        />
      ) : (
        <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-amber-300/10 font-display text-3xl font-bold text-amber-100 ring-2 ring-amber-300/30">
          {entry.name[0]}
        </div>
      )}
      <h2 className="font-display text-xl font-bold text-white">{entry.name}</h2>
      {entry.bio && <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-slate-300">{entry.bio}</p>}
    </article>
  );
}
