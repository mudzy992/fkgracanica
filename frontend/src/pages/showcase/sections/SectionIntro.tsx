type Props = { kicker: string; title: string; body?: string };

export function SectionIntro({ kicker, title, body }: Props) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">{kicker}</p>
      <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h2>
      {body ? (
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100/80 sm:text-lg">{body}</p>
      ) : null}
    </>
  );
}
