import { useLayoutEffect, useRef, useState } from 'react';
import { mediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';
import type { HallOfFameEntry } from '../../../types';

interface Props {
  entry: HallOfFameEntry;
  onOpen: (entry: HallOfFameEntry) => void;
}

export function HofLegendCard({ entry, onOpen }: Props) {
  const photo = entry.photoPath ?? entry.imagePath;
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState((entry.bio?.length ?? 0) > 300);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = bioRef.current;
    if (!el || expanded || !entry.bio) return;
    setOverflows(el.scrollHeight > el.clientHeight + 1 || entry.bio.length > 300);
  }, [entry.bio, expanded]);

  const showToggle = Boolean(entry.bio) && (expanded || overflows);

  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="card-lift relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(10,14,23,1))] px-5 py-8 text-center shadow-[0_22px_60px_rgba(2,6,23,0.35)] transition hover:border-amber-200/35"
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
      <div className="pointer-events-none absolute -right-10 top-10 h-24 w-24 rounded-full bg-amber-300/10 blur-2xl" />
      <div className="mb-6 text-left">{entry.years && <p className="text-sm tabular-nums text-slate-400">{entry.years}</p>}</div>
      {photo ? (
        <img loading="lazy" decoding="async"
          src={mediaUrl(photo, 'medium')}
          alt=""
          className="mx-auto mb-5 h-32 w-32 rounded-full object-cover ring-2 ring-amber-300/50 ring-offset-4 ring-offset-slate-900"
        />
      ) : (
        <div className="mx-auto mb-5 flex h-32 w-32 items-center justify-center rounded-full bg-amber-300/10 font-display text-3xl font-bold text-amber-100 ring-2 ring-amber-300/30 ring-offset-4 ring-offset-slate-900">
          {entry.name[0]}
        </div>
      )}
      <h2 className="font-display text-2xl font-bold text-white">{entry.name}</h2>
      {entry.role && (
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100/80">
          {entry.role}
        </p>
      )}
      <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
      {entry.bio ? (
        <div className="mt-4 text-left">
          <p ref={bioRef} className={cn('text-sm leading-relaxed text-slate-300', !expanded && 'line-clamp-5')}>
            {entry.bio}
          </p>
          {showToggle ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((value) => !value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  setExpanded((value) => !value);
                }
              }}
              className="mt-2 inline-block text-sm font-semibold text-primary-light transition hover:text-white"
            >
              {expanded ? 'Prikaži manje' : 'Pročitaj više'}
            </span>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}
