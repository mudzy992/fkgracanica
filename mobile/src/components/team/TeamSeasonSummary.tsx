import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { HomeLeagueFormDots } from '../home/HomeLeagueFormDots';
import type { TeamPlayer, TeamStanding, TeamTotals } from './load-team-screen';

type Props = {
  seasonName?: string;
  standing?: TeamStanding;
  totals?: TeamTotals;
  players: TeamPlayer[];
};

export function TeamSeasonSummary({ seasonName, standing, totals, players }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const rows = [...players]
    .filter((p) => p.appearances > 0 || p.goals > 0 || p.assists > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.appearances - a.appearances);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {t('teamSeasonStats')}
      </Text>
      {!seasonName ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('teamSeasonUnavailable')}</Text>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.grid}>
            <Kpi label={t('teamSeason')} value={seasonName} accent />
            {standing ? (
              <>
                <Kpi label={t('points')} value={String(standing.points)} />
                <Kpi label={t('homeGdShort')} value={`${standing.goalsFor}:${standing.goalsAgainst}`} />
                <View style={styles.formCell}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t('homeForm')}</Text>
                  <HomeLeagueFormDots form={standing.form} />
                </View>
              </>
            ) : null}
          </View>
          {standing ? (
            <View style={[styles.record, { borderTopColor: colors.border }]}>
              {[
                [t('teamPlayed'), standing.played],
                [t('teamWon'), standing.won],
                [t('teamDrawn'), standing.drawn],
                [t('teamLost'), standing.lost],
              ].map(([label, value]) => (
                <View key={String(label)} style={styles.recordItem}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.recordValue, { color: colors.white }]}>{value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {totals ? (
            <View style={[styles.totals, { borderTopColor: colors.border }]}>
              {[
                [t('playerGoals'), totals.goals],
                [t('playerAssists'), totals.assists],
                [t('playerAppearances'), totals.appearances],
                [t('playerYellow'), totals.yellowCards],
                [t('playerRed'), totals.redCards],
              ].map(([label, value]) => (
                <View key={String(label)} style={styles.totalItem}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.recordValue, { color: colors.white }]}>{value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {rows.length > 0 ? (
            <View style={[styles.table, { borderTopColor: colors.border }]}>
              <View style={styles.thead}>
                <Text style={[styles.th, styles.thName, { color: colors.textMuted }]}>{t('name')}</Text>
                <Text style={[styles.th, { color: colors.textMuted }]}>U</Text>
                <Text style={[styles.th, { color: colors.textMuted }]}>G</Text>
                <Text style={[styles.th, { color: colors.textMuted }]}>A</Text>
                <Text style={[styles.th, { color: colors.textMuted }]}>Ž/C</Text>
              </View>
              {rows.slice(0, 12).map((row, index) => (
                <Pressable
                  key={row.id}
                  onPress={() => router.push(`/player/${row.id}`)}
                  style={[styles.tr, index === 0 && row.goals > 0 && { backgroundColor: `${colors.primary}14` }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.firstName} ${row.lastName}`}
                >
                  <Text style={[styles.tdName, { color: colors.text }]} numberOfLines={1}>
                    {row.firstName} {row.lastName}
                  </Text>
                  <Text style={[styles.td, { color: colors.textMuted }]}>{row.appearances}</Text>
                  <Text style={[styles.td, { color: colors.link }]}>{row.goals}</Text>
                  <Text style={[styles.td, { color: colors.textMuted }]}>{row.assists}</Text>
                  <Text style={[styles.td, { color: colors.textMuted }]}>
                    {row.yellowCards}/{row.redCards}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.kpi,
        {
          backgroundColor: colors.surface,
          borderColor: accent ? colors.link : colors.border,
        },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.white }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  empty: { ...typography.body, textAlign: 'center', paddingVertical: spacing.md },
  card: { borderRadius: 18, borderWidth: 1, padding: spacing.md, gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kpi: { width: '47%', flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: spacing.sm },
  formCell: { width: '47%', flexGrow: 1, borderRadius: 14, padding: spacing.sm, justifyContent: 'center', gap: 6 },
  kpiLabel: { ...typography.caption, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { ...typography.heading, fontWeight: '800', marginTop: 4, fontSize: 16 },
  record: { flexDirection: 'row', borderTopWidth: 1, paddingTop: spacing.md },
  recordItem: { flex: 1, alignItems: 'center', gap: 4 },
  recordValue: { ...typography.heading, fontWeight: '800' },
  totals: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.sm },
  totalItem: { width: '30%', flexGrow: 1, alignItems: 'center', gap: 2 },
  table: { borderTopWidth: 1, paddingTop: spacing.sm, gap: 2 },
  thead: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  th: { width: 28, ...typography.caption, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  thName: { flex: 1, textAlign: 'left', width: undefined },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderRadius: 8 },
  td: { width: 28, ...typography.caption, fontWeight: '700', textAlign: 'center' },
  tdName: { flex: 1, ...typography.body, fontSize: 13, fontWeight: '600' },
});
