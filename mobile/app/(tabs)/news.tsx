import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { api } from '../../src/lib/api';
import { formatDateBs } from '../../src/lib/format-date';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { NewsItem } from '../../src/types/api';

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

  if (loading) return <ScreenLoading />;

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
          style={styles.card}
          onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
        >
          {item.coverPath ? (
            <RemoteImage path={item.coverPath} style={styles.thumb} />
          ) : null}
          <Text style={styles.title}>{item.title}</Text>
          {item.excerpt ? (
            <Text style={styles.excerpt} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}
          <Text style={styles.date}>{formatDateBs(item.publishedAt ?? item.createdAt)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  thumb: { height: 120, marginBottom: spacing.sm },
  title: { ...typography.heading, color: colors.text },
  excerpt: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});
