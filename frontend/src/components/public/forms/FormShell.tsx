import type { ReactNode } from 'react';
import { PageContainer } from '../PageContainer';
import { PremiumCard } from '../shell/PremiumCard';
import { Reveal } from '../../../lib/motion/Reveal';

interface Props {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function FormShell({ title, description, aside, children }: Props) {
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
          <PremiumCard className="p-6 sm:p-8" hover={false}>
            {children}
          </PremiumCard>
        </Reveal>
      </div>
    </PageContainer>
  );
}
