const BLOCKS = ['Hero', 'Vijesti', 'Tabela', 'CTA'];

export function MockCms() {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-[#07101c] p-3">
      {BLOCKS.map((label, i) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <span className="font-display text-xs text-blue-200/50">{i + 1}</span>
          <div className="h-2 flex-1 rounded bg-white/15" />
          <span className="text-[10px] uppercase tracking-wider text-blue-100/70">{label}</span>
        </div>
      ))}
    </div>
  );
}
