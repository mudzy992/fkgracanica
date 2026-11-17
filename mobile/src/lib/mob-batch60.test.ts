import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
vi.mock('expo-screen-orientation', () => ({
  unlockAsync: vi.fn(()=> Promise.resolve()),
  lockAsync: vi.fn(()=> Promise.resolve()),
  OrientationLock: { PORTRAIT_UP: 'PORTRAIT_UP' },
}));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  ActivityIndicator: ()=> 'Loading',
  StyleSheet: { create: (x:any)=> x },
  Appearance: { setColorScheme: vi.fn() },
}));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(()=> Promise.resolve({ data: {} })) } }));
vi.mock('./api', () => ({ api: { get: vi.fn(()=> Promise.resolve({ data: {} })) } }));
vi.mock('../lib/theme-context', () => ({
  useTheme: () => ({ colors: { primary: '#1E3A8A', background: '#050A14', text: '#F8FAFC' } }),
  ThemeProvider: ({children}:any)=> children,
}));
vi.mock('./theme-context', () => ({
  useTheme: () => ({ colors: { primary: '#1E3A8A', background: '#050A14', text: '#F8FAFC' } }),
  ThemeProvider: ({children}:any)=> children,
}));
import { useUnlockOrientation } from '../hooks/use-unlock-orientation';
import { useLiveClock } from '../hooks/use-live-clock';
import { isModuleEnabled } from '../hooks/use-module-flags';
import { ScreenLoading } from '../components/ScreenLoading';
import { computeLiveClock } from './live-clock';
describe('mob-batch60 — P-MOB60 hooks/loading', () => {
  it('useUnlockOrientation exists', () => { expect(typeof useUnlockOrientation).toBe('function'); });
  it('useLiveClock exists', () => { expect(typeof useLiveClock).toBe('function'); });
  it('useLiveClock null when not live', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    function Test(){ const c = useLiveClock({ status: 'SCHEDULED', clockStartedAt: null } as any); return React.createElement('div', null, c ? 'live' : 'null'); }
    expect(renderToString(React.createElement(Test))).toContain('null');
  });
  it('useLiveClock live', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const start = new Date(Date.now()-60*1000).toISOString();
    function Test(){ const c = useLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' } as any); return React.createElement('div', null, c ? 'live' : 'null'); }
    expect(renderToString(React.createElement(Test))).toContain('live');
  });
  it('isModuleEnabled true', () => { expect(isModuleEnabled({ a: 'true' }, 'a')).toBe(true); });
  it('isModuleEnabled false', () => { expect(isModuleEnabled({ a: 'false' }, 'a')).toBe(false); });
  it('isModuleEnabled missing', () => { expect(isModuleEnabled({}, 'x')).toBe(true); });
  it('ScreenLoading exists', () => { expect(typeof ScreenLoading).toBe('function'); });
  it('ScreenLoading renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ScreenLoading as any);
    expect(renderToString(el as any)).toContain('Loading');
  });
  it('computeLiveClock FIRST_HALF', () => {
    const start = new Date(Date.now()-65*1000).toISOString();
    const c = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' } as any, Date.now());
    expect(c?.displayMinute).toBeGreaterThanOrEqual(1);
  });
  it('isModuleEnabled edge', () => { expect(isModuleEnabled({ k: '0' }, 'k')).toBe(true); });
});
