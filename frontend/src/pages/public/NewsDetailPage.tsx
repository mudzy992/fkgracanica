import { useParams } from 'react-router-dom';
import { useNewsItem } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { PageContainer } from '../../components/public/PageContainer';
import { Seo } from '../../components/seo/Seo';
import { RichContent } from '../../components/public/RichContent';
import { VideoEmbed } from '../../components/public/VideoEmbed';
import { NewsCommentsSection } from '../../components/news/NewsCommentsSection';
import { NewsArticleHero } from '../../components/news/NewsArticleHero';
import { NewsGalleryPhotos } from '../../components/news/NewsGalleryPhotos';
import {
  NewsRelatedMatches,
  NewsRelatedPlayers,
} from '../../components/news/NewsDetailSections';
import { Skeleton } from '../../components/ui/skeleton';

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useNewsItem(slug ?? '');

  if (isLoading) {
    return (
      <div className="pb-16">
        <Skeleton className="h-[50vh] w-full rounded-none" />
        <Skeleton className="mx-auto mt-10 h-64 max-w-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="p-12 text-center text-text-muted">
        Vijest nije pronađena.
      </p>
    );
  }

  return (
    <article className="pb-16">
      <Seo
        title={data.seoTitle ?? data.title}
        description={data.seoDesc ?? data.excerpt ?? undefined}
        image={mediaUrl(data.coverPath, 'medium')}
        url={`/vijesti/${data.slug}`}
        type="article"
      />
      <NewsArticleHero
        title={data.title}
        coverPath={data.coverPath}
        categoryName={data.category?.name}
        publishedAt={data.publishedAt}
      />

      <PageContainer size="md" className="py-10 sm:py-12">
        {data.videoUrl && (
          <div className="mb-10">
            <VideoEmbed url={data.videoUrl} title={data.title} />
          </div>
        )}

        <div className="glass-premium rounded-2xl p-6 sm:p-8 md:p-10">
          <RichContent html={data.content} className="text-base leading-relaxed sm:text-lg" />
        </div>

        <NewsGalleryPhotos gallery={data.gallery} galleryId={data.galleryId} />
        <NewsRelatedMatches matches={data.relatedMatches} />
        <NewsRelatedPlayers players={data.relatedPlayers} />
        <NewsCommentsSection newsId={data.id} />
      </PageContainer>
    </article>
  );
}
