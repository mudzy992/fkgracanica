const DOTS = [
  [50, 10],
  [22, 28],
  [50, 28],
  [78, 28],
  [18, 50],
  [38, 50],
  [62, 50],
  [82, 50],
  [30, 72],
  [50, 72],
  [70, 72],
];

export function MockPitch() {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-800 to-emerald-950">
      <div className="absolute inset-x-[8%] top-1/2 h-px bg-white/25" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
      <div className="absolute inset-x-[28%] top-[6%] h-[18%] border border-white/20" />
      <div className="absolute inset-x-[28%] bottom-[6%] h-[18%] border border-white/20" />
      {DOTS.map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}
