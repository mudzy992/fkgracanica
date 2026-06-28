import { cn } from '../../lib/utils';
import { useYouTubeStreamPlayer } from '../../hooks/use-youtube-stream-player';

interface Props {
  url: string;
  active?: boolean;
  hidden?: boolean;
  className?: string;
}

export function LiveYouTubePlayer({ url, active = true, hidden = false, className }: Props) {
  const { containerRef, videoId } = useYouTubeStreamPlayer(url, active);

  if (!videoId) return null;

  return (
    <div
      className={cn(
        className ?? 'pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden bg-black',
        hidden && 'invisible',
      )}
      aria-hidden={hidden}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full" />
    </div>
  );
}
