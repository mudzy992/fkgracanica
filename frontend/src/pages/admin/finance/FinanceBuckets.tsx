import { Badge } from '../../../components/ui/badge';
import { useTranslation } from 'react-i18next';
import type { FinanceBucket, FinanceSummary } from '../../../hooks/use-finance-summary';
import { FinanceProviderChip } from './FinanceProviderChip';
import {
  formatKm,
  isFinanceProvider,
  paymentStatusLabel,
  paymentStatusVariant,
} from './finance-labels';

function Table({
  title,
  rows,
  kind,
}: {
  title: string;
  rows: FinanceBucket[];
  kind: 'provider' | 'status';
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <p className="border-b border-[var(--border-subtle)] px-4 py-2 text-sm font-medium">
        {title}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-muted">
            <th className="px-4 py-2 font-medium">
              {kind === 'provider'
                ? t('admin.orderSheet.paymentMethod')
                : t('admin.membershipForm.status')}
            </th>
            <th className="px-4 py-2 font-medium">{t('admin.financeBuckets.count')}</th>
            <th className="px-4 py-2 font-medium">{t('admin.orderSheet.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-3 text-text-muted" colSpan={3}>
                {t('admin.financeBuckets.empty')}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-2">
                  {kind === 'provider' && isFinanceProvider(row.key) ? (
                    <FinanceProviderChip id={row.key} />
                  ) : (
                    <Badge variant={paymentStatusVariant(row.key)}>
                      {paymentStatusLabel(row.key)}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2 tabular-nums">{row.count}</td>
                <td className="px-4 py-2 tabular-nums">{formatKm(row.sum)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FinanceBuckets({ data }: { data: FinanceSummary }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Table title={t('admin.financeBuckets.byProvider')} rows={data.byProvider} kind="provider" />
      <Table title={t('admin.financeBuckets.byStatus')} rows={data.byStatus} kind="status" />
    </div>
  );
}
