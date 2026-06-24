import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../../src/lib/api';
import { colors, spacing, typography } from '../../../src/lib/theme';
import type { NewsItem } from '../../../src/types/api';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function NewsDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadArticle = useCallback(async () => {
    if (!slug) return;
    try {
      const { data } = await api.get<NewsItem[]>('/news/published');
      const found = data.find((item) => item.slug === slug);
      setArticle(found ?? null);
    } catch {
      setArticle(null);
    }
  }, [slug]);

  useEffect(() => {
    void loadArticle().finally(() => setLoading(false));
  }, [loadArticle]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('error')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.date}>
        {formatDate(article.publishedAt ?? article.createdAt)}
        {article.category ? ` · ${article.category.name}` : ''}
      </Text>
      <Text style={styles.body}>{article.content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  date: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.text, lineHeight: 24 },
  empty: { color: colors.textMuted },
});
