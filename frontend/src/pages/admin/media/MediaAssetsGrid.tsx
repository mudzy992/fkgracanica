import { Check, Copy, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MediaAsset } from '../../../hooks/use-media-admin';
import { mediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

interface Props {
  assets: MediaAsset[];
  empty: string;
  copied: string | null;
  selectionMode: boolean;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (path: string) => void;
  onDelete?: (id: string, filename: string) => void;
  onEdit?: (asset: MediaAsset) => void;
}

function truncateName(name: string, max = 18) {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf('.') > 0 ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, name.length - ext.length);
  return `${base.slice(0, max - ext.length - 1)}…${ext}`;
}

export function MediaAssetsGrid({
  assets,
  empty,
  copied,
  selectionMode,
  isSelected,
  onToggleSelect,
  onCopy,
  onDelete,
  onEdit,
}: Props) {
  const { t } = useTranslation();
  if (!assets.length) {
    return <p className="p-6 text-center text-sm text-text-muted lg:hidden">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:hidden">
      {assets.map((asset) => {
        const selected = isSelected(asset.id);
        return (
          <div
            key={asset.id}
            className={cn(
              'overflow-hidden rounded-lg border bg-background',
              selected ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200',
            )}
          >
            <button
              type="button"
              className="relative block w-full"
              onClick={() => (selectionMode ? onToggleSelect(asset.id) : onEdit?.(asset))}
            >
              <img
                src={mediaUrl(asset.thumbPath ?? asset.originalPath, 'thumb')}
                alt={asset.filename}
                className="aspect-square w-full object-cover"
              />
              {selectionMode && (
                <span
                  className={cn(
                    'absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2',
                    selected ? 'border-primary bg-primary text-white' : 'border-white bg-black/40',
                  )}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
              )}
            </button>
            <div className="space-y-1 p-2">
              <p className="truncate text-xs font-medium" title={asset.filename}>
                {truncateName(asset.filename)}
              </p>
              <p className="text-[10px] text-text-muted">{Math.round(asset.size / 1024)} KB</p>
              {!selectionMode && (
                <div className="flex gap-1">
                  {onEdit ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 flex-1 px-1"
                      onClick={() => onEdit(asset)}
                      aria-label={t('actions.edit')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 flex-1 px-1"
                    onClick={() => onCopy(asset.originalPath)}
                    aria-label={t('admin.mediaGrid.copyUrl')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === asset.originalPath && (
                      <span className="sr-only">{t('admin.mediaGrid.copied')}</span>
                    )}
                  </Button>
                  {onDelete ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 flex-1 px-1 text-danger"
                      onClick={() => void onDelete(asset.id, asset.filename)}
                      aria-label={t('actions.delete')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
