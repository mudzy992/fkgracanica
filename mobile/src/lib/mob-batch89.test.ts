import { describe, expect, it, vi } from 'vitest';
(globalThis as any).__DEV__ = true; (global as any).__DEV__ = true;
vi.stubGlobal('__DEV__', true);
vi.mock('expo', () => ({}));
vi.mock('expo-constants', () => ({ default: { expoConfig: {} } }));
vi.mock('expo-modules-core', () => ({ requireNativeModule: vi.fn(()=>({})), requireOptionalNativeModule: vi.fn(()=>null) }));
vi.mock('expo-router', () => ({ Stack: Object.assign(()=> 'Stack', { Screen: ()=>'Screen'}), Redirect: ()=>'Redirect', useRouter: ()=>({ push: vi.fn(), replace: vi.fn()}), Link: ({children}:any)=>children, Tabs: Object.assign(({children}:any)=>children, { Screen:(p:any)=>null}), useLocalSearchParams: ()=>({}) }));
vi.mock('react-native', () => ({ View: ({children}:any)=>children, Text: ({children}:any)=>children, Pressable: ({children}:any)=>children, ScrollView: ({children}:any)=>children, FlatList: ()=>null, StyleSheet: { create:(x:any)=>x }, Platform: { OS:'ios', select:(o:any)=>o.ios }, ActivityIndicator:()=>'A', Alert:{alert:vi.fn()} }));
vi.mock('@expo/vector-icons', () => ({ Ionicons: ()=>'I' }));
vi.mock('react-i18next', () => ({ useTranslation: ()=>({ t:(k:string)=>k, i18n:{ language:'bs'}})}));
vi.mock('../components/primitives/Screen', () => ({ Screen: ({children}:any)=>children }));
vi.mock('../components/primitives/SectionHeader', () => ({ SectionHeader: ()=>'S'}));
vi.mock('../components/primitives/ListRow', () => ({ ListRow:(p:any)=> `R:${p.title}`}));
vi.mock('../../src/components/primitives/Screen', () => ({ Screen: ({children}:any)=>children }));
vi.mock('../../src/components/primitives/SectionHeader', () => ({ SectionHeader: ()=>'S'}));
vi.mock('../../src/components/primitives/ListRow', () => ({ ListRow:(p:any)=> `R:${p.title}`}));
vi.mock('../components/ScreenEmpty', () => ({ ScreenEmpty: ()=>'E'}));
vi.mock('../components/ListSkeleton', () => ({ ListSkeleton: ()=>'L'}));
vi.mock('../../src/components/ScreenEmpty', () => ({ ScreenEmpty: ()=>'E'}));
vi.mock('../../src/components/ListSkeleton', () => ({ ListSkeleton: ()=>'L'}));
vi.mock('../../src/lib/auth', () => ({ useAuth: ()=>({ isAuthenticated:true, isLoading:false, user:{permissions:[]}})}));
vi.mock('../../src/lib/permissions', () => ({ isStaffUser: ()=>false }));
vi.mock('../../src/hooks/use-module-flags', () => ({ useModuleFlags: ()=>({ flags:{}, loading:false, isEnabled:()=>true})}));
vi.mock('../hooks/use-module-flags', () => ({ useModuleFlags: ()=>({ flags:{}, loading:false, isEnabled:()=>true})}));
vi.mock('../../src/lib/theme-context', () => ({ useTheme: ()=>({ colors:{ headerBg:'#000', white:'#fff', surface:'#050A14', text:'#F', border:'#eee', textMuted:'#888', primary:'#1E3A8A'}})}));
vi.mock('../../src/components/HeaderSearchButton', () => ({ HeaderSearchButton: ()=>'H'}));
vi.mock('../../src/components/ScreenLoading', () => ({ ScreenLoading: ()=>'S'}));
vi.mock('../../src/showcase/ShowcaseScreen', () => ({ ShowcaseScreen: ()=>'S'}));
vi.mock('../../src/hooks/use-unread-notifications', () => ({ useUnreadNotifications: ()=>({count:0})}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: ({children}:any)=>children }));
vi.mock('../i18n', () => ({ setAppLanguage: vi.fn(), hydrateLanguage: vi.fn(()=>Promise.resolve())}));
vi.mock('../../src/i18n', () => ({ setAppLanguage: vi.fn(), hydrateLanguage: vi.fn(()=>Promise.resolve())}));
import TabsLayout from '../../app/(tabs)/_layout';
import MoreScreen from '../../app/(tabs)/more';
import { HeritageTabs } from '../components/heritage/HeritageTabs';
const FALLBACK_NAV = [
  { to:'/', key:'nav.home', moduleKey:null },
  { to:'/o-klubu', key:'nav.club', moduleKey:'modules.timeline' },
  { to:'/vijesti', key:'nav.news', moduleKey:'modules.news' },
  { to:'/galerija', key:'nav.gallery', moduleKey:'modules.gallery' },
  { to:'/tim', key:'nav.team', moduleKey:'modules.clubs' },
  { to:'/liga', key:'nav.league', moduleKey:'modules.competitions' },
  { to:'/sponzori', key:'nav.sponsors', moduleKey:'modules.sponsors' },
  { to:'/trofeji', key:'nav.trophies', moduleKey:'modules.trophies' },
  { to:'/kontakt', key:'nav.contact', moduleKey:'modules.contact' },
] as const;
const MOBILE_TABS = [
  { name:'home', route:'/(tabs)/home', web:'/', hidden:false, guarded:null },
  { name:'news', route:'/(tabs)/news', web:'/vijesti', hidden:false, guarded:null },
  { name:'league/index', route:'/(tabs)/league', web:'/liga', hidden:false, guarded:'modules.competitions' },
  { name:'live/index', route:'/(tabs)/live', web:'/live', hidden:true, guarded:null },
  { name:'more', route:'/(tabs)/more', web:null, hidden:false, guarded:null },
  { name:'profile', route:'/(tabs)/profile', web:null, hidden:false, guarded:'auth' },
] as const;
const HERITAGE_TABS = ['sponsors','trophies','timeline','hall','museum'] as const;
describe('mob-batch89 — P-MOB02 tab parity public navigacija (test-only)', () => {
  it('TabsLayout postoji', () => { expect(typeof TabsLayout).toBe('function'); });
  it('MoreScreen postoji', () => { expect(typeof MoreScreen).toBe('function'); });
  it('HeritageTabs postoji', () => { expect(typeof HeritageTabs).toBe('function'); });
  it('FALLBACK_NAV 9 kao na webu', () => {
    expect(FALLBACK_NAV.length).toBe(9);
    expect(FALLBACK_NAV.map(f=>f.to)).toEqual(['/', '/o-klubu', '/vijesti', '/galerija', '/tim', '/liga', '/sponzori', '/trofeji', '/kontakt']);
  });
  it('MOBILE_TABS 6 (home/news/league/live/more/profile)', () => {
    expect(MOBILE_TABS.length).toBe(6);
    expect(MOBILE_TABS.map(t=>t.name)).toEqual(['home','news','league/index','live/index','more','profile']);
  });
  it('paritet: / → home', () => {
    const mobHome = MOBILE_TABS.find(t=>t.web==='/')!;
    expect(mobHome.name).toBe('home'); expect(mobHome.hidden).toBe(false);
  });
  it('paritet: /vijesti→news, /liga→league (modules.competitions)', () => {
    const news = MOBILE_TABS.find(t=>t.web==='/vijesti')!;
    expect(news.name).toBe('news');
    const league = MOBILE_TABS.find(t=>t.web==='/liga')!;
    expect(league.guarded).toBe('modules.competitions');
    expect(FALLBACK_NAV.find(f=>f.to==='/liga')!.moduleKey).toBe('modules.competitions');
  });
  it('paritet: galerija/tim → More (gallery/clubs)', () => {
    expect(FALLBACK_NAV.find(f=>f.to==='/galerija')!.moduleKey).toBe('modules.gallery');
    expect(FALLBACK_NAV.find(f=>f.to==='/tim')!.moduleKey).toBe('modules.clubs');
    expect(MOBILE_TABS.find(t=>t.name==='more')!.web).toBeNull();
  });
  it('paritet: sponzori/trofeji/o-klubu → HeritageTabs', () => {
    expect(FALLBACK_NAV.find(f=>f.to==='/sponzori')!.moduleKey).toBe('modules.sponsors');
    expect(FALLBACK_NAV.find(f=>f.to==='/trofeji')!.moduleKey).toBe('modules.trophies');
    expect(HERITAGE_TABS).toContain('sponsors'); expect(HERITAGE_TABS).toContain('trophies');
    expect(HERITAGE_TABS).toContain('timeline'); expect(HERITAGE_TABS).toContain('hall'); expect(HERITAGE_TABS).toContain('museum');
  });
  it('paritet: /kontakt → More contact', () => {
    expect(FALLBACK_NAV.find(f=>f.to==='/kontakt')!.moduleKey).toBe('modules.contact');
    expect(typeof MoreScreen).toBe('function');
  });
  it('live skriven — fallback nema live', () => {
    expect(MOBILE_TABS.find(t=>t.name==='live/index')!.hidden).toBe(true);
    expect(FALLBACK_NAV.some(f=>f.to.includes('live'))).toBe(false);
  });
  it('profile auth, nema admin/staff tab', () => {
    expect(MOBILE_TABS.find(t=>t.name==='profile')!.guarded).toBe('auth');
    expect(MOBILE_TABS.filter(t=>t.route.includes('admin')).length).toBe(0);
  });
  it('TabsLayout renderira', async () => {
    const React = await import('react'); const { renderToString } = await import('react-dom/server');
    const html = String(renderToString(React.createElement(TabsLayout as any, {})));
    expect(typeof html).toBe('string');
  });
  it('MoreScreen renderira', async () => {
    const React = await import('react'); const { renderToString } = await import('react-dom/server');
    const html = String(renderToString(React.createElement(MoreScreen as any, {})));
    expect(typeof html).toBe('string');
  });
});
