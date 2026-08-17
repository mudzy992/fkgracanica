import { createHash, timingSafeEqual } from 'crypto';

export function sha512hex(input: string) {
  return createHash('sha512').update(input, 'utf8').digest('hex');
}

export function monriFormUrl(mode: string) {
  return mode === 'live' ? 'https://ipg.monri.com/v2/form' : 'https://ipgtest.monri.com/v2/form';
}

export function toMinorUnits(amount: number) {
  return String(Math.round(amount * 100));
}

export function monriFormDigest(key: string, orderNumber: string, amountMinor: string, currency: string) {
  return sha512hex(`${key}${orderNumber}${amountMinor}${currency}`);
}

export function monriSuccessDigest(key: string, urlWithoutDigest: string) {
  return sha512hex(`${key}${urlWithoutDigest}`);
}

export function monriCallbackDigest(key: string, rawBody: string) {
  return sha512hex(`${key}${rawBody}`);
}

export function hexEqual(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function stripMonriDigest(href: string) {
  const amp = href.indexOf('&digest=');
  const q = href.indexOf('?digest=');
  if (amp !== -1) {
    return { url: href.slice(0, amp), digest: decodeURIComponent(href.slice(amp + 8).split('&')[0]) };
  }
  if (q !== -1) {
    return { url: href.slice(0, q), digest: decodeURIComponent(href.slice(q + 8).split('&')[0]) };
  }
  return { url: href, digest: '' };
}

export function parseMonriRef(orderNumber: string) {
  if (orderNumber.startsWith('t-')) return { kind: 'tickets' as const, id: orderNumber.slice(2) };
  if (orderNumber.startsWith('m-')) return { kind: 'membership' as const, id: orderNumber.slice(2) };
  if (orderNumber.startsWith('s-')) return { kind: 'season' as const, id: orderNumber.slice(2) };
  return null;
}

export function monriOrderNumber(kind: 'tickets' | 'membership' | 'season', id: string) {
  const prefix = kind === 'tickets' ? 't' : kind === 'membership' ? 'm' : 's';
  return `${prefix}-${id}`.slice(0, 40);
}

export function withMonriReturnUrl(successUrl: string, orderNumber: string) {
  const filled = successUrl.replace('{CHECKOUT_SESSION_ID}', orderNumber);
  try {
    const url = new URL(filled);
    url.searchParams.set('paid', '1');
    url.searchParams.set('provider', 'monri');
    url.searchParams.set('session_id', orderNumber);
    return url.toString();
  } catch {
    return filled;
  }
}

export function parseCallbackAuth(header?: string) {
  if (!header) return '';
  const parts = header.trim().split(/\s+/);
  return parts[0] === 'WP3-callback' ? parts[1] ?? '' : parts.at(-1) ?? '';
}
