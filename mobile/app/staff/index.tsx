import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { ListRow } from '../../src/components/primitives/ListRow';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { useAuth } from '../../src/lib/auth';
import { hasPermission, isStaffUser } from '../../src/lib/permissions';

function StaffHubBody() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  if (!isStaffUser(user)) {
    return <ScreenEmpty message="Nemate staff pristup." icon="lock-closed-outline" />;
  }

  return (
    <Screen scroll>
      <SectionHeader title={t('staffWorkspace')} subtitle={t('staffWorkspaceHint')} />
      {hasPermission(user, 'news.submit') || hasPermission(user, 'news.manage') ? (
        <ListRow
          title={t('writer')}
          subtitle={t('writerHint')}
          icon="create-outline"
          onPress={() => router.push('/staff/writer')}
        />
      ) : null}
      {hasPermission(user, 'gallery.manage') ? (
        <ListRow
          title={t('galleryManage')}
          subtitle={t('galleryManageHint')}
          icon="images-outline"
          onPress={() => router.push('/staff/gallery-manage')}
        />
      ) : null}
      {hasPermission(user, 'live.manage') ? (
        <ListRow
          title="Komentator"
          subtitle="Live desk i događaji utakmice"
          icon="mic-outline"
          onPress={() => router.push('/staff/commentator')}
        />
      ) : null}
      {hasPermission(user, 'news.approve') || hasPermission(user, 'gallery.approve') || hasPermission(user, 'live.approve') ? (
        <ListRow
          title="Moderator"
          subtitle="Approve queue i pending sadržaj"
          icon="shield-checkmark-outline"
          onPress={() => router.push('/staff/moderation')}
        />
      ) : null}
      {hasPermission(user, 'users.read') || hasPermission(user, 'settings.read') || hasPermission(user, 'ticketing.manage') ? (
        <ListRow
          title="Administrator"
          subtitle="Korisnici, postavke, validacija, inbox"
          icon="briefcase-outline"
          onPress={() => router.push('/staff/admin')}
        />
      ) : null}
    </Screen>
  );
}

export default function StaffHubScreen() {
  return (
    <RequireAuth returnTo="/staff">
      <StaffHubBody />
    </RequireAuth>
  );
}
