import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeLeagueRow } from './load-home-extras';
import { homeSurface } from './home-surface';
import { HomeSectionTitle } from './HomeSectionTitle';

type Props = { rows: HomeLeagueRow[] };

export function HomeLeagueSnippet({ rows }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (rows.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <HomeSectionTitle title={t('leagueTable')} compact />
        <Pressable onPress={() => router.push('/league')} accessibilityRole="button">
          <Text style={[styles.seeAll, { color: colors.accent }]}>{t('homeSeeAll')}</Text>
        </Pressable>
      </View>
      <View style={[homeSurface(colors), styles.table]}>
        <View style={styles.head}>
          <Text style={[styles.headCell, styles.posCol, { color: colors.textMuted }]}>#</Text>
          <Text style={[styles.headCell, styles.clubCol, { color: colors.textMuted }]}>{t('club')}</Text>
          <Text style={[styles.headCell, styles.ptsCol, { color: colors.textMuted }]}>{t('points')}</Text>
        </View>
        {rows.map((row) => (
          <View key={row.id} style={[styles.dataRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cell, styles.posCol, { color: colors.textMuted }]}>{row.position}</Text>
            <Text style={[styles.cell, styles.clubCol, { color: colors.text }]} numberOfLines={1}>
              {row.clubName}
            </Text>
            <Text style={[styles.cell, styles.ptsCol, { color: colors.primary, fontWeight: '800' }]}>
              {row.points}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontWeight: '600' },
  table: { marginTop: spacing.sm, gap: spacing.xs },
  head: { flexDirection: 'row', paddingBottom: spacing.xs },
  dataRow: { flexDirection: 'row', borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  headCell: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase' },
  cell: { ...typography.body },
  posCol: { width: 28 },
  clubCol: { flex: 1, paddingHorizontal: spacing.xs },
  ptsCol: { width: 40, textAlign: 'right' },
});
