export function MockPortal() {
  return (
    <div className="bg-surface-mock p-3">
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 rounded-full bg-blue-500" />
        <span className="h-1.5 w-16 rounded bg-white/40" />
        <div className="ml-auto flex gap-1">
          {['Vijesti', 'Liga', 'Tim'].map((label) => (
            <span key={label} className="h-1.5 w-8 rounded bg-white/20" />
          ))}
        </div>
      </div>
      <div className="mt-3 h-[4.5rem] rounded-xl bg-gradient-to-r from-blue-950 via-blue-700 to-sky-500" />
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-white/5">
            <div className="h-8 bg-white/10" />
            <div className="space-y-1 p-1.5">
              <div className="h-1 w-3/4 rounded bg-white/35" />
              <div className="h-1 w-1/2 rounded bg-white/15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
