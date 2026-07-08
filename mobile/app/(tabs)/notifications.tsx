import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { useUnreadNotifications } from '../../src/hooks/use-unread-notifications';
import { api } from '../../src/lib/api';
import { formatDateTimeBs } from '../../src/lib/format-date';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Notification, PaginatedResponse } from '../../src/types/api';

function NotificationsBody() {
  const { t } = useTranslation();
  const { refresh: refreshBadge } = useUnreadNotifications();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get<PaginatedResponse<Notification>>('/notifications');
      setItems(data.data);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void loadNotifications().finally(() => setLoading(false));
  }, [loadNotifications]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      await refreshBadge();
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshBadge();
    } catch {
      // ignore
    }
  };

  if (loading) return <ScreenLoading />;

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadNotifications()
              .then(() => refreshBadge())
              .finally(() => setRefreshing(false));
          }}
        />
      }
      ListHeaderComponent={
        hasUnread ? (
          <Pressable style={styles.markAll} onPress={() => void markAllRead()}>
            <Text style={styles.action}>{t('markAllRead')}</Text>
          </Pressable>
        ) : null
      }
      ListEmptyComponent={
        <ScreenEmpty message={t('noNotifications')} icon="notifications-outline" />
      }
      renderItem={({ item }) => (
        <View style={[styles.card, !item.isRead && styles.unread]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>{formatDateTimeBs(item.createdAt)}</Text>
          {!item.isRead ? (
            <Pressable onPress={() => void markRead(item.id)}>
              <Text style={styles.action}>{t('markRead')}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1 },
  markAll: { marginBottom: spacing.sm, alignSelf: 'flex-end' },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  unread: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  title: { ...typography.heading, color: colors.text },
  body: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  action: { color: colors.accent, marginTop: spacing.sm, fontWeight: '600' },
});

export default function NotificationsScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/notifications">
      <NotificationsBody />
    </RequireAuth>
  );
}
