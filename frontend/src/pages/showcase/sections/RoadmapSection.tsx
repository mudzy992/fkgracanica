import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { StatusBadge } from '../StatusBadge';
import type { ShowcaseBadge, ShowcaseModule } from '../types';

const ORDER: ShowcaseBadge[] = ['ready', 'in_progress', 'web_only', 'after_launch'];
const TITLES: Record<ShowcaseBadge, string> = {
  ready: 'Spremno za lansiranje',
  in_progress: 'U toku',
  web_only: 'Namjerno web-only',
  after_launch: 'Poslije lansiranja',
};

export function RoadmapSection({ modules, index }: { modules: ShowcaseModule[]; index: number }) {
  return (
    <AnimatedSection index={index} variant="surface" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">Status</p>
        <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Mapa isporuke</h2>
        <p className="mt-4 max-w-3xl text-blue-100/80">
          Portal ide u produkciju sa Stripe + blagajnom. Ostalo ostaje na mapi i biće isporučeno.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {ORDER.map((badge) => {
            const items = modules.filter((m) => m.badge === badge);
            if (!items.length) return null;
            return (
              <div key={badge}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <StatusBadge badge={badge} />
                  {TITLES[badge]}
                </h3>
                <ul className="space-y-2">
                  {items.map((mod) => (
                    <li
                      key={mod.id}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{mod.title}</p>
                          <p className="text-xs text-blue-100/60">{mod.summary}</p>
                        </div>
                        <span className="shrink-0 tabular-nums text-sm text-blue-200">{mod.percent}%</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-blue-400"
                          style={{ width: `${mod.percent}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
