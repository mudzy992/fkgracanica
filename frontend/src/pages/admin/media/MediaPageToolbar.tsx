import { Search, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { UploadQueueState } from '../../../hooks/use-media-upload-queue';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  globalSearch: boolean;
  debouncedSearch: string;
  totalResults?: number;
  folderId?: string;
  selectedFolderName?: string;
  selectionMode: boolean;
  selectedCount: number;
  visibleCount: number;
  onToggleSelectionMode: () => void;
  onSelectAllVisible: () => void;
  onUploadClick: () => void;
  uploadDisabled: boolean;
  uploadTitle?: string;
  onFolderChipClick?: () => void;
  uploadProgress?: UploadQueueState;
}

function hintText(props: Props) {
  const { globalSearch, debouncedSearch, totalResults, folderId, selectedFolderName } = props;
  if (globalSearch) {
    const count = totalResults ?? 0;
    return `${count} pronađenih medija za „${debouncedSearch}". Upload ide u odabranu mapu.`;
  }
  if (folderId) {
    return `Prikaz mape „${selectedFolderName ?? '—'}". Upload ide u ovu mapu.`;
  }
  return 'Odaberite mapu za upload. „Svi mediji" prikazuje cijelu biblioteku.';
}

export function MediaPageToolbar({
  search,
  onSearchChange,
  globalSearch,
  debouncedSearch,
  totalResults,
  folderId,
  selectedFolderName,
  selectionMode,
  selectedCount,
  visibleCount,
  onToggleSelectionMode,
  onSelectAllVisible,
  onUploadClick,
  uploadDisabled,
  uploadTitle,
  onFolderChipClick,
  uploadProgress,
}: Props) {
  const progressPct =
    uploadProgress && uploadProgress.total > 0
      ? Math.round((uploadProgress.done / uploadProgress.total) * 100)
      : 0;

  return (
    <div className="space-y-2 border-b border-[var(--border-subtle)] px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        {onFolderChipClick && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="lg:hidden"
            onClick={onFolderChipClick}
          >
            Mapa: {folderId ? (selectedFolderName ?? '—') : 'Svi mediji'}
          </Button>
        )}
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pretraga po nazivu, tagu ili putanji…"
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text"
              onClick={() => onSearchChange('')}
              aria-label="Obriši pretragu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectionMode && visibleCount > 0 && (
            <Button type="button" size="sm" variant="outline" onClick={onSelectAllVisible}>
              Odaberi sve ({visibleCount})
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant={selectionMode ? 'default' : 'outline'}
            onClick={onToggleSelectionMode}
          >
            {selectionMode ? `Odabrano (${selectedCount})` : 'Odaberi'}
          </Button>
          <Button
            type="button"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={onUploadClick}
            disabled={uploadDisabled}
            title={uploadTitle}
          >
            Upload{selectedFolderName ? ` u „${selectedFolderName}"` : ''}
          </Button>
        </div>
      </div>
      <p className="text-xs text-text-muted">{hintText({ search, onSearchChange, globalSearch, debouncedSearch, totalResults, folderId, selectedFolderName, selectionMode, selectedCount, visibleCount, onToggleSelectionMode, onSelectAllVisible, onUploadClick, uploadDisabled, uploadTitle, onFolderChipClick, uploadProgress })}</p>
      {uploadProgress?.isRunning && uploadProgress.total > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">
            Upload {uploadProgress.done}/{uploadProgress.total}
            {uploadProgress.failed > 0 ? ` (${uploadProgress.failed} greška)` : ''}
          </p>
        </div>
      )}
      {uploadProgress?.summary && !uploadProgress.isRunning && (
        <p className="text-xs text-text-muted">{uploadProgress.summary}</p>
      )}
    </div>
  );
}
