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
  useUploadMedia,
  type MediaAsset,
  type MediaFolder,
} from '../../hooks/use-media-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { MediaFolderTree } from '../../components/admin/MediaFolderTree';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { MediaAssetFormSheet } from './MediaAssetFormSheet';
import { MediaAssetsTable } from './MediaAssetsTable';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function MediaPage() {
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [folderId, setFolderId] = useState<string | undefined>();
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editAsset, setEditAsset] = useState<MediaAsset | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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
  const createFolder = useCreateMediaFolder();
  const updateFolder = useUpdateMediaFolder();
  const deleteFolder = useDeleteMediaFolder();
  const upload = useUploadMedia();
  const replace = useReplaceMedia();
  const remove = useDeleteMedia();
  const { confirm, dialog } = useConfirm();

  const selectedFolderName = folders.find((f) => f.id === folderId)?.name;

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

  return (
    <>
      <Seo title="Mediji" />
      {dialog}
      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && folderId) void upload.mutateAsync({ file, folderId });
        e.target.value = '';
      }} />
      <input ref={replaceRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && replaceId) void replace.mutateAsync({ id: replaceId, file }).finally(() => setReplaceId(null));
        e.target.value = '';
      }} />
      <AdminPageShell
        title="Mediji"
        isLoading={fl || al}
        actions={(
          <Button
            onClick={() => uploadRef.current?.click()}
            disabled={upload.isPending || !folderId}
            title={folderId ? undefined : 'Prvo odaberite mapu'}
          >
            Upload{selectedFolderName ? ` u „${selectedFolderName}"` : ''}
          </Button>
        )}
      >
        <div className="space-y-2 px-4 pb-2">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Pretraga po nazivu, tagu ili putanji…"
          />
          <p className="text-xs text-text-muted">
            {globalSearch
              ? 'Pretraga kroz sve mape. Upload je uvijek u odabranu mapu.'
              : folderId
                ? `Prikaz mape „${selectedFolderName ?? '—'}". Upload ide u ovu mapu.`
                : 'Odaberite mapu za upload i pregled. „Svi mediji" prikazuje cijelu biblioteku.'}
          </p>
        </div>
        <div className="grid min-h-[320px] lg:grid-cols-[220px_1fr]">
          <MediaFolderTree
            folders={folders}
            selectedId={folderId}
            onSelect={(id) => { setFolderId(id); setPage(1); }}
            newName={newFolder}
            onNewNameChange={setNewFolder}
            onCreate={() => void createFolder.mutateAsync({ name: newFolder, parentId: folderId }).then(() => setNewFolder(''))}
            isCreating={createFolder.isPending}
            onRename={(id, name) => void updateFolder.mutateAsync({ id, name })}
            onDelete={onFolderDelete}
          />
          <div>
            <MediaAssetsTable
              assets={data?.data ?? []}
              copied={copied}
              onCopy={copyUrl}
              onReplace={(id) => { setReplaceId(id); replaceRef.current?.click(); }}
              onDelete={onDelete}
              onEdit={(a) => setEditAsset(a)}
            />
            {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
          </div>
        </div>
      </AdminPageShell>
      <MediaAssetFormSheet asset={editAsset} open={!!editAsset} onOpenChange={(o) => !o && setEditAsset(null)} />
    </>
  );
}
