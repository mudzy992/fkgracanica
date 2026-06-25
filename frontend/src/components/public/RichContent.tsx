import { normalizeHtmlForRender } from '../../lib/html-content';
import { cn } from '../../lib/utils';

interface Props {
  html: string;
  className?: string;
}

export function RichContent({ html, className }: Props) {
  const content = normalizeHtmlForRender(html);
  if (!content) return null;

  return (
    <div
      className={cn('rich-content', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
