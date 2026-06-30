import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { defaultTransition } from '../../../lib/motion/presets';

interface Props {
  children: ReactNode;
}

export function PublicHeroShell({ children }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, var(--hero-radial-accent) 0%, transparent 70%)',
        }}
      />
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--hero-orb-color)' }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={defaultTransition}
      >
        {children}
      </motion.div>
    </div>
  );
}
