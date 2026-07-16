import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { formatDateTimeBs } from '../src/lib/format-date';
import { colors, spacing, typography } from '../src/lib/theme';

type LeagueRow = { id: string; label: string; value: string };
type MatchRow = { id: string; title: string; meta: string };

export default function LeagueScreen() {
  const [standings, setStandings] = useState<LeagueRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const competitions = await api.get<unknown[]>('/competitions/seasons/list');
      const season = asRecord(asArray(competitions.data)[0]);
      const seasonId = asString(season.id);
      const [standingsRes, matchesRes] = await Promise.all([
        seasonId ? api.get('/statistics/standings', { params: { seasonId } }) : Promise.resolve({ data: [] }),
        seasonId ? api.get('/matches', { params: { seasonId } }) : api.get('/matches'),
      ]);
      setStandings(
        asArray(standingsRes.data).slice(0, 8).map((row, index) => {
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
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.list}>
      <Text style={styles.title}>Liga i statistika</Text>
      <Text style={styles.section}>Tabela</Text>
      {standings.map((row) => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.name}>{row.label}</Text>
          <Text style={styles.meta}>{row.value}</Text>
        </View>
      ))}
      <Text style={styles.section}>Utakmice</Text>
      {matches.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.meta}>{item.meta}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  section: { ...typography.heading, color: colors.text, marginVertical: spacing.sm },
  row: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
