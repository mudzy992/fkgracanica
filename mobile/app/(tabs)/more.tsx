import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { ListRow } from '../../src/components/primitives/ListRow';
import { useModuleFlags } from '../../src/hooks/use-module-flags';
import { useAuth } from '../../src/lib/auth';
import { setAppLanguage } from '../../src/i18n';
import { isStaffUser } from '../../src/lib/permissions';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

export default function MoreScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { isEnabled } = useModuleFlags();
  const { colors } = useTheme();
  const canAccessStaff = isStaffUser(user);
  const nextLang = i18n.language === 'en' ? 'bs' : 'en';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email ?? '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

  return (
    <Screen scroll>
      <SectionHeader title={t('publicModules')} />
      {isEnabled('modules.gallery') ? (
        <ListRow
          title={t('gallery')}
          subtitle={t('galleryHint')}
          icon="images-outline"
          onPress={() => router.push('/gallery')}
        />
      ) : null}
      {isEnabled('modules.clubs') ? (
        <ListRow
          title={t('teamClub')}
          subtitle={t('teamClubHint')}
          icon="people-outline"
          onPress={() => router.push('/team')}
        />
      ) : null}
      {isEnabled('modules.competitions') ? (
        <ListRow
          title={t('leagueStats')}
          subtitle={t('leagueStatsHint')}
          icon="trophy-outline"
          onPress={() => router.push('/league')}
        />
      ) : null}
      <ListRow
        title={t('heritage')}
        subtitle={t('heritageHint')}
        icon="ribbon-outline"
        onPress={() => router.push('/heritage')}
      />
      <ListRow
        title={t('contact')}
        subtitle={t('contactHint')}
        icon="mail-outline"
        onPress={() => router.push('/contact')}
      />
      <ListRow
        title={t('browseTickets')}
        subtitle={t('ticketsBrowseHint')}
        icon="ticket-outline"
        onPress={() => router.push('/tickets-browse')}
      />
      <ListRow
        title={t('search')}
        subtitle={t('searchHint')}
        icon="search-outline"
        onPress={() => router.push('/search')}
      />
      {isEnabled('modules.cms') ? (
        <ListRow
          title={t('cmsPages')}
          subtitle={t('cmsPagesHint')}
          icon="document-text-outline"
          onPress={() => router.push('/pages')}
        />
      ) : null}
      <SectionHeader title={t('preferences')} />
      <ListRow
        title={t('language')}
        subtitle={i18n.language === 'en' ? t('languageEn') : t('languageBs')}
        icon="language-outline"
        onPress={() => void setAppLanguage(nextLang)}
      />
      <SectionHeader title={t('accountTools')} subtitle={isAuthenticated ? undefined : t('guestMode')} />
      {isAuthenticated ? (
        <>
          <View style={[styles.profileCard, { backgroundColor: colors.background }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.white }]}>{initials}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user?.email}</Text>
            </View>
          </View>
          <ListRow title={t('membership')} icon="id-card-outline" onPress={() => router.push('/(tabs)/membership')} />
          <ListRow title={t('tickets')} icon="ticket-outline" onPress={() => router.push('/(tabs)/tickets')} />
          <ListRow
            title={t('notifications')}
            icon="notifications-outline"
            onPress={() => router.push('/(tabs)/notifications')}
          />
          <ListRow
            title={t('logout')}
            icon="log-out-outline"
            onPress={() => void logout()}
          />
        </>
      ) : (
        <>
          <ListRow
            title={t('membership')}
            subtitle={t('membershipInfo')}
            icon="id-card-outline"
            onPress={() =>
              router.push({ pathname: '/login', params: { returnTo: '/(tabs)/membership' } })
            }
          />
          <ListRow
            title={t('login')}
            subtitle={t('signInForMemberTools')}
            icon="log-in-outline"
            onPress={() => router.push('/login')}
          />
        </>
      )}
      {canAccessStaff ? (
        <>
          <SectionHeader title={t('staffTools')} subtitle={t('staffWorkspaceHint')} />
          <ListRow
            title={t('staffWorkspace')}
            subtitle={t('open')}
            icon="briefcase-outline"
            onPress={() => router.push('/staff')}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.heading, fontSize: 16 },
  profileCopy: { flex: 1 },
  profileName: { ...typography.body, fontWeight: '700' },
  profileEmail: { ...typography.caption, marginTop: spacing.xs },
});
