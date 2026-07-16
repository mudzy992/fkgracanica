import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { ListRow } from '../../../src/components/primitives/ListRow';
import { RequireAuth } from '../../../src/components/RequireAuth';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { useAuth } from '../../../src/lib/auth';
import { hasAnyPermission } from '../../../src/lib/permissions';

export default function AdminHubScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const canAdmin = hasAnyPermission(user, ['users.read', 'settings.read', 'ticketing.manage', 'dashboard.read']);

  if (!canAdmin) {
    return (
      <RequireAuth returnTo="/staff/admin">
        <ScreenEmpty message="Nemate administratorski pristup." icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnTo="/staff/admin">
      <Screen scroll>
        <SectionHeader title="Administrator" subtitle="Operativni mobilni workspace." />
        <ListRow title="Dashboard" icon="stats-chart-outline" onPress={() => router.push('/staff/admin/dashboard')} />
        <ListRow title="Korisnici" icon="people-outline" onPress={() => router.push('/staff/admin/users')} />
        <ListRow title="Postavke" icon="settings-outline" onPress={() => router.push('/staff/admin/settings')} />
        <ListRow title="QR validacija" icon="qr-code-outline" onPress={() => router.push('/staff/admin/validate')} />
        <ListRow title="Članstvo" icon="id-card-outline" onPress={() => router.push('/staff/admin/membership')} />
        <ListRow title="Inbox" icon="mail-outline" onPress={() => router.push('/staff/admin/comms')} />
      </Screen>
    </RequireAuth>
  );
}
