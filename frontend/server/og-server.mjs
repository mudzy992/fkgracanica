import express from 'express';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');

const CRAWLER_RE =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Viber|TelegramBot|LinkedInBot|Slackbot|Discordbot|Googlebot|bingbot|Applebot|Pinterest|Embedly/i;

const CACHE_MS = 5 * 60 * 1000;
const NOINDEX_PATHS = new Set(['/prijava', '/admin/login', '/placanje/monri']);

function isNoindexPath(path) {
  try {
    return NOINDEX_PATHS.has(decodeURIComponent(path).replace(/\/+$/, '').toLowerCase());
  } catch {
    return false;
  }
}

function isCrawler(ua) {
  return CRAWLER_RE.test(ua ?? '');
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMetaTags(meta) {
  const tags = [
    `<title>${escapeAttr(meta.documentTitle)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(meta.url)}" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(meta.url)}" />`,
    `<meta property="og:type" content="${escapeAttr(meta.type ?? 'website')}" />`,
    `<meta property="og:site_name" content="${escapeAttr(meta.siteName)}" />`,
    `<meta property="og:locale" content="bs_BA" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
  ];
  if (meta.image) {
    tags.push(
      `<meta property="og:image" content="${escapeAttr(meta.image)}" />`,
      `<meta property="og:image:secure_url" content="${escapeAttr(meta.image)}" />`,
      `<meta name="twitter:image" content="${escapeAttr(meta.image)}" />`,
    );
  }
  return tags.join('\n    ');
}

function injectMeta(html, meta) {
  const withoutTitle = html.replace(/<title>[\s\S]*?<\/title>/i, '');
  const withoutOg = withoutTitle.replace(/<meta[^>]+property="og:[^"]+"[^>]*>/gi, '');
  return withoutOg.replace('</head>', `    ${buildMetaTags(meta)}\n  </head>`);
}

/** Isti HTTP handler koriste produkcijski proces i izolovani integracijski testovi. */
export function createOgApp({
  distDir = dist,
  internalApiUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:3000/api/v1',
  fetchImpl = fetch,
} = {}) {
  const indexTemplate = readFileSync(join(distDir, 'index.html'), 'utf8');
  const apiUrl = internalApiUrl.replace(/\/$/, '');
  const cache = new Map();

  async function fetchShareMeta(path) {
    const key = path || '/';
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.data;

    const res = await fetchImpl(`${apiUrl}/seo/share?path=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(key, { data, expires: Date.now() + CACHE_MS });
    return data;
  }

  const app = express();
  app.use((req, res, next) => {
    if (isNoindexPath(req.path)) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (req.path === '/sw.js') res.setHeader('Cache-Control', 'no-cache');
    next();
  });
  app.use(express.static(distDir, { index: false, maxAge: '1d' }));

  app.get(/.*/, async (req, res, next) => {
    if (req.path.includes('.')) return next();
    const ua = req.get('user-agent') ?? '';
    if (!isCrawler(ua)) return res.sendFile(join(distDir, 'index.html'));
    try {
      const meta = await fetchShareMeta(req.path);
      if (meta) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.send(injectMeta(indexTemplate, meta));
      }
    } catch (err) {
      console.error('[og-server] meta fetch failed:', err);
    }
    return res.sendFile(join(distDir, 'index.html'));
  });
  return app;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  const apiUrl = (process.env.INTERNAL_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
  createOgApp({ internalApiUrl: apiUrl }).listen(port, () => {
    console.log(`[og-server] listening on :${port}, API ${apiUrl}`);
  });
}
