import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

type Props = { children: ReactNode; className?: string };

export function BrowserFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_40px_90px_-24px_rgba(0,0,0,0.75)]',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 h-4 flex-1 rounded-md bg-white/10" />
      </div>
      {children}
    </div>
  );
}
