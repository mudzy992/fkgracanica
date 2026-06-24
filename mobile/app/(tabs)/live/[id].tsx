import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { api } from '../../../src/lib/api';
import { colors, spacing, typography } from '../../../src/lib/theme';
import type { Match } from '../../../src/types/api';

const POLL_INTERVAL_MS = 15_000;

/** Socket.IO stub — polls match endpoint until realtime gateway is wired. */
function useLiveMatchStub(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      const { data } = await api.get<Match>(`/matches/${matchId}`);
      setMatch(data);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [matchId]);

  useEffect(() => {
    void fetchMatch();
    intervalRef.current = setInterval(() => void fetchMatch(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMatch]);

  return { match, connected };
}

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { match, connected } = useLiveMatchStub(id ?? '');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (match) setInitialLoading(false);
    const timeout = setTimeout(() => setInitialLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [match]);

  if (initialLoading && !match) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t('error')}</Text>
      </View>
    );
  }

  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';

  return (
    <View style={styles.container}>
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

      <View style={styles.stubBox}>
        <Text style={styles.stubTitle}>{t('liveUpdates')}</Text>
        <Text style={styles.stubText}>{t('socketStub')}</Text>
        <Text style={styles.stubStatus}>
          {connected ? '● Polling active' : '○ Disconnected'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  stubBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stubTitle: { ...typography.heading, color: colors.text },
  stubText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  stubStatus: { ...typography.caption, color: colors.success, marginTop: spacing.sm },
  muted: { color: colors.textMuted },
});
