import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';

interface AdminFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function AdminFormSheet({ open, onOpenChange, title, children }: AdminFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="right">
      <SheetHeader onClose={() => onOpenChange(false)}>{title}</SheetHeader>
      <SheetContent>{children}</SheetContent>
    </Sheet>
  );
}
