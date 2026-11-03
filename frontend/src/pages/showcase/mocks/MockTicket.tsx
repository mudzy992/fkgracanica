export function MockTicket() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900 to-surface-mock p-4">
        <p className="text-[10px] uppercase tracking-widest text-blue-200/70">Članska kartica</p>
        <p className="font-display mt-2 text-lg font-bold text-white">FK-2026-084</p>
        <div className="mt-4 grid h-16 w-16 place-items-center rounded-lg bg-white">
          <div className="h-10 w-10 bg-[repeating-linear-gradient(90deg,#050a14_0_2px,transparent_2px_4px),repeating-linear-gradient(0deg,#050a14_0_2px,transparent_2px_4px)]" />
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
        <p className="text-[10px] uppercase tracking-widest text-blue-200/70">Ulaznica</p>
        <p className="mt-2 text-sm font-semibold text-white">Domaća utakmica</p>
        <p className="mt-1 text-xs text-blue-100/70">Sektor A · Stripe ili blagajna</p>
        <span className="mt-4 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
          QR na ulazu
        </span>
      </div>
    </div>
  );
}
