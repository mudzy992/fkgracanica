import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { NativePhotoPager } from '../../src/components/gallery/NativePhotoPager';
import type { PagerPhoto } from '../../src/components/gallery/photo-pager-types';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

export default function GalleryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<PagerPhoto[]>([]);
  const [pagerIndex, setPagerIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      setError(null);
      const { data } = await api.get(`/gallery/slug/${slug}`);
      const record = asRecord(data);
      setTitle(asString(record.title, t('gallery')));
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
      setError(t('error'));
    }
  }, [slug, t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;
  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: t('gallery') }} />
        <ScreenEmpty
          message={error}
          icon="alert-circle-outline"
          actionLabel={t('retry')}
          onAction={() => {
            setLoading(true);
            void load().finally(() => setLoading(false));
          }}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title || t('gallery') }} />
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ScreenEmpty message={t('galleryNoPhotos')} icon="image-outline" />}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.card}
            onPress={() => setPagerIndex(index)}
            accessibilityRole="button"
            accessibilityLabel={item.caption || title}
          >
            <RemoteImage path={item.path} style={styles.image} />
            {item.caption ? (
              <Text style={[styles.caption, { color: colors.textMuted }]} numberOfLines={1}>
                {item.caption}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
      <NativePhotoPager
        visible={pagerIndex != null}
        photos={photos}
        index={pagerIndex ?? 0}
        onClose={() => setPagerIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1 },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  card: { flex: 1 },
  image: { height: 160, borderRadius: 12 },
  caption: { ...typography.caption, marginTop: spacing.xs },
});
