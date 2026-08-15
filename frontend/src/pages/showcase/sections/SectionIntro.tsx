type Props = { kicker: string; title: string; body?: string; chapter?: number };

export function SectionIntro({ kicker, title, body, chapter }: Props) {
  return (
    <>
      <div className="flex items-baseline gap-3">
        {chapter != null ? (
          <span className="font-display text-sm font-bold tabular-nums text-blue-400/70">
            {String(chapter).padStart(2, '0')}
          </span>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">{kicker}</p>
      </div>
      <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h2>
      {body ? (
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100/80 sm:text-lg">{body}</p>
      ) : null}
    </>
  );
}
