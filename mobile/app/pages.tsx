import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { colors, spacing, typography } from '../src/lib/theme';

type PageItem = { id: string; slug: string; title: string };

export default function PagesScreen() {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/cms/pages');
      setPages(
        asArray(data).map((page, index) => {
          const item = asRecord(page);
          return {
            id: asString(item.id, String(index)),
            slug: asString(item.slug),
            title: asString(item.title, 'CMS stranica'),
          };
        }),
      );
    } catch {
      setPages([]);
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <FlatList
      data={pages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.title}>CMS stranice</Text>}
      ListEmptyComponent={<ScreenEmpty message="Nema objavljenih CMS stranica." icon="document-text-outline" />}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/pages/${item.slug}`)}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.slug}>/{item.slug}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  slug: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
