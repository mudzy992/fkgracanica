import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(() => ({})), requireOptionalNativeModule: vi.fn(() => null) }));
vi.mock('expo', () => ({}));
vi.mock('expo-image', () => ({ Image: () => 'Image' }));
vi.mock('expo-linear-gradient', () => ({ LinearGradient: ({children}:any)=> children }));
vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn(), requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ granted:true })), MediaTypeOptions: {} }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock('expo-router', () => ({ Stack: Object.assign(() => 'Stack', { Screen: () => 'Screen' }), Redirect: () => 'Redirect', useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useLocalSearchParams: () => ({}) }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  ScrollView: ({children}:any)=> children,
  FlatList: (props:any)=> props.data ? props.data.map((d:any)=> props.renderItem ? props.renderItem({item:d}) : null) : null,
  Modal: ({children}:any)=> children,
  TextInput: (props:any)=> null,
  StyleSheet: { create: (x:any)=> x, absoluteFill: {} as any, absoluteFillObject: {} as any },
  Linking: { openURL: vi.fn() },
  ActivityIndicator: () => 'ActivityIndicator',
  Alert: { alert: vi.fn() },
  Animated: { Value: class { constructor(v:any){} setValue(v:any){} }, timing: () => ({ start: (cb:any)=> cb && cb() }), loop: (a:any)=> ({ start: vi.fn(), stop: vi.fn() }), sequence: (a:any)=> a, View: ({children}:any)=> children },
  AccessibilityInfo: { isReduceMotionEnabled: () => Promise.resolve(false) },
}));
vi.mock('react-native-webview', () => ({ WebView: () => 'WebView' }));
vi.mock('react-native-qrcode-svg', () => ({ default: () => 'QR' }));
vi.mock('@expo/vector-icons', () => ({ Ionicons: () => 'Icon' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../components/ScreenEmpty', () => ({ ScreenEmpty: () => 'Empty' }));
vi.mock('../components/ListSkeleton', () => ({ ListSkeleton: () => 'ListSkeleton' }));
vi.mock('../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../components/primitives/Screen', () => ({ Screen: ({children}:any)=> children }));
vi.mock('../components/primitives/SectionHeader', () => ({ SectionHeader: () => 'SectionHeader' }));
vi.mock('../components/RequirePermission', () => ({ RequirePermission: ({children}:any)=> children }));
vi.mock('../../src/components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../../src/components/RequirePermission', () => ({ RequirePermission: ({children}:any)=> children }));
vi.mock('../../src/components/ListSkeleton', () => ({ ListSkeleton: () => 'ListSkeleton' }));
vi.mock('../../src/components/ScreenEmpty', () => ({ ScreenEmpty: () => 'Empty' }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(()=>Promise.resolve({data:{}})), post: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('../../src/lib/api', () => ({ api: { get: vi.fn(()=>Promise.resolve({data:{}})), post: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('../../lib/api', () => ({ api: { get: vi.fn(()=>Promise.resolve({data:{}})) } }));
vi.mock('../lib/content-helpers', () => ({ asRecord: (x:any)=> x||{}, asString: (x:any)=> String(x||''), asArray: (x:any)=> Array.isArray(x)?x:[] }));
vi.mock('../../src/lib/content-helpers', () => ({ asRecord: (x:any)=> x||{}, asString: (x:any)=> String(x||''), asArray: (x:any)=> Array.isArray(x)?x:[] }));
vi.mock('../../lib/content-helpers', () => ({ asRecord: (x:any)=> x||{}, asString: (x:any)=> String(x||'') }));
vi.mock('../lib/dashboard-kpi-labels', () => ({ kpiLabel: (k:string)=> k }));
vi.mock('../../src/lib/dashboard-kpi-labels', () => ({ kpiLabel: (k:string)=> k }));
vi.mock('./sponsor-tiers', () => ({ SPONSOR_TIER_ACCENT: { gold: '#C9A227', silver: '#ccc', bronze: '#cd7f32' } }));
vi.mock('../components/heritage/sponsor-tiers', () => ({ SPONSOR_TIER_ACCENT: { gold: '#C9A227' } }));
vi.mock('../../components/heritage/sponsor-tiers', () => ({ SPONSOR_TIER_ACCENT: { gold: '#C9A227' } }));
vi.mock('./load-heritage', () => ({ }));
vi.mock('../components/home/HomeLeagueRowItem', () => ({ HomeLeagueRowItem: () => 'HomeLeagueRowItem' }));
vi.mock('../../components/home/HomeLeagueRowItem', () => ({ HomeLeagueRowItem: () => 'HomeLeagueRowItem' }));
vi.mock('./load-team-stats', () => ({ loadClubParticipations: () => Promise.resolve([]), loadClubSeasonStats: () => Promise.resolve({ players: [] }) }));
vi.mock('../components/team/load-team-stats', () => ({ loadClubParticipations: () => Promise.resolve([]), loadClubSeasonStats: () => Promise.resolve({ players: [] }) }));
vi.mock('./club-participation', () => ({ pickDefaultParticipation: () => null }));
vi.mock('../../lib/club-participation', () => ({ pickDefaultParticipation: () => null }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13}, title:{fontSize:22} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13}, title:{fontSize:22} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13}, title:{fontSize:22} } }));
vi.mock('../../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));

import { HeritageMuseumKpis } from '../components/heritage/HeritageMuseumKpis';
import { HeritageSponsorTile } from '../components/heritage/HeritageSponsorTile';
import { AdmissionResultOverlay } from '../components/staff/AdmissionResultOverlay';
import { LeagueStandingsList } from '../components/league/LeagueStandingsList';
import AdminDashboardScreen from '../../app/staff/admin/dashboard';
import AdminAuditScreen from '../../app/staff/admin/audit';
import { TeamSeasonStatsBlock } from '../components/team/TeamSeasonStatsBlock';

describe('mob-batch71 — P-MOB71 heritage/league/admin', () => {
  it('HeritageMuseumKpis exists', () => { expect(typeof HeritageMuseumKpis).toBe('function'); });
  it('HeritageSponsorTile exists', () => { expect(typeof HeritageSponsorTile).toBe('function'); });
  it('AdmissionResultOverlay exists', () => { expect(typeof AdmissionResultOverlay).toBe('function'); });
  it('LeagueStandingsList exists', () => { expect(typeof LeagueStandingsList).toBe('function'); });
  it('AdminDashboardScreen exists', () => { expect(typeof AdminDashboardScreen).toBe('function'); });
  it('AdminAuditScreen exists', () => { expect(typeof AdminAuditScreen).toBe('function'); });
  it('TeamSeasonStatsBlock exists', () => { expect(typeof TeamSeasonStatsBlock).toBe('function'); });
  it('HeritageMuseumKpis renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HeritageMuseumKpis as any, { items: 10, years: 50, categories: 5 });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('AdmissionResultOverlay renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(AdmissionResultOverlay as any, { outcome: 'valid', title: 'OK', detail: 'd', hint: 'h' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('LeagueStandingsList renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(LeagueStandingsList as any, { rows: [] });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('HeritageSponsorTile renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HeritageSponsorTile as any, { item: { title: 'S', imagePath: null, url: null }, tier: 'gold' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
});
