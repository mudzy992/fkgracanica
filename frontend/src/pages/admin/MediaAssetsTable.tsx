import { Check, Copy } from 'lucide-react';
import type { MediaAsset } from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { AdminDataTable } from '../../components/admin/AdminPageShell';

interface Props {
  assets: MediaAsset[];
  empty: string;
  copied: string | null;
  selectionMode: boolean;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (path: string) => void;
  onReplace?: (id: string) => void;
  onDelete?: (id: string, filename: string) => void;
  onEdit?: (asset: MediaAsset) => void;
}

export function MediaAssetsTable({
  assets,
  empty,
  copied,
  selectionMode,
  isSelected,
  onToggleSelect,
  onCopy,
  onReplace,
  onDelete,
  onEdit,
}: Props) {
  const columns = [
    ...(selectionMode
      ? [{
          key: 'select',
          header: '',
          render: (r: MediaAsset) => (
            <button
              type="button"
              onClick={() => onToggleSelect(r.id)}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border',
                isSelected(r.id) ? 'border-primary bg-primary text-white' : 'border-slate-300',
              )}
              aria-label={isSelected(r.id) ? 'Poništi odabir' : 'Odaberi'}
            >
              {isSelected(r.id) && <Check className="h-3 w-3" />}
            </button>
          ),
        }]
      : []),
    {
      key: 'preview',
      header: 'Pregled',
      render: (r: MediaAsset) => (
        <img src={mediaUrl(r.thumbPath ?? r.originalPath, 'thumb')} alt="" className="h-12 w-12 rounded object-cover" />
      ),
    },
    { key: 'filename', header: 'Fajl', render: (r: MediaAsset) => r.filename },
    { key: 'size', header: 'Veličina', render: (r: MediaAsset) => `${Math.round(r.size / 1024)} KB` },
    ...(!selectionMode
      ? [{
          key: 'actions',
          header: 'Akcije',
          render: (r: MediaAsset) => (
            <div className="flex flex-wrap gap-1">
              {onEdit ? <Button size="sm" variant="outline" onClick={() => onEdit(r)}>Uredi</Button> : null}
              <Button size="sm" variant="outline" onClick={() => onCopy(r.originalPath)}>
                <Copy className="mr-1 h-3 w-3" />
                {copied === r.originalPath ? 'Kopirano' : 'URL'}
              </Button>
              {onReplace ? <Button size="sm" variant="outline" onClick={() => onReplace(r.id)}>Zamijeni</Button> : null}
              {onDelete ? <Button size="sm" variant="ghost" onClick={() => void onDelete(r.id, r.filename)}>Obriši</Button> : null}
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="hidden lg:block">
      <AdminDataTable
        rows={assets}
        empty={empty}
        cellClassName="p-3"
        headerCellClassName="p-3"
        rowClassName={(r) => (isSelected(r.id) ? 'bg-primary/5' : undefined)}
        columns={columns}
      />
    </div>
  );
}
