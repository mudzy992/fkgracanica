import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Calendar,
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
};

export const KPI_LABELS: Record<string, string> = {
  users: 'Korisnici',
  members: 'Članovi',
  activeMemberships: 'Aktivna članstva',
  publishedNews: 'Objavljene vijesti',
  matches: 'Utakmice',
  goals: 'Golovi',
  ticketsSold: 'Prodane ulaznice',
};

export const KPI_ICONS: Record<string, LucideIcon> = {
  users: Users,
  members: UserCheck,
  activeMemberships: BadgeCheck,
  publishedNews: Newspaper,
  matches: Calendar,
  goals: Target,
  ticketsSold: Ticket,
};
