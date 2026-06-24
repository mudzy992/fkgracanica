import { useRouter } from 'expo-router';
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
import { colors, spacing, typography } from '../../src/lib/theme';
import type { NewsItem } from '../../src/types/api';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function NewsListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = useCallback(async () => {
    try {
      const { data } = await api.get<NewsItem[]>('/news/published');
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void loadNews().finally(() => setLoading(false));
  }, [loadNews]);

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
            void loadNews().finally(() => setRefreshing(false));
          }}
        />
      }
      ListEmptyComponent={<Text style={styles.empty}>{t('noNews')}</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.excerpt ? (
            <Text style={styles.excerpt} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}
          <Text style={styles.date}>{formatDate(item.publishedAt ?? item.createdAt)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: { ...typography.heading, color: colors.text },
  excerpt: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
