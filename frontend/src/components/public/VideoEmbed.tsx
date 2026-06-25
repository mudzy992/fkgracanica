import { parseYouTubeId } from '../../lib/youtube';

interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export function VideoEmbed({ url, title = 'Video', className }: VideoEmbedProps) {
  const id = parseYouTubeId(url);
  if (!id) return null;

  return (
    <div className={className ?? 'aspect-video w-full overflow-hidden rounded-xl'}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
