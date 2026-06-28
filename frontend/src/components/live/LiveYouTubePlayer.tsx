import { cn } from '../../lib/utils';
import { useYouTubeStreamPlayer } from '../../hooks/use-youtube-player';

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
        className ?? 'pointer-events-none absolute inset-0 h-full w-full overflow-hidden',
        hidden && 'invisible',
      )}
      aria-hidden={hidden}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full [&_iframe]:absolute [&_iframe]:left-1/2 [&_iframe]:top-1/2 [&_iframe]:min-h-full [&_iframe]:min-w-full [&_iframe]:-translate-x-1/2 [&_iframe]:-translate-y-1/2"
      />
    </div>
  );
}
