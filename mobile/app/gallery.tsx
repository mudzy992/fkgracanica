import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';
import { GalleryAlbumGrid, type GalleryAlbumTile } from '../src/components/gallery/GalleryAlbumGrid';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { useTheme } from '../src/lib/theme-context';

export default function GalleryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<GalleryAlbumTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get('/gallery');
      setItems(
        asArray(data).map((item, index) => {
          const record = asRecord(item);
          const photos = asArray(record.photos).map((photo) => asRecord(photo));
          return {
            id: asString(record.id, String(index)),
            slug: asString(record.slug),
            title: asString(record.title, t('gallery')),
            coverPath:
              asString(record.coverPath) ||
              asString(record.heroPath) ||
              asString(photos[0]?.path) ||
              asString(photos[0]?.imagePath),
            photoCount: photos.length,
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
      <Stack.Screen options={{ title: t('gallery') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.surface }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
          />
        }
      >
        {items.length === 0 ? (
          <ScreenEmpty message={t('galleryEmpty')} icon="images-outline" />
        ) : (
          <GalleryAlbumGrid items={items} onOpen={(slug) => router.push(`/gallery/${slug}`)} />
        )}
      </ScrollView>
    </>
  );
}
