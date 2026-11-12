import type { MediaFolder } from '../../hooks/use-media-admin';
import { useTranslation } from 'react-i18next';
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
  onCreate?: () => void;
  isCreating?: boolean;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string, name: string) => void;
  className?: string;
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
  const { t } = useTranslation();
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => onSelect(folder.id)}
            className={cn(
              'flex h-auto flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-normal',
              selectedId === folder.id ? 'bg-primary/10 text-primary-light hover:bg-primary/10' : 'hover:bg-surface',
            )}
          >
            <span>{folder.name}</span>
            <span className="text-xs text-text-muted">{folder._count?.assets ?? 0}</span>
          </Button>
        )}
        {!editing && (onRename || onDelete) ? (
          <div className="flex gap-1">
            {onRename ? (
              <Button type="button" size="sm" variant="ghost" aria-label={`${t('actions.edit')}: ${folder.name}`} onClick={() => setEditing(true)}>
                ✎
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={`${t('actions.delete')}: ${folder.name}`}
                onClick={() => onDelete(folder.id, folder.name)}
              >
                ×
              </Button>
            ) : null}
          </div>
        ) : null}
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
  className,
}: MediaFolderTreeProps) {
  const { t } = useTranslation();
  const roots = asArray<MediaFolder>(folders).filter((f) => !f.parentId);

  return (
    <div className={cn('space-y-3 border-r border-[var(--border-subtle)] p-4', className)}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onSelect(undefined)}
        className={cn(
          'h-auto w-full justify-start rounded-lg px-3 py-2 text-left text-sm font-normal',
          !selectedId ? 'bg-primary/10 text-primary-light hover:bg-primary/10' : 'hover:bg-surface',
        )}
      >
        {t('admin.mediaFolders.all')}
      </Button>
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
      {onCreate ? (
        <div className="flex gap-2 pt-2">
          <Input
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder={t('admin.mediaPicker.newFolder')}
            className="text-sm"
          />
          <Button size="sm" aria-label={`${t('actions.create')}: ${t('admin.mediaPicker.newFolder')}`} onClick={onCreate} disabled={!newName || isCreating}>
            +
          </Button>
        </div>
      ) : null}
    </div>
  );
}
