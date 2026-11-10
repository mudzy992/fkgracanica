import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Images } from 'lucide-react';
import { asArray } from '../../lib/as-array';
import type { MediaFolder } from '../../hooks/use-media-admin';
import { useGalleryPhotoBatch } from '../../hooks/use-gallery-photo-batch';
import { MediaPickerDialog } from './MediaPickerDialog';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../ui/dialog';
import { MediaFolderPicker } from './MediaFolderPicker';
import { useMediaFolders } from '../../hooks/use-media-admin';

interface Props {
  galleryId: string;
  existingPaths: string[];
}

export function GalleryPhotoPicker({ galleryId, existingPaths }: Props) {
  const { t } = useTranslation();
  const [gridOpen, setGridOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderId, setFolderId] = useState<string | undefined>();
  const { state, add, retryRefresh } = useGalleryPhotoBatch(galleryId);
  const { data: foldersRaw } = useMediaFolders();
  const folders = asArray<MediaFolder>(foldersRaw);
  const busy = state.phase === 'adding' || state.phase === 'checking';
  const disabled = state.phase !== 'ready';
  const message = state.notice ? t(`admin.galleryBatch.${state.notice}`) : '';

  const addFromFolder = () => {
    const id = folderId!;
    setFolderOpen(false);
    setFolderId(undefined);
    void add({ folderId: id });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGridOpen(true)}
          disabled={disabled}
        >
          <Images className="mr-1 h-4 w-4" />
          Odaberi slike
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFolderOpen(true)}
          disabled={disabled}
        >
          <FolderOpen className="mr-1 h-4 w-4" />
          Dodaj mapu
        </Button>
      </div>
      {message ? (
        <div
          role={state.notice === 'refreshed' ? 'status' : 'alert'}
          className={state.notice === 'refreshed'
            ? 'max-w-xl text-sm text-text-muted'
            : 'max-w-xl rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text'}
        >
          {message}
        </div>
      ) : null}
      {busy ? <p role="status" className="text-sm text-text-muted">{t('admin.galleryBatch.checking')}</p> : null}
      {state.phase === 'blocked' ? (
        <Button type="button" variant="outline" size="sm" onClick={() => void retryRefresh()}>
          {t('admin.galleryBatch.retry')}
        </Button>
      ) : null}

      <MediaPickerDialog
        open={gridOpen}
        onOpenChange={setGridOpen}
        mode="multiple"
        title={t('admin.mediaPicker.pickGallery')}
        selectedPaths={existingPaths}
        onConfirm={(paths) => void add({ paths })}
      />

      <Dialog
        open={folderOpen}
        onOpenChange={setFolderOpen}
        className="max-h-[min(85dvh,560px)] w-full max-w-md sm:max-w-lg"
      >
        <DialogHeader onClose={() => setFolderOpen(false)}>
          {t('admin.mediaPicker.addAllFromFolder')}
        </DialogHeader>
        <DialogBody>
          <p className="mb-3 text-sm text-text-muted">{t('admin.mediaPicker.addAllHint')}</p>
          <MediaFolderPicker folders={folders} selectedId={folderId} onSelect={setFolderId} />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setFolderOpen(false)}>
            Odustani
          </Button>
          <Button type="button" onClick={addFromFolder} disabled={!folderId || disabled}>
            Dodaj mapu
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
