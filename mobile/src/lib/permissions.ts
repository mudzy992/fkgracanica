import type { User } from '../types/api';

const STAFF_KEYS = [
  'users.read',
  'users.create',
  'users.update',
  'settings.read',
  'rbac.read',
  'rbac.update',
  'audit.read',
  'news.manage',
  'news.submit',
  'news.approve',
  'gallery.manage',
  'gallery.approve',
  'sponsors.manage',
  'trophies.manage',
  'club-timeline.manage',
  'hall-of-fame.manage',
  'museum.manage',
  'clubs.manage',
  'players.manage',
  'competitions.manage',
  'matches.manage',
  'live.manage',
  'live.approve',
  'membership.manage',
  'ticketing.manage',
  'dashboard.read',
  'analytics.read',
  'contact.read',
  'newsletter.read',
  'media.read',
  'media.upload',
  'media.manage',
  'cms.manage',
];

export function hasPermission(user: User | null | undefined, key: string): boolean {
  return !!user?.permissions?.includes(key);
}

export function hasAnyPermission(user: User | null | undefined, keys: string[]): boolean {
  return keys.some((key) => hasPermission(user, key));
}

export function isStaffUser(user: User | null | undefined): boolean {
  return hasAnyPermission(user, STAFF_KEYS);
}
