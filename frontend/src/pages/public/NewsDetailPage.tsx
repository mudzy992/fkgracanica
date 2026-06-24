import { Link, useParams } from 'react-router-dom';
import { useNewsItem } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useNewsItem(slug ?? '');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Vijest nije pronađena.</p>;
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Seo title={data.title} description={data.excerpt ?? undefined} image={mediaUrl(data.coverPath)} />
      <Link to="/vijesti">
        <Button variant="ghost" className="mb-4">
          ← Nazad
        </Button>
      </Link>
      {data.coverPath && (
        <img src={mediaUrl(data.coverPath)} alt="" className="mb-6 w-full rounded-xl object-cover" />
      )}
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="mt-2 text-sm text-text-muted">
        {data.publishedAt ? formatDate(data.publishedAt) : ''}
      </p>
      <div className="prose mt-8 max-w-none whitespace-pre-wrap text-text">{data.content}</div>
    </article>
  );
}
