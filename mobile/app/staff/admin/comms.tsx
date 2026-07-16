import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RequireAuth } from '../../../src/components/RequireAuth';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useAuth } from '../../../src/lib/auth';
import { hasAnyPermission } from '../../../src/lib/permissions';
import { colors, spacing, typography } from '../../../src/lib/theme';

export default function AdminCommsScreen() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<string[]>([]);
  const [newsletters, setNewsletters] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [contactRes, newsletterRes] = await Promise.all([
        api.get('/contact'),
        api.get('/newsletter'),
      ]);
      setContacts(asArray(asRecord(contactRes.data).data ?? contactRes.data).map((item) => asString(asRecord(item).email, 'Kontakt')));
      setNewsletters(asArray(asRecord(newsletterRes.data).data ?? newsletterRes.data).map((item) => asString(asRecord(item).email, 'Pretplatnik')));
    } catch {
      setContacts([]);
      setNewsletters([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasAnyPermission(user, ['contact.read', 'newsletter.read'])) {
    return (
      <RequireAuth returnTo="/staff/admin/comms">
        <ScreenEmpty message="Nemate pristup inbox modulu." icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnTo="/staff/admin/comms">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Kontakt</Text>
          {contacts.slice(0, 10).map((item) => (
            <Text key={item} style={styles.item}>{item}</Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Newsletter</Text>
          {newsletters.slice(0, 10).map((item) => (
            <Text key={item} style={styles.item}>{item}</Text>
          ))}
        </View>
      </ScrollView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  item: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
});
