import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

type PageItem = { id: string; slug: string; title: string; excerpt?: string };

export default function PagesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get('/cms/pages');
      setPages(
        asArray(data).map((page, index) => {
          const item = asRecord(page);
          return {
            id: asString(item.id, String(index)),
            slug: asString(item.slug),
            title: asString(item.title, t('cmsPages')),
            excerpt: asString(item.seoDesc) || asString(item.excerpt) || undefined,
          };
        }),
      );
    } catch {
      setPages([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ListSkeleton />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void load().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <FlatList
      data={pages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={[styles.title, { color: colors.text }]}>{t('cmsPages')}</Text>}
      ListEmptyComponent={<ScreenEmpty message={t('searchNoResults')} icon="document-text-outline" />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push(`/pages/${item.slug}`)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
          {item.excerpt ? (
            <Text style={[styles.slug, { color: colors.textMuted }]} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : (
            <Text style={[styles.slug, { color: colors.textMuted }]}>/{item.slug}</Text>
          )}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.title, marginBottom: spacing.sm },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: { ...typography.body, fontWeight: '600' },
  slug: { ...typography.caption, marginTop: spacing.xs },
});
