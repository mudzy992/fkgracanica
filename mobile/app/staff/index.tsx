import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { ListRow } from '../../src/components/primitives/ListRow';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { useStaffQueueCounts } from '../../src/hooks/use-staff-queue-counts';
import { useAuth } from '../../src/lib/auth';
import { hasAnyPermission, hasPermission, isStaffUser } from '../../src/lib/permissions';

function StaffHubBody() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const counts = useStaffQueueCounts(user);

  if (!isStaffUser(user)) {
    return <ScreenEmpty message={t('noStaffAccess')} icon="lock-closed-outline" />;
  }

  return (
    <Screen scroll>
      <SectionHeader title={t('staffWorkspaceHint')} />
      {hasPermission(user, 'news.submit') || hasPermission(user, 'news.manage') ? (
        <ListRow
          title={t('writer')}
          subtitle={`${counts.drafts} ${t('drafts')} · ${counts.newsPending} ${t('pendingReview')}`}
          icon="create-outline"
          rightText={String(counts.drafts + counts.newsPending)}
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
          title={t('commentatorTitle')}
          subtitle={`${counts.liveNow} ${t('liveNow')} · ${counts.scheduled} ${t('scheduledMatches')}`}
          icon="mic-outline"
          rightText={String(counts.liveNow)}
          onPress={() => router.push('/staff/commentator')}
        />
      ) : null}
      {hasPermission(user, 'news.approve') || hasPermission(user, 'gallery.approve') || hasPermission(user, 'live.approve') ? (
        <ListRow
          title={t('moderator')}
          subtitle={`${counts.newsPending} · ${counts.galleryPending} · ${counts.livePending}`}
          icon="shield-checkmark-outline"
          rightText={String(counts.newsPending + counts.galleryPending + counts.livePending)}
          onPress={() => router.push('/staff/moderation')}
        />
      ) : null}
      {hasAnyPermission(user, ['admissions.scan', 'ticketing.manage']) ? (
        <ListRow
          title={t('ulaz')}
          subtitle={t('ulazHint')}
          icon="qr-code-outline"
          onPress={() => router.push('/staff/ulaz')}
        />
      ) : null}
      {hasPermission(user, 'users.read') || hasPermission(user, 'settings.read') || hasPermission(user, 'ticketing.manage') ? (
        <ListRow
          title={t('adminHub')}
          subtitle={t('adminHubHint')}
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
