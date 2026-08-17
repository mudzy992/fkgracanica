import { useTranslation } from 'react-i18next';
import { VideoEmbed } from '../public/VideoEmbed';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import type { MatchHighlight } from '../../types';

export function MatchHighlights({
  streamUrl,
  highlights,
}: {
  streamUrl?: string | null;
  highlights?: MatchHighlight[];
}) {
  const { t } = useTranslation();
  const clips = highlights ?? [];
  if (!streamUrl && !clips.length) return null;

  return (
    <section className="mt-10 space-y-8 sm:mt-12">
      {streamUrl ? (
        <div>
          <Reveal>
            <NewsSectionTitle>{t('match.fullStream')}</NewsSectionTitle>
          </Reveal>
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/10">
            <VideoEmbed url={streamUrl} title={t('match.fullStream')} />
          </div>
        </div>
      ) : null}
      {clips.length > 0 ? (
        <div>
          <Reveal>
            <NewsSectionTitle>{t('match.highlights')}</NewsSectionTitle>
          </Reveal>
          <ul className="mt-4 grid gap-6">
            {clips.map((clip) => (
              <li key={clip.id}>
                <p className="mb-2 text-sm font-medium">{clip.title}</p>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <VideoEmbed url={clip.youtubeUrl} title={clip.title} startSeconds={clip.startSeconds} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
