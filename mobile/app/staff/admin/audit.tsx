import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type AuditItem = { id: string; action: string; entity: string; actor: string; createdAt: string };

export default function AdminAuditScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [items, setItems] = useState<AuditItem[]>([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/audit', { params: { limit: 50 } });
      setItems(
        asArray(asRecord(data).data ?? data).map((row, i) => {
          const item = asRecord(row);
          const actor = asRecord(item.actor);
          return {
            id: asString(item.id, String(i)),
            action: asString(item.action),
            entity: asString(item.entity, '-'),
            actor: asString(actor.email, asString(item.actorId, '-')),
            createdAt: asString(item.createdAt, ''),
          };
        }),
      );
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequirePermission permission="audit.read" returnTo="/staff/admin/audit">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
        ListEmptyComponent={<ScreenEmpty message={t('noAudit')} icon="document-text-outline" />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.action, { color: colors.text }]}>{item.action}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.entity}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.actor}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.createdAt}</Text>
          </View>
        )}
      />
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  action: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
