import { useYouTubeAudioPlayer } from '../../hooks/use-youtube-player';

interface Props {
  url: string;
  active: boolean;
}

export function LivePrematchAudio({ url, active }: Props) {
  const { containerRef, videoId } = useYouTubeAudioPlayer(url, active);
  if (!videoId) return null;
  return (
    <div className="pointer-events-none fixed -left-[9999px] h-px w-px overflow-hidden opacity-0">
      <div ref={containerRef} />
    </div>
  );
}
