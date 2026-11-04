import type { FinanceSummary } from '../../../hooks/use-finance-summary';
import { useTranslation } from 'react-i18next';
import { formatDay, formatKm } from './finance-labels';

function Stat({ label, hint, value }: { label: string; hint: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{hint}</p>
    </div>
  );
}

export function FinanceKpiGrid({ data }: { data: FinanceSummary }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Stat
        label={t('admin.financeKpi.tickets')}
        value={formatKm(data.tickets.sum)}
        hint={t('admin.financeKpi.transactions', { count: data.tickets.count })}
      />
      <Stat
        label={t('admin.financeKpi.seasonPasses')}
        value={formatKm(data.seasonPass.sum)}
        hint={t('admin.financeKpi.cards', { count: data.seasonPass.count })}
      />
      <Stat
        label={t('admin.financeKpi.memberships')}
        value={formatKm(data.membership.sum)}
        hint={t('admin.financeKpi.activeMembers', { count: data.membership.count })}
      />
      <Stat
        label={t('admin.visitors.total')}
        value={formatKm(data.totalSum)}
        hint={t('admin.financeKpi.totalHint')}
      />
      <Stat
        label={t('admin.financeKpi.period')}
        value={`${formatDay(data.from)} – ${formatDay(data.to)}`}
        hint={t('admin.financeKpi.periodHint')}
      />
    </div>
  );
}
