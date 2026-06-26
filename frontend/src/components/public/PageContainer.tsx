import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  size?: 'md' | 'lg';
}

const widths = { md: 'max-w-4xl', lg: 'max-w-6xl' };

export function PageContainer({ children, className, size = 'lg' }: Props) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6', widths[size], className)}>
      {children}
    </div>
  );
}
