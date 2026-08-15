import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { RemoteImage } from '../RemoteImage';

type Props = {
  clubName: string;
  crestPath?: string;
  location?: string;
  formation?: string;
  playerCount: number;
  seasonName?: string;
  points?: number;
  starters: number;
  benchCount: number;
};

export function TeamHero({
  clubName,
  crestPath,
  location,
  formation,
  playerCount,
  seasonName,
  points,
  starters,
  benchCount,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.hero, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg }]}>
      {crestPath ? (
        <RemoteImage
          path={crestPath}
          variant="original"
          transparent
          contentFit="contain"
          style={styles.crestBg}
        />
      ) : null}
      <LinearGradient
        colors={[`${colors.background}AA`, `${colors.background}EE`, colors.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        style={[styles.back, { top: insets.top + spacing.sm, backgroundColor: 'rgba(0,0,0,0.45)' }]}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        accessibilityRole="button"
        accessibilityLabel={t('teamBackHome')}
      >
        <Ionicons name="arrow-back" size={16} color={colors.white} />
        <Text style={[styles.backText, { color: colors.white }]}>{t('teamBackHome')}</Text>
      </Pressable>
      {crestPath ? (
        <RemoteImage
          path={crestPath}
          variant="original"
          transparent
          contentFit="contain"
          style={styles.crest}
        />
      ) : null}
      <Text style={[styles.kicker, { color: colors.link }]}>{t('teamKicker')}</Text>
      <Text style={[styles.title, { color: colors.white }]}>{clubName}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t('teamSubtitle')}</Text>
      {location ? (
        <Text style={[styles.location, { color: 'rgba(255,255,255,0.5)' }]}>{location}</Text>
      ) : null}
      <View style={styles.kpis}>
        <Kpi label={t('teamPlayers')} value={String(playerCount || '—')} />
        <Kpi label={t('teamFormation')} value={formation || '—'} />
        <Kpi label={t('teamSeason')} value={seasonName || '—'} />
        <Kpi label={t('points')} value={points != null ? String(points) : '—'} />
      </View>
      {playerCount > 0 ? (
        <Text style={[styles.lineupHint, { color: 'rgba(255,255,255,0.4)' }]}>
          {t('teamLineupHint', { starters, bench: benchCount })}
        </Text>
      ) : null}
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.kpi, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border }]}>
      <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.white }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, overflow: 'hidden', alignItems: 'center' },
  crestBg: {
    position: 'absolute',
    top: 40,
    width: 260,
    height: 260,
    opacity: 0.1,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  crest: { width: 88, height: 88, marginTop: spacing.xl, borderRadius: 0, backgroundColor: 'transparent' },
  back: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  title: { ...typography.display, fontSize: 32, textTransform: 'uppercase', textAlign: 'center', marginTop: spacing.sm },
  sub: { ...typography.body, textAlign: 'center', marginTop: spacing.sm },
  location: { ...typography.caption, marginTop: spacing.sm },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg, width: '100%' },
  kpi: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  kpiLabel: { ...typography.caption, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { ...typography.heading, fontWeight: '800', marginTop: 4, fontSize: 15 },
  lineupHint: { ...typography.caption, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
});
