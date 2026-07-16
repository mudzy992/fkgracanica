import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type RoleRow = { id: string; name: string; keys: string[] };
type Perm = { key: string; description: string };

export default function AdminRolesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [perms, setPerms] = useState<Perm[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/rbac/roles'),
        api.get('/rbac/permissions'),
      ]);
      setRoles(
        asArray(rolesRes.data).map((r) => {
          const row = asRecord(r);
          const keys = asArray(row.permissions)
            .map((p) => asString(asRecord(asRecord(p).permission).key))
            .filter(Boolean);
          return { id: asString(row.id), name: asString(row.name), keys };
        }),
      );
      setPerms(
        asArray(permsRes.data).map((p) => {
          const row = asRecord(p);
          return { key: asString(row.key), description: asString(row.description, asString(row.key)) };
        }),
      );
    } catch {
      setRoles([]);
      setPerms([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openRole = (role: RoleRow) => {
    if (role.name === 'Administrator') return;
    setSelectedId(role.id);
    setSelectedKeys(role.keys);
  };

  const toggle = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const save = async () => {
    if (!selectedId) return;
    await api.patch(`/rbac/roles/${selectedId}/permissions`, { permissionKeys: selectedKeys });
    setSelectedId(null);
    await load();
    Alert.alert(t('roles'), t('savePermissions'));
  };

  const selected = roles.find((r) => r.id === selectedId);

  if (selected) {
    return (
      <RequirePermission permission="rbac.read" returnTo="/staff/admin/roles">
        <FlatList
          data={perms}
          keyExtractor={(item) => item.key}
          contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{`${t('permissions')}: ${selected.name}`}</Text>
              <PrimaryButton label={t('savePermissions')} onPress={() => void save()} />
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.key}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>{item.description}</Text>
                </View>
                <Switch value={selectedKeys.includes(item.key)} onValueChange={() => toggle(item.key)} />
              </View>
            </View>
          )}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="rbac.read" returnTo="/staff/admin/roles">
      <FlatList
        data={roles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
        ListHeaderComponent={
          <Text style={[styles.title, { color: colors.text, marginBottom: spacing.sm }]}>{t('roles')}</Text>
        }
        renderItem={({ item }) => {
          const locked = item.name === 'Administrator';
          return (
            <Pressable
              style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => openRole(item)}
              disabled={locked}
            >
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {locked ? t('systemRole') : `${item.keys.length} ${t('permissions').toLowerCase()}`}
              </Text>
            </Pressable>
          );
        }}
      />
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  title: { ...typography.heading },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
