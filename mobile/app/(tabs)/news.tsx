import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { HomeNewsCompactCard, HomeNewsFeaturedCard } from '../../src/components/home/home-news-cards';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { NewsCategoryChips, type NewsCategoryChip } from '../../src/components/news/NewsCategoryChips';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useTheme } from '../../src/lib/theme-context';
import { spacing } from '../../src/lib/theme';
import type { NewsItem } from '../../src/types/api';

export default function NewsListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategoryChip[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setError(null);
      const [newsRes, catRes] = await Promise.all([
        api.get<NewsItem[]>('/news/published', { params: categoryId ? { categoryId } : undefined }),
        api.get('/news-categories'),
      ]);
      setItems(Array.isArray(newsRes.data) ? newsRes.data : []);
      setCategories(
        asArray(catRes.data).map((row, index) => {
          const item = asRecord(row);
          return { id: asString(item.id, String(index)), name: asString(item.name) };
        }),
      );
    } catch {
      setItems([]);
      setError(t('error'));
    }
  }, [categoryId, t]);

  useEffect(() => {
    void loadNews().finally(() => setLoading(false));
  }, [loadNews]);

  const open = (slug: string) => router.push(`/news/${slug}`);
  const featured = !categoryId ? items[0] : undefined;
  const rest = featured ? items.slice(1) : items;

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
      data={rest}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: colors.surface }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadNews().finally(() => setRefreshing(false));
          }}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <NewsCategoryChips categories={categories} activeId={categoryId} onChange={setCategoryId} />
          {featured ? <HomeNewsFeaturedCard item={featured} onPress={() => open(featured.slug)} /> : null}
        </View>
      }
      ListEmptyComponent={
        featured ? null : <ScreenEmpty message={t('noNews')} icon="newspaper-outline" />
      }
      renderItem={({ item }) => <HomeNewsCompactCard item={item} onPress={() => open(item.slug)} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  header: { gap: spacing.md, marginBottom: spacing.sm },
});
