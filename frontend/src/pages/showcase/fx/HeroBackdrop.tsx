export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="showcase-orb absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-blue-600/35 blur-3xl" />
      <div className="showcase-orb absolute -right-16 top-24 h-[22rem] w-[22rem] rounded-full bg-sky-400/20 blur-3xl [animation-delay:-7s]" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.6px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
