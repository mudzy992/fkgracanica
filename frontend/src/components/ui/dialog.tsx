import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { trapModalTab, useBodyScrollLock, useNativeModal } from './modal-effects';

const DialogTitle = createContext<string | undefined>(undefined);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  preventClose?: boolean;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, preventClose, className }: DialogProps) {
  const titleId = useId();
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  // Potvrda otvorena iz Sheeta mora biti iznad njegovog nativnog top layera.
  const nested = open && !!document.querySelector('dialog[data-sheet-modal][open]');
  useBodyScrollLock(open);
  useNativeModal(ref, nested);

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
    if (!preventClose) onOpenChange(false);
  };
  const content = (
    <>
      <button
        type="button"
        tabIndex={nested ? -1 : undefined}
        className="absolute inset-0 bg-black/40"
        aria-label={t('actions.close')}
        onClick={requestClose}
      />
      <div
        role={nested ? undefined : 'dialog'}
        aria-modal={nested ? undefined : 'true'}
        aria-labelledby={nested ? undefined : titleId}
        className={cn(
          'relative z-10 flex w-full flex-col rounded-xl border border-[var(--border-subtle)] bg-background shadow-xl max-h-[min(92dvh,720px)]',
          className,
        )}
      >
        {children}
      </div>
    </>
  );

  return createPortal(
    <DialogTitle.Provider value={titleId}>
      {nested ? (
        <dialog
          ref={ref}
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none border-0 bg-transparent p-4 text-text backdrop:bg-transparent"
          onKeyDown={(event) => { event.stopPropagation(); trapModalTab(event); }}
          onCancel={(event) => { event.preventDefault(); event.stopPropagation(); requestClose(); }}
        >
          <div className="relative flex h-full items-center justify-center">{content}</div>
        </dialog>
      ) : (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">{content}</div>
      )}
    </DialogTitle.Provider>,
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
  const titleId = useContext(DialogTitle);
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
      <div id={titleId} className="text-base font-semibold text-text">{children}</div>
      <Button
        type="button"
        data-modal-initial-focus
        variant="ghost"
        size="icon"
        onClick={() => !preventClose && onClose()}
        disabled={preventClose}
        aria-label={t('actions.close')}
        className={preventClose ? 'opacity-40' : ''}
      >
        <X aria-hidden className="h-4 w-4" />
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
