import type { ShowcaseBadge, ShowcaseSurface } from '../../showcase/types';

export const GROUP_KEYS: { badge: ShowcaseBadge; labelKey: string }[] = [
  { badge: 'ready', labelKey: 'admin.stanjeReady' },
  { badge: 'in_progress', labelKey: 'admin.stanjeInProgress' },
  { badge: 'web_only', labelKey: 'admin.stanjeWebOnly' },
  { badge: 'after_launch', labelKey: 'admin.stanjeAfterLaunch' },
];

export const SURFACE_LABELS: Record<ShowcaseSurface, string> = {
  web: 'Web',
  admin: 'Admin',
  mobile: 'Mobilna',
};

export const BAR_CLASS: Record<ShowcaseBadge, string> = {
  ready: 'bg-success',
  in_progress: 'bg-amber-500',
  web_only: 'bg-primary',
  after_launch: 'bg-text-muted/40',
};
