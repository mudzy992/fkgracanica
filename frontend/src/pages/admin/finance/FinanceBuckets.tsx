import { Badge } from '../../../components/ui/badge';
import type { FinanceBucket, FinanceSummary } from '../../../hooks/use-finance-summary';
import { FinanceProviderChip } from './FinanceProviderChip';
import { formatKm, isFinanceProvider, paymentStatusLabel, paymentStatusVariant } from './finance-labels';

function Table({
  title,
  rows,
  kind,
}: {
  title: string;
  rows: FinanceBucket[];
  kind: 'provider' | 'status';
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <p className="border-b border-[var(--border-subtle)] px-4 py-2 text-sm font-medium">{title}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-muted">
            <th className="px-4 py-2 font-medium">{kind === 'provider' ? 'Način' : 'Status'}</th>
            <th className="px-4 py-2 font-medium">Broj</th>
            <th className="px-4 py-2 font-medium">Iznos</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-3 text-text-muted" colSpan={3}>Nema podataka u ovom periodu</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-2">
                  {kind === 'provider' && isFinanceProvider(row.key) ? (
                    <FinanceProviderChip id={row.key} />
                  ) : (
                    <Badge variant={paymentStatusVariant(row.key)}>{paymentStatusLabel(row.key)}</Badge>
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
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Table title="Po načinu plaćanja" rows={data.byProvider} kind="provider" />
      <Table title="Po statusu" rows={data.byStatus} kind="status" />
    </div>
  );
}
