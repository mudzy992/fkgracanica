import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export function HomeMembershipBand() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handlePress = () => {
    if (isAuthenticated) router.push('/(tabs)/membership');
    else router.push('/login?returnTo=/(tabs)/membership');
  };

  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('joinClub')}
    >
      <LinearGradient
        colors={[colors.primary, '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.band}
      >
        <View style={[styles.glow, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: colors.white }]}>{t('membership')}</Text>
          <Text style={[styles.title, { color: colors.white }]}>{t('joinClub')}</Text>
          <Text style={[styles.desc, { color: colors.white }]}>{t('joinClubDesc')}</Text>
          <View style={styles.ctaRow}>
            <Text style={[styles.ctaLabel, { color: colors.white }]}>{t('homeMembershipCta')}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </View>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
          <Ionicons name="shield-checkmark" size={30} color={colors.white} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  band: {
    borderRadius: 24,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 124,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -48,
    right: -36,
  },
  copy: { flex: 1, paddingRight: spacing.md },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    opacity: 0.82,
    marginBottom: spacing.xs,
  },
  title: { ...typography.title, fontWeight: '800' },
  desc: { ...typography.caption, marginTop: spacing.xs, opacity: 0.9, maxWidth: 240 },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  ctaLabel: { ...typography.caption, fontWeight: '800' },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
