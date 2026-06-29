import type { User } from '../types';

export function userInitials(user: Pick<User, 'email' | 'firstName' | 'lastName'>): string {
  const first = user.firstName?.trim().charAt(0) ?? '';
  const last = user.lastName?.trim().charAt(0) ?? '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email.charAt(0).toUpperCase();
}
