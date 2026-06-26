import { Link, useParams } from 'react-router-dom';
import { useNewsItem } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { PageContainer } from '../../components/public/PageContainer';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Seo } from '../../components/seo/Seo';
import { RichContent } from '../../components/public/RichContent';
import { VideoEmbed } from '../../components/public/VideoEmbed';
import { NewsCommentsSection } from '../../components/news/NewsCommentsSection';
import {
  NewsGalleryPhotos,
  NewsRelatedMatches,
  NewsRelatedPlayers,
} from '../../components/news/NewsDetailSections';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useNewsItem(slug ?? '');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Vijest nije pronađena.</p>;
  }

  return (
    <article className="pb-16">
      <Seo title={data.seoTitle ?? data.title} description={data.seoDesc ?? data.excerpt ?? undefined} image={mediaUrl(data.coverPath)} />
      {data.coverPath && (
        <div className="relative h-48 sm:h-64 md:h-80">
          <img src={mediaUrl(data.coverPath, 'medium')} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      )}
      <PageContainer size="md" className="py-8 sm:py-10">
        <Link to="/vijesti">
          <Button variant="ghost" className="mb-4">
            ← Nazad
          </Button>
        </Link>
        {data.category && <Badge className="mb-3">{data.category.name}</Badge>}
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{data.title}</h1>
        <p className="mt-2 text-sm text-text-muted">{data.publishedAt ? formatDate(data.publishedAt) : ''}</p>
        {data.videoUrl && (
          <div className="mt-8">
            <VideoEmbed url={data.videoUrl} title={data.title} />
          </div>
        )}
        <PremiumCard className="mt-8 p-6 sm:p-8" hover={false}>
          <RichContent html={data.content} />
        </PremiumCard>
        <NewsGalleryPhotos photos={data.gallery?.photos} />
        <NewsRelatedMatches matches={data.relatedMatches} />
        <NewsRelatedPlayers players={data.relatedPlayers} />
        <NewsCommentsSection newsId={data.id} />
      </PageContainer>
    </article>
  );
}
