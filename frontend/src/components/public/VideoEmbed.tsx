import { useTranslation } from 'react-i18next';
import { parseYouTubeId } from '../../lib/youtube';

interface VideoEmbedProps {
  url: string;
  title?: string;
  startSeconds?: number | null;
  className?: string;
}

export function VideoEmbed({ url, title = 'Video', startSeconds, className }: VideoEmbedProps) {
  const { t } = useTranslation();
  const id = parseYouTubeId(url);
  if (!id) {
    return <p role="status" className="p-4 text-sm text-text-muted">{t('video.unavailable')}</p>;
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${id}`);
  if (typeof startSeconds === 'number' && Number.isSafeInteger(startSeconds) && startSeconds > 0) {
    embedUrl.searchParams.set('start', String(startSeconds));
  }

  return (
    <div className={className ?? 'aspect-video w-full overflow-hidden rounded-xl'}>
      <iframe
        src={embedUrl.toString()}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
