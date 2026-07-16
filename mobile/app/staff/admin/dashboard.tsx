import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { api } from '../../../src/lib/api';
import { asRecord, asString } from '../../../src/lib/content-helpers';
import { colors, spacing, typography } from '../../../src/lib/theme';

export default function AdminDashboardScreen() {
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
        <SectionHeader title="Dashboard" subtitle="Brzi KPI pregled." />
        {Object.entries(kpis).map(([key, value]) => (
          <View key={key} style={styles.card}>
            <Text style={styles.label}>{key}</Text>
            <Text style={styles.value}>{asString(value, JSON.stringify(value))}</Text>
          </View>
        ))}
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.heading, color: colors.text, marginTop: spacing.xs },
});
