import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface Props {
  imageUrl?: string;
}

export function MatchParallaxBg({ imageUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%']);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {imageUrl ? (
        <motion.div className="absolute -inset-[12%]" style={{ y }}>
          <img src={imageUrl} alt="" className="h-full w-full object-cover" aria-hidden />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-background to-surface" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(5,10,20,0.92), rgba(30,58,138,0.85)), linear-gradient(to top, rgba(5,10,20,0.95), transparent 40%)',
        }}
      />
    </div>
  );
}
