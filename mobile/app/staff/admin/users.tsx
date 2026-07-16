import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type RoleOpt = { id: string; name: string };
type UserItem = { id: string; email: string; name: string; roleIds: string[]; roleNames: string };

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [items, setItems] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleOpt[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  const load = useCallback(async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/role-options'),
      ]);
      const roleList = asArray(rolesRes.data).map((r) => {
        const row = asRecord(r);
        return { id: asString(row.id), name: asString(row.name) };
      });
      setRoles(roleList);
      setRoleId((prev) => prev || roleList[0]?.id || '');
      setItems(
        asArray(asRecord(usersRes.data).data ?? usersRes.data).map((user, i) => {
          const item = asRecord(user);
          const userRoles = asArray(item.roles).map((ur) => asRecord(asRecord(ur).role));
          const roleIds = userRoles.map((r) => asString(r.id)).filter(Boolean);
          return {
            id: asString(item.id, String(i)),
            email: asString(item.email),
            name: [asString(item.firstName), asString(item.lastName)].filter(Boolean).join(' '),
            roleIds,
            roleNames: userRoles.map((r) => asString(r.name)).filter(Boolean).join(', '),
          };
        }),
      );
    } catch {
      setItems([]);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createUser = async () => {
    await api.post('/users', { email, password, roleIds: roleId ? [roleId] : undefined });
    setEmail('');
    setPassword('');
    await load();
    Alert.alert(t('users'), t('userCreated'));
  };

  const toggleRole = async (user: UserItem, nextRoleId: string) => {
    const has = user.roleIds.includes(nextRoleId);
    const roleIds = has ? user.roleIds.filter((id) => id !== nextRoleId) : [...user.roleIds, nextRoleId];
    await api.patch(`/users/${user.id}`, { roleIds });
    await load();
  };

  return (
    <RequirePermission permission="users.read" returnTo="/staff/admin/users">
      <Screen padded={false}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>{t('users')}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder={t('email')}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder={t('password')}
                secureTextEntry
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.meta, { color: colors.textMuted }]}>{t('assignRole')}</Text>
              <View style={styles.roles}>
                {roles.map((role) => (
                  <Pressable
                    key={role.id}
                    style={[styles.chip, { backgroundColor: roleId === role.id ? colors.primary : colors.surface }]}
                    onPress={() => setRoleId(role.id)}
                  >
                    <Text style={{ color: roleId === role.id ? colors.white : colors.text, fontWeight: '600' }}>{role.name}</Text>
                  </Pressable>
                ))}
              </View>
              <PrimaryButton label={t('createUser')} onPress={() => void createUser()} />
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name || item.email}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.email}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.roleNames || '—'}</Text>
              <View style={styles.roles}>
                {roles.map((role) => {
                  const active = item.roleIds.includes(role.id);
                  return (
                    <Pressable
                      key={role.id}
                      style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface }]}
                      onPress={() => void toggleRole(item, role.id)}
                    >
                      <Text style={{ color: active ? colors.white : colors.text, fontWeight: '600' }}>{role.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  title: { ...typography.heading, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs, marginBottom: spacing.xs },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
