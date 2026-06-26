import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { defaultTransition, fadeUp } from './presets';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8%' }}
      variants={fadeUp}
      transition={{ ...defaultTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
