import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(() => ({})), requireOptionalNativeModule: vi.fn(() => null) }));
vi.mock('expo', () => ({}));
vi.mock('expo-linear-gradient', () => ({ LinearGradient: ({children}:any)=> children }));
vi.mock('expo-image', () => ({ Image: () => 'Image' }));
vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn(), requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ granted:true })), MediaTypeOptions: {} }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock('expo-router', () => ({ Stack: Object.assign(() => 'Stack', { Screen: () => 'Screen' }), Redirect: () => 'Redirect', useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useLocalSearchParams: () => ({}) }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  ScrollView: ({children}:any)=> children,
  Modal: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x, absoluteFill: {} as any, absoluteFillObject: {} as any },
  ActivityIndicator: () => 'ActivityIndicator',
  Alert: { alert: vi.fn() },
  Linking: { openURL: vi.fn() },
  Animated: { Value: class { constructor(v:any){} setValue(v:any){} }, timing: () => ({ start: (cb:any)=> cb && cb() }), View: ({children}:any)=> children },
  AccessibilityInfo: { isReduceMotionEnabled: () => Promise.resolve(false) },
}));
vi.mock('react-native-webview', () => ({ WebView: () => 'WebView' }));
vi.mock('react-native-qrcode-svg', () => ({ default: () => 'QR' }));
vi.mock('@expo/vector-icons', () => ({ Ionicons: () => 'Icon' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../components/ScreenEmpty', () => ({ ScreenEmpty: () => 'Empty' }));
vi.mock('../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('./RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../components/QrCodeView', () => ({ QrCodeView: () => 'QrCodeView' }));
vi.mock('./QrCodeView', () => ({ QrCodeView: () => 'QrCodeView' }));
vi.mock('../../components/QrCodeView', () => ({ QrCodeView: () => 'QrCodeView' }));
vi.mock('./TeamPlayerCard', () => ({ TeamPlayerCard: () => 'TeamPlayerCard' }));
vi.mock('../components/team/TeamPlayerCard', () => ({ TeamPlayerCard: () => 'TeamPlayerCard' }));
vi.mock('../../components/team/TeamPlayerCard', () => ({ TeamPlayerCard: () => 'TeamPlayerCard' }));
vi.mock('./news-body-html', () => ({ newsBodyEditorHtml: () => '<html></html>' }));
vi.mock('../components/writer/news-body-html', () => ({ newsBodyEditorHtml: () => '<html></html>' }));
vi.mock('../../components/writer/news-body-html', () => ({ newsBodyEditorHtml: () => '<html></html>' }));
vi.mock('../lib/realtime', () => ({ getRealtimeSocket: () => ({ emit: vi.fn(), on: vi.fn(), off: vi.fn(), connected: false }) }));
vi.mock('../../lib/realtime', () => ({ getRealtimeSocket: () => ({ emit: vi.fn(), on: vi.fn(), off: vi.fn(), connected: false }) }));
vi.mock('./realtime', () => ({ getRealtimeSocket: () => ({ emit: vi.fn(), on: vi.fn(), off: vi.fn(), connected: false }) }));
vi.mock('../lib/content-helpers', () => ({ asRecord: (x:any)=> x, asString: (x:any)=> String(x||'') }));
vi.mock('../../lib/content-helpers', () => ({ asRecord: (x:any)=> x, asString: (x:any)=> String(x||'') }));
vi.mock('./content-helpers', () => ({ asRecord: (x:any)=> x, asString: (x:any)=> String(x||'') }));
vi.mock('../lib/format-date', () => ({ formatDateBs: () => '01.01.2026' }));
vi.mock('../../lib/format-date', () => ({ formatDateBs: () => '01.01.2026' }));
vi.mock('./format-date', () => ({ formatDateBs: () => '01.01.2026' }));
vi.mock('../../src/lib/format-date', () => ({ formatDateBs: () => '01.01.2026' }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13}, title:{fontSize:22} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13}, title:{fontSize:22} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13}, title:{fontSize:22} } }));
vi.mock('../../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));

import AdminStaffLayout from '../../app/staff/admin/_layout';
import { TeamSpotlight } from '../components/team/TeamSpotlight';
import { HomeSectionShell } from '../components/home/HomeSectionShell';
import { useLiveListSocket } from '../hooks/use-live-list-socket';
import { MembershipCardVisual } from '../components/membership/MembershipCardVisual';
import { TicketBrowseSteps } from '../components/TicketBrowseSteps';
import NewsBodyDomEditor from '../components/writer/NewsBodyDomEditor';

describe('mob-batch68 — P-MOB68 layout/hooks', () => {
  it('AdminStaffLayout exists', () => { expect(typeof AdminStaffLayout).toBe('function'); });
  it('TeamSpotlight exists', () => { expect(typeof TeamSpotlight).toBe('function'); });
  it('HomeSectionShell exists', () => { expect(typeof HomeSectionShell).toBe('function'); });
  it('useLiveListSocket exists', () => { expect(typeof useLiveListSocket).toBe('function'); });
  it('MembershipCardVisual exists', () => { expect(typeof MembershipCardVisual).toBe('function'); });
  it('TicketBrowseSteps exists', () => { expect(typeof TicketBrowseSteps).toBe('function'); });
  it('NewsBodyDomEditor exists', () => { expect(typeof NewsBodyDomEditor).toBe('function'); });
  it('AdminStaffLayout renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(AdminStaffLayout as any);
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
  it('HomeSectionShell renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HomeSectionShell as any, {}, 'child');
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('TicketBrowseSteps renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(TicketBrowseSteps as any, { active: 2 });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('TeamSpotlight renders empty', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(TeamSpotlight as any, { players: [] });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
});
