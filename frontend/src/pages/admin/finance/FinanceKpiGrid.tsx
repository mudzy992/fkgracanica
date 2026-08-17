import type { FinanceSummary } from '../../../hooks/use-finance-summary';
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
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Ulaznice"
        value={formatKm(data.tickets.sum)}
        hint={`${data.tickets.count} transakcija`}
      />
      <Stat
        label="Članarine (procjena)"
        value={formatKm(data.membership.sum)}
        hint={`${data.membership.count} aktivnih članova`}
      />
      <Stat
        label="Ukupno"
        value={formatKm(data.totalSum)}
        hint="Ulaznice + procjena članarina"
      />
      <Stat
        label="Period"
        value={`${formatDay(data.from)} – ${formatDay(data.to)}`}
        hint="Po datumu kreiranja uplate / aktivacije"
      />
    </div>
  );
}
