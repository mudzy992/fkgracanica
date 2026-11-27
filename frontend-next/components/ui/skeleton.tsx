import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-deep', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-surface p-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
