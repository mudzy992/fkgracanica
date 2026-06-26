import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export function ClubHubPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-surface/90 p-5 shadow-sm md:p-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
