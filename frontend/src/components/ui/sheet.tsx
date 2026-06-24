import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  side?: 'left' | 'right';
}

export function Sheet({ open, onOpenChange, children, side = 'left' }: SheetProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Zatvori"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'absolute top-0 h-full w-[min(100%,20rem)] bg-background shadow-xl',
          side === 'left' ? 'left-0' : 'right-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 p-4">
      <div className="font-semibold text-text">{children}</div>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Zatvori">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}

export function SheetContent({ children }: { children: ReactNode }) {
  return <div className="overflow-y-auto p-4">{children}</div>;
}
