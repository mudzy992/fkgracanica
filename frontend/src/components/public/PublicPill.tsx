import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

export function PublicPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition',
        active
          ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,102,255,0.35)]'
          : 'glass-premium text-white/80 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}
