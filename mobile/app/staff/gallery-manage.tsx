import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../src/components/primitives/PrimaryButton';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { RequirePermission } from '../../src/components/RequirePermission';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';
import { uploadMedia } from '../../src/lib/upload-media';

type GalleryAlbum = {
  id: string;
  title: string;
  status: string;
  photosCount: number;
};

function mapAlbum(raw: unknown): GalleryAlbum {
  const r = asRecord(raw);
  const photos = asArray(r.photos);
  return {
    id: asString(r.id),
    title: asString(r.title, '—'),
    status: asString(r.status, 'DRAFT'),
    photosCount: photos.length,
  };
}

export default function GalleryManageScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/gallery');
      setAlbums(asArray(data).map(mapAlbum));
    } catch {
      setAlbums([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert(t('galleryManage'), t('validationRequired'));
      return;
    }
    setBusy(true);
    try {
      await api.post('/gallery', {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      await load();
      Alert.alert(t('galleryManage'), t('galleryAlbumCreated'));
    } catch {
      Alert.alert(t('galleryManage'), t('error'));
    } finally {
      setBusy(false);
    }
  };

  const handleAddPhoto = async (albumId: string) => {
    setSelectedId(albumId);
    setBusy(true);
    try {
      const path = await uploadMedia();
      await api.post(`/gallery/${albumId}/photos`, { path });
      await load();
      Alert.alert(t('galleryManage'), t('galleryPhotoAdded'));
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      Alert.alert(t('galleryManage'), t('error'));
    } finally {
      setBusy(false);
      setSelectedId(null);
    }
  };

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
  ];

  return (
    <RequirePermission permission="gallery.manage" returnTo="/staff/gallery-manage">
      <Screen scroll>
        <SectionHeader title={t('galleryManage')} subtitle={t('galleryManageHint')} />
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            style={inputStyle}
            value={title}
            onChangeText={setTitle}
            placeholder={t('galleryAlbumTitle')}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={inputStyle}
            value={description}
            onChangeText={setDescription}
            placeholder={t('galleryAlbumDesc')}
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton label={t('galleryCreateAlbum')} onPress={() => void handleCreate()} loading={busy} />
        </View>
        {albums.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>{t('galleryEmpty')}</Text>
        ) : (
          albums.map((album) => (
            <View
              key={album.id}
              style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.albumTitle, { color: colors.text }]}>{album.title}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {album.status} · {album.photosCount} {t('galleryPhotos')}
                </Text>
              </View>
              <PrimaryButton
                label={t('galleryAddPhoto')}
                onPress={() => void handleAddPhoto(album.id)}
                loading={busy && selectedId === album.id}
              />
            </View>
          ))
        )}
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  empty: { ...typography.body, textAlign: 'center', paddingVertical: spacing.lg },
  row: { borderWidth: 1, borderRadius: 12, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.sm },
  rowText: { gap: 2 },
  albumTitle: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption },
});
