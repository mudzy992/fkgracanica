import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text } from 'react-native';
import { NativePhotoPager } from '../../../src/components/gallery/NativePhotoPager';
import { NewsComments } from '../../../src/components/NewsComments';
import { NewsHtmlBody } from '../../../src/components/news/NewsHtmlBody';
import { NewsRelatedBlock } from '../../../src/components/news/NewsRelatedBlock';
import { fetchNewsDetail, type NewsDetail } from '../../../src/components/news/load-news-detail';
import { RemoteImage } from '../../../src/components/RemoteImage';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../../src/components/ScreenLoading';
import { formatDateBs } from '../../../src/lib/format-date';
import { useTheme } from '../../../src/lib/theme-context';
import { newsArticleUrl } from '../../../src/lib/web-origin';
import { spacing, typography } from '../../../src/lib/theme';

export default function NewsDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagerIndex, setPagerIndex] = useState<number | null>(null);

  const loadArticle = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      setArticle(await fetchNewsDetail(slug));
    } catch {
      setArticle(null);
      setError(t('error'));
    }
  }, [slug, t]);

  useEffect(() => {
    void loadArticle().finally(() => setLoading(false));
  }, [loadArticle]);

  const handleShare = useCallback(async () => {
    if (!article) return;
    const url = newsArticleUrl(article.slug);
    await Share.share({ title: article.title, message: `${article.title}\n${url}`, url });
  }, [article]);

  useEffect(() => {
    if (!article) return;
    navigation.setOptions({
      title: article.title,
      headerRight: () => (
        <Pressable onPress={() => void handleShare()} accessibilityRole="button" accessibilityLabel={t('shareNews')}>
          <Ionicons name="share-outline" size={22} color={colors.white} />
        </Pressable>
      ),
    });
  }, [article, navigation, handleShare, t, colors.white]);

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
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {article.coverPath ? <RemoteImage path={article.coverPath} style={styles.cover} /> : null}
        {article.category ? (
          <Text style={[styles.category, { color: colors.primaryLight }]}>{article.category.name}</Text>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {formatDateBs(article.publishedAt ?? article.createdAt)}
        </Text>
        {article.videoUrl ? (
          <Pressable
            onPress={() => void Linking.openURL(article.videoUrl ?? '')}
            accessibilityRole="link"
            accessibilityLabel={t('watchVideo')}
          >
            <Text style={[styles.video, { color: colors.link }]}>{t('watchVideo')}</Text>
          </Pressable>
        ) : null}
        <NewsHtmlBody html={article.content} />
        <NewsRelatedBlock
          galleryTitle={t('newsGallery')}
          photos={article.photos}
          matchesTitle={t('relatedMatches')}
          matches={article.relatedMatches}
          playersTitle={t('relatedPlayers')}
          players={article.relatedPlayers}
          onPhotoPress={setPagerIndex}
        />
        <NewsComments newsId={article.id} />
      </ScrollView>
      <NativePhotoPager
        visible={pagerIndex != null}
        photos={article.photos}
        index={pagerIndex ?? 0}
        onClose={() => setPagerIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  cover: { marginBottom: spacing.md, height: 220 },
  category: { ...typography.caption, fontWeight: '700', marginBottom: spacing.xs },
  title: { ...typography.title, marginBottom: spacing.sm },
  date: { ...typography.caption, marginBottom: spacing.lg },
  video: { ...typography.body, fontWeight: '700', marginBottom: spacing.md },
});
