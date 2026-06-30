import { cn } from '../../lib/utils';

export type AccountTab = 'membership' | 'tickets';

const TABS: { id: AccountTab; label: string }[] = [
  { id: 'membership', label: 'Članstvo' },
  { id: 'tickets', label: 'Ulaznice' },
];

interface Props {
  active: AccountTab;
  onChange: (tab: AccountTab) => void;
  showTickets: boolean;
}

export function AccountSectionTabs({ active, onChange, showTickets }: Props) {
  const tabs = showTickets ? TABS : TABS.filter((t) => t.id === 'membership');

  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            active === t.id ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
