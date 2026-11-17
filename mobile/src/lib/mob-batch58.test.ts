import { describe, expect, it, vi } from 'vitest';
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Image: (p:any)=> null,
  Pressable: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x, hairlineWidth: 1 },
  Appearance: { setColorScheme: vi.fn() },
  Alert: { alert: vi.fn() },
  TextInput: (p:any)=> null,
}));
vi.mock('expo-router', () => ({ Link: ({children}:any)=> children }));
vi.mock('../lib/theme-context', () => ({
  useTheme: () => ({ colors: { success: '#16A34A', surface: '#0A1525', textMuted: '#94A3B8', white: '#fff', border: '#334155', background: '#050A14', text: '#F8FAFC', primaryLight: '#93C5FD', primary: '#1E3A8A', danger: '#DC2626' } }),
}));
vi.mock('../lib/media', () => ({ mediaUrl: (u:string)=> u ? `https://cdn.example.com/${u}` : null }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(()=> Promise.resolve({ data: null })), post: vi.fn() } }));
vi.mock('../components/primitives/Screen', () => ({ Screen: ({children}:any)=> children }));
vi.mock('../components/ScreenLoading', () => ({ ScreenLoading: ()=> 'Loading' }));
vi.mock('../components/primitives/PrimaryButton', () => ({ PrimaryButton: ()=> 'Button' }));
import { StatusChip } from '../showcase/StatusChip';
import { CatalogBlock } from '../showcase/CatalogBlock';
import { ShowcaseHero } from '../showcase/ShowcaseHero';
import { ShowcaseCta } from '../showcase/ShowcaseCta';
import { ShowcaseScreen } from '../showcase/ShowcaseScreen';
import { SurfaceTrio } from '../showcase/SurfaceTrio';
describe('mob-batch58 — P-MOB58 showcase batch1', () => {
  it('StatusChip', () => { expect(typeof StatusChip).toBe('function'); });
  it('CatalogBlock', () => { expect(typeof CatalogBlock).toBe('function'); });
  it('ShowcaseHero', () => { expect(typeof ShowcaseHero).toBe('function'); });
  it('ShowcaseCta', () => { expect(typeof ShowcaseCta).toBe('function'); });
  it('ShowcaseScreen', () => { expect(typeof ShowcaseScreen).toBe('function'); });
  it('SurfaceTrio', () => { expect(typeof SurfaceTrio).toBe('function'); });
  it('StatusChip renders ready', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(StatusChip as any, { badge: 'ready' });
    expect(renderToString(el as any)).toBeTruthy();
  });
  it('CatalogBlock renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(CatalogBlock as any, { section: { id:'1', title:'T', body:'B' }, modules: [] });
    expect(renderToString(el as any)).toContain('T');
  });
  it('ShowcaseHero renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const club = { name:'FK', tagline:'t', crestUrl:'', email:'', phone:'', address:'', launchNote:'' };
    const el = React.createElement(ShowcaseHero as any, { club, percent: 50 });
    expect(renderToString(el as any)).toContain('FK');
  });
  it('SurfaceTrio renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(SurfaceTrio as any, { section: { id:'1', title:'T', body:'B' } });
    expect(renderToString(el as any)).toContain('T');
  });
  it('ShowcaseCta renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const club = { name:'FK', tagline:'t', crestUrl:'', email:'', phone:'', address:'', launchNote:'' };
    const el = React.createElement(ShowcaseCta as any, { club });
    expect(renderToString(el as any)).toBeTruthy();
  });
});
