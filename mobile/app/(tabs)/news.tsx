import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from 'react-native';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { api } from '../../src/lib/api';
import { formatDateBs } from '../../src/lib/format-date';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';
import type { NewsItem } from '../../src/types/api';

export default function NewsListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<NewsItem[]>('/news/published');
      setItems(data);
    } catch {
      setItems([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void loadNews().finally(() => setLoading(false));
  }, [loadNews]);

  if (loading) return <ListSkeleton />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadNews().finally(() => setLoading(false));
        }}
      />
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
      ListEmptyComponent={<ScreenEmpty message={t('noNews')} icon="newspaper-outline" />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          {item.coverPath ? <RemoteImage path={item.coverPath} style={styles.thumb} /> : null}
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          {item.excerpt ? (
            <Text style={[styles.excerpt, { color: colors.textMuted }]} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {formatDateBs(item.publishedAt ?? item.createdAt)}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: { borderRadius: 10, padding: spacing.md, borderWidth: 1, marginBottom: spacing.sm },
  thumb: { height: 120, marginBottom: spacing.sm },
  title: { ...typography.heading },
  excerpt: { ...typography.body, marginTop: spacing.xs },
  date: { ...typography.caption, marginTop: spacing.sm },
});
