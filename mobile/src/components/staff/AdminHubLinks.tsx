import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../primitives/SectionHeader';
import { ListRow } from '../primitives/ListRow';
import { hasPermission } from '../../lib/permissions';
import type { User } from '../../types/api';

type Props = { user: User | null | undefined };

type Link = {
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  permission: string;
};

const OPS: Link[] = [
  { titleKey: 'dashboard', icon: 'stats-chart-outline', href: '/staff/admin/dashboard', permission: 'dashboard.read' },
  { titleKey: 'users', icon: 'people-outline', href: '/staff/admin/users', permission: 'users.read' },
  { titleKey: 'roles', icon: 'shield-checkmark-outline', href: '/staff/admin/roles', permission: 'rbac.read' },
  { titleKey: 'settings', icon: 'settings-outline', href: '/staff/admin/settings', permission: 'settings.read' },
  { titleKey: 'auditLog', icon: 'document-text-outline', href: '/staff/admin/audit', permission: 'audit.read' },
  { titleKey: 'orders', icon: 'ticket-outline', href: '/staff/admin/orders', permission: 'ticketing.manage' },
  { titleKey: 'qrValidate', icon: 'qr-code-outline', href: '/staff/admin/validate', permission: 'ticketing.manage' },
  { titleKey: 'membershipAdmin', icon: 'id-card-outline', href: '/staff/admin/membership', permission: 'membership.manage' },
  { titleKey: 'galleryManage', icon: 'images-outline', href: '/staff/gallery-manage', permission: 'gallery.manage' },
  { titleKey: 'inbox', icon: 'mail-outline', href: '/staff/admin/comms', permission: 'contact.read' },
];

const CRUD: Link[] = [
  { titleKey: 'sponsors', icon: 'ribbon-outline', href: '/staff/admin/sponsors', permission: 'sponsors.manage' },
  { titleKey: 'trophies', icon: 'trophy-outline', href: '/staff/admin/trophies', permission: 'trophies.manage' },
  { titleKey: 'timeline', icon: 'time-outline', href: '/staff/admin/club-timeline', permission: 'club-timeline.manage' },
  { titleKey: 'hallOfFame', icon: 'star-outline', href: '/staff/admin/hall-of-fame', permission: 'hall-of-fame.manage' },
  { titleKey: 'museum', icon: 'business-outline', href: '/staff/admin/museum', permission: 'museum.manage' },
  { titleKey: 'clubs', icon: 'football-outline', href: '/staff/admin/clubs', permission: 'clubs.manage' },
  { titleKey: 'players', icon: 'people-outline', href: '/staff/admin/players', permission: 'players.manage' },
  { titleKey: 'competitions', icon: 'medal-outline', href: '/staff/admin/competitions', permission: 'competitions.manage' },
  { titleKey: 'matches', icon: 'calendar-outline', href: '/staff/admin/matches', permission: 'matches.manage' },
];

function Links({ links, user }: { links: Link[]; user: Props['user'] }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <>
      {links
        .filter((link) => hasPermission(user, link.permission))
        .map((link) => (
          <ListRow
            key={link.href}
            title={t(link.titleKey)}
            icon={link.icon}
            onPress={() => router.push(link.href as '/staff/admin')}
          />
        ))}
    </>
  );
}

export function AdminHubLinks({ user }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeader title={t('adminOps')} subtitle={t('adminHubHint')} />
      <Links links={OPS} user={user} />
      <SectionHeader title={t('adminEntities')} subtitle={t('adminEntitiesHint')} />
      <Links links={CRUD} user={user} />
    </>
  );
}
