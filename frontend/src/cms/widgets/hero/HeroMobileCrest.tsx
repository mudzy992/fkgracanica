import { motion, useReducedMotion } from 'framer-motion';
import { usePublicSettings } from '../../../hooks';
import { mediaUrl } from '../../../lib/media';
import { cn } from '../../../lib/utils';
import { defaultTransition, fadeUp } from '../../../lib/motion/presets';

interface Props {
  compact?: boolean;
}

export function HeroMobileCrest({ compact = false }: Props) {
  const { data: settings } = usePublicSettings();
  const reduce = useReducedMotion();
  const crestUrl = settings?.['club.crestUrl'];
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';

  if (!crestUrl) return null;

  return (
    <motion.div
      variants={fadeUp}
      initial={reduce ? false : 'hidden'}
      animate="visible"
      transition={{ ...defaultTransition, delay: 0.1 }}
      className="relative flex min-h-0 h-full flex-col p-6 lg:hidden"
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <div
          className="pointer-events-none absolute bottom-[18%] left-1/2 h-10 w-32 -translate-x-1/2 rounded-full bg-[#0066ff]/50 blur-2xl sm:h-12 sm:w-40"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[20%] left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-primary-light/35 blur-xl"
          aria-hidden
        />
        <img
          src={mediaUrl(crestUrl, 'original')}
          alt={clubName}
          className={cn(
            'relative z-10 object-contain',
            compact ? 'max-h-[55%] max-w-[55%]' : 'max-h-[70%] max-w-[70%]',
          )}
        />
      </div>
    </motion.div>
  );
}
