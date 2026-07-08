import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '../../../lib/utils';
import type { HeroBackgroundDisplay } from './hero-background-utils';
import {
  heroBackgroundImageClass,
  heroBackgroundOnDesktop,
  heroBackgroundOnMobile,
} from './hero-background-utils';

interface Props {
  bgUrl?: string;
  backgroundDisplay?: HeroBackgroundDisplay;
}

export function HeroBackground({ bgUrl, backgroundDisplay = 'all' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const showMobile = heroBackgroundOnMobile(backgroundDisplay);
  const showDesktop = heroBackgroundOnDesktop(backgroundDisplay);
  const showImage = !!bgUrl && (showMobile || showDesktop);

  return (
    <div ref={ref} className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-hero" />
      {showImage && (
        <motion.div
          style={{ y }}
          className={cn('absolute inset-0', heroBackgroundImageClass(backgroundDisplay))}
        >
          <img
            src={bgUrl}
            alt=""
            className="h-full w-full object-cover object-[70%_center] lg:object-center"
            aria-hidden
          />
        </motion.div>
      )}
      {showImage && showDesktop && (
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ background: 'var(--hero-image-overlay)' }}
        />
      )}
      {showImage && showMobile && (
        <>
          <div
            className="absolute inset-0 lg:hidden"
            style={{ background: 'var(--hero-image-overlay)' }}
          />
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(to right, rgba(5,10,20,0.92) 0%, rgba(5,10,20,0.55) 42%, transparent 62%), linear-gradient(to top, rgba(5,10,20,0.95) 0%, rgba(5,10,20,0.5) 38%, transparent 58%)',
            }}
          />
        </>
      )}
      <div className="absolute -right-1/4 top-0 h-full w-1/2 -skew-x-12 bg-white/[0.03]" />
      <div className="absolute -right-1/3 top-0 h-full w-1/3 -skew-x-12 border-l border-white/10" />
    </div>
  );
}
