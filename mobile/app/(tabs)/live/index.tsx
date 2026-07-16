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
import { ListSkeleton } from '../../../src/components/ListSkeleton';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { formatDateTimeBs } from '../../../src/lib/format-date';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';
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
  const { colors } = useTheme();
  if (matches.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {matches.map((m) => (
        <Pressable
          key={m.id}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => onPress(m.id)}
          accessibilityRole="button"
        >
          <Text style={[styles.teams, { color: colors.text }]}>
            {m.homeClub.name} vs {m.awayClub.name}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<Match[]>('/matches');
      setMatches(data);
    } catch {
      setMatches([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const { live, upcoming, recent } = useMemo(() => {
    const now = Date.now();
    return {
      live: matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME'),
      upcoming: matches
        .filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt).getTime() >= now)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 10),
      recent: matches
        .filter((m) => m.status === 'FINISHED')
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 5),
    };
  }, [matches]);

  if (loading) return <ListSkeleton />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void load().finally(() => setLoading(false));
        }}
      />
    );
  }

  const open = (id: string) => router.push(`/(tabs)/live/${id}`);
  const empty = live.length === 0 && upcoming.length === 0 && recent.length === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
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
  container: { flex: 1 },
  content: { padding: spacing.md },
  contentEmpty: { flexGrow: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.heading, marginBottom: spacing.sm },
  card: { borderRadius: 10, padding: spacing.md, borderWidth: 1, marginBottom: spacing.sm },
  teams: { ...typography.heading },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
