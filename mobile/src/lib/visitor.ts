import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const MOBILE_VISITOR_ID_KEY = 'fk_mobile_visitor_id';

function generateId(): string {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function getOrCreateMobileVisitorId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(MOBILE_VISITOR_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  await SecureStore.setItemAsync(MOBILE_VISITOR_ID_KEY, id);
  return id;
}

export async function trackMobileVisit(): Promise<void> {
  try {
    const visitorId = await getOrCreateMobileVisitorId();
    await api.post('/public-analytics/visit', { platform: 'mobile', visitorId });
  } catch {
    // never crash for analytics
  }
}
