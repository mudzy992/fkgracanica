import { mediaUrl } from '../../../lib/media';
import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { DeviceCluster } from '../frames/DeviceCluster';
import { HeroBackdrop } from '../fx/HeroBackdrop';
import type { ShowcaseClub } from '../types';

type Props = { club: ShowcaseClub; percent: number };

export function HeroSection({ club, percent }: Props) {
  const crest = mediaUrl(club.crestUrl, 'medium') ?? mediaUrl(club.crestUrl, 'thumb');
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <AnimatedSection variant="hero" className="relative min-h-dvh overflow-hidden">
      <HeroBackdrop />
      <div className="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <div>
          {crest ? (
            <img src={crest} alt="" className="mb-6 h-16 w-16 object-contain sm:h-20 sm:w-20" />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
            Digitalna platforma · u izradi
          </p>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {club.name}
          </h1>
          {club.tagline ? <p className="mt-3 text-lg text-blue-100/80">{club.tagline}</p> : null}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-blue-100/70 sm:text-lg">
            Web, admin i mobile — ista platforma. Pregledaj šta klub dobija, kako izgleda i ko šta radi.
          </p>
          {club.launchNote ? (
            <p className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-50">
              {club.launchNote}
            </p>
          ) : null}
          <div className="mt-10 flex items-center gap-5">
            <div className="relative h-[88px] w-[88px]">
              <svg width="88" height="88" viewBox="0 0 140 140" className="-rotate-90">
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
              <p className="font-display absolute inset-0 grid place-items-center text-xl font-bold">{percent}%</p>
            </div>
            <p className="max-w-[10rem] text-[11px] uppercase leading-snug tracking-wider text-blue-200/70">
              spremnost za lansiranje
            </p>
          </div>
        </div>
        <DeviceCluster />
      </div>
      <p className="showcase-cue pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-blue-200/50">
        Skrolaj
      </p>
    </AnimatedSection>
  );
}
