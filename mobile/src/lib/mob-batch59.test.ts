import { describe, expect, it, vi } from 'vitest';
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x, hairlineWidth: 1 },
}));
vi.mock('../lib/theme-context', () => ({
  useTheme: () => ({ colors: { text: '#F8FAFC', textMuted: '#94A3B8', background: '#050A14', border: '#334155', primary: '#1E3A8A', primaryLight: '#93C5FD', success: '#16A34A' } }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(()=> Promise.resolve({ data: null })) } }));
import { JourneyStrip } from '../showcase/JourneyStrip';
import { PhonePreview } from '../showcase/PhonePreview';
import { RoadmapBlock } from '../showcase/RoadmapBlock';
import { RolesBlock } from '../showcase/RolesBlock';
import { useShowcase } from '../showcase/use-showcase';
describe('mob-batch59 — P-MOB59 showcase batch2', () => {
  it('JourneyStrip', () => { expect(typeof JourneyStrip).toBe('function'); });
  it('PhonePreview', () => { expect(typeof PhonePreview).toBe('function'); });
  it('RoadmapBlock', () => { expect(typeof RoadmapBlock).toBe('function'); });
  it('RolesBlock', () => { expect(typeof RolesBlock).toBe('function'); });
  it('useShowcase', () => { expect(typeof useShowcase).toBe('function'); });
  it('JourneyStrip renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(JourneyStrip as any, { section: { id:'1', title:'T', body:'B' }, modules: [] });
    expect(renderToString(el as any)).toContain('T');
  });
  it('PhonePreview renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(PhonePreview as any, { section: { id:'1', title:'T', body:'B' }, modules: [] });
    expect(renderToString(el as any)).toContain('T');
  });
  it('RoadmapBlock renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(RoadmapBlock as any, { modules: [{ id:'1', title:'M', percent:10, badge:'ready', summary:'s' }] });
    expect(renderToString(el as any)).toContain('M');
  });
  it('RolesBlock renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(RolesBlock as any, { roles: [{ id:'1', title:'R', who:'who', tasks:['a'] }] });
    expect(renderToString(el as any)).toContain('R');
  });
  it('RoadmapBlock empty', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(RoadmapBlock as any, { modules: [] });
    expect(renderToString(el as any)).toContain('Mapa');
  });
  it('JourneyStrip with modules', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(JourneyStrip as any, { section: { id:'1', title:'T', body:'B', moduleIds:['1'] }, modules: [{ id:'1', title:'M', percent:50, badge:'ready', summary:'s' }] });
    expect(renderToString(el as any)).toContain('M');
  });
});
