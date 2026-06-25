import { useEffect, useState } from 'react';
import type { MediaAsset, MediaFolder } from '../../hooks/use-media-admin';
import { useMediaFolders, useUpdateMediaAsset } from '../../hooks/use-media-admin';
import { asArray } from '../../lib/as-array';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mediaUrl } from '../../lib/media';

interface Props {
  asset: MediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaAssetFormSheet({ asset, open, onOpenChange }: Props) {
  const { data: foldersRaw } = useMediaFolders();
  const folders = asArray<MediaFolder>(foldersRaw);
  const update = useUpdateMediaAsset();
  const [filename, setFilename] = useState('');
  const [tags, setTags] = useState('');
  const [folderId, setFolderId] = useState('');

  useEffect(() => {
    if (!asset) return;
    setFilename(asset.filename);
    setTags(asset.tags ?? '');
    setFolderId(asset.folderId ?? '');
  }, [asset]);

  const onSave = async () => {
    if (!asset) return;
    await update.mutateAsync({
      id: asset.id,
      filename,
      tags,
      folderId: folderId || null,
    });
    onOpenChange(false);
  };

  if (!asset) return null;

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Uredi medij">
      <div className="space-y-4">
        <div className="flex gap-3">
          {(['thumb', 'medium', 'original'] as const).map((size) => (
            <div key={size} className="text-center">
              <img
                src={mediaUrl(
                  (size === 'thumb' ? asset.thumbPath : size === 'medium' ? asset.mediumPath : asset.originalPath) ??
                    asset.originalPath,
                  size === 'original' ? 'original' : size,
                )}
                alt=""
                className="h-20 w-20 rounded object-cover"
              />
              <p className="mt-1 text-xs text-text-muted">{size}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Naziv fajla</label>
          <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tagovi</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vijesti, hero" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mapa</label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Bez mape</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => void onSave()} disabled={update.isPending}>Sačuvaj</Button>
      </div>
    </AdminFormSheet>
  );
}
