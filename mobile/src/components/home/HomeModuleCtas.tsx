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
    <View style={styles.row}>
      {showMembership ? (
        <Pressable
          style={({ pressed }) => [
            styles.action,
            styles.primary,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={goMembership}
          accessibilityRole="button"
          accessibilityLabel={t('joinClub')}
        >
          <Ionicons name="people" size={18} color={colors.white} />
          <Text style={[styles.label, { color: colors.white }]} numberOfLines={1}>
            {t('joinClub')}
          </Text>
        </Pressable>
      ) : null}
      {showTickets ? (
        <Pressable
          style={({ pressed }) => [
            styles.action,
            styles.secondary,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={goTickets}
          accessibilityRole="button"
          accessibilityLabel={t('browseTickets')}
        >
          <Ionicons name="ticket-outline" size={18} color={colors.link} />
          <Text style={[styles.label, { color: colors.link }]} numberOfLines={1}>
            {t('browseTickets')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 46,
  },
  primary: {},
  secondary: { borderWidth: 1 },
  label: { ...typography.caption, fontWeight: '700', flexShrink: 1 },
});
