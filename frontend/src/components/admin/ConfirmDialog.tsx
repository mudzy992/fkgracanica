import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  confirmDisabled?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending,
  confirmDisabled,
  variant = 'default',
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const handleConfirm = () => {
    void Promise.resolve(onConfirm()).then(() => onOpenChange(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-sm">
      <DialogHeader onClose={() => onOpenChange(false)}>{title}</DialogHeader>
      <DialogBody>
        {description &&
          (typeof description === 'string' ? (
            <p className="text-sm text-text-muted">{description}</p>
          ) : (
            description
          ))}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
          {t('actions.cancel')}
        </Button>
        <Button
          className={variant === 'danger' ? 'bg-danger text-background hover:bg-danger hover:ring-2 hover:ring-danger' : ''}
          onClick={handleConfirm}
          disabled={isPending || confirmDisabled}
        >
          {isPending ? '...' : (confirmLabel ?? t('actions.confirm'))}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
