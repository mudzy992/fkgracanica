import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Club, Match } from '../../types/api';
import { formatMatchDayLabel, formatMatchTime } from './format-match-display';
import { isMatchLive } from './pick-home-matches';

type Props = {
  match: Match;
  onPress: () => void;
};

function TeamColumn({ club, colors }: { club: Club; colors: { surface: string; text: string } }) {
  return (
    <View style={styles.team}>
      <View style={[styles.crestShell, { backgroundColor: colors.surface }]}>
        <RemoteImage path={club.crestPath} variant="medium" style={styles.crest} />
      </View>
      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={2}>
        {club.shortName ?? club.name}
      </Text>
    </View>
  );
}

export function HomeMatchCard({ match, onPress }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const live = isMatchLive(match);
  const showScore = live || match.status === 'FINISHED';
  const home = match.homeClub.shortName ?? match.homeClub.name;
  const away = match.awayClub.shortName ?? match.awayClub.name;
  const cta = live ? t('followLive') : t('matchDetails');
  const centerLabel = showScore ? `${match.homeScore} : ${match.awayScore}` : formatMatchTime(match.scheduledAt);
  const dayLabel = formatMatchDayLabel(match.scheduledAt, i18n.language);
  const a11y = showScore
    ? `${home} ${match.homeScore} : ${match.awayScore} ${away}`
    : `${home} ${t('vs')} ${away}, ${dayLabel}`;

  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <View style={styles.chipRow}>
        {live ? (
          <View style={[styles.liveChip, { backgroundColor: colors.danger }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.white }]} />
            <Text style={[styles.chipText, { color: colors.white }]}>
              {t('liveNow')}
              {match.minute > 0 ? ` ${match.minute}'` : ''}
            </Text>
          </View>
        ) : (
          <View style={[styles.dayChip, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chipText, { color: colors.link }]}>{dayLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.scoreRow}>
        <TeamColumn club={match.homeClub} colors={colors} />
        <View style={styles.center}>
          <Text style={[styles.centerValue, { color: live ? colors.danger : colors.link }]}>
            {centerLabel}
          </Text>
          {!showScore ? (
            <Text style={[styles.vsHint, { color: colors.textMuted }]}>{t('vs')}</Text>
          ) : live ? (
            <Text style={[styles.vsHint, { color: colors.textMuted }]}>{t('liveNow')}</Text>
          ) : null}
        </View>
        <TeamColumn club={match.awayClub} colors={colors} />
      </View>

      {match.venue ? (
        <View style={styles.venueRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.venue, { color: colors.textMuted }]} numberOfLines={1}>
            {match.venue}
          </Text>
        </View>
      ) : null}

      <View style={[styles.cta, { backgroundColor: live ? colors.danger : colors.primary }]}>
        <Text style={[styles.ctaText, { color: colors.white }]}>{cta}</Text>
        <Ionicons name={live ? 'radio-outline' : 'chevron-forward'} size={18} color={colors.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.sm },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  dayChip: { borderRadius: 999, paddingHorizontal: spacing.sm + 2, paddingVertical: 4 },
  chipText: { ...typography.caption, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { width: 104, alignItems: 'center', gap: spacing.xs },
  crestShell: {
    width: 64,
    height: 64,
    borderRadius: 20,
    padding: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crest: { width: '100%', height: '100%', borderRadius: 14 },
  teamName: { ...typography.caption, minHeight: 34, textAlign: 'center', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  centerValue: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  vsHint: { ...typography.caption, marginTop: 2, fontWeight: '700', textTransform: 'uppercase' },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  venue: { ...typography.caption, flexShrink: 1 },
  cta: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  ctaText: { ...typography.body, fontWeight: '800' },
});
