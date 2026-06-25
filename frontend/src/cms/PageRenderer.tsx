import { Seo } from '../components/seo/Seo';
import { Skeleton } from '../components/ui/skeleton';
import { useCmsPage } from '../hooks/use-cms-pages';
import { WidgetRenderer } from './WidgetRenderer';

interface Props {
  slug: string;
  admin?: boolean;
}

export function PageRenderer({ slug, admin }: Props) {
  const { data: page, isLoading, isError } = useCmsPage(slug, admin);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !page) {
    return <p className="p-12 text-center text-text-muted">Stranica nije pronađena.</p>;
  }

  return (
    <>
      <Seo title={page.seoTitle ?? page.title} description={page.seoDesc ?? undefined} />
      {(page.sections ?? []).map((section) => (
        <WidgetRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
