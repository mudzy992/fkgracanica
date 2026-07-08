import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LiveEventList } from '../../../src/components/LiveEventList';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../../src/components/ScreenLoading';
import { useLiveMatch } from '../../../src/hooks/use-live-match';
import { colors, spacing } from '../../../src/lib/theme';

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { match, connected, loading } = useLiveMatch(id ?? '');

  if (loading && !match) return <ScreenLoading />;

  if (!match) {
    return <ScreenEmpty message={t('error')} icon="alert-circle-outline" />;
  }

  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.scoreboard}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{match.homeClub.name}</Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.score}>
            {match.homeScore} : {match.awayScore}
          </Text>
          {isLive ? (
            <Text style={styles.liveBadge}>
              {t('live')} · {match.minute}&apos;
            </Text>
          ) : (
            <Text style={styles.status}>{match.status}</Text>
          )}
        </View>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{match.awayClub.name}</Text>
        </View>
      </View>

      {match.venue ? <Text style={styles.venue}>{match.venue}</Text> : null}

      <LiveEventList events={match.events ?? []} connected={connected} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  teamBlock: { flex: 1 },
  teamName: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  scoreBlock: { alignItems: 'center', paddingHorizontal: spacing.md },
  score: { fontSize: 32, fontWeight: '700', color: colors.white },
  liveBadge: { color: '#FCA5A5', marginTop: spacing.xs, fontWeight: '600' },
  status: { color: colors.white, opacity: 0.8, marginTop: spacing.xs },
  venue: { textAlign: 'center', color: colors.textMuted, marginBottom: spacing.lg },
});
