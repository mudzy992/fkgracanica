import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { colors, spacing, typography } from '../../../src/lib/theme';

type MembershipItem = { id: string; name: string; status: string };

export default function AdminMembershipScreen() {
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

  const action = async (id: string, kind: 'activate' | 'suspend' | 'renew' | 'cancel') => {
    await api.patch(`/membership/${id}/${kind}`);
    await load();
  };

  return (
    <RequirePermission permission="membership.manage" returnTo="/staff/admin/membership">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.status}</Text>
            <View style={styles.actions}>
              {(['activate', 'renew', 'suspend', 'cancel'] as const).map((kind) => (
                <Pressable key={kind} style={styles.button} onPress={() => void action(item.id, kind)}>
                  <Text style={styles.buttonText}>{kind}</Text>
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
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  button: { backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  buttonText: { color: colors.text, fontWeight: '600' },
});
