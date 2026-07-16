import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { api } from '../../../src/lib/api';
import { colors, spacing, typography } from '../../../src/lib/theme';

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Record<string, string>>('/settings/private');
      setSettings(data);
    } catch {
      setSettings({});
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    await api.put('/settings/private', settings);
    Alert.alert('Postavke', 'Privatne postavke su sačuvane.');
  };

  return (
    <RequirePermission permission="settings.read" returnTo="/staff/admin/settings">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Postavke</Text>
        {Object.entries(settings).slice(0, 12).map(([key, value]) => (
          <View key={key} style={styles.card}>
            <Text style={styles.key}>{key}</Text>
            {value === 'true' || value === 'false' ? (
              <Switch value={value === 'true'} onValueChange={(next) => setSettings((prev) => ({ ...prev, [key]: String(next) }))} />
            ) : (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={(next) => setSettings((prev) => ({ ...prev, [key]: next }))}
              />
            )}
          </View>
        ))}
        <PrimaryButton label="Sačuvaj postavke" onPress={() => void save()} />
      </ScrollView>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  key: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
});
