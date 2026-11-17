import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true;
(global as any).__DEV__ = true;
vi.mock('expo-linear-gradient', () => ({ LinearGradient: () => 'Gradient' }));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x, absoluteFill: {} as any, hairlineWidth: 1 },
  ActivityIndicator: () => 'Loading',
  Animated: {
    Value: class { constructor(v:any){ this.val=v } },
    timing: () => ({ start: (cb:any)=> cb && cb() }),
    sequence: (arr:any)=> ({ start: (cb:any)=> cb && cb() }),
    Text: ({children}:any)=> children,
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../components/RemoteImage', () => ({ RemoteImage: () => 'RemoteImage' }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F8FAFC', textMuted:'#94A3B8', primary:'#1E3A8A', white:'#fff', background:'#050A14', surface:'#0A1525', border:'#334155', link:'#93C5FD' } }) }));
vi.mock('./theme', () => ({ spacing: { xs:4, sm:8, md:16, lg:24, xl:32 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('./html-text', () => ({ htmlToParagraphs: (s:string)=> s ? [s] : [] }));

import { PrimaryButton } from '../components/primitives/PrimaryButton';
import { NewsHtmlBody } from '../components/news/NewsHtmlBody';
import { commentatorStyles } from '../components/staff/commentator-styles';
import { CountStrip } from '../components/staff/CountStrip';
import { HeritageFilmPhoto } from '../components/heritage/HeritageFilmPhoto';
import { ScorePulse } from '../components/ScorePulse';
import { HeritageTimelineShade } from '../components/heritage/HeritageTimelineShade';

describe('mob-batch62 — P-MOB62 primitives/heritage', () => {
  it('PrimaryButton exists', () => { expect(typeof PrimaryButton).toBe('function'); });
  it('PrimaryButton renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(PrimaryButton as any, { label: 'Test', onPress: ()=>{} });
    expect(String(renderToString(el as any))).toContain('Test');
  });
  it('NewsHtmlBody exists', () => { expect(typeof NewsHtmlBody).toBe('function'); });
  it('NewsHtmlBody renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(NewsHtmlBody as any, { html: '<p>Hello</p>' });
    expect(String(renderToString(el as any))).toContain('Hello');
  });
  it('commentatorStyles exists', () => { expect(commentatorStyles.card).toBeTruthy(); });
  it('CountStrip exists', () => { expect(typeof CountStrip).toBe('function'); });
  it('CountStrip renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(CountStrip as any, { items: [{ label:'A', value:1 }] });
    expect(String(renderToString(el as any))).toContain('A');
  });
  it('HeritageFilmPhoto exists', () => { expect(typeof HeritageFilmPhoto).toBe('function'); });
  it('HeritageFilmPhoto renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(HeritageFilmPhoto as any, { path: '/img.jpg' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('ScorePulse exists', () => { expect(typeof ScorePulse).toBe('function'); });
  it('HeritageTimelineShade exists', () => { expect(typeof HeritageTimelineShade).toBe('function'); });
});
