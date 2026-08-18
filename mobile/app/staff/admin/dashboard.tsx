import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListSkeleton } from '../../../src/components/ListSkeleton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { api } from '../../../src/lib/api';
import { asRecord, asString } from '../../../src/lib/content-helpers';
import { kpiLabel } from '../../../src/lib/dashboard-kpi-labels';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [kpis, setKpis] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/kpis');
      setKpis(asRecord(data));
    } catch {
      setError(true);
      setKpis({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const entries = Object.entries(kpis);

  return (
    <RequirePermission permission="dashboard.read" returnTo="/staff/admin/dashboard">
      <Screen scroll>
        <SectionHeader title={t('dashboard')} subtitle={t('dashboardHint')} />
        {loading ? <ListSkeleton rows={4} /> : null}
        {error ? <ScreenEmpty message={t('error')} actionLabel={t('retry')} onAction={() => void load()} compact /> : null}
        {!loading && !error && entries.length === 0 ? <ScreenEmpty message={t('noItems')} compact /> : null}
        <View style={styles.grid}>
          {entries.map(([key, value]) => (
            <View key={key} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{kpiLabel(key)}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{asString(value, JSON.stringify(value))}</Text>
            </View>
          ))}
        </View>
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, width: '48%', flexGrow: 1 },
  label: { ...typography.caption },
  value: { ...typography.heading, marginTop: spacing.xs },
});
