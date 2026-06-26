import { cn } from '../../lib/utils';

interface Props {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: Props) {
  return (
    <p className={cn('py-16 text-center text-text-muted', className)}>{message}</p>
  );
}
