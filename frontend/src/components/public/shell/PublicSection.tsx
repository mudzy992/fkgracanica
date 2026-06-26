import type { ReactNode } from 'react';
import { Reveal } from '../../../lib/motion/Reveal';
import { cn } from '../../../lib/utils';

interface Props {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function PublicSection({ eyebrow, title, children, className, actions }: Props) {
  return (
    <section className={cn('py-10 sm:py-12 md:py-16', className)}>
      {(title || actions) && (
        <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            )}
            {title && <h2 className="font-display mt-1 text-2xl font-bold text-text sm:text-3xl">{title}</h2>}
          </div>
          {actions}
        </Reveal>
      )}
      {children}
    </section>
  );
}
