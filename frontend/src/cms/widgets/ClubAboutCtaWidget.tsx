import { ArrowRight, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClubTimeline, useHallOfFame, useOwnClub } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { sortStoryChapters } from '../../components/public/story/sort-story-chapters';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['club-about-cta'] };

export function ClubAboutCtaWidget({ config: _config }: Props) {
  const { data: ownClub } = useOwnClub();
  const { data: timeline } = useClubTimeline();
  const { data: hallOfFame } = useHallOfFame();
  const chapters = useMemo(() => sortStoryChapters(timeline ?? []), [timeline]);
  const firstYear = chapters[0]?.year;
  const storyImagePath = chapters.find((chapter) => chapter.imagePath)?.imagePath;
  const hallEntry = hallOfFame?.find((entry) => entry.photoPath || entry.imagePath);
  const storyImage = storyImagePath ? mediaUrl(storyImagePath, 'original') : null;
  const heritageImage = hallEntry ? mediaUrl(hallEntry.photoPath ?? hallEntry.imagePath, 'original') : null;
  const clubName = ownClub?.name ?? 'FK Gračanica';
  const hallCount = hallOfFame?.length ?? 0;
  const title = firstYear
    ? `${clubName} od ${firstYear}. vodi u priču koja završava u Kući slavnih.`
    : `${clubName} vodi u priču koja završava u Kući slavnih.`;
  const text =
    hallCount > 0
      ? 'Uđi u dokumentarnu priču kluba, prođi kroz njegove ere i otvori baštinsko poglavlje posvećeno imenima koja su ga obilježila.'
      : 'Uđi u dokumentarnu priču kluba i otkrij baštinsko poglavlje posvećeno njegovim najvećim imenima.';

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface-deep p-6 shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              Dokumentar kluba
            </div>
            <div>
              <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/o-klubu"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                Pregledaj O klubu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/60">
              {storyImage ? (
                <img loading="lazy" decoding="async" src={storyImage} alt="" className="h-80 w-full object-cover sm:h-[26rem]" />
              ) : (
                <div className="flex h-80 items-center justify-center bg-[linear-gradient(160deg,#0f172a,#1d4ed8)] text-sm font-semibold uppercase tracking-[0.3em] text-white/80 sm:h-[26rem]">
                  O klubu
                </div>
              )}
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-slate-950/70 sm:mt-10">
              {heritageImage ? (
                <img loading="lazy" decoding="async" src={heritageImage} alt="" className="h-80 w-full object-cover sm:h-[26rem]" />
              ) : (
                <div className="flex h-80 items-center justify-center bg-[linear-gradient(180deg,#120d05,#3f2a0f)] text-sm font-semibold uppercase tracking-[0.3em] text-amber-100/75 sm:h-[26rem]">
                  Baština
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
