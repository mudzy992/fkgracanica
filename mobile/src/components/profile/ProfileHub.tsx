import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../primitives/ListRow';
import { SectionHeader } from '../primitives/SectionHeader';
import { useAuth } from '../../lib/auth';
import { isStaffUser } from '../../lib/permissions';
import { setAppLanguage } from '../../i18n';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export function ProfileHub() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const nextLang = i18n.language === 'en' ? 'bs' : 'en';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email ?? '';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.white }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>
      </View>
      <SectionHeader title={t('accountTools')} />
      <ListRow title={t('membership')} icon="id-card-outline" onPress={() => router.push('/membership')} />
      <ListRow title={t('tickets')} icon="ticket-outline" onPress={() => router.push('/tickets')} />
      <ListRow title={t('buyTickets')} icon="card-outline" onPress={() => router.push('/tickets-buy')} />
      <ListRow
        title={t('notifications')}
        icon="notifications-outline"
        onPress={() => router.push('/notifications')}
      />
      <SectionHeader title={t('preferences')} />
      <ListRow
        title={t('language')}
        subtitle={i18n.language === 'en' ? t('languageEn') : t('languageBs')}
        icon="language-outline"
        onPress={() => void setAppLanguage(nextLang)}
      />
      {isStaffUser(user) ? (
        <ListRow title={t('staffWorkspace')} icon="briefcase-outline" onPress={() => router.push('/staff')} />
      ) : null}
      <ListRow title={t('logout')} icon="log-out-outline" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  hero: { alignItems: 'center', borderRadius: 20, paddingVertical: spacing.xl, paddingHorizontal: spacing.md, gap: spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  initials: { ...typography.title, fontSize: 22 },
  name: { ...typography.title, fontWeight: '800', textAlign: 'center' },
  email: { ...typography.caption },
});
