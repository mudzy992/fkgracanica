import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from 'react-native';
import { RemoteImage } from '../src/components/RemoteImage';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { api } from '../src/lib/api';
import { asString } from '../src/lib/content-helpers';
import { colors, spacing, typography } from '../src/lib/theme';

type GalleryAlbum = { id: string; slug: string; title: string; description?: string; coverPath?: string };

export default function GalleryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<unknown[]>('/gallery');
      setItems(
        data.map((item, index) => {
          const record = item as Record<string, unknown>;
          const photos = Array.isArray(record.photos) ? (record.photos as Record<string, unknown>[]) : [];
          return {
            id: asString(record.id, String(index)),
            slug: asString(record.slug),
            title: asString(record.title, 'Galerija'),
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
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void load().finally(() => setRefreshing(false))} />
      }
      ListEmptyComponent={<ScreenEmpty message="Nema galerija za prikaz." icon="images-outline" />}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/gallery/${item.slug}`)}>
          <RemoteImage path={item.coverPath} style={styles.image} />
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  image: { height: 180, marginBottom: spacing.sm },
  title: { ...typography.heading, color: colors.text },
  desc: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
