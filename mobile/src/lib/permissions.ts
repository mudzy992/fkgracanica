import type { User } from '../types/api';

const STAFF_KEYS = [
  'users.read',
  'settings.read',
  'news.manage',
  'news.submit',
  'news.approve',
  'gallery.manage',
  'gallery.approve',
  'live.manage',
  'live.approve',
  'membership.manage',
  'ticketing.manage',
  'dashboard.read',
  'contact.read',
  'newsletter.read',
  'media.manage',
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
