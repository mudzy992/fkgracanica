import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../../src/components/ScreenLoading';
import { api } from '../../../src/lib/api';
import { formatDateTimeBs } from '../../../src/lib/format-date';
import { colors, spacing, typography } from '../../../src/lib/theme';
import type { Match } from '../../../src/types/api';

function Section({
  title,
  matches,
  onPress,
}: {
  title: string;
  matches: Match[];
  onPress: (id: string) => void;
}) {
  if (matches.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {matches.map((m) => (
        <Pressable key={m.id} style={styles.card} onPress={() => onPress(m.id)}>
          <Text style={styles.teams}>
            {m.homeClub.name} vs {m.awayClub.name}
          </Text>
          <Text style={styles.meta}>
            {m.status === 'LIVE' || m.status === 'HALFTIME'
              ? `${m.homeScore} : ${m.awayScore} · ${m.minute}'`
              : formatDateTimeBs(m.scheduledAt)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function LiveListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Match[]>('/matches');
      setMatches(data);
    } catch {
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const { live, upcoming, recent } = useMemo(() => {
    const now = Date.now();
    const liveMs = matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME');
    const upcomingMs = matches
      .filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 10);
    const recentMs = matches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 5);
    return { live: liveMs, upcoming: upcomingMs, recent: recentMs };
  }, [matches]);

  const open = (id: string) => router.push(`/(tabs)/live/${id}`);

  if (loading) return <ScreenLoading />;

  const empty = live.length === 0 && upcoming.length === 0 && recent.length === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, empty && styles.contentEmpty]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load().finally(() => setRefreshing(false));
          }}
        />
      }
    >
      {empty ? <ScreenEmpty message={t('noMatches')} icon="football-outline" /> : null}
      <Section title={t('live')} matches={live} onPress={open} />
      <Section title={t('upcoming')} matches={upcoming} onPress={open} />
      <Section title={t('recent')} matches={recent} onPress={open} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md },
  contentEmpty: { flexGrow: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  teams: { ...typography.heading, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
