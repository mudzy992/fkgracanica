export type ShowcaseBadge = 'ready' | 'in_progress' | 'after_launch' | 'web_only';
export type ShowcaseSurface = 'web' | 'admin' | 'mobile';

export type ShowcaseModule = {
  id: string;
  title: string;
  percent: number;
  badge: ShowcaseBadge;
  surfaces: ShowcaseSurface[];
  summary: string;
};

export type ShowcaseSection = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
  moduleIds?: string[];
};

export type ShowcaseRole = {
  id: string;
  title: string;
  who: string;
  tasks: string[];
};

export type ShowcaseClub = {
  name: string;
  tagline: string;
  crestUrl: string;
  email: string;
  phone: string;
  address: string;
  launchNote: string;
};

export type ShowcasePayload = {
  modeOn: boolean;
  overallPercent: number;
  club: ShowcaseClub;
  modules: ShowcaseModule[];
  sections: ShowcaseSection[];
  roles: ShowcaseRole[];
};

export type PlatformStatusCounts = Record<ShowcaseBadge, number>;

export type PlatformStatusPayload = {
  overallPercent: number;
  counted: number;
  afterLaunch: number;
  counts: PlatformStatusCounts;
  modules: ShowcaseModule[];
};

export function isShowcaseModeOn(value: string | undefined): boolean {
  return value === 'true';
}

export function overallPercentFrom(modules: ShowcaseModule[]): number {
  const counted = modules.filter((m) => m.badge !== 'after_launch');
  if (!counted.length) return 0;
  return Math.round(counted.reduce((sum, m) => sum + m.percent, 0) / counted.length);
}
