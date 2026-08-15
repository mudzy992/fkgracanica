import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { StatusBadge } from '../StatusBadge';
import type { ShowcaseRole } from '../types';

export function RolesSection({ roles, index }: { roles: ShowcaseRole[]; index: number }) {
  return (
    <AnimatedSection index={index} className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">Ljudi</p>
        <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">Uloge i zadaci</h2>
        <p className="mt-4 max-w-3xl text-base text-blue-100/80 sm:text-lg">
          Pet uloga. Mali klub može spojiti administratora i moderatora; komentator je obavezan na dan utakmice.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <article key={role.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
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
