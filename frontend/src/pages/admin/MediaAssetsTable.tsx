import { Copy } from 'lucide-react';
import type { MediaAsset } from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { Button } from '../../components/ui/button';
import { AdminDataTable } from '../../components/admin/AdminPageShell';

interface Props {
  assets: MediaAsset[];
  copied: string | null;
  onCopy: (path: string) => void;
  onReplace: (id: string) => void;
  onDelete: (id: string, filename: string) => void;
  onEdit: (asset: MediaAsset) => void;
}

export function MediaAssetsTable({ assets, copied, onCopy, onReplace, onDelete, onEdit }: Props) {
  return (
    <AdminDataTable
      rows={assets}
      empty="Nema medija u ovoj mapi."
      columns={[
        {
          key: 'preview',
          header: 'Pregled',
          render: (r) => (
            <img src={mediaUrl(r.thumbPath ?? r.originalPath, 'thumb')} alt="" className="h-12 w-12 rounded object-cover" />
          ),
        },
        { key: 'filename', header: 'Fajl', render: (r) => r.filename },
        { key: 'size', header: 'Veličina', render: (r) => `${Math.round(r.size / 1024)} KB` },
        {
          key: 'actions',
          header: 'Akcije',
          render: (r) => (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(r)}>Uredi</Button>
              <Button size="sm" variant="outline" onClick={() => onCopy(r.originalPath)}>
                <Copy className="mr-1 h-3 w-3" />
                {copied === r.originalPath ? 'Kopirano' : 'URL'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onReplace(r.id)}>Zamijeni</Button>
              <Button size="sm" variant="ghost" onClick={() => void onDelete(r.id, r.filename)}>Obriši</Button>
            </div>
          ),
        },
      ]}
    />
  );
}
