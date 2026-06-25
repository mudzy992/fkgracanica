import type { ReactNode } from 'react';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';

interface AdminFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Kada true, backdrop/Escape/X ne zatvaraju dijalog */
  dirty?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export function AdminFormSheet({
  open,
  onOpenChange,
  title,
  children,
  dirty = false,
  size = 'md',
}: AdminFormSheetProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      preventClose={dirty}
      className={sizeClass[size]}
    >
      <DialogHeader onClose={() => onOpenChange(false)} preventClose={dirty}>
        {title}
      </DialogHeader>
      <DialogBody>{open ? children : null}</DialogBody>
    </Dialog>
  );
}
