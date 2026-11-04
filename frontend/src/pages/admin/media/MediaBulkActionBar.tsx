import { useState } from 'react';
import type { MediaFolder } from '../../../hooks/use-media-admin';
import { useDeleteMedia, useUpdateMediaAsset } from '../../../hooks/use-media-admin';
import { asArray } from '../../../lib/as-array';
import { Button } from '../../../components/ui/button';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedIds: Set<string>;
  folders: MediaFolder[];
  onClear: () => void;
  onDone: () => void;
  onConfirmDelete: (count: number) => Promise<boolean>;
}

export function MediaBulkActionBar({
  selectedIds,
  folders,
  onClear,
  onDone,
  onConfirmDelete,
}: Props) {
  const { t } = useTranslation();
  const [targetFolder, setTargetFolder] = useState('');
  const [busy, setBusy] = useState(false);
  const remove = useDeleteMedia();
  const update = useUpdateMediaAsset();
  const folderList = asArray<MediaFolder>(folders);
  const count = selectedIds.size;

  if (!count) return null;

  const handleDelete = async () => {
    const ok = await onConfirmDelete(count);
    if (!ok) return;
    setBusy(true);
    try {
      for (const id of selectedIds) {
        await remove.mutateAsync(id);
      }
      onDone();
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async () => {
    if (!targetFolder) return;
    setBusy(true);
    try {
      for (const id of selectedIds) {
        await update.mutateAsync({ id, folderId: targetFolder });
      }
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-background/95 p-3 shadow-lg backdrop-blur sm:static sm:border-t-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{count} odabrano</span>
        <select
          value={targetFolder}
          onChange={(e) => setTargetFolder(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm sm:max-w-[200px] sm:flex-none"
          disabled={busy}
        >
          <option value="">{t('admin.mediaBulk.moveTo')}</option>
          {folderList.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void handleMove()}
          disabled={busy || !targetFolder}
        >
          Primijeni
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => void handleDelete()}
          disabled={busy}
        >
          Obriši
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClear} disabled={busy}>
          Poništi
        </Button>
      </div>
    </div>
  );
}
