import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'article';
}

export function PremiumCard({ children, className, hover = true, as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={cn(
        'glass-card rounded-2xl border border-[var(--border-subtle)] shadow-sm',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
