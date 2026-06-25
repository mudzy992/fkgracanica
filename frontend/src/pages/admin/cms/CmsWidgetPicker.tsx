import { useState } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { useCmsWidgets, useAddCmsSection } from '../../../hooks/use-cms-pages';
import { asArray } from '../../../lib/as-array';
import type { CmsWidgetMeta } from '../../../cms/types';

interface Props {
  pageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CmsWidgetPicker({ pageId, open, onOpenChange }: Props) {
  const { data } = useCmsWidgets();
  const widgets = asArray<CmsWidgetMeta>(data).filter((w) => w.category !== 'global');
  const add = useAddCmsSection(pageId);
  const [category, setCategory] = useState<string>('all');

  const filtered = category === 'all' ? widgets : widgets.filter((w) => w.category === category);
  const categories = ['all', 'layout', 'module'] as const;

  const pick = async (widgetType: string) => {
    await add.mutateAsync({ widgetType, config: {} });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg">
      <DialogHeader onClose={() => onOpenChange(false)}>Dodaj widget</DialogHeader>
      <DialogBody>
        <div className="mb-3 flex gap-2">
          {categories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>
              {c === 'all' ? 'Sve' : c === 'layout' ? 'Layout' : 'Moduli'}
            </Button>
          ))}
        </div>
        <div className="grid gap-2">
          {filtered.map((w) => (
            <Button key={w.type} variant="outline" className="justify-start" onClick={() => void pick(w.type)} disabled={add.isPending}>
              {w.label}
            </Button>
          ))}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Zatvori
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
