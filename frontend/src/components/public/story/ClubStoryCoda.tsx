import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultTransition, fadeUp } from '../../../lib/motion/presets';

export function ClubStoryCoda() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,102,255,0.16),transparent_55%)]" />
      <div className="relative mx-auto flex min-h-[70dvh] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={defaultTransition}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light">Danas</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Priča se nastavlja
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/60 sm:text-lg">
            Ista strast. Nova generacija. Uđi u sljedeće poglavlje — na terenu ili u tribinama.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/tim"
              className="inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-primary/90"
            >
              Prvi tim
            </Link>
            <Link
              to="/clanstvo"
              className="inline-flex rounded-full border border-white/15 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-primary/40 hover:text-white"
            >
              Članstvo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
