import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequirePermission } from '../RequirePermission';
import { Screen } from '../primitives/Screen';
import { ScreenEmpty } from '../ScreenEmpty';
import { PrimaryButton } from '../primitives/PrimaryButton';
import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { EntityCrudConfig } from './entity-crud-types';
import { EntityFormModal } from './EntityFormModal';

type Props = {
  config: EntityCrudConfig;
  listPath?: string;
  returnTo: string;
};

const emptyValues = (fields: EntityCrudConfig['fields']): Record<string, string> =>
  Object.fromEntries(
    fields.map((f) => {
      if (f.type !== 'choice' || !f.choices?.[0]) return [f.key, ''];
      const first = f.choices[0];
      return [f.key, typeof first === 'string' ? first : first.value];
    }),
  );

export function EntityListScreen({ config, listPath, returnTo }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState(emptyValues(config.fields));
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(listPath ?? config.endpoint);
      setItems(
        asArray(asRecord(data).data ?? data).map((row) => asRecord(row)),
      );
    } catch {
      setItems([]);
    }
  }, [config.endpoint, listPath]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setValues(emptyValues(config.fields));
    setOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditId(asString(row.id));
    const next = emptyValues(config.fields);
    for (const field of config.fields) {
      const raw = row[field.key];
      next[field.key] = raw == null ? '' : String(raw);
    }
    setValues(next);
    setOpen(true);
  };

  const handleSave = async () => {
    const missing = config.fields.filter((f) => f.required && !values[f.key]?.trim());
    if (missing.length) {
      Alert.alert(t(config.titleKey), t('validationRequired'));
      return;
    }
    setSaving(true);
    try {
      const body = config.buildBody(values);
      if (editId) await api.patch(`${config.endpoint}/${editId}`, body);
      else await api.post(config.endpoint, body);
      setOpen(false);
      await load();
    } catch {
      Alert.alert(t('error'), t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: Record<string, unknown>) => {
    Alert.alert(t('confirmDelete'), config.itemTitle(row), [
      { text: t('close'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          void api.delete(`${config.endpoint}/${asString(row.id)}`).then(load);
        },
      },
    ]);
  };

  return (
    <RequirePermission permission={config.permission} returnTo={returnTo}>
      <Screen padded={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t(config.titleKey)}</Text>
          <PrimaryButton label={t('add')} onPress={openCreate} />
        </View>
        <FlatList
          data={items}
          keyExtractor={(item, i) => asString(item.id, String(i))}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ScreenEmpty message={t(config.emptyKey ?? 'noItems')} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openEdit(item)}
              onLongPress={() => confirmDelete(item)}
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}
            >
              <View style={styles.rowText}>
                <Text style={[typography.body, { color: colors.text }]}>{config.itemTitle(item)}</Text>
                {config.itemSubtitle ? (
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {config.itemSubtitle(item)}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                <Text style={{ color: colors.danger }}>{t('delete')}</Text>
              </Pressable>
            </Pressable>
          )}
        />
        <EntityFormModal
          visible={open}
          title={editId ? t('edit') : t('add')}
          fields={config.fields}
          values={values}
          saving={saving}
          onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          onSave={() => void handleSave()}
          onClose={() => setOpen(false)}
        />
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1, gap: 2 },
});
