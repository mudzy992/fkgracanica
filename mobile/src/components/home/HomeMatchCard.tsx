import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { formatDateTimeBs } from '../../lib/format-date';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Club, Match } from '../../types/api';
import { isMatchLive } from './pick-home-matches';

type Props = {
  match: Match;
  onPress: () => void;
};

function TeamMark({ club }: { club: Club }) {
  const { colors } = useTheme();
  return (
    <View style={styles.team}>
      <View style={[styles.crestShell, { backgroundColor: colors.surface }]}>
        <RemoteImage path={club.crestPath} variant="thumb" style={styles.crest} />
      </View>
      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={2}>
        {club.shortName ?? club.name}
      </Text>
    </View>
  );
}

export function HomeMatchCard({ match, onPress }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const live = isMatchLive(match);
  const showScore = live || match.status === 'FINISHED';
  const home = match.homeClub.shortName ?? match.homeClub.name;
  const away = match.awayClub.shortName ?? match.awayClub.name;
  const cta = live ? t('followLive') : t('matchDetails');
  const label = showScore
    ? `${home} ${match.homeScore} : ${match.awayScore} ${away}`
    : `${home} ${t('vs')} ${away}`;

  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.topRow}>
        {live ? (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>{t('liveNow')}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.scoreRow}>
        <TeamMark club={match.homeClub} />
        <Text style={[styles.score, { color: colors.primary }]}>
          {showScore ? `${match.homeScore} : ${match.awayScore}` : t('vs')}
        </Text>
        <TeamMark club={match.awayClub} />
      </View>
      <View style={styles.metaBlock}>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{formatDateTimeBs(match.scheduledAt)}</Text>
        {match.venue ? <Text style={[styles.meta, { color: colors.textMuted }]}>{match.venue}</Text> : null}
      </View>
      <Text style={[styles.link, { color: colors.accent }]}>{cta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  badge: { borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { ...typography.caption, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  team: { width: 96, alignItems: 'center', gap: spacing.xs },
  crestShell: { width: 54, height: 54, borderRadius: 16, padding: spacing.xs },
  crest: { width: '100%', height: '100%', borderRadius: 12 },
  teamName: { ...typography.caption, minHeight: 32, textAlign: 'center', fontWeight: '700' },
  score: { ...typography.title, minWidth: 72, textAlign: 'center' },
  metaBlock: { marginTop: spacing.md, alignItems: 'center' },
  meta: { ...typography.caption, marginTop: spacing.xs },
  link: { marginTop: spacing.sm, fontWeight: '600', textAlign: 'center' },
});
