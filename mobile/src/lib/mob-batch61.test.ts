import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('expo-linking', () => ({ createURL: (s:string)=> `fkg://${s}`, parse: (u:string)=> ({ queryParams: {} }) }));
vi.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: vi.fn(), openAuthSessionAsync: vi.fn(()=> Promise.resolve({ type: 'dismiss' })) }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x },
}));
vi.mock('@expo/vector-icons', () => ({ Ionicons: ()=> 'Icon' }));
vi.mock('expo-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../components/RemoteImage', () => ({ RemoteImage: ()=> 'RemoteImage' }));
vi.mock('./use-public-settings', () => ({ usePublicSettings: () => ({ 'club.crestUrl': 'https://cdn.example.com/crest.png' }) }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text: '#F8FAFC', textMuted: '#94A3B8', primary: '#1E3A8A', surface: '#0A1525' } }), ThemeProvider: ({children}:any)=> children }));
vi.mock('./api', () => ({ api: { get: vi.fn(() => Promise.resolve({ data: { membershipAnnualPrice: 10, membershipOnlineEnabled: true, onlineReady: true } })), post: vi.fn(()=> Promise.resolve({ data: { url: 'https://stripe.example/pay' } })) }, API_URL: 'https://api.example.com/api/v1' }));
vi.mock('./start-mobile-checkout', () => ({ startMobileCheckout: vi.fn(() => Promise.resolve('paid')), finishCheckoutReturn: vi.fn(()=> Promise.resolve('paid')), parseCheckoutKind: (x:string)=> x || 'tickets' }));
vi.mock('./theme', () => ({ spacing: { xs:4, sm:8, md:16, lg:24, xl:32 }, typography: { heading: { fontSize:20 }, caption: { fontSize:13 }, title: { fontSize:24 } }, darkColors: { background:'#050A14', text:'#F8FAFC' }, colors: { background:'#050A14', text:'#F8FAFC' }, brand: { primary:'#1E3A8A', accent:'#2563EB' } }));
vi.mock('../lib/media', () => ({ mediaUrl: (u:string)=> u ? `https://cdn.example.com/${u}` : null }));

import { LoginCrest } from '../components/auth/LoginCrest';
import { HomeSectionTitle } from '../components/home/HomeSectionTitle';
import { SectionHeader } from '../components/primitives/SectionHeader';
import { HeaderSearchButton } from '../components/HeaderSearchButton';
import { payMembershipOnline } from '../components/membership/pay-membership-online';
import type { PagerPhoto } from '../components/gallery/photo-pager-types';
import type { EntityCrudConfig } from '../components/staff/entity-crud-types';

describe('mob-batch61 — P-MOB61 auth/home/membership', () => {
  it('LoginCrest exists', () => { expect(typeof LoginCrest).toBe('function'); });
  it('LoginCrest renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(LoginCrest as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('HomeSectionTitle exists', () => { expect(typeof HomeSectionTitle).toBe('function'); });
  it('HomeSectionTitle renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HomeSectionTitle as any, { title: 'Test' });
    expect(String(renderToString(el as any))).toContain('Test');
  });
  it('SectionHeader exists', () => { expect(typeof SectionHeader).toBe('function'); });
  it('SectionHeader renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(SectionHeader as any, { title: 'T', subtitle: 'S' });
    expect(String(renderToString(el as any))).toContain('T');
  });
  it('HeaderSearchButton exists', () => { expect(typeof HeaderSearchButton).toBe('function'); });
  it('HeaderSearchButton renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HeaderSearchButton as any, { color: '#fff' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('payMembershipOnline skipped when not online', async () => {
    const { api } = await import('./api');
    (api.get as any).mockResolvedValueOnce({ data: { membershipAnnualPrice: 0, membershipOnlineEnabled: false, onlineReady: false } });
    expect(await payMembershipOnline('id')).toBe('skipped');
  });
  it('payMembershipOnline paid', async () => {
    const { api } = await import('./api');
    (api.get as any).mockResolvedValueOnce({ data: { membershipAnnualPrice: 10, membershipOnlineEnabled: true, onlineReady: true } });
    expect(await payMembershipOnline('id')).toBe('paid');
  });
  it('types', () => {
    const p: PagerPhoto = { id: '1', path: '/a' };
    const c: EntityCrudConfig = { endpoint: '/a', permission: 'p', titleKey: 'k', fields: [], itemTitle: () => 't', buildBody: () => ({}) };
    expect(p.id).toBe('1'); expect(c.endpoint).toBe('/a');
  });
});
