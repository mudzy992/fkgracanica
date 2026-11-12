import { X } from 'lucide-react';
import { createContext, useContext, useId, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { trapModalTab, useBodyScrollLock, useNativeModal } from './modal-effects';

const SheetTitle = createContext<string | undefined>(undefined);

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  side?: 'left' | 'right';
}

export function Sheet({ open, onOpenChange, children, side = 'left' }: SheetProps) {
  const titleId = useId();
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  useBodyScrollLock(open);
  useNativeModal(ref, open);

  if (!open) return null;

  return (
    <SheetTitle.Provider value={titleId}>
      <dialog
        ref={ref}
        data-sheet-modal
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0 text-text backdrop:bg-black/40"
        onKeyDown={trapModalTab}
        onCancel={(event) => {
          event.preventDefault();
          onOpenChange(false);
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          className="absolute inset-0"
          aria-label={t('actions.close')}
          onClick={() => onOpenChange(false)}
        />
        <div
          className={cn(
            'absolute top-0 flex h-full w-[min(100%,20rem)] flex-col overflow-hidden bg-background shadow-xl',
            side === 'left' ? 'left-0' : 'right-0',
          )}
        >
          {children}
        </div>
      </dialog>
    </SheetTitle.Provider>
  );
}

export function SheetHeader({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const titleId = useContext(SheetTitle);
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
      <div id={titleId} className="font-semibold text-text">{children}</div>
      <Button type="button" data-modal-initial-focus variant="ghost" size="icon" onClick={onClose} aria-label={t('actions.close')}>
        <X aria-hidden className="h-5 w-5" />
      </Button>
    </div>
  );
}

export function SheetContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto p-4', className)}>{children}</div>;
}
