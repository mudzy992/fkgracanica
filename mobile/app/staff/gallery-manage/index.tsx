import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { ListSkeleton } from '../../../src/components/ListSkeleton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { api } from '../../../src/lib/api';
import { getApiErrorMessage } from '../../../src/lib/api-error';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type GalleryAlbum = { id: string; title: string; status: string; photosCount: number };

function mapAlbum(raw: unknown): GalleryAlbum {
  const r = asRecord(raw);
  return {
    id: asString(r.id),
    title: asString(r.title, '—'),
    status: asString(r.status, 'DRAFT'),
    photosCount: asArray(r.photos).length,
  };
}

export default function GalleryManageListScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/gallery');
      setAlbums(asArray(data).map(mapAlbum));
    } catch {
      setAlbums([]);
    } finally {
      setLoading(false);
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
      const { data } = await api.post('/gallery', { title: title.trim(), description: description.trim() || undefined });
      const created = mapAlbum(data);
      router.replace(`/staff/gallery-manage/${created.id}`);
    } catch (err) {
      Alert.alert(t('galleryManage'), getApiErrorMessage(err, t('error')));
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }];

  return (
    <RequirePermission permission="gallery.manage" returnTo="/staff/gallery-manage">
      <Screen scroll>
        <SectionHeader title={t('galleryManageHint')} />
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder={t('galleryAlbumTitle')} placeholderTextColor={colors.textMuted} />
          <TextInput style={inputStyle} value={description} onChangeText={setDescription} placeholder={t('galleryAlbumDesc')} placeholderTextColor={colors.textMuted} />
          <PrimaryButton label={t('galleryCreateAlbum')} onPress={() => void handleCreate()} loading={busy} />
        </View>
        {loading ? <ListSkeleton rows={3} /> : null}
        {!loading && albums.length === 0 ? <Text style={[styles.empty, { color: colors.textMuted }]}>{t('galleryEmpty')}</Text> : null}
        {albums.map((album) => (
          <Pressable
            key={album.id}
            onPress={() => router.push(`/staff/gallery-manage/${album.id}`)}
            style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Text style={[styles.albumTitle, { color: colors.text }]}>{album.title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {album.status} · {album.photosCount} {t('galleryPhotos')}
            </Text>
          </Pressable>
        ))}
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  empty: { ...typography.body, textAlign: 'center', paddingVertical: spacing.lg },
  row: { borderWidth: 1, borderRadius: 12, padding: spacing.md, gap: 2, marginBottom: spacing.sm },
  albumTitle: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption },
});
