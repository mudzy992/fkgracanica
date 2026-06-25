import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Potvrdi',
  onConfirm,
  isPending,
  variant = 'default',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    void Promise.resolve(onConfirm()).then(() => onOpenChange(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-sm">
      <DialogHeader onClose={() => onOpenChange(false)}>{title}</DialogHeader>
      <DialogBody>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
          Odustani
        </Button>
        <Button
          className={variant === 'danger' ? 'bg-danger hover:bg-danger/90' : ''}
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? '...' : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
