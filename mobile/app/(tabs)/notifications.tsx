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
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';
import type { Notification, PaginatedResponse } from '../../src/types/api';

function NotificationsBody() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { refresh: refreshBadge } = useUnreadNotifications();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<PaginatedResponse<Notification>>('/notifications');
      setItems(data.data);
    } catch {
      setItems([]);
      setError(t('error'));
    }
  }, [t]);

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
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadNotifications().finally(() => setLoading(false));
        }}
      />
    );
  }

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
          <Pressable
            style={styles.markAll}
            onPress={() => void markAllRead()}
            accessibilityRole="button"
            accessibilityLabel={t('markAllRead')}
          >
            <Text style={[styles.action, { color: colors.accent }]}>{t('markAllRead')}</Text>
          </Pressable>
        ) : null
      }
      ListEmptyComponent={
        <ScreenEmpty message={t('noNotifications')} icon="notifications-outline" />
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border },
            !item.isRead && { borderLeftWidth: 4, borderLeftColor: colors.primary },
          ]}
        >
          <View style={styles.titleRow}>
            {!item.isRead ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
            <Text style={[styles.title, { color: colors.text, flex: 1 }]}>{item.title}</Text>
          </View>
          <Text style={[styles.body, { color: colors.textMuted }]}>{item.body}</Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formatDateTimeBs(item.createdAt)}</Text>
          {!item.isRead ? (
            <Pressable onPress={() => void markRead(item.id)} accessibilityRole="button">
              <Text style={[styles.action, { color: colors.accent }]}>{t('markRead')}</Text>
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
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { ...typography.heading },
  body: { ...typography.body, marginTop: spacing.xs },
  date: { ...typography.caption, marginTop: spacing.sm },
  action: { marginTop: spacing.sm, fontWeight: '600' },
});

export default function NotificationsScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/notifications">
      <NotificationsBody />
    </RequireAuth>
  );
}
