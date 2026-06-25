import { useCallback, useState } from 'react';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
}

export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);
  const [pending, setPending] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOpts(options);
      setResolver(() => resolve);
    });
  }, []);

  const close = (result: boolean) => {
    setOpts(null);
    resolver?.(result);
    setResolver(null);
    setPending(false);
  };

  const dialog = opts ? (
    <ConfirmDialog
      open
      onOpenChange={(o) => !o && close(false)}
      title={opts.title}
      description={opts.description}
      confirmLabel={opts.confirmLabel}
      variant={opts.variant}
      isPending={pending}
      onConfirm={() => {
        setPending(true);
        close(true);
      }}
    />
  ) : null;

  return { confirm, dialog };
}
