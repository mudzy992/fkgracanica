import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';
import { isFormDirty, snapshotForm } from './form-dirty';

interface AdminFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /**
   * Kada true, backdrop/Escape/X ne zatvaraju dijalog.
   * FE-04b: ako se ne proslijedi, dijalog **sam** detektuje izmjene polja
   * (snapshot pri otvaranju) i traži potvrdu prije zatvaranja — do sada je
   * zatvaranje tiho gubilo otkucano u 21 od 23 forme.
   */
  dirty?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-[min(96vw,56rem)]',
} as const;

export function AdminFormSheet({
  open,
  onOpenChange,
  title,
  children,
  dirty = false,
  size = 'md',
}: AdminFormSheetProps) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef('');

  // Snapshot polja nakon što se sadržaj montira (forme popunjavaju vrijednosti u efektu).
  useEffect(() => {
    if (!open) {
      initialRef.current = '';
      return;
    }
    const id = window.setTimeout(() => {
      if (bodyRef.current) initialRef.current = snapshotForm(bodyRef.current);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const confirmDiscard = () => {
    if (dirty) return true;
    if (!isFormDirty(bodyRef.current, initialRef.current)) return true;
    return window.confirm(
      t('admin.unsavedChanges', 'Ima nesačuvanih izmjena. Zatvoriti bez spremanja?'),
    );
  };

  // Zaštita i pri napuštanju stranice (reload / zatvaranje taba) dok je dijalog otvoren.
  useEffect(() => {
    if (!open) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (!isFormDirty(bodyRef.current, initialRef.current)) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [open]);

  const requestClose = (next: boolean) => {
    if (!next && !confirmDiscard()) return;
    onOpenChange(next);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={requestClose}
      preventClose={dirty}
      className={sizeClass[size]}
    >
      <DialogHeader onClose={() => requestClose(false)} preventClose={dirty}>
        {title}
      </DialogHeader>
      <DialogBody>
        <div ref={bodyRef}>{open ? children : null}</div>
      </DialogBody>
    </Dialog>
  );
}
