import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

type Props = { children: ReactNode; className?: string };

export function PhoneFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.85rem] border-[5px] border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]',
        className,
      )}
    >
      <div className="absolute left-1/2 top-1.5 z-10 h-3.5 w-16 -translate-x-1/2 rounded-full bg-zinc-800" />
      <div className="aspect-[9/19]">{children}</div>
    </div>
  );
}
