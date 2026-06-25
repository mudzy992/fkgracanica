import { useClubTimeline } from '../../hooks';
import { RichContent } from '../../components/public/RichContent';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';

export function ClubTimelinePage() {
  const { data, isLoading } = useClubTimeline();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Seo title="O klubu" />
      <h1 className="mb-8 text-3xl font-bold">O klubu</h1>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-8 border-l-2 border-primary pl-6">
          {data?.map((event) => (
            <article key={event.id} className="relative">
              <span className="absolute -left-[1.65rem] top-1 flex h-4 w-4 rounded-full bg-primary" />
              <p className="text-sm font-bold text-primary">{event.year}</p>
              <h2 className="text-xl font-semibold">{event.title}</h2>
              {event.description && <RichContent html={event.description} className="mt-2 text-text-muted" />}
              {event.imagePath && (
                <img src={mediaUrl(event.imagePath)} alt="" className="mt-4 rounded-lg" />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
