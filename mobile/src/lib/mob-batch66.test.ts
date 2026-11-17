import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(() => ({})), requireOptionalNativeModule: vi.fn(() => null) }));
vi.mock('expo', () => ({}));
vi.mock('expo-image', () => ({ Image: () => 'Image' }));
vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn(), requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ granted:true })), MediaTypeOptions: {} }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock('expo-router', () => ({ Stack: Object.assign(() => 'Stack', { Screen: () => 'Screen' }), Redirect: () => 'Redirect' }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  ScrollView: ({children}:any)=> children,
  Modal: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x, absoluteFill: {} as any, absoluteFillObject: {} as any },
  ActivityIndicator: () => 'ActivityIndicator',
  Linking: { openURL: vi.fn() },
  Animated: {
    Value: class { constructor(v:any){} setValue(v:any){} },
    timing: () => ({ start: (cb:any)=> cb && cb() }),
    View: ({children}:any)=> children,
  },
  AccessibilityInfo: { isReduceMotionEnabled: () => Promise.resolve(false) },
}));
vi.mock('react-native-webview', () => ({ WebView: () => 'WebView' }));
vi.mock('react-native-qrcode-svg', () => ({ default: () => 'QR' }));
vi.mock('@expo/vector-icons', () => ({ Ionicons: () => 'Icon' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../components/ScreenEmpty', () => ({ ScreenEmpty: () => 'Empty' }));
vi.mock('../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../components/QrCodeView', () => ({ QrCodeView: () => 'QrCodeView' }));
vi.mock('../components/LiveEventList', () => ({ LiveEventList: () => 'LiveEventList' }));
vi.mock('../components/live/LiveEventList', () => ({ LiveEventList: () => 'LiveEventList' }));
vi.mock('../components/live/LiveStreamPaused', () => ({ LiveStreamPaused: () => 'LiveStreamPaused' }));
vi.mock('../components/live/LiveStreamPlayer', () => ({ LiveStreamPlayer: () => 'LiveStreamPlayer' }));
vi.mock('./QrCodeView', () => ({ QrCodeView: () => 'QrCodeView' }));
vi.mock('./LiveEventList', () => ({ LiveEventList: () => 'LiveEventList' }));
vi.mock('./MatchScoreRow', () => ({ MatchScoreRow: () => 'MatchScoreRow' }));
vi.mock('../components/live/MatchScoreRow', () => ({ MatchScoreRow: () => 'MatchScoreRow' }));
vi.mock('../../components/live/MatchScoreRow', () => ({ MatchScoreRow: () => 'MatchScoreRow' }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A', primaryLight:'#1E3A8A' } }) }));
vi.mock('../../lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));
vi.mock('./auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../../src/lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('./permissions', () => ({ hasPermission: () => true, hasAnyPermission: () => true }));
vi.mock('../lib/permissions', () => ({ hasPermission: () => true, hasAnyPermission: () => true }));
vi.mock('../../src/lib/permissions', () => ({ hasPermission: () => true, hasAnyPermission: () => true }));
vi.mock('./youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('../lib/youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('../../lib/youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('../../src/lib/youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('./youtube-embed', () => ({ youtubeEmbedHtml: () => '<html></html>', youtubeEmbedOrigin: () => 'https://example.com' }));
vi.mock('../lib/youtube-embed', () => ({ youtubeEmbedHtml: () => '<html></html>', youtubeEmbedOrigin: () => 'https://example.com' }));
vi.mock('../../lib/youtube-embed', () => ({ youtubeEmbedHtml: () => '<html></html>', youtubeEmbedOrigin: () => 'https://example.com' }));
vi.mock('./match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('../lib/match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('../../lib/match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('./media', () => ({ mediaUrl: () => 'https://example.com/img.jpg' }));
vi.mock('../lib/media', () => ({ mediaUrl: () => 'https://example.com/img.jpg' }));
vi.mock('../../src/lib/media', () => ({ mediaUrl: () => 'https://example.com/img.jpg' }));
vi.mock('../hooks/use-live-clock', () => ({ useLiveClock: () => ({ minute: 10 }) }));
vi.mock('../../hooks/use-live-clock', () => ({ useLiveClock: () => ({ minute: 10 }) }));
vi.mock('./live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('../lib/live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('../../lib/live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('../../src/lib/live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('./match-status', () => ({ matchMetaLine: () => 'Round 1' }));
vi.mock('../lib/match-status', () => ({ matchMetaLine: () => 'Round 1' }));
vi.mock('../../lib/match-status', () => ({ matchMetaLine: () => 'Round 1' }));
vi.mock('../../src/lib/match-status', () => ({ matchMetaLine: () => 'Round 1' }));

import { Screen } from '../components/primitives/Screen';
import { ListRow } from '../components/primitives/ListRow';
import { RequireAuth } from '../components/RequireAuth';
import { QrModal } from '../components/QrModal';
import { LiveEventsSheet } from '../components/live/LiveEventsSheet';
import { LiveFeaturedStream } from '../components/live/LiveFeaturedStream';
import { LiveMatchRow } from '../components/live/LiveMatchRow';

describe('mob-batch66 — P-MOB66 primitives/live', () => {
  it('Screen exists', () => { expect(typeof Screen).toBe('function'); });
  it('ListRow exists', () => { expect(typeof ListRow).toBe('function'); });
  it('RequireAuth exists', () => { expect(typeof RequireAuth).toBe('function'); });
  it('QrModal exists', () => { expect(typeof QrModal).toBe('function'); });
  it('LiveEventsSheet exists', () => { expect(typeof LiveEventsSheet).toBe('function'); });
  it('LiveFeaturedStream exists', () => { expect(typeof LiveFeaturedStream).toBe('function'); });
  it('LiveMatchRow exists', () => { expect(typeof LiveMatchRow).toBe('function'); });
  it('Screen renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(Screen as any, { padded: true }, 'child');
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('ListRow renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ListRow as any, { title: 'T', subtitle: 'S' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('RequireAuth renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(RequireAuth as any, { returnTo: '/test' }, 'child');
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('QrModal renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(QrModal as any, { value: 'test-qr', onClose: () => {} });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
});
