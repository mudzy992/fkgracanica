import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import {
  downloadFinanceExport,
  useFinanceSummary,
  type FinanceFilters,
} from '../../hooks/use-finance-summary';
import { FinanceKpiGrid } from './finance/FinanceKpiGrid';
import { FinanceBuckets } from './finance/FinanceBuckets';
import { FinanceFiltersForm } from './finance/FinanceFiltersForm';
import { formatDay, localIsoDate } from './finance/finance-labels';

function FinanceKpiSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="h-[118px] border-[var(--border-subtle)] bg-surface/50">
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function FinanceAdminPage() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<FinanceFilters>({
    from: `${new Date().getFullYear()}-01-01`,
    to: localIsoDate(),
    provider: '',
    status: '',
  });
  const [applied, setApplied] = useState(draft);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useFinanceSummary(applied);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <Seo title={t('admin.finance')} />
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.finance')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t('admin.financeIntro', {
              defaultValue: 'Pregled uplata ulaznica i procjena članarina za {{from}} – {{to}}.',
              from: formatDay(applied.from),
              to: formatDay(applied.to),
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void downloadFinanceExport('xlsx', applied)}>
            {t('admin.financeExport.xlsx', { defaultValue: 'Preuzmi Excel' })}
          </Button>
          <Button variant="outline" onClick={() => void downloadFinanceExport('pdf', applied)}>
            {t('admin.financeExport.pdf', { defaultValue: 'Preuzmi PDF' })}
          </Button>
        </div>
      </div>
      {lastUpdated ? (
        <div className="flex items-center justify-end gap-3 border-b border-[var(--border-subtle)] px-4 py-2 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}
          </span>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching
              ? t('admin.common.loading')
              : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
          </Button>
        </div>
      ) : null}
      <FinanceFiltersForm draft={draft} setDraft={setDraft} onApply={() => setApplied(draft)} />
      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-text-muted">
            {t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}
          </p>
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching
              ? t('admin.common.loading')
              : t('actions.retry', { defaultValue: 'Pokušaj ponovo' })}
          </Button>
        </div>
      ) : isLoading || !data ? (
        <FinanceKpiSkeleton />
      ) : (
        <div className="space-y-6">
          <FinanceKpiGrid data={data} />
          <FinanceBuckets data={data} />
          <p className="rounded-lg border border-[var(--border-subtle)] bg-surface/40 px-4 py-3 text-sm text-text-muted">
            {t('admin.financeMembershipNote', {
              defaultValue:
                'Članarine su procjena: broj članova sa statusom Aktivno u odabranom periodu, pomnožen godišnjom cijenom iz postavki. Pojedinačna online uplata članarine nije u ovom izvještaju kao Payment red.',
            })}
          </p>
        </div>
      )}
    </>
  );
}
