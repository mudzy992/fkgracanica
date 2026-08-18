import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { LeagueLeaderItem } from './load-league-screen';

const PODIUM = ['#EAB308', '#94A3B8', '#B45309'] as const;

function podiumColor(index: number): string | undefined {
  return index >= 0 && index < 3 ? PODIUM[index] : undefined;
}

type Props = { scorers: LeagueLeaderItem[]; assists: LeagueLeaderItem[] };

export function LeagueLeadersSection({ scorers, assists }: Props) {
  const { t } = useTranslation();
  if (scorers.length === 0 && assists.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <LeaderTable title={t('leagueTopScorers')} valueLabel={t('playerGoals')} rows={scorers} />
      <LeaderTable title={t('leagueTopAssists')} valueLabel={t('playerAssists')} rows={assists} />
    </View>
  );
}

function LeaderTable({
  title,
  valueLabel,
  rows,
}: {
  title: string;
  valueLabel: string;
  rows: LeagueLeaderItem[];
}) {
  const { colors } = useTheme();
  const router = useRouter();
  if (rows.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.head, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.valueHead, { color: colors.textMuted }]}>{valueLabel}</Text>
      </View>
      {rows.map((row, index) => (
        <Pressable
          key={row.playerId}
          onPress={() => router.push(`/player/${row.playerId}`)}
          style={[styles.row, index === 0 && { backgroundColor: `${colors.primary}14` }]}
          accessibilityRole="button"
          accessibilityLabel={row.name}
        >
          <Text style={[styles.rank, { color: podiumColor(index) ?? colors.textMuted }]}>
            {index + 1}
          </Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {row.name}
          </Text>
          <Text style={[styles.value, { color: colors.link }]}>{row.value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.md },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  title: { ...typography.caption, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  valueHead: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rank: { width: 22, ...typography.caption, fontWeight: '800' },
  name: { flex: 1, ...typography.body, fontWeight: '600', fontSize: 14 },
  value: { ...typography.heading, fontWeight: '800' },
});
