import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeLeagueRow } from '../home/load-home-extras';
import { HomeLeagueRowItem } from '../home/HomeLeagueRowItem';

type Props = { rows: HomeLeagueRow[]; title?: string };

export function LeagueStandingsList({ rows, title }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {title ?? t('standings')}
      </Text>
      <View style={[styles.table, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={[styles.accent, { backgroundColor: colors.primary }]} />
        <View style={styles.head}>
          <Text style={[styles.headCell, styles.headPos, { color: colors.textMuted }]}>#</Text>
          <Text style={[styles.headCell, styles.headClub, { color: colors.textMuted }]}>{t('club')}</Text>
          <Text style={[styles.headCell, styles.headForm, { color: colors.textMuted }]}>{t('homeForm')}</Text>
          <Text style={[styles.headCell, styles.headPts, { color: colors.textMuted }]}>{t('points')}</Text>
        </View>
        <View style={styles.list}>
          {rows.map((row) => (
            <HomeLeagueRowItem key={row.id} row={row} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  table: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  headCell: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headPos: { width: 26, textAlign: 'center' },
  headClub: { flex: 1, marginLeft: 40 },
  headForm: { width: 47, textAlign: 'center' },
  headPts: { width: 28, textAlign: 'right' },
  list: { gap: spacing.xs },
});
