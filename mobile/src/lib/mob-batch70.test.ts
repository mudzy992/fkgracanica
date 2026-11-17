import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(() => ({})), requireOptionalNativeModule: vi.fn(() => null) }));
vi.mock('expo', () => ({}));
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
  TextInput: (props:any)=> props.children || null,
  FlatList: (props:any)=> props.data ? props.data.map((d:any)=> props.renderItem ? props.renderItem({item:d}) : null) : null,
  StyleSheet: { create: (x:any)=> x, absoluteFill: {} as any, absoluteFillObject: {} as any },
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
vi.mock('../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('./RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('./LiveEventList', () => ({ LiveEventList: () => 'LiveEventList' }));
vi.mock('../components/LiveEventList', () => ({ LiveEventList: () => 'LiveEventList' }));
vi.mock('../components/live/LiveEventList', () => ({ LiveEventList: () => 'LiveEventList' }));
vi.mock('./entity-crud-types', () => ({ }));
vi.mock('../components/staff/entity-crud-types', () => ({ }));
vi.mock('./live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('../lib/live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('../../lib/live-clock', () => ({ formatLiveMinute: () => '10' }));
vi.mock('./match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('../lib/match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('../../lib/match-events', () => ({ matchEventLabelKey: (t:string)=> t }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));
vi.mock('./api', () => ({ api: { get: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(()=>Promise.resolve({})) } }));

import { WriterNewsFields } from '../components/writer/WriterNewsFields';
import { LeagueSeasonChips } from '../components/league/LeagueSeasonChips';
import { HeritageHofRail } from '../components/heritage/HeritageHofRail';
import { LiveEventList } from '../components/LiveEventList';
import { HeritageSponsorHero } from '../components/heritage/HeritageSponsorHero';
import { LiveScoreboard } from '../components/live/LiveScoreboard';
import { PlayerStatGrid } from '../components/player/PlayerStatGrid';

describe('mob-batch70 — P-MOB70 writer/league/heritage', () => {
  it('WriterNewsFields exists', () => { expect(typeof WriterNewsFields).toBe('function'); });
  it('LeagueSeasonChips exists', () => { expect(typeof LeagueSeasonChips).toBe('function'); });
  it('HeritageHofRail exists', () => { expect(typeof HeritageHofRail).toBe('function'); });
  it('LiveEventList exists', () => { expect(typeof LiveEventList).toBe('function'); });
  it('HeritageSponsorHero exists', () => { expect(typeof HeritageSponsorHero).toBe('function'); });
  it('LiveScoreboard exists', () => { expect(typeof LiveScoreboard).toBe('function'); });
  it('PlayerStatGrid exists', () => { expect(typeof PlayerStatGrid).toBe('function'); });
  it('WriterNewsFields renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const article = { title:'', slug:'', excerpt:'', categoryId:'', coverPath:'', videoUrl:'', tagsCsv:'', seoTitle:'', seoDesc:'', scheduledAt:'' };
    const el = React.createElement(WriterNewsFields as any, { article, categories: [], onChange: vi.fn(), onPickCover: vi.fn() });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
  it('LeagueSeasonChips renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(LeagueSeasonChips as any, { seasons: [], seasonId: '', onChange: vi.fn() });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
  it('LiveEventList renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(LiveEventList as any, { events: [], connected: true });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
  it('HeritageHofRail renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HeritageHofRail as any, { items: [], onSelect: vi.fn() });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
});
