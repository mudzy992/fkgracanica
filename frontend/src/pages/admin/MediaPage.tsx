import { useEffect, useRef, useState } from 'react';
import { asArray } from '../../lib/as-array';
import {
  useCreateMediaFolder,
  useDeleteMediaFolder,
  useDeleteMedia,
  useMediaAssets,
  useMediaFolders,
  useReplaceMedia,
  useUpdateMediaFolder,
  type MediaAsset,
  type MediaFolder,
} from '../../hooks/use-media-admin';
import { useMediaLibraryAccess } from '../../hooks/use-media-library-access';
import { useMediaSelection } from '../../hooks/use-media-selection';
import { useMediaUploadQueue } from '../../hooks/use-media-upload-queue';
import { useConfirm } from '../../hooks/use-confirm';
import { MediaFolderTree } from '../../components/admin/MediaFolderTree';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { MediaPageToolbar } from './media/MediaPageToolbar';
import { MediaFolderSheet } from './media/MediaFolderSheet';
import { MediaUploadZone } from './media/MediaUploadZone';
import { MediaAssetFormSheet } from './MediaAssetFormSheet';
import { MediaPageAssetsSection } from './media/MediaPageAssetsSection';
import { MediaPageFileInputs } from './media/MediaPageFileInputs';
import { emptyMediaMessage, copyMediaOriginalUrl } from './media/media-page-helpers';
import { Seo } from '../../components/seo/Seo';

export function MediaPage() {
  const { canUpload, canManage } = useMediaLibraryAccess();
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [folderId, setFolderId] = useState<string | undefined>();
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editAsset, setEditAsset] = useState<MediaAsset | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const selection = useMediaSelection();
  const { enqueue, state: uploadState } = useMediaUploadQueue();
  const { data: foldersRaw, isLoading: fl } = useMediaFolders();
  const folders = asArray<MediaFolder>(foldersRaw);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const globalSearch = !!debouncedSearch;
  const { data, isLoading: al } = useMediaAssets({
    folderId: globalSearch ? undefined : folderId,
    page,
    search: debouncedSearch || undefined,
  });
  const assets = data?.data ?? [];
  const visibleIds = assets.map((a) => a.id);

  const createFolder = useCreateMediaFolder();
  const updateFolder = useUpdateMediaFolder();
  const deleteFolder = useDeleteMediaFolder();
  const replace = useReplaceMedia();
  const remove = useDeleteMedia();
  const { confirm, dialog } = useConfirm();

  const selectedFolderName = folders.find((f) => f.id === folderId)?.name;
  const uploadDisabled = uploadState.isRunning || !folderId;

  const handleFolderSelect = (id?: string) => {
    setFolderId(id);
    setPage(1);
    selection.clear();
  };

  const copyUrl = (path: string) => copyMediaOriginalUrl(path, setCopied);

  const onDelete = async (id: string, filename: string) => {
    const ok = await confirm({
      title: 'Obrisati medij?',
      description: filename,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void remove.mutateAsync(id);
  };

  const onFolderDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Obrisati mapu?',
      description: name,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) {
      void deleteFolder.mutateAsync(id).then(() => folderId === id && setFolderId(undefined));
    }
  };

  const folderTreeProps = {
    folders,
    selectedId: folderId,
    onSelect: handleFolderSelect,
    newName: newFolder,
    onNewNameChange: setNewFolder,
    onCreate: canUpload
      ? () => void createFolder.mutateAsync({ name: newFolder, parentId: folderId }).then(() => setNewFolder(''))
      : undefined,
    isCreating: createFolder.isPending,
    onRename: canManage ? (id: string, name: string) => void updateFolder.mutateAsync({ id, name }) : undefined,
    onDelete: canManage ? onFolderDelete : undefined,
  };

  return (
    <>
      <Seo title="Mediji" />
      {dialog}
      <MediaPageFileInputs
        uploadRef={uploadRef}
        replaceRef={replaceRef}
        folderId={folderId}
        replaceId={replaceId}
        onUpload={(files) => folderId && enqueue(files, folderId)}
        onReplace={(file) => {
          if (replaceId) void replace.mutateAsync({ id: replaceId, file }).finally(() => setReplaceId(null));
        }}
      />
      <AdminPageShell title="Mediji" isLoading={fl || al}>
        <MediaPageToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); selection.clear(); }}
          globalSearch={globalSearch}
          debouncedSearch={debouncedSearch}
          totalResults={data?.meta?.total}
          folderId={folderId}
          selectedFolderName={selectedFolderName}
          selectionMode={selection.selectionMode}
          selectedCount={selection.selectedCount}
          visibleCount={visibleIds.length}
          onToggleSelectionMode={() =>
            (selection.selectionMode ? selection.exitSelectionMode() : selection.enterSelectionMode())
          }
          onSelectAllVisible={() => selection.selectAll(visibleIds)}
          onUploadClick={() => uploadRef.current?.click()}
          uploadDisabled={uploadDisabled}
          uploadTitle={folderId ? undefined : 'Prvo odaberite mapu'}
          onFolderChipClick={() => setFolderSheetOpen(true)}
          uploadProgress={uploadState}
          canUpload={canUpload}
          canManage={canManage}
        />
        {canUpload ? (
          <MediaUploadZone
            folderId={folderId}
            disabled={uploadState.isRunning}
            onTrigger={() => uploadRef.current?.click()}
            onFiles={(files) => folderId && enqueue(files, folderId)}
          />
        ) : null}
        <div className="grid min-h-[320px] items-start lg:grid-cols-[minmax(200px,240px)_1fr]">
          <MediaFolderTree {...folderTreeProps} className="hidden lg:block" />
          <MediaPageAssetsSection
            assets={assets}
            empty={emptyMediaMessage(globalSearch, debouncedSearch)}
            copied={copied}
            folders={folders}
            selectionMode={selection.selectionMode}
            selectedCount={selection.selectedCount}
            selectedIds={selection.selectedIds}
            isSelected={selection.isSelected}
            onToggleSelect={selection.toggle}
            onCopy={copyUrl}
            onReplace={canManage ? (id) => { setReplaceId(id); replaceRef.current?.click(); } : undefined}
            onDelete={canManage ? onDelete : undefined}
            onEdit={canManage ? setEditAsset : undefined}
            onClearSelection={selection.clear}
            onExitSelection={selection.exitSelectionMode}
            onConfirmBulkDelete={canManage ? (n) => confirm({ title: `Obrisati ${n} medija?`, description: 'Ova radnja se ne može poništiti.', variant: 'danger', confirmLabel: 'Obriši' }) : undefined}
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </AdminPageShell>
      <MediaFolderSheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen} {...folderTreeProps} />
      <MediaAssetFormSheet asset={editAsset} open={!!editAsset} onOpenChange={(o) => !o && setEditAsset(null)} />
    </>
  );
}
