import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useLiveClock } from '../../hooks/use-live-clock';
import { formatLiveMinute } from '../../lib/live-clock';
import { matchMetaLine, matchStatusKey } from '../../lib/match-status';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Match } from '../../types/api';
import { RemoteImage } from '../RemoteImage';
import { ScorePulse } from '../ScorePulse';

type Props = { match: Match };

export function LiveScoreboard({ match }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const clock = useLiveClock(match);
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';
  const meta = matchMetaLine(match, (n) => t('matchRound', { n }));
  const statusLabel = t(matchStatusKey(match.status));
  const clockLabel = formatLiveMinute(clock, match.minute);
  const badge =
    match.status === 'HALFTIME' ? statusLabel : isLive ? `${statusLabel} · ${clockLabel}` : statusLabel;

  return (
    <View style={[styles.board, { backgroundColor: colors.primary }]}>
      <View style={styles.row}>
        <Team name={match.homeClub.name} crestPath={match.homeClub.crestPath} />
        <View style={styles.score}>
          <ScorePulse homeScore={match.homeScore} awayScore={match.awayScore} color={colors.white} />
          <Text style={[styles.badge, { color: isLive ? '#FCA5A5' : colors.white }]}>{badge}</Text>
        </View>
        <Team name={match.awayClub.name} crestPath={match.awayClub.crestPath} />
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {match.venue ? <Text style={styles.meta}>{match.venue}</Text> : null}
    </View>
  );
}

function Team({ name, crestPath }: { name: string; crestPath?: string | null }) {
  const { colors } = useTheme();
  return (
    <View style={styles.team}>
      <RemoteImage path={crestPath} variant="thumb" transparent style={styles.crest} />
      <Text style={[styles.name, { color: colors.white }]} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  crest: { width: 48, height: 48 },
  name: { ...typography.caption, fontWeight: '700', textAlign: 'center' },
  score: { alignItems: 'center', paddingHorizontal: spacing.sm },
  badge: { marginTop: spacing.xs, fontWeight: '700', textTransform: 'uppercase', fontSize: 12 },
  meta: { color: 'rgba(255,255,255,0.75)', textAlign: 'center', ...typography.caption, fontWeight: '600' },
});
