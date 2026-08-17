import { parseYouTubeId } from '../../lib/youtube';

interface VideoEmbedProps {
  url: string;
  title?: string;
  startSeconds?: number | null;
  className?: string;
}

export function VideoEmbed({ url, title = 'Video', startSeconds, className }: VideoEmbedProps) {
  const id = parseYouTubeId(url);
  if (!id) return null;
  const start = startSeconds && startSeconds > 0 ? `?start=${startSeconds}` : '';

  return (
    <div className={className ?? 'aspect-video w-full overflow-hidden rounded-xl'}>
      <iframe
        src={`https://www.youtube.com/embed/${id}${start}`}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
