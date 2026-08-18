import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';

const BRASS = '#C4A574';

type Props = { items: number; years: number; categories: number };

export function HeritageMuseumKpis({ items, years, categories }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background, borderColor: BRASS }]}>
      <Text style={styles.kicker}>{t('museumKicker')}</Text>
      <Text style={[styles.lead, { color: colors.textMuted }]}>{t('museumLead')}</Text>
      <View style={styles.row}>
        <Kpi label={t('museumItems')} value={items} />
        <Kpi label={t('museumYearsCount')} value={years || '—'} />
        <Kpi label={t('museumCategoriesCount')} value={categories || '—'} />
      </View>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  kicker: {
    ...typography.caption,
    color: BRASS,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  lead: { ...typography.caption, textAlign: 'center' },
  row: { flexDirection: 'row', marginTop: spacing.sm },
  kpi: { flex: 1, alignItems: 'center', gap: 2 },
  kpiLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  kpiValue: { ...typography.title, fontWeight: '800' },
});
