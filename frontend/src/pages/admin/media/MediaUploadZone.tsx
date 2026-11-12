import { useCallback } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface Props {
  folderId?: string;
  disabled?: boolean;
  onTrigger: () => void;
  onFiles?: (files: FileList) => void;
  className?: string;
}

export function MediaUploadZone({ folderId, disabled, onTrigger, onFiles, className }: Props) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled || !folderId || !onFiles || !e.dataTransfer.files.length) return;
      onFiles(e.dataTransfer.files);
    },
    [disabled, folderId, onFiles],
  );

  return (
    <div className={cn('px-3 pb-3 sm:px-4 lg:hidden', className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || !folderId}
        onClick={onTrigger}
        className={cn(
          'flex h-auto min-h-11 w-full justify-center gap-2 rounded-lg border-dashed px-4 py-3 text-sm',
          disabled || !folderId
            ? 'border-[var(--border-subtle)] text-text-muted opacity-60'
            : 'border-primary/40 text-primary-light hover:border-primary-light hover:bg-primary/5',
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <ImagePlus className="h-4 w-4 shrink-0" />
        <span>{folderId ? 'Dodaj slike (galerija ili kamera)' : 'Prvo odaberite mapu'}</span>
      </Button>
    </div>
  );
}
