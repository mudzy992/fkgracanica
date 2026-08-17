import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LiveEventList } from '../../../src/components/LiveEventList';
import { ScorePulse } from '../../../src/components/ScorePulse';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../../src/components/ScreenLoading';
import { useLiveMatch } from '../../../src/hooks/use-live-match';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing } from '../../../src/lib/theme';
import { MatchHighlightsList } from '../../../src/components/MatchHighlightsList';

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { match, connected, loading } = useLiveMatch(id ?? '');

  if (loading && !match) return <ScreenLoading />;

  if (!match) {
    return <ScreenEmpty message={t('error')} icon="alert-circle-outline" />;
  }

  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
      <View style={[styles.scoreboard, { backgroundColor: colors.primary }]}>
        <View style={styles.teamBlock}>
          <Text style={[styles.teamName, { color: colors.white }]}>{match.homeClub.name}</Text>
        </View>
        <View style={styles.scoreBlock}>
          <ScorePulse homeScore={match.homeScore} awayScore={match.awayScore} color={colors.white} />
          {isLive ? (
            <Text style={styles.liveBadge}>
              {t('live')} · {match.minute}&apos;
            </Text>
          ) : (
            <Text style={[styles.status, { color: colors.white }]}>{match.status}</Text>
          )}
        </View>
        <View style={styles.teamBlock}>
          <Text style={[styles.teamName, { color: colors.white }]}>{match.awayClub.name}</Text>
        </View>
      </View>
      {match.venue ? <Text style={[styles.venue, { color: colors.textMuted }]}>{match.venue}</Text> : null}
      <LiveEventList events={match.events ?? []} connected={connected} />
      <MatchHighlightsList
        highlights={match.highlights}
        textColor={colors.text}
        accentColor={colors.primary}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  teamBlock: { flex: 1 },
  teamName: { fontWeight: '600', textAlign: 'center' },
  scoreBlock: { alignItems: 'center', paddingHorizontal: spacing.md },
  liveBadge: { color: '#FCA5A5', marginTop: spacing.xs, fontWeight: '600' },
  status: { opacity: 0.8, marginTop: spacing.xs },
  venue: { textAlign: 'center', marginBottom: spacing.lg },
});
