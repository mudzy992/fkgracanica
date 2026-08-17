import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Calendar,
  Inbox,
  Newspaper,
  Target,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';

export const KPI_ROUTES: Record<string, string> = {
  users: '/admin/users',
  members: '/admin/membership',
  activeMemberships: '/admin/membership',
  publishedNews: '/admin/news',
  matches: '/admin/competitions',
  goals: '/admin/competitions',
  ticketsSold: '/admin/ticketing',
  pendingNews: '/admin/news',
  pendingGalleries: '/admin/gallery',
  pendingLive: '/admin/live/pending',
  pendingMemberships: '/admin/membership',
  unreadInbox: '/admin/comms',
};

export const KPI_LABELS: Record<string, string> = {
  users: 'Korisnici',
  members: 'Članovi',
  activeMemberships: 'Aktivna članstva',
  publishedNews: 'Objavljene vijesti',
  matches: 'Utakmice',
  goals: 'Golovi',
  ticketsSold: 'Prodane ulaznice',
  pendingNews: 'Vijesti na odobrenju',
  pendingGalleries: 'Galerije na odobrenju',
  pendingLive: 'Live izvještaji',
  pendingMemberships: 'Članarine na čekanju',
  unreadInbox: 'Nepročitan inbox',
};

export const KPI_ICONS: Record<string, LucideIcon> = {
  users: Users,
  members: UserCheck,
  activeMemberships: BadgeCheck,
  publishedNews: Newspaper,
  matches: Calendar,
  goals: Target,
  ticketsSold: Ticket,
  pendingNews: Newspaper,
  pendingGalleries: Newspaper,
  pendingLive: Calendar,
  pendingMemberships: UserCheck,
  unreadInbox: Inbox,
};

export const QUEUE_KPI_KEYS = [
  'pendingMemberships',
  'pendingNews',
  'pendingLive',
  'unreadInbox',
] as const;

export const HEALTH_KPI_KEYS = [
  'activeMemberships',
  'ticketsSold',
  'publishedNews',
] as const;
