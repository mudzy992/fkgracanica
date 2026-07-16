import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type MembershipItem = { id: string; name: string; status: string };
type ActionKind = 'activate' | 'suspend' | 'renew' | 'cancel';

export default function AdminMembershipScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [items, setItems] = useState<MembershipItem[]>([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/membership');
      setItems(
        asArray(data).map((item, index) => {
          const membership = asRecord(item);
          const user = asRecord(membership.user);
          return {
            id: asString(membership.id, String(index)),
            name: asString(user.email, 'Član'),
            status: asString(membership.status, '-'),
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

  const action = async (id: string, kind: ActionKind) => {
    await api.patch(`/membership/${id}/${kind}`);
    await load();
  };

  const labels: Record<ActionKind, string> = {
    activate: t('membershipActivate'),
    renew: t('membershipRenew'),
    suspend: t('membershipSuspend'),
    cancel: t('membershipCancel'),
  };

  return (
    <RequirePermission permission="membership.manage" returnTo="/staff/admin/membership">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.status}</Text>
            <View style={styles.actions}>
              {(['activate', 'renew', 'suspend', 'cancel'] as const).map((kind) => (
                <Pressable
                  key={kind}
                  style={[styles.button, { backgroundColor: colors.surface }]}
                  onPress={() => void action(item.id, kind)}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>{labels[kind]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      />
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  button: { borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  buttonText: { fontWeight: '600' },
});
