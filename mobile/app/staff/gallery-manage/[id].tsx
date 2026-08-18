import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ListSkeleton } from '../../../src/components/ListSkeleton';
import { MediaPickerSheet } from '../../../src/components/media/MediaPickerSheet';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { GalleryPhotoGrid, type GalleryPhoto } from '../../../src/components/writer/GalleryPhotoGrid';
import { api } from '../../../src/lib/api';
import { getApiErrorMessage } from '../../../src/lib/api-error';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useAuth } from '../../../src/lib/auth';
import { hasPermission } from '../../../src/lib/permissions';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';
import { uploadMedia } from '../../../src/lib/upload-media';

function mapPhotos(raw: unknown): GalleryPhoto[] {
  return asArray(asRecord(raw).photos).map((p) => {
    const r = asRecord(p);
    return { id: asString(r.id), path: asString(r.path), caption: asString(r.caption) };
  });
}

export default function GalleryEditorScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const canApprove = hasPermission(user, 'gallery.approve');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/gallery/${id}`);
      const r = asRecord(data);
      setTitle(asString(r.title, '—'));
      setStatus(asString(r.status, 'DRAFT'));
      setPhotos(mapPhotos(data));
    } catch (err) {
      Alert.alert(t('galleryManage'), getApiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const addPaths = async (paths: string[]) => {
    if (!id) return;
    setBusy(true);
    try {
      for (const path of paths) {
        await api.post(`/gallery/${id}/photos`, { path });
      }
      await load();
    } catch (err) {
      Alert.alert(t('galleryManage'), getApiErrorMessage(err, t('error')));
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    try {
      const path = await uploadMedia();
      await addPaths([path]);
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      Alert.alert(t('galleryManage'), t('error'));
    }
  };

  const handleDelete = (photoId: string) => {
    Alert.alert(t('confirmDelete'), t('galleryPhotos'), [
      { text: t('close'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          void api.delete(`/gallery/${id}/photos/${photoId}`).then(load);
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await api.patch(`/gallery/${id}`, { status: 'PENDING' });
      setStatus('PENDING');
      Alert.alert(t('galleryManage'), t('gallerySubmitted'));
    } catch (err) {
      Alert.alert(t('galleryManage'), getApiErrorMessage(err, t('error')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <RequirePermission permission="gallery.manage" returnTo="/staff/gallery-manage">
      <Stack.Screen options={{ title: title || t('galleryManage') }} />
      <Screen scroll>
        <SectionHeader title={t('galleryEditorHint')} />
        {loading ? <ListSkeleton rows={2} /> : (
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{status} · {photos.length} {t('galleryPhotos')}</Text>
            <GalleryPhotoGrid photos={photos} onDelete={handleDelete} />
            <PrimaryButton label={t('galleryFromLibrary')} onPress={() => setLibOpen(true)} loading={busy} />
            <PrimaryButton label={t('galleryUploadPhone')} onPress={() => void handleUpload()} loading={busy} />
            {!canApprove && status === 'DRAFT' ? (
              <PrimaryButton label={t('gallerySubmitReview')} onPress={() => void handleSubmit()} loading={busy} />
            ) : null}
          </View>
        )}
        <MediaPickerSheet
          visible={libOpen}
          multiple
          selected={photos.map((p) => p.path)}
          onClose={() => setLibOpen(false)}
          onConfirm={(paths) => void addPaths(paths.filter((p) => !photos.some((ph) => ph.path === p)))}
        />
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  meta: { ...typography.caption },
});
