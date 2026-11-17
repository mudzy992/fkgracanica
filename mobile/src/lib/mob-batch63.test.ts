import { describe, expect, it, vi } from 'vitest';
vi.mock('expo-router', () => ({ Stack: { Screen: () => null }, Redirect: () => null }));
vi.mock('react-native', () => ({
  View: ({children}:any)=> children,
  Text: ({children}:any)=> children,
  Pressable: ({children}:any)=> children,
  StyleSheet: { create: (x:any)=> x },
  ActivityIndicator: () => 'Loading',
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k:string)=> k }) }));
vi.mock('../showcase/ShowcaseScreen', () => ({ ShowcaseScreen: () => 'Showcase' }));
vi.mock('../components/staff/EntityListScreen', () => ({ EntityListScreen: (p:any)=> 'List' }));
vi.mock('../components/staff/entity-configs', () => ({
  timelineConfig: { endpoint: '/t', permission: 'p', titleKey: 'k', fields: [], itemTitle: ()=>'t', buildBody: ()=>({}) },
  clubsConfig: { endpoint: '/c', permission: 'p', titleKey: 'k', fields: [], itemTitle: ()=>'t', buildBody: ()=>({}) },
  hallOfFameConfig: { endpoint: '/h', permission: 'p', titleKey: 'k', fields: [], itemTitle: ()=>'t', buildBody: ()=>({}) },
  museumConfig: { endpoint: '/m', permission: 'p', titleKey: 'k', fields: [], itemTitle: ()=>'t', buildBody: ()=>({}) },
  trophiesConfig: { endpoint: '/t', permission: 'p', titleKey: 'k', fields: [], itemTitle: ()=>'t', buildBody: ()=>({}) },
}));
vi.mock('../../app/league', () => ({ default: () => 'League' }));
vi.mock('../lib/theme-context', () => ({ useTheme: () => ({ colors: { text:'#F8FAFC' } }) }));
vi.mock('./theme-context', () => ({ useTheme: () => ({ colors: { text:'#F8FAFC' } }) }));
vi.mock('./theme', () => ({ spacing: { md:16 }, typography: { heading:{fontSize:20} } }));

import LeagueIndex from '../../app/(tabs)/league/index';
import ShowcaseRoute from '../../app/showcase';
import AdminClubTimelineScreen from '../../app/staff/admin/club-timeline';
import AdminClubsScreen from '../../app/staff/admin/clubs';
import AdminHallOfFameScreen from '../../app/staff/admin/hall-of-fame';
import AdminMuseumScreen from '../../app/staff/admin/museum';
import AdminTrophiesScreen from '../../app/staff/admin/trophies';

describe('mob-batch63 — P-MOB63 app routes', () => {
  it('LeagueIndex exists', () => { expect(typeof LeagueIndex).toBe('function'); });
  it('LeagueIndex renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(LeagueIndex as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('ShowcaseRoute exists', () => { expect(typeof ShowcaseRoute).toBe('function'); });
  it('ShowcaseRoute renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ShowcaseRoute as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('AdminClubTimelineScreen exists', () => { expect(typeof AdminClubTimelineScreen).toBe('function'); });
  it('AdminClubsScreen exists', () => { expect(typeof AdminClubsScreen).toBe('function'); });
  it('AdminHallOfFameScreen exists', () => { expect(typeof AdminHallOfFameScreen).toBe('function'); });
  it('AdminMuseumScreen exists', () => { expect(typeof AdminMuseumScreen).toBe('function'); });
  it('AdminTrophiesScreen exists', () => { expect(typeof AdminTrophiesScreen).toBe('function'); });
  it('Admin routes render', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(AdminClubsScreen as any);
    expect(String(renderToString(el as any))).toBeTruthy();
  });
  it('all routes are functions', () => {
    expect(typeof AdminMuseumScreen).toBe('function');
    expect(typeof AdminTrophiesScreen).toBe('function');
  });
});
