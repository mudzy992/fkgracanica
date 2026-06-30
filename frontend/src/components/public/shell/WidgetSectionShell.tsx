import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Bez pozadinskog gradijenta — za full-bleed sekcije */
  plain?: boolean;
}

export function WidgetSectionShell({ children, className, id, plain }: Props) {
  return (
    <section id={id} className={cn('widget-section', className)}>
      {!plain && <div className="widget-section-bg" />}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}
