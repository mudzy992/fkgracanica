import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

type Props = { height: number };

export function HeritageTimelineCoda({ height }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.root, { height, backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['rgba(5,10,20,0.95)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,102,255,0.16)']}
        locations={[0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={[styles.kicker, { color: colors.primaryLight }]}>{t('storyToday')}</Text>
      <Text style={styles.title}>{t('storyContinues')}</Text>
      <Text style={styles.body}>{t('storyCodaBody')}</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/team')}
          accessibilityRole="button"
          accessibilityLabel={t('storyFirstTeam')}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.btnLabel, { color: colors.white }]}>{t('storyFirstTeam')}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(tabs)/membership')}
          accessibilityRole="button"
          accessibilityLabel={t('homeMembershipCta')}
          style={styles.outline}
        >
          <Text style={[styles.btnLabel, { color: 'rgba(255,255,255,0.85)' }]}>{t('homeMembershipCta')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  kicker: { ...typography.caption, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  title: { ...typography.title, color: '#fff', fontWeight: '800', textAlign: 'center', marginTop: spacing.sm },
  body: {
    ...typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 360,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg },
  btn: { borderRadius: 999, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  outline: {
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btnLabel: { ...typography.caption, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
