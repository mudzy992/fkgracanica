import { Link } from 'react-router-dom';
import { ArrowLeft, Images } from 'lucide-react';
import { mediaUrl } from '../../lib/media';

interface Props {
  title: string;
  coverPath?: string | null;
  photoCount?: number;
}

export function GalleryAlbumHero({ title, coverPath, photoCount }: Props) {
  return (
    <header className="relative min-h-[40vh] overflow-hidden md:min-h-[50vh]">
      {coverPath ? (
        <img
          src={mediaUrl(coverPath, 'original')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />

      <div className="relative mx-auto flex min-h-[40vh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 md:min-h-[50vh] md:pb-14">
        <Link
          to="/galerija"
          className="glass-premium absolute left-4 top-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:text-white sm:left-6"
        >
          <ArrowLeft size={14} />
          Galerija
        </Link>

        <div className="space-y-4">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-light">
            Album
          </span>
          <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {photoCount != null && photoCount > 0 && (
            <p className="flex items-center gap-2 text-sm text-white/50">
              <Images size={14} />
              {photoCount}{' '}
              {photoCount === 1 ? 'fotografija' : photoCount >= 2 && photoCount <= 4 ? 'fotografije' : 'fotografija'}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
