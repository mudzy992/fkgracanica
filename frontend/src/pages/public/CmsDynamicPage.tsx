import { useParams } from 'react-router-dom';
import { PageRenderer } from '../../cms/PageRenderer';

export function CmsDynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;
  return <PageRenderer slug={slug} />;
}
