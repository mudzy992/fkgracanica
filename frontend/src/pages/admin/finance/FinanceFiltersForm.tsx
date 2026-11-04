import { Button } from '../../../components/ui/button';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../components/ui/input';
import type { FinanceFilters } from '../../../hooks/use-finance-summary';
import { FinanceProviderChip } from './FinanceProviderChip';
import { PAYMENT_STATUS_OPTIONS } from './finance-labels';

const PROVIDERS = ['stripe', 'paypal', 'monri', 'box_office'] as const;

export function FinanceFiltersForm({
  draft,
  setDraft,
  onApply,
}: {
  draft: FinanceFilters;
  setDraft: (next: FinanceFilters) => void;
  onApply: () => void;
}) {
  const { t } = useTranslation();
  return (
    <form
      className="mb-6 space-y-4 rounded-xl border border-[var(--border-subtle)] bg-surface/40 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Od</span>
          <Input
            type="date"
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Do</span>
          <Input
            type="date"
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-text-muted">{t('admin.financeFilters.status')}</span>
          <select
            className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
          >
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <p className="mb-2 text-sm text-text-muted">{t('admin.financeFilters.method')}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!draft.provider}
            onClick={() => setDraft({ ...draft, provider: '' })}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              !draft.provider
                ? 'bg-text text-background ring-2 ring-accent ring-offset-2 ring-offset-background'
                : 'bg-surface text-text-muted hover:text-text'
            }`}
          >
            Svi načini
          </button>
          {PROVIDERS.map((id) => (
            <FinanceProviderChip
              key={id}
              id={id}
              selected={draft.provider === id}
              onClick={() => setDraft({ ...draft, provider: draft.provider === id ? '' : id })}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Filter načina vrijedi za ulaznice. Članarine nemaju Payment red pa se prikazuju samo uz
          „Svi načini”.
        </p>
      </div>
      <Button type="submit">{t('admin.financeFilters.period')}</Button>
    </form>
  );
}
