import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type GalleryPhoto = { id: string; path: string; caption?: string };

type Props = {
  photos: GalleryPhoto[];
  onDelete: (photoId: string) => void;
};

export function GalleryPhotoGrid({ photos, onDelete }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (photos.length === 0) {
    return <Text style={[styles.empty, { color: colors.textMuted }]}>{t('galleryNoPhotos')}</Text>;
  }

  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <View key={photo.id} style={[styles.cell, { borderColor: colors.border }]}>
          <RemoteImage path={photo.path} variant="thumb" style={styles.thumb} />
          <Pressable onPress={() => onDelete(photo.id)} accessibilityRole="button" accessibilityLabel={t('delete')}>
            <Text style={[styles.del, { color: colors.danger }]}>{t('delete')}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '31%', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  thumb: { width: '100%', height: 96, borderRadius: 0 },
  del: { ...typography.caption, textAlign: 'center', paddingVertical: 6, fontWeight: '600' },
  empty: { ...typography.body, textAlign: 'center', paddingVertical: spacing.md },
});
