import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { API_URL, api } from './api';

WebBrowser.maybeCompleteAuthSession();

export type CheckoutKind = 'tickets' | 'membership' | 'season';
export type CheckoutResult = 'paid' | 'cancelled' | 'dismissed';

type Input = {
  kind: CheckoutKind;
  body: Record<string, unknown>;
};

const PATH: Record<CheckoutKind, string> = {
  tickets: '/payments/checkout/tickets',
  membership: '/payments/checkout/membership',
  season: '/payments/checkout/season-pass',
};

const CONFIRM: Record<CheckoutKind, string> = {
  tickets: '/payments/tickets/confirm-session',
  membership: '/payments/membership/confirm-session',
  season: '/payments/season-pass/confirm-session',
};

export async function startMobileCheckout({ kind, body }: Input): Promise<CheckoutResult> {
  const appReturn = Linking.createURL('payment-return');
  const bounce = `${API_URL.replace(/\/$/, '')}/payments/mobile-return`;
  const to = encodeURIComponent(appReturn);
  const { data } = await api.post<{ url?: string }>(PATH[kind], {
    ...body,
    provider: 'stripe',
    successUrl: `${bounce}?kind=${kind}&paid=1&to=${to}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${bounce}?kind=${kind}&cancelled=1&to=${to}`,
  });
  if (!data.url) throw new Error('checkout');
  const result = await WebBrowser.openAuthSessionAsync(data.url, appReturn);
  if (result.type !== 'success') return result.type === 'cancel' ? 'cancelled' : 'dismissed';
  return finishCheckoutReturn(kind, result.url);
}

export async function finishCheckoutReturn(kind: CheckoutKind, url: string): Promise<CheckoutResult> {
  const parsed = Linking.parse(url);
  const query = parsed.queryParams ?? {};
  if (asParam(query.cancelled) === '1') return 'cancelled';
  const sessionId = asParam(query.session_id);
  if (!sessionId) return 'dismissed';
  await api.post(CONFIRM[kind], { sessionId, provider: 'stripe' });
  return 'paid';
}

export function parseCheckoutKind(value?: string): CheckoutKind {
  if (value === 'membership' || value === 'season' || value === 'tickets') return value;
  return 'tickets';
}

function asParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}
