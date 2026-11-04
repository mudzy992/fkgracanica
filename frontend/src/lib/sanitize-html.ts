import DOMPurify from 'dompurify';
import { safeRichIframeSrc } from './youtube';

/**
 * FE-03/P-FE03-1 (odobreno): sanitizacija HTML-a iz CMS-a i vijesti.
 *
 * Prije ovoga `RichContent` je renderovao `dangerouslySetInnerHTML` bez ikakve
 * sanitizacije — svako sa `news.manage`/`cms.manage` (ili upad u bazu) mogao je
 * ubaciti `<img onerror>`/`<script>` i izvršiti JS u sesijama posjetilaca
 * (**stored XSS**, nalaz B-FE03-01 / naslijeđeni B-09b-13).
 *
 * Allowlista je namjerno uska: ono što Tiptap editor i `.rich-content` stilovi
 * stvarno koriste. `iframe` je dozvoljen samo za YouTube embed (news galerija i
 * widget `youtube`), bez `allow-scripts` iz drugih domena.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'hr',
  'div',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'mark',
  'sub',
  'sup',
  'small',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'figure',
  'figcaption',
  'iframe',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'loading',
  'class',
  'colspan',
  'rowspan',
  'allow',
  'allowfullscreen',
  'frameborder',
];

/** Dozvoljeni linkovi: http(s), mailto, tel ili relativna putanja. */
const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'form', 'input', 'object', 'embed', 'link'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
};

function allowedByAttribute(tag: string, attribute: string, value: string): boolean {
  if (tag === 'iframe') {
    if (attribute === 'src') return true; // Canonicalized below after DOMPurify's protocol filtering.
    return (
      attribute === 'width' ||
      attribute === 'height' ||
      attribute === 'allow' ||
      attribute === 'allowfullscreen' ||
      attribute === 'frameborder' ||
      attribute === 'title'
    );
  }
  if ((tag === 'a' && attribute === 'href') || (tag === 'img' && attribute === 'src')) {
    return SAFE_LINK.test(value) || /^data:image\//i.test(value);
  }
  return true;
}

/** Dodatna provjera poslije DOMPurify (protokol u `href`/`src`, cilj linka). */
function harden(root: typeof DOMPurify): void {
  root.addHook('afterSanitizeAttributes', (node: Element) => {
    const el = node;
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;
    for (const attr of Array.from(el.attributes ?? [])) {
      if (!allowedByAttribute(tag, attr.name, attr.value)) el.removeAttribute(attr.name);
    }
    if (tag === 'iframe') {
      const src = el.getAttribute('src');
      const safe = src && safeRichIframeSrc(src);
      if (safe) el.setAttribute('src', safe);
      else el.removeAttribute('src');
    }
    if (tag === 'a' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

harden(DOMPurify);

/**
 * Sanitizuje HTML prije renderovanja. Vraća string siguran za
 * `dangerouslySetInnerHTML` (prazan string ako ulaz nije string).
 */
export function sanitizeHtml(html: string, unavailableMessage = 'Ugrađeni video nije dostupan.'): string {
  if (typeof html !== 'string' || !html.trim()) return '';
  const root = DOMPurify.sanitize(html, { ...PURIFY_CONFIG, RETURN_DOM: true }) as HTMLElement;
  for (const frame of root.querySelectorAll('iframe:not([src])')) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'status');
    notice.textContent = unavailableMessage;
    frame.replaceWith(notice);
  }
  return root.innerHTML;
}

/** Izvoz za testove — provjera da allowlista ne uključi opasne tagove. */
export const SANITIZE_ALLOWED_TAGS = ALLOWED_TAGS;
