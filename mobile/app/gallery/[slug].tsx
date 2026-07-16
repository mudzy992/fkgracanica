import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

type Photo = { id: string; path?: string; caption?: string };

export default function GalleryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const { data } = await api.get(`/gallery/slug/${slug}`);
      const record = asRecord(data);
      setTitle(asString(record.title, 'Galerija'));
      setPhotos(
        asArray(record.photos).map((photo, index) => {
          const item = asRecord(photo);
          return {
            id: asString(item.id, String(index)),
            path: asString(item.path) || asString(item.imagePath),
            caption: asString(item.caption),
          };
        }),
      );
    } catch {
      setPhotos([]);
    }
  }, [slug]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      ListEmptyComponent={<ScreenEmpty message="Galerija nema fotografija." icon="image-outline" />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <RemoteImage path={item.path} style={styles.image} />
          {item.caption ? <Text style={[styles.caption, { color: colors.textMuted }]}>{item.caption}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.title, marginBottom: spacing.sm },
  card: { marginBottom: spacing.md },
  image: { height: 220 },
  caption: { ...typography.caption, marginTop: spacing.xs },
});
