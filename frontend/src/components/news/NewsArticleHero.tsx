import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';

interface Props {
  title: string;
  coverPath?: string | null;
  categoryName?: string;
  publishedAt?: string | null;
}

export function NewsArticleHero({ title, coverPath, categoryName, publishedAt }: Props) {
  return (
    <header className="relative min-h-[50vh] overflow-hidden md:min-h-[60vh]">
      {coverPath ? (
        <img
          src={mediaUrl(coverPath, 'original')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

      <div className="relative mx-auto flex min-h-[50vh] max-w-4xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 md:min-h-[60vh] md:pb-14">
        <Link
          to="/vijesti"
          className="glass-premium absolute left-4 top-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:text-white sm:left-6"
        >
          <ArrowLeft size={14} />
          Vijesti
        </Link>

        <div className="space-y-4">
          {categoryName && (
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-light">
              {categoryName}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {publishedAt && (
            <p className="flex items-center gap-2 text-sm text-white/50">
              <Clock size={14} />
              {formatDate(publishedAt)}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
