import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/lib/api';
import { RequireAuth } from '../../src/components/RequireAuth';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Notification, PaginatedResponse } from '../../src/types/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('bs-BA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationsBody() {
  const { t } = useTranslation();
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
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
            void loadNotifications().finally(() => setRefreshing(false));
          }}
        />
      }
      ListEmptyComponent={<Text style={styles.empty}>{t('noNotifications')}</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, !item.isRead && styles.unread]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
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
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});

export default function NotificationsScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/notifications">
      <NotificationsBody />
    </RequireAuth>
  );
}
