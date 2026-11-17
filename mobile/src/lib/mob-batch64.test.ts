import { describe, expect, it, vi } from 'vitest';
vi.mock('expo-router', () => ({ Stack: { Screen: () => null }, Redirect: () => 'Redirect' }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x },
  ActivityIndicator: () => 'Loading',
}));
vi.mock('react-native-qrcode-svg', () => ({ default: () => 'QR' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../../src/components/RequirePermission', () => ({ RequirePermission: ({children}:any)=> children }));
vi.mock('../../src/components/RequireAuth', () => ({ RequireAuth: ({children}:any)=> children }));
vi.mock('../../src/components/primitives/Screen', () => ({ Screen: ({children}:any)=> children }));
vi.mock('../../src/components/profile/ProfileHub', () => ({ ProfileHub: () => 'Hub' }));
vi.mock('../../src/components/staff/TicketValidateScreen', () => ({ TicketValidateScreen: () => 'Validate' }));
vi.mock('../components/staff/EntityListScreen', () => ({ EntityListScreen: () => 'List' }));
vi.mock('../components/staff/entity-configs', () => ({ sponsorsConfig: { endpoint:'/s', permission:'p', titleKey:'k', fields:[], itemTitle:()=>'t', buildBody:()=>({}) } }));
vi.mock('../../src/components/staff/EntityListScreen', () => ({ EntityListScreen: () => 'List' }));
vi.mock('../../../src/components/staff/EntityListScreen', () => ({ EntityListScreen: () => 'List' }));
vi.mock('../../../src/components/staff/entity-configs', () => ({ sponsorsConfig: { endpoint:'/s', permission:'p', titleKey:'k', fields:[], itemTitle:()=>'t', buildBody:()=>({}) } }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isLoading: false }) }));
vi.mock('../../src/lib/auth', () => ({ useAuth: () => ({ isLoading: false }) }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F8FAFC', textMuted:'#94A3B8', primary:'#1E3A8A', white:'#fff', background:'#050A14', surface:'#0A1525', border:'#334155' } }) }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F8FAFC', textMuted:'#94A3B8', primary:'#1E3A8A', white:'#fff', background:'#050A14', surface:'#0A1525', border:'#334155' } }) }));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F8FAFC', primary:'#1E3A8A', background:'#050A14' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, body:{fontSize:16}, caption:{fontSize:13} } }));
vi.mock('../lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20}, caption:{fontSize:13} } }));
vi.mock('../../src/lib/theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));
vi.mock('../lib/live-clock', () => ({ formatLiveMinute: () => '10’' }));
vi.mock('../../lib/live-clock', () => ({ formatLiveMinute: () => '10’' }));
vi.mock('../lib/match-status', () => ({ matchStatusKey: (s:string)=> s }));
vi.mock('../../lib/match-status', () => ({ matchStatusKey: (s:string)=> s }));
vi.mock('../hooks/use-live-match', () => ({ useLiveMatch: () => ({ match: { homeClub:{name:'H'}, awayClub:{name:'A'}, homeScore:1, awayScore:0, minute:10, status:'LIVE' }, clock: { periodLabel:'1H' } }) }));
vi.mock('../../hooks/use-live-match', () => ({ useLiveMatch: () => ({ match: { homeClub:{name:'H'}, awayClub:{name:'A'}, homeScore:1, awayScore:0, minute:10, status:'LIVE' }, clock: { periodLabel:'1H' } }) }));
vi.mock('./commentator-styles', () => ({ commentatorStyles: { card:{}, label:{}, hint:{} } }));
vi.mock('../components/staff/commentator-styles', () => ({ commentatorStyles: { card:{}, label:{}, hint:{} } }));

import AdminValidateScreen from '../../app/staff/admin/validate';
import UlazScreen from '../../app/staff/ulaz';
import AdminSponsorsScreen from '../../app/staff/admin/sponsors';
import ProfileScreen from '../../app/(tabs)/profile';
import IndexScreen from '../../app/index';
import { CommentatorScoreboard } from '../components/staff/CommentatorScoreboard';
import { QrCodeView } from '../components/QrCodeView';

describe('mob-batch64 — P-MOB64 app/profile/qr', () => {
  it('AdminValidateScreen exists', () => { expect(typeof AdminValidateScreen).toBe('function'); });
  it('UlazScreen exists', () => { expect(typeof UlazScreen).toBe('function'); });
  it('AdminSponsorsScreen exists', () => { expect(typeof AdminSponsorsScreen).toBe('function'); });
  it('ProfileScreen exists', () => { expect(typeof ProfileScreen).toBe('function'); });
  it('IndexScreen exists', () => { expect(typeof IndexScreen).toBe('function'); });
  it('CommentatorScoreboard exists', () => { expect(typeof CommentatorScoreboard).toBe('function'); });
  it('QrCodeView exists', () => { expect(typeof QrCodeView).toBe('function'); });
  it('renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    expect(String(renderToString(React.createElement(AdminValidateScreen as any)))).toBeTruthy();
    expect(String(renderToString(React.createElement(QrCodeView as any, { value:'test' })))).toBeTruthy();
  });
  it('CommentatorScoreboard renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(CommentatorScoreboard as any, { matchId:'1' });
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('ProfileScreen renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ProfileScreen as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('IndexScreen renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(IndexScreen as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
});
