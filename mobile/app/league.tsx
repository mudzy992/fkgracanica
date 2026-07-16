import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { formatDateTimeBs } from '../src/lib/format-date';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

type LeagueRow = { id: string; label: string; value: string };
type MatchRow = { id: string; title: string; meta: string };

export default function LeagueScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [standings, setStandings] = useState<LeagueRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const competitions = await api.get<unknown[]>('/competitions/seasons/list');
      const season = asRecord(asArray(competitions.data)[0]);
      const seasonId = asString(season.id);
      const [standingsRes, matchesRes] = await Promise.all([
        seasonId ? api.get('/statistics/standings', { params: { seasonId } }) : Promise.resolve({ data: [] }),
        seasonId ? api.get('/matches', { params: { seasonId } }) : api.get('/matches'),
      ]);
      setStandings(
        asArray(standingsRes.data).map((row, index) => {
          const item = asRecord(row);
          return {
            id: asString(item.clubId, String(index)),
            label: asString(item.clubName, `Tim ${index + 1}`),
            value: `${asString(item.points, '0')} pts`,
          };
        }),
      );
      setMatches(
        asArray(matchesRes.data).slice(0, 8).map((match, index) => {
          const item = asRecord(match);
          const home = asRecord(item.homeClub);
          const away = asRecord(item.awayClub);
          return {
            id: asString(item.id, String(index)),
            title: `${asString(home.name, 'Domaći')} vs ${asString(away.name, 'Gosti')}`,
            meta:
              asString(item.status) === 'LIVE' || asString(item.status) === 'HALFTIME'
                ? `${asString(item.homeScore, '0')} : ${asString(item.awayScore, '0')} · ${asString(item.minute, '0')}'`
                : formatDateTimeBs(asString(item.scheduledAt)),
          };
        }),
      );
    } catch {
      setStandings([]);
      setMatches([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.list}>
      <Text style={[styles.title, { color: colors.text }]}>{t('leagueStats')}</Text>
      <Text style={[styles.section, { color: colors.text }]}>{t('standings')}</Text>
      {standings.map((row) => (
        <View key={row.id} style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>{row.label}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{row.value}</Text>
        </View>
      ))}
      <Text style={[styles.section, { color: colors.text }]}>{t('matches')}</Text>
      {matches.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => router.push(`/(tabs)/live/${item.id}`)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{item.meta}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title, marginBottom: spacing.sm },
  section: { ...typography.heading, marginVertical: spacing.sm },
  row: { borderRadius: 12, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
