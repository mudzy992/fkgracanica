import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequirePermission } from '../../../src/components/RequirePermission';
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

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard/kpis');
      setKpis(asRecord(data));
    } catch {
      setKpis({});
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequirePermission permission="dashboard.read" returnTo="/staff/admin/dashboard">
      <Screen scroll>
        <SectionHeader title={t('dashboard')} subtitle={t('dashboardHint')} />
        {Object.entries(kpis).map(([key, value]) => (
          <View key={key} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{kpiLabel(key)}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{asString(value, JSON.stringify(value))}</Text>
          </View>
        ))}
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md },
  label: { ...typography.caption },
  value: { ...typography.heading, marginTop: spacing.xs },
});
