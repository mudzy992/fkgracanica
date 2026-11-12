import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaAsset, MediaFolder } from '../../hooks/use-media-admin';
import { useMediaFolders, useUpdateMediaAsset } from '../../hooks/use-media-admin';
import { asArray } from '../../lib/as-array';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaUrl } from '../../lib/media';
import { getApiErrorMessage } from '../../lib/api-error';

interface Props {
  asset: MediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaAssetFormSheet({ asset, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { data: foldersRaw } = useMediaFolders();
  const folders = asArray<MediaFolder>(foldersRaw);
  const update = useUpdateMediaAsset();
  const [filename, setFilename] = useState('');
  const [tags, setTags] = useState('');
  const [folderId, setFolderId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!asset) return;
    setFilename(asset.filename);
    setTags(asset.tags ?? '');
    setFolderId(asset.folderId ?? '');
  }, [asset]);

  /**
   * FE-04b/P-FE04-7: prije je greška bila tiho pojedena (unhandled rejection) —
   * dijalog ostane otvoren, spinner stane, a korisnik ne zna da izmjena nije
   * sačuvana.
   */
  const onSave = async () => {
    setError('');
    try {
      await update.mutateAsync({
        id: asset!.id,
        filename,
        tags,
        folderId: folderId || null,
      });
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, t('admin.mediaAsset.saveError')));
    }
  };

  if (!asset) return null;

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={t('admin.mediaAsset.edit')}>
      <div className="space-y-4">
        <div className="flex gap-3">
          {(['thumb', 'medium', 'original'] as const).map((size) => (
            <div key={size} className="text-center">
              <img
                src={mediaUrl(
                  (size === 'thumb'
                    ? asset.thumbPath
                    : size === 'medium'
                      ? asset.mediumPath
                      : asset.originalPath) ?? asset.originalPath,
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
          <label className="mb-1 block text-sm font-medium">{t('admin.mediaAsset.filename')}</label>
          <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('admin.mediaAsset.tags')}</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t('admin.mediaAsset.tagsPlaceholder')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('admin.mediaAsset.folder')}</label>
          <Select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
          >
            <option value="">{t('admin.mediaAsset.noFolder')}</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button onClick={() => void onSave()} disabled={update.isPending}>
          Sačuvaj
        </Button>
      </div>
    </AdminFormSheet>
  );
}
