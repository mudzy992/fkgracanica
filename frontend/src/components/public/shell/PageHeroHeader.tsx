import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function PageHeroHeader({ eyebrow, title, subtitle, children, className, compact }: Props) {
  return (
    <header
      className={cn(
        'border-b border-[var(--border-subtle)] bg-[image:var(--gradient-page-hero)]',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-6xl px-4 text-center sm:px-6',
          compact ? 'py-10 sm:py-12' : 'py-12 sm:py-16 md:py-20',
        )}
      >
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-text sm:mt-3 sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-base text-text-muted sm:mt-4 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
