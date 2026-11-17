import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(() => ({})), requireOptionalNativeModule: vi.fn(() => null) }));
vi.mock('expo', () => ({}));
vi.mock('expo-image', () => ({ Image: () => 'Image' }));
vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn(), requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ granted:true })), MediaTypeOptions: {} }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock('expo-router', () => ({ Stack: Object.assign(() => 'Stack', { Screen: () => 'Screen' }), Redirect: () => 'Redirect', useLocalSearchParams: () => ({}), useRouter: () => ({ replace: vi.fn() }) }));
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
vi.mock('../lib/api', () => ({ api: { post: vi.fn(()=>Promise.resolve({})), patch: vi.fn(()=>Promise.resolve({})), get: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('../../lib/api', () => ({ api: { post: vi.fn(()=>Promise.resolve({})), patch: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('../../src/lib/api', () => ({ api: { post: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('./api', () => ({ api: { post: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('./api-error', () => ({ getApiErrorMessage: (e:any,fb:string)=>fb }));
vi.mock('../lib/api-error', () => ({ getApiErrorMessage: (e:any,fb:string)=>fb }));
vi.mock('../../lib/api-error', () => ({ getApiErrorMessage: (e:any,fb:string)=>fb }));
vi.mock('../../src/lib/api-error', () => ({ getApiErrorMessage: (e:any,fb:string)=>fb }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));
vi.mock('./auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../../src/lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] }, isLoading:false }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false, user:{ permissions:[] } }) }));
vi.mock('../components/ScreenLoading', () => ({ ScreenLoading: () => 'ScreenLoading' }));
vi.mock('../../components/ScreenLoading', () => ({ ScreenLoading: () => 'ScreenLoading' }));
vi.mock('./start-mobile-checkout', () => ({ parseCheckoutKind: (k:string)=> k || 'tickets' }));
vi.mock('../lib/start-mobile-checkout', () => ({ parseCheckoutKind: (k:string)=> k || 'tickets' }));
vi.mock('../../src/lib/start-mobile-checkout', () => ({ parseCheckoutKind: (k:string)=> k || 'tickets' }));
vi.mock('../../lib/start-mobile-checkout', () => ({ parseCheckoutKind: (k:string)=> k || 'tickets' }));

import { QUICK_EVENTS, EVENT_I18N } from '../components/staff/commentator-events';
import { emptyPlayerValues, buildPlayerBody, playerFieldsWithClubs } from '../components/staff/players-admin';
import { emptyMatchValues, buildMatchBody } from '../components/staff/matches-admin';
import { createLiveActionRunner } from '../components/staff/commentator-api';
import { GalleryPhotoGrid } from '../components/writer/GalleryPhotoGrid';
import { HomeLeagueFormDots } from '../components/home/HomeLeagueFormDots';
import PaymentReturnScreen from '../../app/payment-return';

describe('mob-batch67 — P-MOB67 utils/components', () => {
  it('commentator-events exists', () => { expect(QUICK_EVENTS).toContain('GOAL'); expect(EVENT_I18N.GOAL).toBe('eventGoal'); });
  it('players-admin empty', () => { const v=emptyPlayerValues(); expect(v.position).toBe('MID'); expect(v.firstName).toBe(''); });
  it('players-admin build trims', () => { const b=buildPlayerBody({firstName:' A ', lastName:' B ', clubId:'', position:'DEF', number:'7', bio:' hi '}); expect(b.firstName).toBe('A'); expect(b.number).toBe(7); });
  it('players-admin fields with clubs', () => { const f=playerFieldsWithClubs([{id:'c1', name:'Club'}]); expect(f.find(x=>x.key==='clubId')?.choices).toBeTruthy(); });
  it('matches-admin empty', () => { const v=emptyMatchValues(); expect(v.homeClubId).toBe(''); });
  it('matches-admin build', () => { const b=buildMatchBody({homeClubId:'h', awayClubId:'a', scheduledAt:'2026-01-01T10:00:00Z', venue:' Stad '}, 's1'); expect(b.seasonId).toBe('s1'); expect(b.venue).toBe('Stad'); });
  it('commentator-api runner', async () => { const r=createLiveActionRunner('fb'); expect(typeof r).toBe('function'); await r(async()=>{}); });
  it('GalleryPhotoGrid exists', () => { expect(typeof GalleryPhotoGrid).toBe('function'); });
  it('HomeLeagueFormDots exists', () => { expect(typeof HomeLeagueFormDots).toBe('function'); });
  it('PaymentReturnScreen exists', () => { expect(typeof PaymentReturnScreen).toBe('function'); });
  it('HomeLeagueFormDots renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HomeLeagueFormDots as any, { form: 'WDLWW' });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
});
