import type { ReactNode } from 'react';

/** Zajedničko stanje i dvojnici za MediaPage testove (dva fajla). */
export const mediaPageState = {
  user: { id: 'u1', permissions: ['media.manage'] as string[] },
  folders: [] as Array<{ id: string; name: string; parentId?: string | null }>,
  assets: { data: [] as Array<Record<string, unknown>>, meta: { total: 5 } as Record<string, unknown> },
  assetsArgs: {} as Record<string, unknown>,
  confirm: async () => true,
  mutate: {
    createFolder: async () => ({}),
    updateFolder: async () => ({}),
    deleteFolder: async () => ({}),
    deleteMedia: async () => ({}),
    replace: async () => ({}),
  },
  enqueue: () => undefined,
  retryRefresh: () => undefined,
  clearReport: () => undefined,
  choose: () => undefined,
  onUpload: () => undefined,
  treeProps: {} as Record<string, unknown>,
  toolbarProps: {} as Record<string, unknown>,
  assetsProps: {} as Record<string, unknown>,
  sheetProps: {} as Record<string, unknown>,
  assetSheetProps: {} as Record<string, unknown>,
  fileInputsProps: {} as Record<string, unknown>,
};

export function AdminPageShellDouble({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function MediaFolderTreeDouble(props: Record<string, unknown>) {
  mediaPageState.treeProps = props;
  const p = props as unknown as {
    folders: unknown[]; selectedId?: string; onCreate?: () => void;
    onRename?: (id: string, name: string) => void; onDelete?: (id: string, name: string) => void;
    onSelect: (id?: string) => void;
  };
  return (
    <div>
      <span>tree:{p.folders.length}:{p.selectedId ?? '-'}</span>
      {p.onCreate && <button onClick={() => p.onCreate!()}>napravi-mapu</button>}
      {p.onRename && <button onClick={() => p.onRename!('f1', 'Novo ime')}>preimenuj</button>}
      {p.onDelete && <button onClick={() => p.onDelete!('f1', 'Prva')}>obriši-mapu</button>}
      <button onClick={() => p.onSelect('f1')}>izaberi-f1</button>
      <button onClick={() => p.onSelect(undefined)}>izaberi-root</button>
    </div>
  );
}

export function MediaPageToolbarDouble(props: Record<string, unknown>) {
  mediaPageState.toolbarProps = props;
  const p = props as unknown as {
    search: string; onSearchChange: (v: string) => void; selectedCount: number;
    onToggleSelectionMode: () => void; onSelectAllVisible: () => void; onUploadClick: () => void;
    onFolderChipClick?: () => void; uploadDisabled: boolean; uploadTitle?: string;
    selectionMode: boolean; canManage: boolean; totalResults?: number;
  };
  return (
    <div>
      <span>toolbar:{p.search}:{p.selectedCount}:{String(p.selectionMode)}:{String(p.uploadDisabled)}:{p.uploadTitle ?? '-'}:{p.totalResults}</span>
      <input aria-label="pretraga" value={p.search} onChange={(e) => p.onSearchChange(e.target.value)} />
      <button onClick={p.onToggleSelectionMode}>selekcija</button>
      <button onClick={p.onSelectAllVisible}>sve</button>
      <button onClick={p.onUploadClick}>upload</button>
      {p.onFolderChipClick && <button onClick={p.onFolderChipClick}>mapa-chip</button>}
      <span>dozvole:{String(p.canManage)}</span>
    </div>
  );
}

export function MediaUploadZoneDouble({ folderId, onFiles }: { folderId?: string; onFiles: (f: FileList) => void }) {
  return (
    <button onClick={() => onFiles([new File(['x'], 'a.jpg')] as unknown as FileList)}>
      zone:{folderId ?? '-'}
    </button>
  );
}

export function MediaPageAssetsSectionDouble(props: Record<string, unknown>) {
  mediaPageState.assetsProps = props;
  const p = props as unknown as {
    assets: Array<{ id: string; filename: string }>; empty: string; onCopy: (path: string) => void;
    onDelete?: (id: string, name: string) => void; onEdit?: (a: { id: string }) => void;
    onReplace?: (id: string) => void; onToggleSelect: (id: string) => void;
    onConfirmBulkDelete?: (n: number) => Promise<boolean>; onPageChange: (n: number) => void; page: number;
  };
  return (
    <div>
      <span>assets:{p.assets.length}:{p.page}:{p.empty}</span>
      <button onClick={() => p.onCopy('x/slika.jpg')}>kopiraj</button>
      {p.onDelete && <button onClick={() => p.onDelete!('a1', 'slika.jpg')}>obriši-medij</button>}
      {p.onEdit && <button onClick={() => p.onEdit!(p.assets[0])}>uredi</button>}
      {p.onReplace && <button onClick={() => p.onReplace!('a1')}>zamijeni</button>}
      {p.onConfirmBulkDelete && <button onClick={() => void p.onConfirmBulkDelete!(2)}>obriši-odabrane</button>}
      <button onClick={() => p.onToggleSelect('a1')}>označi</button>
      <button onClick={() => p.onPageChange(2)}>strana-2</button>
    </div>
  );
}

export function MediaPageFileInputsDouble(props: Record<string, unknown>) {
  mediaPageState.fileInputsProps = props;
  const p = props as unknown as { onReplace: (f: File) => void; replaceId: string | null };
  return (
    <div>
      <span>inputs:{p.replaceId ?? '-'}</span>
      <button onClick={() => p.onReplace(new File(['x'], 'b.jpg'))}>posalji-zamjenu</button>
    </div>
  );
}

export function MediaFolderSheetDouble(props: Record<string, unknown>) {
  mediaPageState.sheetProps = props;
  return <div>folder-sheet:{String((props as { open: boolean }).open)}</div>;
}

export function MediaAssetFormSheetDouble(props: Record<string, unknown>) {
  mediaPageState.assetSheetProps = props;
  const p = props as { open: boolean; onOpenChange: (open: boolean) => void };
  return (
    <div>
      <span>asset-sheet:{String(p.open)}</span>
      {p.open && <button onClick={() => p.onOpenChange(false)}>zatvori-asset</button>}
    </div>
  );
}
