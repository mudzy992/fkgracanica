import { useEffect, useState } from 'react';
import { useCmsMenu, useCmsPages, useSaveCmsMenu } from '../../../hooks/use-cms-pages';
import { useModuleFlags } from '../../../hooks';
import { asArray } from '../../../lib/as-array';
import { Button } from '../../../components/ui/button';
import { AdminPageShell } from '../../../components/admin/AdminPageShell';
import type { CmsPage } from '../../../cms/types';
import { CmsMenuPreviewBar } from './CmsMenuPreviewBar';
import { CmsMenuSortableList } from './CmsMenuSortableList';
import { menuItemToDraft, type MenuDraftItem } from './menu-utils';

export function CmsMenuEditor() {
  const { data: menu, isLoading } = useCmsMenu('main');
  const { data: pagesRaw } = useCmsPages(true);
  const { data: moduleFlags } = useModuleFlags();
  const pages = asArray<CmsPage>(pagesRaw);
  const save = useSaveCmsMenu('main');
  const [items, setItems] = useState<MenuDraftItem[]>([]);

  useEffect(() => {
    if (menu?.items) {
      setItems(menu.items.map(menuItemToDraft).sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [menu]);

  const addCustom = () =>
    setItems((prev) => [
      ...prev,
      { label: 'Nova stavka', path: '/p/', sortOrder: prev.length, enabled: true, isSystem: false },
    ]);

  const submit = async () => {
    await save.mutateAsync(
      items.map((it, i) => ({
        id: it.id,
        label: it.label,
        path: it.path,
        sortOrder: i,
        pageId: it.pageId ?? null,
        externalUrl: it.externalUrl ?? null,
        enabled: it.enabled,
      })),
    );
  };

  return (
    <AdminPageShell title="Glavni meni" isLoading={isLoading}>
      <div className="space-y-4 p-3">
        <CmsMenuPreviewBar items={items} moduleFlags={moduleFlags} />
        <p className="text-xs text-text-muted">
          Sistemske stavke (zaključane) možete samo ugašiti ili premjestiti. Prilagođene stavke možete potpuno
          uređivati. Javna navigacija također skriva stavke čiji je modul isključen u Postavkama.
        </p>
        <CmsMenuSortableList
          items={items}
          pages={pages}
          moduleFlags={moduleFlags}
          onChange={setItems}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={addCustom}>
            + Prilagođena stavka
          </Button>
          <Button onClick={() => void submit()} disabled={save.isPending}>
            Sačuvaj meni
          </Button>
        </div>
      </div>
    </AdminPageShell>
  );
}
