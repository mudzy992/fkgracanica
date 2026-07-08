import type { MediaAsset, MediaFolder } from '../../../hooks/use-media-admin';
import { AdminPagination } from '../../../components/admin/AdminPagination';
import type { PaginationMeta } from '../../../types/pagination';
import { MediaAssetsGrid } from './MediaAssetsGrid';
import { MediaAssetsTable } from '../MediaAssetsTable';
import { MediaBulkActionBar } from './MediaBulkActionBar';

interface Props {
  assets: MediaAsset[];
  empty: string;
  copied: string | null;
  folders: MediaFolder[];
  selectionMode: boolean;
  selectedCount: number;
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (path: string) => void;
  onReplace: (id: string) => void;
  onDelete: (id: string, filename: string) => void;
  onEdit: (asset: MediaAsset) => void;
  onClearSelection: () => void;
  onExitSelection: () => void;
  onConfirmBulkDelete: (count: number) => Promise<boolean>;
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export function MediaPageAssetsSection({
  assets,
  empty,
  copied,
  folders,
  selectionMode,
  selectedCount,
  selectedIds,
  isSelected,
  onToggleSelect,
  onCopy,
  onReplace,
  onDelete,
  onEdit,
  onClearSelection,
  onExitSelection,
  onConfirmBulkDelete,
  meta,
  page,
  onPageChange,
}: Props) {
  return (
    <div className={selectedCount > 0 ? 'pb-20 sm:pb-4' : 'pb-4'}>
      <MediaAssetsGrid
        assets={assets}
        empty={empty}
        copied={copied}
        selectionMode={selectionMode}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onCopy={onCopy}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      <MediaAssetsTable
        assets={assets}
        empty={empty}
        copied={copied}
        selectionMode={selectionMode}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onCopy={onCopy}
        onReplace={onReplace}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      {selectedCount > 0 && (
        <div className="px-3 sm:px-4">
          <MediaBulkActionBar
            selectedIds={selectedIds}
            folders={folders}
            onClear={onClearSelection}
            onDone={onExitSelection}
            onConfirmDelete={onConfirmBulkDelete}
          />
        </div>
      )}
      {meta && (
        <div className="pb-safe">
          <AdminPagination meta={meta} page={page} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
