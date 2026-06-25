import type { MediaFolder } from '../../hooks/use-media-admin';
import { useState } from 'react';
import { asArray } from '../../lib/as-array';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface MediaFolderTreeProps {
  folders: MediaFolder[];
  selectedId?: string;
  onSelect: (id?: string) => void;
  newName: string;
  onNewNameChange: (v: string) => void;
  onCreate: () => void;
  isCreating?: boolean;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string, name: string) => void;
}

function FolderNode({
  folder,
  selectedId,
  onSelect,
  depth,
  onRename,
  onDelete,
}: {
  folder: MediaFolder;
  selectedId?: string;
  onSelect: (id: string) => void;
  depth: number;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);

  return (
    <>
      <div className="flex items-center gap-1" style={{ paddingLeft: `${12 + depth * 12}px` }}>
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (name.trim() && name !== folder.name) onRename?.(folder.id, name.trim());
            }}
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => onSelect(folder.id)}
            className={cn(
              'flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm',
              selectedId === folder.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface',
            )}
          >
            <span>{folder.name}</span>
            <span className="text-xs text-text-muted">{folder._count?.assets ?? 0}</span>
          </button>
        )}
        {!editing && (
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>✎</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onDelete?.(folder.id, folder.name)}>×</Button>
          </div>
        )}
      </div>
      {folder.children?.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={depth + 1}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

export function MediaFolderTree({
  folders,
  selectedId,
  onSelect,
  newName,
  onNewNameChange,
  onCreate,
  isCreating,
  onRename,
  onDelete,
}: MediaFolderTreeProps) {
  const roots = asArray<MediaFolder>(folders).filter((f) => !f.parentId);

  return (
    <div className="space-y-3 border-r border-slate-200 p-4">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={cn(
          'w-full rounded-lg px-3 py-2 text-left text-sm',
          !selectedId ? 'bg-primary/10 text-primary' : 'hover:bg-surface',
        )}
      >
        Svi mediji
      </button>
      {roots.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          selectedId={selectedId}
          onSelect={(id) => onSelect(id)}
          depth={0}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
      <div className="flex gap-2 pt-2">
        <Input
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          placeholder="Nova mapa"
          className="text-sm"
        />
        <Button size="sm" onClick={onCreate} disabled={!newName || isCreating}>
          +
        </Button>
      </div>
    </div>
  );
}
