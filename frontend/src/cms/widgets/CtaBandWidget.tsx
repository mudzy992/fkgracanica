import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '../../lib/motion/Reveal';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['cta-band'] };

export function CtaBandWidget({ config }: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-gradient-club relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 shadow-premium sm:p-12"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary-light/10" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              {config.title && (
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
                  {config.title}
                </h2>
              )}
              {config.text && <p className="mt-3 max-w-lg text-white/80">{config.text}</p>}
            </div>
            {config.buttons.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {config.buttons.map((btn, i) => (
                  <Link
                    key={i}
                    to={btn.url}
                    className={
                      btn.variant === 'outline'
                        ? 'btn-hero-outline'
                        : 'btn-hero-primary group inline-flex'
                    }
                  >
                    {btn.label}
                    {btn.variant !== 'outline' && (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}
