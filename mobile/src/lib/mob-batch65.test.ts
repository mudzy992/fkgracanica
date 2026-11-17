import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(() => ({})), requireOptionalNativeModule: vi.fn(() => null) }));
vi.mock('expo', () => ({}));
vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn(), requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ granted:true })), MediaTypeOptions: {} }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock('expo-router', () => ({ Stack: Object.assign(() => 'Stack', { Screen: () => 'Screen' }) }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  Linking: { openURL: vi.fn() },
  StyleSheet: { create: (x:any)=> x, absoluteFill: {} as any, absoluteFillObject: {} as any },
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
vi.mock('../components/media/MediaPickerSheet', () => ({ MediaPickerSheet: () => 'Picker' }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));
vi.mock('./auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../../src/lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('./permissions', () => ({ hasPermission: () => true, hasAnyPermission: () => true }));
vi.mock('../lib/permissions', () => ({ hasPermission: () => true, hasAnyPermission: () => true }));
vi.mock('../../src/lib/permissions', () => ({ hasPermission: () => true, hasAnyPermission: () => true }));
vi.mock('./youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('../lib/youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('../../lib/youtube-id', () => ({ parseYouTubeId: (u:string)=> u ? 'abc123def45' : null }));
vi.mock('./youtube-embed', () => ({ youtubeEmbedHtml: () => '<html></html>', youtubeEmbedOrigin: () => 'https://example.com' }));
vi.mock('../lib/youtube-embed', () => ({ youtubeEmbedHtml: () => '<html></html>', youtubeEmbedOrigin: () => 'https://example.com' }));
vi.mock('../../lib/youtube-embed', () => ({ youtubeEmbedHtml: () => '<html></html>', youtubeEmbedOrigin: () => 'https://example.com' }));
vi.mock('./match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('../lib/match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('../../lib/match-events', () => ({ matchEventLabelKey: (t:string)=> t }));

import StaffLayout from '../../app/staff/_layout';
import { RequirePermission } from '../components/RequirePermission';
import { HomeFadeSection } from '../components/home/HomeFadeSection';
import { MatchHighlightsList } from '../components/MatchHighlightsList';
import { EntityImageField } from '../components/staff/EntityImageField';
import { LiveStreamPlayer } from '../components/live/LiveStreamPlayer';
import { LiveEventToast } from '../components/live/LiveEventToast';

describe('mob-batch65 — P-MOB65 staff/layout', () => {
  it('StaffLayout exists', () => { expect(typeof StaffLayout).toBe('function'); });
  it('RequirePermission exists', () => { expect(typeof RequirePermission).toBe('function'); });
  it('HomeFadeSection exists', () => { expect(typeof HomeFadeSection).toBe('function'); });
  it('MatchHighlightsList exists', () => { expect(typeof MatchHighlightsList).toBe('function'); });
  it('EntityImageField exists', () => { expect(typeof EntityImageField).toBe('function'); });
  it('LiveStreamPlayer exists', () => { expect(typeof LiveStreamPlayer).toBe('function'); });
  it('LiveEventToast exists', () => { expect(typeof LiveEventToast).toBe('function'); });
  it('StaffLayout renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(StaffLayout as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('RequirePermission renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(RequirePermission as any, { permission:'test' }, 'child');
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('LiveEventToast renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(LiveEventToast as any, { event: { type:'GOAL', minute:10, player:{firstName:'A', lastName:'B'} } });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('MatchHighlightsList renders empty', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(MatchHighlightsList as any, { highlights: [], textColor:'#fff', accentColor:'#000' });
    expect(String(renderToString(el as any))).toBe('');
  });
});
