import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { stripHtml } from '../../lib/html-content';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverPath?: string | null;
  publishedAt?: string | null;
};

export function NewsCompactCard({ item, delay }: { item: NewsItem; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group"
    >
      <Link to={`/vijesti/${item.slug}`}>
        <div className="glass-premium card-lift flex h-full flex-col overflow-hidden rounded-2xl md:flex-row">
          {item.coverPath && (
            <div className="relative h-48 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-48">
              <img
                src={mediaUrl(item.coverPath, 'medium')}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <Clock size={12} />
              {item.publishedAt ? formatDate(item.publishedAt) : ''}
            </div>
            <h3 className="font-display mb-3 text-lg font-bold uppercase leading-snug text-white group-hover:text-primary-light">
              {item.title}
            </h3>
            <p className="line-clamp-2 text-sm text-text-muted">{stripHtml(item.excerpt ?? '')}</p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function NewsGridCard({ item, delay }: { item: NewsItem; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group"
    >
      <Link to={`/vijesti/${item.slug}`}>
        <div className="glass-premium card-lift overflow-hidden rounded-2xl">
          {item.coverPath && (
            <div className="relative h-44 overflow-hidden">
              <img
                src={mediaUrl(item.coverPath, 'medium')}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <Clock size={11} />
              {item.publishedAt ? formatDate(item.publishedAt) : ''}
            </div>
            <h3 className="font-display text-base font-bold uppercase leading-snug text-white group-hover:text-primary-light">
              {item.title}
            </h3>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function NewsFeaturedCard({ item }: { item: NewsItem }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="group lg:row-span-2"
    >
      <Link to={`/vijesti/${item.slug}`} className="block h-full">
        <div className="card-lift relative min-h-[400px] overflow-hidden rounded-3xl">
          {item.coverPath && (
            <img
              src={mediaUrl(item.coverPath, 'medium')}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/50">
              <Clock size={14} />
              {item.publishedAt ? formatDate(item.publishedAt) : ''}
            </div>
            <h3 className="font-display mb-4 text-2xl font-bold uppercase leading-tight text-white group-hover:text-primary-light md:text-3xl">
              {item.title}
            </h3>
            <p className="mb-4 line-clamp-2 text-white/60">{stripHtml(item.excerpt ?? '')}</p>
            <span className="inline-flex items-center gap-2 font-semibold text-primary-light">
              {t('news.readMore')} <ArrowUpRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
