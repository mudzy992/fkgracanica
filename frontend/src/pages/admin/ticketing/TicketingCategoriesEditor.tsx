import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { TicketCategory } from '../../../types/ticketing-config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';

interface Props {
  categories: TicketCategory[];
  onChange: (categories: TicketCategory[]) => void;
}

export function TicketingCategoriesEditor({ categories, onChange }: Props) {
  const [draft, setDraft] = useState<TicketCategory[]>(categories);

  useEffect(() => {
    setDraft(categories);
  }, [categories]);

  const sync = (next: TicketCategory[]) => {
    setDraft(next);
    onChange(next);
  };

  const add = () => {
    const id = `cat-${Date.now()}`;
    sync([...draft, { id, label: 'Nova kategorija', price: 5, isActive: true }]);
  };

  const update = (index: number, patch: Partial<TicketCategory>) => {
    sync(draft.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const remove = (index: number) => {
    sync(draft.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {draft.map((cat, index) => (
        <div
          key={cat.id}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--border-subtle)] p-3"
        >
          <div className="min-w-[120px] flex-1">
            <label className="mb-1 block text-xs text-text-muted">Naziv</label>
            <Input value={cat.label} onChange={(e) => update(index, { label: e.target.value })} />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs text-text-muted">Cijena</label>
            <Input
              type="number"
              step="0.01"
              value={cat.price}
              onChange={(e) => update(index, { price: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <Switch
              checked={cat.isActive !== false}
              onCheckedChange={(v) => update(index, { isActive: v })}
            />
            Aktivna
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            aria-label="Obriši"
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="mr-1 h-4 w-4" />
        Dodaj kategoriju
      </Button>
    </div>
  );
}
