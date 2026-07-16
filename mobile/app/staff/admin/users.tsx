import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { colors, spacing, typography } from '../../../src/lib/theme';

type UserItem = { id: string; email: string; name: string };

export default function AdminUsersScreen() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      const list = asArray(asRecord(data).data ?? data).map((user, index) => {
        const item = asRecord(user);
        return {
          id: asString(item.id, String(index)),
          email: asString(item.email),
          name: [asString(item.firstName), asString(item.lastName)].filter(Boolean).join(' '),
        };
      });
      setItems(list);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createUser = async () => {
    await api.post('/users', { email, password });
    setEmail('');
    setPassword('');
    await load();
    Alert.alert('Korisnici', 'Korisnik je kreiran.');
  };

  return (
    <RequirePermission permission="users.read" returnTo="/staff/admin/users">
      <Screen padded={false}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.card}>
              <Text style={styles.title}>Korisnici</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Lozinka" secureTextEntry />
              <PrimaryButton label="Kreiraj korisnika" onPress={() => void createUser()} />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name || item.email}</Text>
              <Text style={styles.meta}>{item.email}</Text>
            </View>
          )}
        />
      </Screen>
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
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
