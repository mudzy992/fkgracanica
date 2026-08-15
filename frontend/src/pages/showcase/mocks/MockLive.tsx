export function MockLive() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#07101c]">
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 px-4 py-4">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Live
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="h-8 w-8 rounded-full bg-blue-500/80" />
          <p className="font-display text-3xl font-bold tabular-nums text-white">2 — 1</p>
          <span className="h-8 w-8 rounded-full bg-white/20" />
        </div>
        <p className="mt-1 text-center text-[10px] text-blue-100/60">67′ · 1. kolo</p>
      </div>
      <ul className="space-y-1.5 p-3">
        {['Gol 14′', 'Žuti karton 41′', 'Izmjena 63′'].map((row) => (
          <li key={row} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-blue-50">
            {row}
          </li>
        ))}
      </ul>
    </div>
  );
}
