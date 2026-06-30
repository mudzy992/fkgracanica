import type { ReactNode } from 'react';
import { PageContainer } from '../PageContainer';
import { PremiumCard } from '../shell/PremiumCard';
import { Reveal } from '../../../lib/motion/Reveal';
import { cn } from '../../../lib/utils';

interface Props {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  /** split = forma u desnoj koloni; full = puna širina (Moj račun) */
  layout?: 'split' | 'full';
}

export function FormShell({ title, description, aside, children, layout = 'split' }: Props) {
  if (layout === 'full') {
    return (
      <PageContainer className="py-10 sm:py-14">
        <Reveal>
          <div className="mb-8 max-w-3xl space-y-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">{title}</h1>
            {description && <p className="text-lg text-text-muted">{description}</p>}
            {aside}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <PremiumCard className="overflow-visible p-6 sm:p-8 lg:p-10" hover={false}>
            {children}
          </PremiumCard>
        </Reveal>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">{title}</h1>
            {description && <p className="text-lg text-text-muted">{description}</p>}
            {aside}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <PremiumCard className={cn('p-6 sm:p-8', layout === 'split' && 'overflow-visible')} hover={false}>
            {children}
          </PremiumCard>
        </Reveal>
      </div>
    </PageContainer>
  );
}
