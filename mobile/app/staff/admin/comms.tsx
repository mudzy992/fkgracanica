import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequireAuth } from '../../../src/components/RequireAuth';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useAuth } from '../../../src/lib/auth';
import { hasAnyPermission } from '../../../src/lib/permissions';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type ContactMsg = { id: string; email: string; subject: string; message: string; isRead: boolean };

export default function AdminCommsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [newsletters, setNewsletters] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [contactRes, newsletterRes] = await Promise.all([
        api.get('/contact', { params: { limit: 50 } }),
        api.get('/newsletter', { params: { limit: 50 } }),
      ]);
      setContacts(
        asArray(asRecord(contactRes.data).data ?? contactRes.data).map((item, i) => {
          const row = asRecord(item);
          return {
            id: asString(row.id, String(i)),
            email: asString(row.email, 'Kontakt'),
            subject: asString(row.subject, ''),
            message: asString(row.message, ''),
            isRead: Boolean(row.isRead),
          };
        }),
      );
      setNewsletters(
        asArray(asRecord(newsletterRes.data).data ?? newsletterRes.data).map((item) =>
          asString(asRecord(item).email, 'Pretplatnik'),
        ),
      );
    } catch {
      setContacts([]);
      setNewsletters([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    await api.patch(`/contact/${id}/read`);
    await load();
  };

  const remove = async (id: string) => {
    await api.delete(`/contact/${id}`);
    await load();
  };

  if (!hasAnyPermission(user, ['contact.read', 'newsletter.read'])) {
    return (
      <RequireAuth returnTo="/staff/admin/comms">
        <ScreenEmpty message={t('noInboxAccess')} icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnTo="/staff/admin/comms">
      <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('contactMessages')}</Text>
          {contacts.map((item) => (
            <View key={item.id} style={[styles.msg, { borderTopColor: colors.border }]}>
              <Text style={[styles.email, { color: colors.text }]}>{item.email}</Text>
              {!!item.subject && <Text style={[styles.meta, { color: colors.textMuted }]}>{item.subject}</Text>}
              <Text style={[styles.body, { color: colors.text }]}>{item.message}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.isRead ? t('read') : t('unread')}</Text>
              <View style={styles.actions}>
                {!item.isRead && (
                  <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => void markRead(item.id)}>
                    <Text style={{ color: colors.white, fontWeight: '600' }}>{t('markRead')}</Text>
                  </Pressable>
                )}
                <Pressable style={[styles.btn, { backgroundColor: colors.surface }]} onPress={() => void remove(item.id)}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{t('delete')}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('newsletterSubs')}</Text>
          {newsletters.map((email) => (
            <Text key={email} style={[styles.meta, { color: colors.textMuted }]}>{email}</Text>
          ))}
        </View>
      </ScrollView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md },
  title: { ...typography.heading, marginBottom: spacing.sm },
  msg: { borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.sm, gap: spacing.xs },
  email: { ...typography.body, fontWeight: '600' },
  body: { ...typography.body },
  meta: { ...typography.caption },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  btn: { borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
