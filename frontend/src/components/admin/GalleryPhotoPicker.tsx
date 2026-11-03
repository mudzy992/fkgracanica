import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Images } from 'lucide-react';
import { asArray } from '../../lib/as-array';
import { fetchAllMediaAssetsInFolder } from '../../lib/fetch-all-media-assets';
import type { MediaFolder } from '../../hooks/use-media-admin';
import { useAddGalleryPhotos } from '../../hooks/use-content-admin';
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
  const [busy, setBusy] = useState(false);
  const addPhotos = useAddGalleryPhotos();
  const { data: foldersRaw } = useMediaFolders();
  const folders = asArray<MediaFolder>(foldersRaw);

  const addPaths = async (paths: string[]) => {
    const fresh = paths.filter((p) => p && !existingPaths.includes(p));
    if (!fresh.length) return;
    setBusy(true);
    try {
      await addPhotos.mutateAsync({ galleryId, paths: fresh });
    } finally {
      setBusy(false);
    }
  };

  const addFromFolder = async () => {
    if (!folderId) return;
    setBusy(true);
    try {
      const assets = await fetchAllMediaAssetsInFolder(folderId);
      const paths = assets.map((a) => a.originalPath);
      await addPaths(paths);
      setFolderOpen(false);
      setFolderId(undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setGridOpen(true)}
        disabled={busy}
      >
        <Images className="mr-1 h-4 w-4" />
        Odaberi slike
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setFolderOpen(true)}
        disabled={busy}
      >
        <FolderOpen className="mr-1 h-4 w-4" />
        Dodaj mapu
      </Button>

      <MediaPickerDialog
        open={gridOpen}
        onOpenChange={setGridOpen}
        mode="multiple"
        title={t('admin.mediaPicker.pickGallery')}
        selectedPaths={existingPaths}
        onConfirm={(paths) => void addPaths(paths)}
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
          <Button type="button" onClick={() => void addFromFolder()} disabled={!folderId || busy}>
            Dodaj mapu
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
