import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type GalleryAlbumTile = {
  id: string;
  slug: string;
  title: string;
  coverPath?: string;
  photoCount: number;
};

type Props = {
  items: GalleryAlbumTile[];
  onOpen: (slug: string) => void;
};

export function GalleryAlbumGrid({ items, onOpen }: Props) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  const [lead, ...rest] = items;

  return (
    <View style={styles.wrap}>
      <Tile item={lead} lead onPress={() => onOpen(lead.slug)} countLabel={t('galleryPhotos')} />
      <View style={styles.row}>
        {rest.map((item) => (
          <Tile key={item.id} item={item} onPress={() => onOpen(item.slug)} countLabel={t('galleryPhotos')} />
        ))}
      </View>
    </View>
  );
}

function Tile({
  item,
  lead,
  onPress,
  countLabel,
}: {
  item: GalleryAlbumTile;
  lead?: boolean;
  onPress: () => void;
  countLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, lead ? styles.lead : styles.small, { opacity: pressed ? 0.94 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <RemoteImage path={item.coverPath} variant="medium" style={styles.cover} />
      <LinearGradient colors={['transparent', 'rgba(5,10,20,0.82)']} locations={[0.4, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.footer}>
        <Text style={[lead ? styles.titleLead : styles.titleSmall, { color: colors.white }]} numberOfLines={lead ? 2 : 1}>
          {item.title}
        </Text>
        <View style={styles.chip}>
          <Ionicons name="images-outline" size={12} color={colors.white} />
          <Text style={[styles.count, { color: colors.white }]}>
            {item.photoCount} {countLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, padding: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { borderRadius: 18, overflow: 'hidden' },
  lead: { width: '100%', aspectRatio: 16 / 10 },
  small: { width: '48%', flexGrow: 1, aspectRatio: 1 },
  cover: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  footer: { flex: 1, justifyContent: 'flex-end', padding: spacing.sm, gap: spacing.xs },
  titleLead: { ...typography.heading, fontWeight: '800', color: '#fff' },
  titleSmall: { ...typography.caption, fontWeight: '800', textTransform: 'uppercase' },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  count: { ...typography.caption, fontSize: 11, fontWeight: '700' },
});
