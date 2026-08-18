import { useTranslation } from 'react-i18next';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { RequireAuth } from '../../../src/components/RequireAuth';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { AdminHubLinks } from '../../../src/components/staff/AdminHubLinks';
import { useAuth } from '../../../src/lib/auth';
import { hasAnyPermission } from '../../../src/lib/permissions';

const ADMIN_KEYS = [
  'users.read',
  'settings.read',
  'ticketing.manage',
  'dashboard.read',
  'audit.read',
  'rbac.read',
  'membership.manage',
  'contact.read',
  'newsletter.read',
  'gallery.manage',
  'sponsors.manage',
  'trophies.manage',
  'club-timeline.manage',
  'hall-of-fame.manage',
  'museum.manage',
  'clubs.manage',
  'players.manage',
  'competitions.manage',
  'matches.manage',
];

export default function AdminHubScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canAdmin = hasAnyPermission(user, ADMIN_KEYS);

  if (!canAdmin) {
    return (
      <RequireAuth returnTo="/staff/admin">
        <ScreenEmpty message={t('noAdminAccess')} icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnTo="/staff/admin">
      <Screen scroll>
        <SectionHeader title={t('adminHubHint')} />
        <AdminHubLinks user={user} />
      </Screen>
    </RequireAuth>
  );
}
