import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { asArray } from '../../lib/as-array';
import { cn } from '../../lib/utils';

interface StaticProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  placeholder?: string;
}

interface AsyncProps<T extends object> {
  endpoint: string;
  labelKey: keyof T & string;
  valueKey: keyof T & string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  params?: Record<string, string>;
  formatLabel?: (item: T) => string;
}

export function EntitySelect<T extends object>(props: StaticProps | AsyncProps<T>) {
  if ('options' in props) {
    const { value, onChange, options, label, placeholder = 'Odaberi...' } = props;
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium">{label}</label>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const {
    endpoint,
    labelKey,
    valueKey,
    value,
    onChange,
    placeholder = 'Odaberi...',
    multiple,
    params,
    formatLabel,
  } = props;

  const { data: raw, isLoading } = useQuery({
    queryKey: ['entity-select', endpoint, params],
    queryFn: async () => (await api.get(endpoint, { params })).data,
  });
  const data = asArray<T>(raw);

  const labelOf = (item: T) =>
    formatLabel ? formatLabel(item) : String((item as Record<string, unknown>)[labelKey]);

  const toggle = (id: string) => {
    if (!multiple) {
      onChange(id);
      return;
    }
    const ids = Array.isArray(value) ? value : [];
    onChange(ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]);
  };

  if (isLoading) return <p className="text-sm text-text-muted">Učitavanje...</p>;

  return (
    <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
      {data.length === 0 && <span className="text-sm text-text-muted">{placeholder}</span>}
      {data.map((item) => {
        const id = String((item as Record<string, unknown>)[valueKey]);
        const active = multiple
          ? (Array.isArray(value) ? value : []).includes(id)
          : value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs',
              active ? 'border-primary bg-primary text-white' : 'border-slate-200',
            )}
          >
            {labelOf(item)}
          </button>
        );
      })}
    </div>
  );
}
