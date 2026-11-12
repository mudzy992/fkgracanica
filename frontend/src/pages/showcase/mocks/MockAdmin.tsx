export function MockAdmin() {
  return (
    <div className="flex h-full min-h-[9rem] bg-surface">
      <div className="w-[22%] space-y-1.5 border-r border-white/10 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 rounded ${i === 1 ? 'bg-blue-400/70' : 'bg-white/15'}`} />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-1.5 p-2">
        {['Korisnici', 'Članovi', 'Vijesti', 'Ulaznice'].map((label) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-2">
            <p className="text-[7px] uppercase tracking-wider text-blue-200/70">{label}</p>
            <p className="font-display mt-1 text-sm font-bold text-white">24</p>
          </div>
        ))}
      </div>
    </div>
  );
}
