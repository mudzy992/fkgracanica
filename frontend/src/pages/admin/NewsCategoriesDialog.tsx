import { useState } from 'react';
import { asArray } from '../../lib/as-array';
import {
  useCreateNewsCategory,
  useDeleteNewsCategory,
  useNewsCategories,
  type NewsCategory,
} from '../../hooks/use-news-admin';
import { Button } from '../../components/ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { useTranslation } from 'react-i18next';
import { runAction } from '../../lib/action-errors';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsCategoriesDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { data: raw } = useNewsCategories();
  const categories = asArray<NewsCategory>(raw);
  const create = useCreateNewsCategory();
  const remove = useDeleteNewsCategory();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const dirty = name.trim().length > 0;

  const onAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError('');
    try {
      await create.mutateAsync({ name: trimmed });
      setName('');
    } catch {
      setError('Greška pri kreiranju kategorije');
    }
  };

  const onDelete = (cat: NewsCategory) => {
    if (!window.confirm(`Obrisati kategoriju "${cat.name}"?`)) return;
    void runAction(remove.mutateAsync(cat.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} preventClose={dirty} className="max-w-md">
      <DialogHeader onClose={() => onOpenChange(false)} preventClose={dirty}>
        Kategorije vijesti
      </DialogHeader>
      <DialogBody className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('admin.newsCategories.newPlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && void onAdd()}
          />
          <Button onClick={() => void onAdd()} disabled={!name.trim() || create.isPending}>
            Dodaj
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <ul className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)]">
          {categories.length === 0 && (
            <li className="p-3 text-sm text-text-muted">{t('admin.newsCategories.empty')}</li>
          )}
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-text-muted">{cat.slug}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(cat)}
                disabled={remove.isPending}
              >
                Obriši
              </Button>
            </li>
          ))}
        </ul>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Zatvori
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
