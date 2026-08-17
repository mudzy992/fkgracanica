import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { downloadFinanceExport, useFinanceSummary, type FinanceFilters } from '../../hooks/use-finance-summary';
import { FinanceKpiGrid } from './finance/FinanceKpiGrid';
import { FinanceBuckets } from './finance/FinanceBuckets';
import { FinanceFiltersForm } from './finance/FinanceFiltersForm';
import { formatDay, localIsoDate } from './finance/finance-labels';

export function FinanceAdminPage() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<FinanceFilters>({
    from: `${new Date().getFullYear()}-01-01`,
    to: localIsoDate(),
    provider: '',
    status: '',
  });
  const [applied, setApplied] = useState(draft);
  const { data, isLoading, isError, refetch } = useFinanceSummary(applied);

  return (
    <>
      <Seo title={t('admin.finance')} />
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.finance')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Pregled uplata ulaznica i procjena članarina za {formatDay(applied.from)} –{' '}
            {formatDay(applied.to)}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void downloadFinanceExport('xlsx', applied)}>
            Preuzmi Excel
          </Button>
          <Button variant="outline" onClick={() => void downloadFinanceExport('pdf', applied)}>
            Preuzmi PDF
          </Button>
        </div>
      </div>
      <FinanceFiltersForm draft={draft} setDraft={setDraft} onApply={() => setApplied(draft)} />
      {isError ? (
        <Button variant="outline" onClick={() => void refetch()}>Pokušaj ponovo</Button>
      ) : isLoading || !data ? (
        <p className="text-sm text-text-muted">Učitavanje...</p>
      ) : (
        <div className="space-y-6">
          <FinanceKpiGrid data={data} />
          <FinanceBuckets data={data} />
          <p className="rounded-lg border border-[var(--border-subtle)] bg-surface/40 px-4 py-3 text-sm text-text-muted">
            Članarine su procjena: broj članova sa statusom Aktivno u odabranom periodu, pomnožen
            godišnjom cijenom iz postavki. Pojedinačna online uplata članarine nije u ovom izvještaju
            kao Payment red.
          </p>
        </div>
      )}
    </>
  );
}
