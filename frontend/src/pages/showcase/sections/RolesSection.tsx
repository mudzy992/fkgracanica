import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { StatusBadge } from '../StatusBadge';
import type { ShowcaseRole } from '../types';
import { SectionIntro } from './SectionIntro';

export function RolesSection({ roles, index }: { roles: ShowcaseRole[]; index: number }) {
  return (
    <AnimatedSection id="uloge" index={index} className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro
          kicker="Ljudi"
          title="Uloge i zadaci"
          body="Pet uloga. Mali klub može spojiti administratora i moderatora; komentator je obavezan na dan utakmice."
          chapter={index}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-400/35 hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-white">{role.title}</h3>
                <StatusBadge badge="ready" />
              </div>
              <p className="mt-1 text-xs text-blue-200/70">{role.who}</p>
              <ul className="mt-4 space-y-2 text-sm text-blue-50">
                {role.tasks.map((task) => (
                  <li key={task} className="border-l-2 border-blue-400/40 pl-3">
                    {task}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
