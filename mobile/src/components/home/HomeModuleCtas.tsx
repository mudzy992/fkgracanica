import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

type Props = {
  showMembership: boolean;
  showTickets: boolean;
};

export function HomeModuleCtas({ showMembership, showTickets }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (!showMembership && !showTickets) return null;

  const goMembership = () => {
    if (isAuthenticated) router.push('/(tabs)/membership');
    else router.push('/login?returnTo=/(tabs)/membership');
  };

  const goTickets = () => {
    if (isAuthenticated) router.push('/tickets-buy');
    else router.push('/tickets-browse');
  };

  return (
    <View style={styles.stack}>
      {showMembership ? (
        <Pressable
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
          ]}
          onPress={goMembership}
          accessibilityRole="button"
          accessibilityLabel={t('joinClub')}
        >
          <View style={styles.labelWrap}>
            <Text style={[styles.primaryTitle, { color: colors.white }]}>{t('joinClub')}</Text>
            <Text style={[styles.primarySub, { color: colors.white }]}>{t('joinClubDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </Pressable>
      ) : null}
      {showTickets ? (
        <Pressable
          style={({ pressed }) => [
            styles.secondary,
            { backgroundColor: colors.background, opacity: pressed ? 0.92 : 1 },
          ]}
          onPress={goTickets}
          accessibilityRole="button"
          accessibilityLabel={t('browseTickets')}
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>{t('browseTickets')}</Text>
          <Ionicons name="ticket-outline" size={20} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 72,
  },
  labelWrap: { flex: 1, paddingRight: spacing.sm },
  primaryTitle: { ...typography.heading, fontWeight: '800' },
  primarySub: { ...typography.caption, marginTop: spacing.xs, opacity: 0.88 },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  secondaryText: { ...typography.body, fontWeight: '700' },
});
