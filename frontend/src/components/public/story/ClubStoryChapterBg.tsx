import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface Props {
  imageUrl?: string;
}

export function ClubStoryChapterBg({ imageUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%']);

  return (
    <div ref={ref} className="story-grain absolute inset-0 overflow-hidden">
      {imageUrl ? (
        <motion.div className="absolute -inset-[12%]" style={{ y }}>
          <img src={imageUrl} alt="" className="h-full w-full object-cover grayscale" aria-hidden />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.16),transparent_55%)]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(5,10,20,0.88), rgba(30,58,138,0.55)), linear-gradient(to top, rgba(5,10,20,0.94), transparent 45%)',
        }}
      />
    </div>
  );
}
