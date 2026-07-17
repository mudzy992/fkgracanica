import { Ionicons } from '@expo/vector-icons';
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
      style={({ pressed }) => [
        styles.band,
        { backgroundColor: colors.primary, opacity: pressed ? 0.94 : 1 },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('joinClub')}
    >
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.white }]}>{t('joinClub')}</Text>
        <Text style={[styles.desc, { color: colors.white }]}>{t('joinClubDesc')}</Text>
      </View>
      <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
        <Ionicons name="shield-checkmark" size={28} color={colors.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  band: {
    borderRadius: 22,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 100,
  },
  copy: { flex: 1, paddingRight: spacing.md },
  title: { ...typography.heading, fontWeight: '800' },
  desc: { ...typography.caption, marginTop: spacing.xs, opacity: 0.88, maxWidth: 240 },
  iconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
