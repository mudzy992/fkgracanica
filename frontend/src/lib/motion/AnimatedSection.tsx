import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../utils';
import { defaultTransition, fadeUp } from './presets';

interface Props {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'surface' | 'hero';
  index?: number;
}

const variants = {
  default: '',
  surface: 'bg-surface/50',
  hero: '',
};

export function AnimatedSection({ children, className, variant = 'default', index = 0 }: Props) {
  const reduce = useReducedMotion();
  const base = cn('relative', variants[variant], className);
  const immediate = variant === 'hero' || index === 0;

  if (reduce) return <section className={base}>{children}</section>;

  if (immediate) {
    return (
      <motion.section
        className={base}
        initial="visible"
        animate="visible"
        variants={fadeUp}
        transition={defaultTransition}
      >
        {children}
      </motion.section>
    );
  }

  return (
    <motion.section
      className={base}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-5%' }}
      variants={fadeUp}
      transition={{ ...defaultTransition, delay: Math.min(index * 0.06, 0.3) }}
    >
      {children}
    </motion.section>
  );
}
