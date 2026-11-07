import { useEffect, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { qrDataUrl } from '../../lib/pass-qr';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';
import { cn } from '../../lib/utils';

interface Props {
  value: string;
  size?: number;
  enlargeSize?: number;
  label?: string;
  className?: string;
}

export function PassQrCode({
  value,
  size = 72,
  enlargeSize = 280,
  label = 'QR kod',
  className,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [largeSrc, setLargeSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [largeFailed, setLargeFailed] = useState(false);

  /**
   * Q-FE06-33: bez `catch`-a odbijeno generisanje je ostavljalo skeleton koji
   * pulsira zauvijek uz neobrađen rejection. Sada se prikazuje poruka.
   */
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    qrDataUrl(value, size)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLargeFailed(false);
    qrDataUrl(value, enlargeSize)
      .then((url) => {
        if (!cancelled) setLargeSrc(url);
      })
      .catch(() => {
        if (!cancelled) setLargeFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, value, enlargeSize]);

  if (failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-[var(--border-subtle)] p-2 text-center text-xs text-text-muted',
          className,
        )}
        style={{ width: size, height: size }}
      >
        QR kod nije dostupan
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn('animate-pulse rounded-lg bg-[var(--border-subtle)]', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group relative rounded-lg border-2 border-primary/30 bg-white p-1 transition hover:border-primary',
          className,
        )}
        aria-label={`Povećaj ${label}`}
      >
        <img src={src} alt={label} width={size} height={size} className="rounded-md" />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <ZoomIn className="h-5 w-5 text-white drop-shadow" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen} className="max-w-sm">
        <DialogHeader onClose={() => setOpen(false)}>{label}</DialogHeader>
        <DialogBody className="flex flex-col items-center gap-3 pb-6">
          {largeSrc ? (
            <img src={largeSrc} alt={label} width={enlargeSize} height={enlargeSize} className="rounded-xl" />
          ) : largeFailed ? (
            <p className="text-sm text-text-muted">QR kod nije dostupan</p>
          ) : (
            <div className="h-64 w-64 animate-pulse rounded-xl bg-[var(--border-subtle)]" />
          )}
          <p className="text-center text-sm text-text-muted">Pokažite ovaj kod na ulazu ili blagajni</p>
        </DialogBody>
      </Dialog>
    </>
  );
}
