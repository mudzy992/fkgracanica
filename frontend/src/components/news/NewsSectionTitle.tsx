import type { ReactNode } from 'react';

export function NewsSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-primary-light/30 to-transparent" />
      <h2 className="font-display shrink-0 text-sm font-bold uppercase tracking-[0.2em] text-primary-light">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-l from-primary-light/30 to-transparent" />
    </div>
  );
}
