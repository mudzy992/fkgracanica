import { normalizeHtmlForRender } from '../../lib/html-content';
import { sanitizeHtml } from '../../lib/sanitize-html';
import { cn } from '../../lib/utils';

interface Props {
  html: string;
  className?: string;
}

/**
 * FE-03/P-FE03-1: sav HTML (vijesti, CMS `rich-text`/`custom-html`, muzej, trofeji,
 * klupska historija) prolazi kroz `sanitizeHtml` prije `dangerouslySetInnerHTML`
 * — bez toga je svaki `news.manage`/`cms.manage` nalog imao stored XSS.
 */
export function RichContent({ html, className }: Props) {
  const content = sanitizeHtml(normalizeHtmlForRender(html));
  if (!content) return null;

  return (
    <div className={cn('rich-content', className)} dangerouslySetInnerHTML={{ __html: content }} />
  );
}
