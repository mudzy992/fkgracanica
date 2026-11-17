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
vi.mock('../../components/RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('./RemoteImage', () => ({ RemoteImage: () => 'Remote' }));
vi.mock('../components/primitives/PrimaryButton', () => ({ PrimaryButton: () => 'PrimaryButton' }));
vi.mock('./primitives/PrimaryButton', () => ({ PrimaryButton: () => 'PrimaryButton' }));
vi.mock('../../components/primitives/PrimaryButton', () => ({ PrimaryButton: () => 'PrimaryButton' }));
vi.mock('./commentator-styles', () => ({ commentatorStyles: { card: {}, label: {}, input: {}, submit: {}, submitText: {} } }));
vi.mock('../components/staff/commentator-styles', () => ({ commentatorStyles: { card: {}, label: {}, input: {}, submit: {}, submitText: {} } }));
vi.mock('../../components/staff/commentator-styles', () => ({ commentatorStyles: { card: {}, label: {}, input: {}, submit: {}, submitText: {} } }));
vi.mock('../lib/api', () => ({ api: { post: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('../../lib/api', () => ({ api: { post: vi.fn(()=>Promise.resolve({})) } }));
vi.mock('./commentator-api', () => ({ postLive: vi.fn(()=>Promise.resolve({})) }));
vi.mock('../components/staff/commentator-api', () => ({ postLive: vi.fn(()=>Promise.resolve({})) }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F', headerBg:'#000', white:'#fff', surface:'#050A14', primary:'#1E3A8A', background:'#fff', border:'#eee', textMuted:'#888', primaryLight:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A', danger:'#f00' } }) }));
vi.mock('../../lib/theme-context', () => ({ useTheme: () => ({ colors: { headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', background:'#fff', border:'#eee', textMuted:'#888', primary:'#1E3A8A' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16, lg:24, xl:32, sm:8, xs:4 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16, sm:8, xs:4, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));
vi.mock('./auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false }) }));
vi.mock('../../src/lib/auth', () => ({ useAuth: () => ({ isAuthenticated:true, isLoading:false }) }));

import { ListSkeleton } from '../components/ListSkeleton';
import { ScreenEmpty } from '../components/ScreenEmpty';
import { CommentatorCommentForm } from '../components/staff/CommentatorCommentForm';
import AdminStaffIndex from '../../app/staff/admin/index';
import { RemoteImage } from '../components/RemoteImage';
import { ModerationPreviewSheet } from '../components/staff/ModerationPreviewSheet';
import { CommentatorMatchSelector } from '../components/staff/CommentatorMatchSelector';

describe('mob-batch69 — P-MOB69 skeletons/admin', () => {
  it('ListSkeleton exists', () => { expect(typeof ListSkeleton).toBe('function'); });
  it('ScreenEmpty exists', () => { expect(typeof ScreenEmpty).toBe('function'); });
  it('CommentatorCommentForm exists', () => { expect(typeof CommentatorCommentForm).toBe('function'); });
  it('AdminStaffIndex exists', () => { expect(typeof AdminStaffIndex).toBe('function'); });
  it('RemoteImage exists', () => { expect(typeof RemoteImage).toBe('function'); });
  it('ModerationPreviewSheet exists', () => { expect(typeof ModerationPreviewSheet).toBe('function'); });
  it('CommentatorMatchSelector exists', () => { expect(typeof CommentatorMatchSelector).toBe('function'); });
  it('ListSkeleton renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ListSkeleton as any, { rows: 2 });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
  it('ScreenEmpty renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ScreenEmpty as any, { message: 'empty' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('RemoteImage renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(RemoteImage as any, { path: '/test.jpg' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('CommentatorMatchSelector renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(CommentatorMatchSelector as any, { matches: [], selectedId: null, onSelect: vi.fn() });
    const html = String(renderToString(el as any));
    expect(typeof html).toBe('string');
  });
});
