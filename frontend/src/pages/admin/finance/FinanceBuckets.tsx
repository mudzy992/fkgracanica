import { Badge } from '../../../components/ui/badge';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
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
      <UITable className="w-full text-sm">
        <TableHeader>
          <TableRow className="text-left text-text-muted">
            <TableHead className="px-4 py-2 font-medium">
              {kind === 'provider'
                ? t('admin.orderSheet.paymentMethod')
                : t('admin.membershipForm.status')}
            </TableHead>
            <TableHead className="px-4 py-2 font-medium">{t('admin.financeBuckets.count')}</TableHead>
            <TableHead className="px-4 py-2 font-medium">{t('admin.orderSheet.amount')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell className="px-4 py-3 text-text-muted" colSpan={3}>
                {t('admin.financeBuckets.empty')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.key} className="border-t border-[var(--border-subtle)]">
                <TableCell className="px-4 py-2">
                  {kind === 'provider' && isFinanceProvider(row.key) ? (
                    <FinanceProviderChip id={row.key} />
                  ) : (
                    <Badge variant={paymentStatusVariant(row.key)}>
                      {paymentStatusLabel(row.key)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 tabular-nums">{row.count}</TableCell>
                <TableCell className="px-4 py-2 tabular-nums">{formatKm(row.sum)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </UITable>
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
