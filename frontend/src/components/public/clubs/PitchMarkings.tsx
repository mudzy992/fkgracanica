import { cn } from '../../../lib/utils';

export function PitchMarkings({ horizontal }: { horizontal?: boolean }) {
  return (
    <>
      <div className="absolute inset-3 rounded-lg border-2 border-white/30 md:inset-4" />
      <div
        className={cn(
          'absolute bg-white/30',
          horizontal
            ? 'left-1/2 top-3 bottom-3 w-0.5 -translate-x-1/2 md:top-4 md:bottom-4'
            : 'left-3 right-3 top-1/2 h-0.5 -translate-y-1/2 md:left-4 md:right-4',
        )}
      />
      <div
        className={cn(
          'absolute rounded-full border-2 border-white/30',
          horizontal
            ? 'left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 md:h-28 md:w-28'
            : 'left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2',
        )}
      />
    </>
  );
}
