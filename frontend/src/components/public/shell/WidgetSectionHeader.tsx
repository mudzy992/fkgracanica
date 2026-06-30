interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export function WidgetSectionHeader({ title, subtitle, eyebrow }: Props) {
  return (
    <div className="mb-10 md:mb-14">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-light/30 to-transparent" />
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary-light">
          {eyebrow ?? 'FK Gračanica'}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-light/30 to-transparent" />
      </div>
      <h2 className="font-display text-center text-3xl font-bold uppercase tracking-wider text-gradient-club sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-text-muted md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
