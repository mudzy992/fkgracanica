import { useState } from 'react';
import { asArray } from '../../lib/as-array';
import { useMediaAssets, type MediaAsset } from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';

interface Props {
  value?: string | null;
  onSelect?: (path: string) => void;
  onChange?: (path: string) => void;
  label?: string;
  readOnly?: boolean;
}

export function MediaPicker({ value, onSelect, onChange, label = 'Naslovna slika', readOnly }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useMediaAssets({ limit: 100 });
  const assets = asArray<MediaAsset>(data?.data ?? data);
  const pickPath = onSelect ?? onChange ?? (() => {});

  const pick = (path: string) => {
    pickPath(path);
    setOpen(false);
  };

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
      <Dialog open={open} onOpenChange={setOpen} className="max-w-md">
        <DialogHeader onClose={() => setOpen(false)}>Mediji</DialogHeader>
        <DialogBody>
          {isLoading && <p className="text-sm text-text-muted">Učitavanje...</p>}
          <div className="grid grid-cols-3 gap-2">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => pick(a.originalPath)}
                className="overflow-hidden rounded-lg border border-slate-200 hover:border-primary"
              >
                <img
                  src={mediaUrl(a.thumbPath ?? a.originalPath, 'thumb')}
                  alt={a.filename}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
}
