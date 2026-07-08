import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { RemoteImage } from '../../../src/components/RemoteImage';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../../src/components/ScreenLoading';
import { api } from '../../../src/lib/api';
import { formatDateBs } from '../../../src/lib/format-date';
import { colors, spacing, typography } from '../../../src/lib/theme';
import type { NewsItem } from '../../../src/types/api';

export default function NewsDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadArticle = useCallback(async () => {
    if (!slug) return;
    try {
      const { data } = await api.get<NewsItem>(`/news/slug/${slug}`);
      setArticle(data);
    } catch {
      setArticle(null);
    }
  }, [slug]);

  useEffect(() => {
    void loadArticle().finally(() => setLoading(false));
  }, [loadArticle]);

  if (loading) return <ScreenLoading />;

  if (!article) {
    return <ScreenEmpty message={t('error')} icon="alert-circle-outline" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {article.coverPath ? <RemoteImage path={article.coverPath} style={styles.cover} /> : null}
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.date}>
        {formatDateBs(article.publishedAt ?? article.createdAt)}
        {article.category ? ` · ${article.category.name}` : ''}
      </Text>
      <Text style={styles.body}>{article.content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  cover: { marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  date: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.text, lineHeight: 24 },
});
