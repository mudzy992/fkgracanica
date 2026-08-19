import { webOrigin } from './web-origin';

export function youtubeEmbedOrigin(): string {
  return webOrigin();
}

export function youtubeEmbedSrc(videoId: string, muted = false): string {
  const origin = encodeURIComponent(youtubeEmbedOrigin());
  const qs = [
    'autoplay=1',
    `mute=${muted ? '1' : '0'}`,
    'controls=0',
    'disablekb=1',
    'fs=0',
    'playsinline=1',
    'rel=0',
    'modestbranding=1',
    'iv_load_policy=3',
    `origin=${origin}`,
  ].join('&');
  return `https://www.youtube.com/embed/${videoId}?${qs}`;
}

export function youtubeEmbedHtml(videoId: string, muted = false): string {
  const src = youtubeEmbedSrc(videoId, muted);
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
</head><body style="margin:0;background:#000">
<script>location.replace(${JSON.stringify(src)})</script>
</body></html>`;
}
