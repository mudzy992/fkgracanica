import { usePlayers } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';

const defaultFormation = [
  { x: 50, y: 90, label: 'GK' },
  { x: 20, y: 70, label: 'LB' },
  { x: 40, y: 72, label: 'CB' },
  { x: 60, y: 72, label: 'CB' },
  { x: 80, y: 70, label: 'RB' },
  { x: 30, y: 50, label: 'CM' },
  { x: 50, y: 48, label: 'CM' },
  { x: 70, y: 50, label: 'CM' },
  { x: 25, y: 28, label: 'LW' },
  { x: 50, y: 22, label: 'ST' },
  { x: 75, y: 28, label: 'RW' },
];

export function FirstTeamPage() {
  const { data: players, isLoading } = usePlayers();
  const starters = players?.filter((p) => p.isActive).slice(0, 11) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Prvi tim" />
      <h1 className="mb-8 text-3xl font-bold">Prvi tim</h1>
      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <>
          <div
            className={cn(
              'relative mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-green-700',
              'aspect-[3/4] max-w-md md:aspect-[16/10] md:max-w-4xl',
            )}
          >
            <div className="absolute inset-4 rounded-lg border-2 border-white/30" />
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30 md:h-32 md:w-32" />
            {defaultFormation.map((pos, i) => {
              const player = starters[i];
              return (
                <div
                  key={i}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:h-12 md:w-12">
                    {player?.number ?? i + 1}
                  </div>
                  <span className="mt-1 max-w-16 truncate text-center text-[10px] font-medium text-white md:text-xs">
                    {player ? `${player.firstName[0]}. ${player.lastName}` : pos.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {starters.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                {p.photoPath ? (
                  <img src={mediaUrl(p.photoPath)} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {p.number}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-sm text-text-muted">{p.position}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
