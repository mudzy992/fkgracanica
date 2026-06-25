import { Link, useParams } from 'react-router-dom';
import { useNewsItem } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
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

  const seoTitle = data.seoTitle ?? data.title;
  const seoDesc = data.seoDesc ?? data.excerpt ?? undefined;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Seo title={seoTitle} description={seoDesc} image={mediaUrl(data.coverPath)} />
      <Link to="/vijesti">
        <Button variant="ghost" className="mb-4">
          ← Nazad
        </Button>
      </Link>
      {data.category && <Badge className="mb-3">{data.category.name}</Badge>}
      {data.coverPath && (
        <img src={mediaUrl(data.coverPath)} alt="" className="mb-6 w-full rounded-xl object-cover" />
      )}
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="mt-2 text-sm text-text-muted">
        {data.publishedAt ? formatDate(data.publishedAt) : ''}
      </p>
      {data.videoUrl && (
        <div className="mt-8">
          <VideoEmbed url={data.videoUrl} title={data.title} />
        </div>
      )}
      <RichContent html={data.content} className="mt-8" />
      <NewsGalleryPhotos photos={data.gallery?.photos} />
      <NewsRelatedMatches matches={data.relatedMatches} />
      <NewsRelatedPlayers players={data.relatedPlayers} />
      <NewsCommentsSection newsId={data.id} />
    </article>
  );
}
