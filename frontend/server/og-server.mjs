import express from 'express';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const indexTemplate = readFileSync(join(dist, 'index.html'), 'utf8');

const PORT = Number(process.env.PORT ?? 3000);
const INTERNAL_API_URL = (process.env.INTERNAL_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');

const CRAWLER_RE =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Viber|TelegramBot|LinkedInBot|Slackbot|Discordbot|Googlebot|bingbot|Applebot|Pinterest|Embedly/i;

const cache = new Map();
const CACHE_MS = 5 * 60 * 1000;

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

async function fetchShareMeta(path) {
  const key = path || '/';
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  const res = await fetch(`${INTERNAL_API_URL}/seo/share?path=${encodeURIComponent(key)}`);
  if (!res.ok) return null;
  const data = await res.json();
  cache.set(key, { data, expires: Date.now() + CACHE_MS });
  return data;
}

const app = express();
app.use(express.static(dist, { index: false, maxAge: '1d' }));

app.get(/.*/, async (req, res, next) => {
  if (req.path.includes('.')) return next();
  const ua = req.get('user-agent') ?? '';
  if (!isCrawler(ua)) {
    return res.sendFile(join(dist, 'index.html'));
  }
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
  return res.sendFile(join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[og-server] listening on :${PORT}, API ${INTERNAL_API_URL}`);
});
