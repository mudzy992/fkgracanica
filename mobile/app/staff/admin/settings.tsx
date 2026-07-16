import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { api } from '../../../src/lib/api';
import { asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type SettingRow = { key: string; value: string; description?: string };

const toRows = (data: unknown): SettingRow[] =>
  Object.entries(asRecord(data)).map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const row = asRecord(value);
      const description = asString(row.description);
      return { key, value: asString(row.value, ''), description: description || undefined };
    }
    return { key, value: asString(value, '') };
  });

export default function AdminSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [flags, setFlags] = useState<SettingRow[]>([]);

  const load = useCallback(async () => {
    try {
      const [privateRes, flagsRes] = await Promise.all([
        api.get('/settings/private'),
        api.get('/settings/module-flags'),
      ]);
      setSettings(toRows(privateRes.data));
      setFlags(toRows(flagsRes.data));
    } catch {
      setSettings([]);
      setFlags([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setValue = (key: string, value: string) => {
    setSettings((prev) => prev.map((row) => (row.key === key ? { ...row, value } : row)));
  };

  const save = async () => {
    const body = Object.fromEntries(settings.map((row) => [row.key, row.value]));
    await api.put('/settings/private', body);
    Alert.alert(t('settings'), t('settingsSaved'));
  };

  const renderRow = (row: SettingRow, editable: boolean) => (
    <View key={row.key} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.key, { color: colors.textMuted }]}>{row.key}</Text>
      {!!row.description && <Text style={[styles.desc, { color: colors.textMuted }]}>{row.description}</Text>}
      {row.value === 'true' || row.value === 'false' ? (
        <Switch
          value={row.value === 'true'}
          disabled={!editable}
          onValueChange={(next) => {
            if (editable) setValue(row.key, String(next));
          }}
        />
      ) : (
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={row.value}
          editable={editable}
          onChangeText={(next) => setValue(row.key, next)}
        />
      )}
    </View>
  );

  return (
    <RequirePermission permission="settings.read" returnTo="/staff/admin/settings">
      <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>
        {settings.map((row) => renderRow(row, true))}
        <PrimaryButton label={t('saveSettings')} onPress={() => void save()} />
        <Text style={[styles.title, { color: colors.text, marginTop: spacing.md }]}>{t('moduleFlags')}</Text>
        {flags.map((row) => renderRow(row, false))}
      </ScrollView>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md },
  key: { ...typography.caption, marginBottom: spacing.xs },
  desc: { ...typography.caption, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
});
