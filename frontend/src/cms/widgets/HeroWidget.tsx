import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { PublicHeroShell } from '../../components/public/shell/PublicHeroShell';
import { mediaUrl } from '../../lib/media';
import { defaultTransition, fadeUp, staggerContainer } from '../../lib/motion/presets';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['hero'] };

export function HeroWidget({ config }: Props) {
  const bgUrl = mediaUrl(config.backgroundImage, 'medium');
  const reduce = useReducedMotion();

  const content = (
    <section className="relative min-h-[70dvh] overflow-hidden bg-primary text-white">
      {bgUrl && (
        <>
          <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-accent/40" />
        </>
      )}
      {!bgUrl && <div className="absolute inset-0 bg-gradient-hero" />}
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 md:min-h-[70dvh] md:justify-center md:py-28">
        {config.foundedYear && (
          <motion.p
            className="text-sm font-medium uppercase tracking-[0.3em] text-white/70"
            variants={fadeUp}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            {config.foundedYear} —
          </motion.p>
        )}
        <motion.h1
          className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          animate="visible"
          transition={{ ...defaultTransition, delay: 0.2 }}
        >
          {config.title}
        </motion.h1>
        {config.subtitle && (
          <motion.p
            className="max-w-xl text-lg text-white/85 md:text-xl"
            variants={fadeUp}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            transition={{ ...defaultTransition, delay: 0.35 }}
          >
            {config.subtitle}
          </motion.p>
        )}
        {config.buttons.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-3"
            variants={staggerContainer}
            initial={reduce ? false : 'hidden'}
            animate="visible"
          >
            {config.buttons.map((btn, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Link to={btn.url}>
                  <Button
                    className={
                      btn.variant === 'outline'
                        ? 'border-white/40 text-white backdrop-blur-sm hover:bg-white/15'
                        : 'bg-white text-primary shadow-premium hover:bg-white/90'
                    }
                    variant={btn.variant === 'outline' ? 'outline' : 'default'}
                  >
                    {btn.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );

  return <PublicHeroShell>{content}</PublicHeroShell>;
}
