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
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';

function emptyMessage(globalSearch: boolean, debouncedSearch: string) {
  if (globalSearch) return `Nema rezultata za „${debouncedSearch}".`;
  return 'Nema medija u ovoj mapi.';
}

export function MediaPage() {
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    selection.clear();
  };

  const handleFolderSelect = (id?: string) => {
    setFolderId(id);
    setPage(1);
    selection.clear();
  };

  const copyUrl = (path: string) => {
    void navigator.clipboard.writeText(mediaUrl(path, 'original') ?? path).then(() => {
      setCopied(path);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const onDelete = async (id: string, filename: string) => {
    const ok = await confirm({ title: 'Obrisati medij?', description: filename, variant: 'danger', confirmLabel: 'Obriši' });
    if (ok) void remove.mutateAsync(id);
  };

  const onFolderDelete = async (id: string, name: string) => {
    const ok = await confirm({ title: 'Obrisati mapu?', description: name, variant: 'danger', confirmLabel: 'Obriši' });
    if (ok) {
      void deleteFolder.mutateAsync(id).then(() => folderId === id && setFolderId(undefined));
    }
  };

  const onBulkDeleteConfirm = async (count: number) =>
    confirm({
      title: `Obrisati ${count} medija?`,
      description: 'Ova radnja se ne može poništiti.',
      variant: 'danger',
      confirmLabel: 'Obriši',
    });

  const handleUploadFiles = (files: FileList) => {
    if (!folderId) return;
    enqueue(files, folderId);
  };

  const handleToggleSelectionMode = () => {
    if (selection.selectionMode) selection.exitSelectionMode();
    else selection.enterSelectionMode();
  };

  const folderTreeProps = {
    folders,
    selectedId: folderId,
    onSelect: handleFolderSelect,
    newName: newFolder,
    onNewNameChange: setNewFolder,
    onCreate: () => void createFolder.mutateAsync({ name: newFolder, parentId: folderId }).then(() => setNewFolder('')),
    isCreating: createFolder.isPending,
    onRename: (id: string, name: string) => void updateFolder.mutateAsync({ id, name }),
    onDelete: onFolderDelete,
  };

  const empty = emptyMessage(globalSearch, debouncedSearch);

  return (
    <>
      <Seo title="Mediji" />
      {dialog}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length && folderId) handleUploadFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replaceId) void replace.mutateAsync({ id: replaceId, file }).finally(() => setReplaceId(null));
          e.target.value = '';
        }}
      />
      <AdminPageShell title="Mediji" isLoading={fl || al}>
        <MediaPageToolbar
          search={search}
          onSearchChange={handleSearchChange}
          globalSearch={globalSearch}
          debouncedSearch={debouncedSearch}
          totalResults={data?.meta?.total}
          folderId={folderId}
          selectedFolderName={selectedFolderName}
          selectionMode={selection.selectionMode}
          selectedCount={selection.selectedCount}
          visibleCount={visibleIds.length}
          onToggleSelectionMode={handleToggleSelectionMode}
          onSelectAllVisible={() => selection.selectAll(visibleIds)}
          onUploadClick={() => uploadRef.current?.click()}
          uploadDisabled={uploadDisabled}
          uploadTitle={folderId ? undefined : 'Prvo odaberite mapu'}
          onFolderChipClick={() => setFolderSheetOpen(true)}
          uploadProgress={uploadState}
        />
        <MediaUploadZone
          folderId={folderId}
          disabled={uploadState.isRunning}
          onTrigger={() => uploadRef.current?.click()}
          onFiles={handleUploadFiles}
        />
        <div className="grid min-h-[320px] items-start lg:grid-cols-[minmax(200px,240px)_1fr]">
          <MediaFolderTree {...folderTreeProps} className="hidden lg:block" />
          <MediaPageAssetsSection
            assets={assets}
            empty={empty}
            copied={copied}
            folders={folders}
            selectionMode={selection.selectionMode}
            selectedCount={selection.selectedCount}
            selectedIds={selection.selectedIds}
            isSelected={selection.isSelected}
            onToggleSelect={selection.toggle}
            onCopy={copyUrl}
            onReplace={(id) => { setReplaceId(id); replaceRef.current?.click(); }}
            onDelete={onDelete}
            onEdit={setEditAsset}
            onClearSelection={selection.clear}
            onExitSelection={selection.exitSelectionMode}
            onConfirmBulkDelete={onBulkDeleteConfirm}
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </AdminPageShell>
      <MediaFolderSheet
        open={folderSheetOpen}
        onOpenChange={setFolderSheetOpen}
        {...folderTreeProps}
      />
      <MediaAssetFormSheet asset={editAsset} open={!!editAsset} onOpenChange={(o) => !o && setEditAsset(null)} />
    </>
  );
}
