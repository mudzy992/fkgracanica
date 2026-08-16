import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';

interface Props {
  hasEmail?: boolean;
  hasPhone?: boolean;
  hasAddress?: boolean;
}

function KpiChip({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="glass-premium rounded-xl px-4 py-3 text-center">
      <Icon size={16} className="mx-auto mb-2 text-primary-light" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
    </div>
  );
}

export function ContactCinematicHero({ hasEmail, hasPhone, hasAddress }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const chips = [
    hasEmail && { icon: Mail, label: t('contactPage.email') },
    hasPhone && { icon: Phone, label: t('contactPage.phone') },
    hasAddress && { icon: MapPin, label: t('contactPage.address') },
  ].filter(Boolean) as { icon: typeof Mail; label: string }[];

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light sm:text-sm">
            {t('contactPage.eyebrow')}
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('contactPage.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 sm:text-lg">
            {t('contactPage.subtitle')}
          </p>

          {chips.length > 0 && (
            <div
              className={`mx-auto mt-10 grid max-w-2xl gap-3 ${
                chips.length === 1 ? 'grid-cols-1' : chips.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {chips.map((c) => (
                <KpiChip key={c.label} icon={c.icon} label={c.label} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
