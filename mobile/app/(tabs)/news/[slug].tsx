import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { NewsComments } from '../../../src/components/NewsComments';
import { RemoteImage } from '../../../src/components/RemoteImage';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../../src/components/ScreenLoading';
import { api } from '../../../src/lib/api';
import { formatDateBs } from '../../../src/lib/format-date';
import { stripHtml } from '../../../src/lib/html-text';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';
import type { NewsItem } from '../../../src/types/api';

export default function NewsDetailScreen() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticle = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      const { data } = await api.get<NewsItem>(`/news/slug/${slug}`);
      setArticle(data);
    } catch {
      setArticle(null);
      setError(t('error'));
    }
  }, [slug, t]);

  useEffect(() => {
    void loadArticle().finally(() => setLoading(false));
  }, [loadArticle]);

  if (loading) return <ScreenLoading />;

  if (error || !article) {
    return (
      <ScreenEmpty
        message={error ?? t('error')}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadArticle().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {article.coverPath ? <RemoteImage path={article.coverPath} style={styles.cover} /> : null}
      <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
      <Text style={[styles.date, { color: colors.textMuted }]}>
        {formatDateBs(article.publishedAt ?? article.createdAt)}
        {article.category ? ` · ${article.category.name}` : ''}
      </Text>
      <Text style={[styles.body, { color: colors.text }]}>{stripHtml(article.content)}</Text>
      <NewsComments newsId={article.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  cover: { marginBottom: spacing.md },
  title: { ...typography.title, marginBottom: spacing.sm },
  date: { ...typography.caption, marginBottom: spacing.lg },
  body: { ...typography.body, lineHeight: 24 },
});
