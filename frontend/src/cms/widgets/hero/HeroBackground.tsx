import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Props {
  bgUrl?: string;
}

export function HeroBackground({ bgUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);

  return (
    <div ref={ref} className="absolute inset-0">
      {bgUrl ? (
        <motion.div style={{ y }} className="absolute inset-0">
          <img src={bgUrl} alt="" className="h-full w-full object-cover" aria-hidden />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-hero" />
      )}
      {bgUrl && (
        <div className="absolute inset-0" style={{ background: 'var(--hero-image-overlay)' }} />
      )}
      <div className="absolute -right-1/4 top-0 h-full w-1/2 -skew-x-12 bg-white/[0.03]" />
      <div className="absolute -right-1/3 top-0 h-full w-1/3 -skew-x-12 border-l border-white/10" />
    </div>
  );
}
