import { useState } from 'react';
import { mediaUrl } from '../../lib/media';
import { Button } from '../ui/button';
import { MediaPickerDialog } from './MediaPickerDialog';

interface Props {
  value?: string | null;
  onSelect?: (path: string) => void;
  onChange?: (path: string) => void;
  label?: string;
  readOnly?: boolean;
}

export function MediaPicker({ value, onSelect, onChange, label = 'Naslovna slika', readOnly }: Props) {
  const [open, setOpen] = useState(false);
  const pickPath = onSelect ?? onChange ?? (() => {});

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-text">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <img src={mediaUrl(value, 'thumb')} alt="" className="h-16 w-16 rounded-lg object-cover" />
        )}
        {!readOnly && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              {value ? 'Promijeni' : 'Odaberi'}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => pickPath('')}>
                Ukloni
              </Button>
            )}
          </div>
        )}
      </div>
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        mode="single"
        title="Odabir medija"
        selectedPaths={value ? [value] : []}
        onConfirm={(paths) => pickPath(paths[0] ?? '')}
      />
    </div>
  );
}
