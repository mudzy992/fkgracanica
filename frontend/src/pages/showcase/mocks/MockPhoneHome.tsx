export function MockPhoneHome() {
  return (
    <div className="flex h-full flex-col bg-[#050a14] px-2.5 pt-6">
      <div className="flex items-center gap-1.5">
        <span className="h-5 w-5 rounded-full bg-blue-500" />
        <span className="h-1.5 w-14 rounded bg-white/50" />
      </div>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2">
        <div className="flex items-center justify-between">
          <span className="h-3 w-8 rounded bg-white/30" />
          <span className="font-display text-[11px] font-bold text-white">2 — 1</span>
          <span className="h-3 w-8 rounded bg-white/20" />
        </div>
        <p className="mt-1 text-center text-[7px] uppercase tracking-wider text-emerald-400">Live</p>
      </div>
      <div className="mt-2 space-y-1.5">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-1.5 rounded-lg bg-white/5 p-1.5">
            <div className="h-8 w-8 rounded bg-white/10" />
            <div className="flex-1 space-y-1 pt-0.5">
              <div className="h-1.5 w-4/5 rounded bg-white/35" />
              <div className="h-1 w-1/2 rounded bg-white/15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
