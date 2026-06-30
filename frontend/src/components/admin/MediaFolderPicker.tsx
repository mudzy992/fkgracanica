import type { MediaFolder } from '../../hooks/use-media-admin';
import { asArray } from '../../lib/as-array';
import { cn } from '../../lib/utils';

interface Props {
  folders: MediaFolder[];
  selectedId?: string;
  onSelect: (id?: string) => void;
  className?: string;
}

function FolderNode({
  folder,
  selectedId,
  onSelect,
  depth,
}: {
  folder: MediaFolder;
  selectedId?: string;
  onSelect: (id: string) => void;
  depth: number;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(folder.id)}
        style={{ paddingLeft: `${12 + depth * 12}px` }}
        className={cn(
          'flex w-full items-center justify-between rounded-lg py-2 pr-3 text-left text-sm',
          selectedId === folder.id ? 'bg-primary/10 text-primary-light' : 'text-text hover:bg-surface',
        )}
      >
        <span className="truncate">{folder.name}</span>
        <span className="ml-2 shrink-0 text-xs text-text-muted">{folder._count?.assets ?? 0}</span>
      </button>
      {folder.children?.map((child) => (
        <FolderNode key={child.id} folder={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </>
  );
}

export function MediaFolderPicker({ folders, selectedId, onSelect, className }: Props) {
  const roots = asArray<MediaFolder>(folders).filter((f) => !f.parentId);

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
        <FolderNode key={folder.id} folder={folder} selectedId={selectedId} onSelect={(id) => onSelect(id)} depth={0} />
      ))}
    </div>
  );
}
