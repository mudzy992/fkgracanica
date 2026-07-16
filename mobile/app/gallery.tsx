import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { RemoteImage } from '../src/components/RemoteImage';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asString } from '../src/lib/content-helpers';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

type GalleryAlbum = { id: string; slug: string; title: string; description?: string; coverPath?: string };

export default function GalleryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<unknown[]>('/gallery');
      setItems(
        data.map((item, index) => {
          const record = item as Record<string, unknown>;
          const photos = Array.isArray(record.photos) ? (record.photos as Record<string, unknown>[]) : [];
          return {
            id: asString(record.id, String(index)),
            slug: asString(record.slug),
            title: asString(record.title, t('gallery')),
            description: asString(record.description),
            coverPath:
              asString(record.coverPath) ||
              asString(record.heroPath) ||
              asString(photos[0]?.path) ||
              asString(photos[0]?.imagePath),
          };
        }),
      );
    } catch {
      setItems([]);
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
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load().finally(() => setRefreshing(false));
          }}
        />
      }
      ListEmptyComponent={<ScreenEmpty message={t('searchNoResults')} icon="images-outline" />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push(`/gallery/${item.slug}`)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <RemoteImage path={item.coverPath} style={styles.image} />
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          {item.description ? (
            <Text style={[styles.desc, { color: colors.textMuted }]}>{item.description}</Text>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  image: { height: 180, marginBottom: spacing.sm },
  title: { ...typography.heading },
  desc: { ...typography.caption, marginTop: spacing.xs },
});
