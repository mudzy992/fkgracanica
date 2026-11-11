import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { asArray } from '../../lib/as-array';
import {
  useMediaAssets,
  useMediaFolders,
  type MediaAsset,
  type MediaFolder,
} from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';
import { MediaFolderPicker } from './MediaFolderPicker';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../ui/dialog';
import { Input } from '../ui/input';

type Mode = 'single' | 'multiple';

/**
 * Q-FE06-36: default `[]` je nova referenca svakog rendera, a efekat zavisi od
 * `selectedPaths` → `setPicked` → render → beskonačna petlja. Modulska
 * konstanta drži referencu stabilnom kad prop nije proslijeđen.
 */
const NO_PATHS: string[] = [];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: Mode;
  title?: string;
  selectedPaths?: string[];
  onConfirm: (paths: string[]) => void;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  mode = 'single',
  title = 'Odabir medija',
  selectedPaths = NO_PATHS,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [folderId, setFolderId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const { data: foldersRaw } = useMediaFolders();
  const folders = asArray<MediaFolder>(foldersRaw);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    setPicked(new Set(selectedPaths));
    setSearch('');
    setDebouncedSearch('');
    setFolderId(undefined);
  }, [open, selectedPaths]);

  const queryFolderId = debouncedSearch ? undefined : folderId;
  const { data, isLoading } = useMediaAssets({
    folderId: queryFolderId,
    search: debouncedSearch || undefined,
    limit: 60,
    page: 1,
  });
  const assets = asArray<MediaAsset>(data?.data ?? data);

  const visiblePaths = useMemo(() => assets.map((a) => a.originalPath), [assets]);

  const toggle = (path: string) => {
    if (mode === 'single') {
      onConfirm([path]);
      onOpenChange(false);
      return;
    }
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectVisible = () => {
    setPicked((prev) => {
      const next = new Set(prev);
      visiblePaths.forEach((p) => next.add(p));
      return next;
    });
  };

  const confirmMultiple = () => {
    onConfirm([...picked]);
    onOpenChange(false);
  };

  const addFolderHint = folderId && !debouncedSearch;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-h-[min(92dvh,820px)] w-full max-w-[min(96vw,1100px)]"
    >
      <DialogHeader onClose={() => onOpenChange(false)}>{title}</DialogHeader>
      <DialogBody className="flex min-h-0 flex-col gap-0 p-0 sm:flex-row">
        <aside className="max-h-40 shrink-0 overflow-y-auto border-b border-[var(--border-subtle)] p-3 sm:max-h-none sm:w-52 sm:border-b-0 sm:border-r">
          <MediaFolderPicker folders={folders} selectedId={folderId} onSelect={setFolderId} />
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.mediaPicker.searchPlaceholder')}
          />
          {debouncedSearch && (
            <p className="text-xs text-text-muted">
              {t('admin.mediaPicker.searchResults', { count: assets.length })}
            </p>
          )}
          {addFolderHint && (
            <p className="text-xs text-text-muted">{t('admin.mediaPicker.folderView')}</p>
          )}
          <div className="min-h-[200px] flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-text-muted">{t('admin.common.loading')}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {assets.map((a) => {
                  const selected = picked.has(a.originalPath);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(a.originalPath)}
                      className={cn(
                        'relative overflow-hidden rounded-lg border transition',
                        selected
                          ? 'border-primary-light ring-2 ring-primary-light/40'
                          : 'border-[var(--border-subtle)] hover:border-primary-light/50',
                      )}
                    >
                      <img
                        src={mediaUrl(a.thumbPath ?? a.originalPath, 'thumb')}
                        alt={a.filename}
                        className="aspect-square w-full object-cover"
                      />
                      {mode === 'multiple' && selected && (
                        <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {!isLoading && !assets.length && (
              <p className="py-8 text-center text-sm text-text-muted">
                {t('admin.mediaPicker.empty')}
              </p>
            )}
          </div>
        </div>
      </DialogBody>
      {mode === 'multiple' && (
        <DialogFooter>
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-text-muted">Odabrano: {picked.size}</span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectVisible}
                disabled={!visiblePaths.length}
              >
                Odaberi vidljive
              </Button>
              <Button type="button" size="sm" onClick={confirmMultiple} disabled={!picked.size}>
                Dodaj odabrane
              </Button>
            </div>
          </div>
        </DialogFooter>
      )}
    </Dialog>
  );
}
