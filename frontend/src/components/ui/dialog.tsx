import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  preventClose?: boolean;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, preventClose, className }: DialogProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open || !preventClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, preventClose]);

  if (!open) return null;

  const requestClose = () => {
    if (preventClose) return;
    onOpenChange(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Zatvori"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex max-h-[min(90vh,720px)] w-full flex-col rounded-xl border border-[var(--border-subtle)] bg-background shadow-xl',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({
  children,
  onClose,
  preventClose,
}: {
  children: ReactNode;
  onClose: () => void;
  preventClose?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
      <div className="text-base font-semibold text-text">{children}</div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => !preventClose && onClose()}
        disabled={preventClose}
        aria-label="Zatvori"
        className={preventClose ? 'opacity-40' : ''}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-4 py-3', className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--border-subtle)] px-4 py-3">{children}</div>
  );
}
