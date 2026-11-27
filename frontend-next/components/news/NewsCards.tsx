import Link from 'next/link';
import { formatDate, stripHtml } from '../../lib/utils';
import { mediaUrl } from '../../lib/media';

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverPath?: string | null;
  publishedAt?: string | null;
};

export function NewsCompactCard({ item }: { item: NewsItem }) {
  return (
    <article className="group">
      <Link href={`/vijesti/${item.slug}`}>
        <div className="glass-premium flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-deep/60 md:flex-row">
          {item.coverPath ? (
            <div className="relative h-48 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(item.coverPath, 'medium') ?? ''}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ) : null}
          <div className="flex flex-col justify-center p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <span>🕒</span>
              {item.publishedAt ? formatDate(item.publishedAt) : ''}
            </div>
            <h3 className="font-display mb-3 text-lg font-bold uppercase leading-snug text-white group-hover:text-primary-light">
              {item.title}
            </h3>
            <p className="line-clamp-2 text-sm text-text-muted">
              {stripHtml(item.excerpt ?? '')}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function NewsGridCard({ item }: { item: NewsItem }) {
  return (
    <article className="group">
      <Link href={`/vijesti/${item.slug}`}>
        <div className="glass-premium overflow-hidden rounded-2xl border border-border bg-surface-deep/60">
          {item.coverPath ? (
            <div className="relative h-44 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(item.coverPath, 'medium') ?? ''}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          ) : null}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <span>🕒</span>
              {item.publishedAt ? formatDate(item.publishedAt) : ''}
            </div>
            <h3 className="font-display text-base font-bold uppercase leading-snug text-white group-hover:text-primary-light">
              {item.title}
            </h3>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function NewsFeaturedCard({ item }: { item: NewsItem }) {
  return (
    <article className="group lg:row-span-2">
      <Link href={`/vijesti/${item.slug}`} className="block h-full">
        <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-border bg-surface-deep">
          {item.coverPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(item.coverPath, 'medium') ?? ''}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <span>🕒</span>
              {item.publishedAt ? formatDate(item.publishedAt) : ''}
            </div>
            <h3 className="font-display mb-4 text-2xl font-bold uppercase leading-tight text-white group-hover:text-primary-light md:text-3xl">
              {item.title}
            </h3>
            <p className="mb-4 line-clamp-2 text-white/80">
              {stripHtml(item.excerpt ?? '')}
            </p>
            <span className="inline-flex items-center gap-2 font-semibold text-primary-light">
              Pročitaj više →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
