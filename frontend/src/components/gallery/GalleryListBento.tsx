import { Link } from 'react-router-dom';
import { Images } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { GalleryItem } from '../../types';
import { mediaUrl } from '../../lib/media';
import { cn } from '../../lib/utils';

const BENTO_SPANS = [
  'col-span-2 row-span-2 min-h-[200px] sm:min-h-[260px]',
  'col-span-1 row-span-1 min-h-[96px] sm:min-h-[120px]',
  'col-span-1 row-span-1 min-h-[96px] sm:min-h-[120px]',
  'col-span-1 row-span-2 min-h-[200px] sm:min-h-[260px]',
  'col-span-1 row-span-1 min-h-[96px] sm:min-h-[120px]',
  'col-span-2 row-span-1 min-h-[110px] sm:min-h-[140px]',
];

function coverSrc(path: string) {
  return mediaUrl(path, 'thumb') ?? mediaUrl(path, 'medium') ?? mediaUrl(path, 'original');
}

interface Props {
  items: GalleryItem[];
}

export function GalleryListBento({ items }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 md:[grid-auto-rows:minmax(120px,auto)]">
      {items.map((g, i) => {
        const cover = g.photos?.[0]?.path;
        const count = g.photos?.length ?? 0;
        const span = BENTO_SPANS[i % BENTO_SPANS.length];
        const src = cover ? coverSrc(cover) : undefined;

        return (
          <motion.div
            key={g.id}
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className={span}
          >
            <Link
              to={`/galerija/${g.slug}`}
              className="group card-lift relative block h-full min-h-[inherit] overflow-hidden rounded-2xl border border-white/10"
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 p-4 text-center text-sm text-text-muted">
                  {g.title}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-90 transition group-hover:opacity-100" />
              {count > 0 && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm sm:text-xs">
                  <Images size={12} />
                  {count}
                </span>
              )}
              <p className="absolute bottom-0 left-0 right-0 p-4 font-display text-sm font-bold uppercase leading-snug text-white group-hover:text-primary-light sm:text-base">
                {g.title}
              </p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function GalleryListBentoSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse rounded-2xl bg-white/5', BENTO_SPANS[i % BENTO_SPANS.length])}
        />
      ))}
    </div>
  );
}
