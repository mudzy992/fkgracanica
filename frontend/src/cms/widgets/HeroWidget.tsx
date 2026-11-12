import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { PublicHeroShell } from '../../components/public/shell/PublicHeroShell';
import { useMatches } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { defaultTransition, fadeUp, staggerContainer } from '../../lib/motion/presets';
import { HeroBackground } from './hero/HeroBackground';
import { HeroMatchDock } from './hero/HeroMatchDock';
import { HeroMobileCrest } from './hero/HeroMobileCrest';
import { isHeroMatchDockVisible } from './hero/hero-match-utils';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['hero'] };

export function HeroWidget({ config }: Props) {
  const bgUrl = mediaUrl(config.backgroundImage, 'original');
  const reduce = useReducedMotion();
  const showMatches = config.showMatches !== false;
  const showLast = config.showLastResult !== false;
  const { data: matches } = useMatches();
  const matchDockVisible = isHeroMatchDockVisible(matches, showMatches, showLast);

  return (
    <PublicHeroShell>
      <section className="relative -mt-16 flex min-h-[100dvh] flex-col overflow-hidden pt-16 text-white">
        <HeroBackground
          bgUrl={bgUrl || undefined}
          backgroundDisplay={config.backgroundDisplay ?? 'all'}
        />

        <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto_auto] lg:flex lg:flex-col">
          <HeroMobileCrest compact={matchDockVisible} />

          <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pb-4 sm:px-6 sm:pb-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center lg:py-10">
            {config.foundedYear && (
              <motion.div
                variants={fadeUp}
                initial={reduce ? false : 'hidden'}
                animate="visible"
                transition={{ ...defaultTransition, delay: 0.2 }}
                className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 sm:mb-4"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary-light" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  Osnovan {config.foundedYear}. godine
                </span>
              </motion.div>
            )}

            <motion.h1
              className="font-display max-w-[11.5rem] text-3xl font-bold uppercase leading-[0.95] tracking-tight sm:max-w-sm sm:text-4xl md:max-w-2xl md:text-5xl lg:max-w-4xl lg:text-6xl xl:text-7xl"
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="visible"
              transition={{ ...defaultTransition, delay: 0.35 }}
            >
              <span className="text-gradient-club">{config.title}</span>
            </motion.h1>

            {config.subtitle && (
              <motion.p
                className="mt-3 max-w-[11.5rem] font-display text-sm uppercase tracking-[0.12em] text-white/80 sm:mt-4 sm:max-w-sm sm:text-base md:max-w-xl md:text-lg"
                variants={fadeUp}
                initial={reduce ? false : 'hidden'}
                animate="visible"
                transition={{ ...defaultTransition, delay: 0.5 }}
              >
                {config.subtitle}
              </motion.p>
            )}

            {config.buttons.length > 0 && (
              <motion.div
                className="mt-5 flex flex-wrap gap-3 sm:mt-6"
                variants={staggerContainer}
                initial={reduce ? false : 'hidden'}
                animate="visible"
              >
                {config.buttons.map((btn, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Link
                      to={btn.url}
                      className={
                        btn.variant === 'outline'
                          ? 'btn-hero-outline !px-5 !py-2.5 text-sm sm:!px-6 sm:!py-3'
                          : 'btn-hero-primary group !px-5 !py-2.5 text-sm sm:!px-6 sm:!py-3'
                      }
                    >
                      {btn.label}
                      {btn.variant !== 'outline' && (
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {showMatches && <HeroMatchDock showLast={showLast} />}
        </div>
      </section>
    </PublicHeroShell>
  );
}
