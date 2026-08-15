import { mediaUrl } from '../../../lib/media';
import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import type { ShowcaseClub } from '../types';

type Props = { club: ShowcaseClub; percent: number };

export function HeroSection({ club, percent }: Props) {
  const crest = mediaUrl(club.crestUrl, 'medium') ?? mediaUrl(club.crestUrl, 'thumb');
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <AnimatedSection variant="hero" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.35),_transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_auto]">
        <div>
          {crest ? (
            <img src={crest} alt="" className="mb-6 h-20 w-20 object-contain sm:h-24 sm:w-24" />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">Digitalna platforma</p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {club.name}
          </h1>
          {club.tagline ? (
            <p className="mt-3 text-lg text-blue-100/80">{club.tagline}</p>
          ) : null}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-blue-100/70 sm:text-lg">
            Kompletna platforma kluba: javni portal, administracija i mobilna aplikacija. Iskren pregled
            šta radi danas i šta stiže uz lansiranje.
          </p>
          {club.launchNote ? (
            <p className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-50">
              {club.launchNote}
            </p>
          ) : null}
        </div>
        <div className="relative h-[140px] w-[140px] justify-self-center">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="#60A5FA"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-4xl font-bold text-white">{percent}%</p>
            <p className="mt-1 max-w-[7rem] text-[10px] uppercase leading-tight tracking-wider text-blue-200/70">
              spremnost za lansiranje
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
