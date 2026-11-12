import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../../components/ui/card';
import { PercentRing } from './PercentRing';
import type { PlatformStatusPayload } from './types';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-xl border border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-text">{value}</p>
    </Card>
  );
}

export function PlatformStatusHero({ data }: { data: PlatformStatusPayload }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <PercentRing percent={data.overallPercent} />
          <p className="max-w-[12rem] text-center text-xs uppercase tracking-wider text-text-muted sm:text-left">
            {t('admin.stanjeRingCaption')}
          </p>
        </div>
        <div className="grid w-full flex-1 gap-3 sm:grid-cols-2">
          <Stat label={t('admin.stanjeCounted')} value={data.counted} />
          <Stat label={t('admin.stanjeAfter')} value={data.afterLaunch} />
          <Stat label={t('admin.stanjeReady')} value={data.counts.ready} />
          <Stat label={t('admin.stanjeInProgress')} value={data.counts.in_progress} />
        </div>
      </CardContent>
    </Card>
  );
}
