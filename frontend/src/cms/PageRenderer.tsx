import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { SectionDivider } from '../components/public/shell/SectionDivider';
import { AnimatedSection } from '../lib/motion/AnimatedSection';
import { Skeleton } from '../components/ui/skeleton';
import { useCmsPage } from '../hooks/use-cms-pages';
import { WidgetRenderer } from './WidgetRenderer';

interface Props {
  slug: string;
  admin?: boolean;
}

export function PageRenderer({ slug, admin }: Props) {
  const { t } = useTranslation();
  const { data: page, isLoading, isError } = useCmsPage(slug, admin);
  const sections = page?.sections ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !page) {
    return <p className="p-12 text-center text-text-muted">{t('pages.notFound')}</p>;
  }

  return (
    <>
      <Seo
        title={slug === 'home' ? undefined : (page.seoTitle ?? page.title)}
        description={slug === 'home' ? undefined : (page.seoDesc ?? undefined)}
        url={slug === 'home' ? '/' : `/p/${slug}`}
        type="website"
      />
      {sections.map((section, index) => (
        <div key={section.id}>
          {index > 0 && section.widgetType !== 'hero' && <SectionDivider />}
          <AnimatedSection
            variant={section.widgetType === 'hero' ? 'hero' : section.widgetType.includes('cta') ? 'surface' : 'default'}
            index={index}
          >
            <WidgetRenderer section={section} />
          </AnimatedSection>
        </div>
      ))}
    </>
  );
}
