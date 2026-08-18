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
  seasonName: string;
  competitionName?: string;
  teamCount: number;
  roundsPlayed: number;
  leaderName?: string;
  leaderPoints?: number;
  leaderCrestPath?: string;
};

export function LeagueHero({
  seasonName,
  competitionName,
  teamCount,
  roundsPlayed,
  leaderName,
  leaderPoints,
  leaderCrestPath,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.hero, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg }]}>
      {leaderCrestPath ? (
        <RemoteImage
          path={leaderCrestPath}
          variant="original"
          transparent
          contentFit="contain"
          style={styles.crestBg}
        />
      ) : (
        <View style={[styles.glow, { backgroundColor: `${colors.primary}33` }]} />
      )}
      <LinearGradient
        colors={[`${colors.background}CC`, `${colors.background}EE`, colors.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        style={[styles.back, { top: insets.top + spacing.sm, backgroundColor: 'rgba(0,0,0,0.45)' }]}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        accessibilityRole="button"
        accessibilityLabel={t('leagueBackHome')}
      >
        <Ionicons name="arrow-back" size={16} color={colors.white} />
        <Text style={[styles.backText, { color: colors.white }]}>{t('leagueBackHome')}</Text>
      </Pressable>
      <Text style={[styles.kicker, { color: colors.link }]}>
        {competitionName || t('leagueKicker')}
      </Text>
      <Text style={[styles.title, { color: colors.white }]}>{t('leagueTitle')}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        {seasonName || t('leagueFallbackSub')}
      </Text>
      <View style={styles.kpis}>
        <Kpi label={t('leagueTeams')} value={String(teamCount || '—')} />
        <Kpi label={t('leagueRounds')} value={String(roundsPlayed || '—')} />
        <Kpi
          label={t('leagueLeader')}
          value={leaderName ? `${leaderName}` : '—'}
          hint={leaderPoints != null ? `${leaderPoints} ${t('points')}` : undefined}
        />
      </View>
    </View>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.kpi, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border }]}>
      <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.white }]} numberOfLines={1}>
        {value}
      </Text>
      {hint ? <Text style={[styles.kpiHint, { color: colors.link }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  crestBg: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    width: 280,
    height: 280,
    opacity: 0.12,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  glow: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.7,
  },
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
  backText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  title: { ...typography.display, textAlign: 'center', marginTop: spacing.sm },
  sub: { ...typography.body, textAlign: 'center', marginTop: spacing.sm },
  kpis: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  kpi: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  kpiLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: { ...typography.heading, fontWeight: '800', marginTop: 4, fontSize: 14 },
  kpiHint: { ...typography.caption, marginTop: 2, fontWeight: '700' },
});
