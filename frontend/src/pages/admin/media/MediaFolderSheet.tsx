import type { MediaFolder } from '../../../hooks/use-media-admin';
import { MediaFolderTree } from '../../../components/admin/MediaFolderTree';
import { Sheet, SheetContent, SheetHeader } from '../../../components/ui/sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function MediaFolderSheet({
  open,
  onOpenChange,
  folders,
  selectedId,
  onSelect,
  newName,
  onNewNameChange,
  onCreate,
  isCreating,
  onRename,
  onDelete,
}: Props) {
  const handleSelect = (id?: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="left">
      <SheetHeader onClose={() => onOpenChange(false)}>Mape medija</SheetHeader>
      <SheetContent className="p-0">
        <MediaFolderTree
          folders={folders}
          selectedId={selectedId}
          onSelect={handleSelect}
          newName={newName}
          onNewNameChange={onNewNameChange}
          onCreate={onCreate}
          isCreating={isCreating}
          onRename={onRename}
          onDelete={onDelete}
          className="border-r-0"
        />
      </SheetContent>
    </Sheet>
  );
}
