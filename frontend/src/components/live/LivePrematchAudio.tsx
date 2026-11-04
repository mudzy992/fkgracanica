import { useTranslation } from 'react-i18next';
import { useYouTubeAudioPlayer } from '../../hooks/use-youtube-player';

interface Props {
  url: string;
  active: boolean;
}

export function LivePrematchAudio({ url, active }: Props) {
  const { t } = useTranslation();
  const { containerRef, videoId } = useYouTubeAudioPlayer(url, active);
  if (!videoId) {
    if (!url.trim()) return null;
    return (
      <p role="status" className="relative mx-auto w-full max-w-3xl p-3 text-center text-sm text-white">
        {t('video.audioUnavailable')}
      </p>
    );
  }
  return (
    <div className="pointer-events-none fixed -left-[9999px] h-px w-px overflow-hidden opacity-0">
      <div ref={containerRef} />
    </div>
  );
}
