import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { RequireAuth } from '../src/components/RequireAuth';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { useUnreadNotifications } from '../src/hooks/use-unread-notifications';
import { api } from '../src/lib/api';
import { formatDateTimeBs } from '../src/lib/format-date';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';
import type { Notification, PaginatedResponse } from '../src/types/api';

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
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshBadge();
    } catch {
      /* ignore */
    }
  };

  if (loading) return <ListSkeleton rows={5} />;
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
            <Text style={[styles.action, { color: colors.primaryLight }]}>{t('markAllRead')}</Text>
          </Pressable>
        ) : null
      }
      ListEmptyComponent={<ScreenEmpty message={t('noNotifications')} icon="notifications-outline" compact />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            if (!item.isRead) void markRead(item.id);
          }}
          accessibilityRole="button"
          style={[
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border },
            !item.isRead && { borderColor: colors.primary },
          ]}
        >
          <View style={styles.titleRow}>
            {!item.isRead ? <View style={[styles.dot, { backgroundColor: colors.primaryLight }]} /> : null}
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          </View>
          <Text style={[styles.body, { color: colors.textMuted }]}>{item.body}</Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formatDateTimeBs(item.createdAt)}</Text>
        </Pressable>
      )}
    />
  );
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  return (
    <RequireAuth returnTo="/notifications">
      <Stack.Screen options={{ title: t('notifications') }} />
      <NotificationsBody />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1, gap: spacing.sm },
  markAll: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  card: { borderRadius: 16, padding: spacing.md, borderWidth: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { ...typography.heading, flex: 1, fontWeight: '800' },
  body: { ...typography.body, marginTop: spacing.xs },
  date: { ...typography.caption, marginTop: spacing.sm },
  action: { fontWeight: '700' },
});
