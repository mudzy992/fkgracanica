import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MediaFolder } from '../../hooks/use-media-admin';
import { asArray } from '../../lib/as-array';
import { cn } from '../../lib/utils';

interface Props {
  folders: MediaFolder[];
  selectedId?: string;
  onSelect: (id?: string) => void;
  className?: string;
}

function childrenOf(folders: MediaFolder[], parentId: string) {
  return folders.filter((f) => f.parentId === parentId);
}

function FolderNode({
  folder,
  folders,
  selectedId,
  onSelect,
  depth,
}: {
  folder: MediaFolder;
  folders: MediaFolder[];
  selectedId?: string;
  onSelect: (id: string) => void;
  depth: number;
}) {
  const { t } = useTranslation();
  const kids = childrenOf(folders, folder.id);
  const [open, setOpen] = useState(true);
  return (
    <>
      <div className="flex items-center" style={{ paddingLeft: `${8 + depth * 12}px` }}>
        {kids.length ? (
          <button
            type="button"
            className="p-1 text-text-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label={t('admin.mediaPicker.toggleFolders')}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          className={cn(
            'flex flex-1 items-center justify-between rounded-lg py-2 pr-3 text-left text-sm',
            selectedId === folder.id
              ? 'bg-primary/10 text-primary-light'
              : 'text-text hover:bg-surface',
          )}
        >
          <span className="truncate">{folder.name}</span>
          <span className="ml-2 shrink-0 text-xs text-text-muted">
            {folder._count?.assets ?? 0}
          </span>
        </button>
      </div>
      {open &&
        kids.map((child) => (
          <FolderNode
            key={child.id}
            folder={child}
            folders={folders}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

export function MediaFolderPicker({ folders, selectedId, onSelect, className }: Props) {
  const list = asArray<MediaFolder>(folders);
  const roots = useMemo(() => list.filter((f) => !f.parentId), [list]);

  return (
    <div className={cn('space-y-1', className)}>
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={cn(
          'w-full rounded-lg px-3 py-2 text-left text-sm',
          !selectedId ? 'bg-primary/10 text-primary-light' : 'text-text hover:bg-surface',
        )}
      >
        Sve slike
      </button>
      {roots.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          folders={list}
          selectedId={selectedId}
          onSelect={(id) => onSelect(id)}
          depth={0}
        />
      ))}
    </div>
  );
}
