import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeGalleryItem } from './load-home-extras';

type Props = { items: HomeGalleryItem[] };

type TileProps = {
  item: HomeGalleryItem;
  lead?: boolean;
  onPress: () => void;
};

function GalleryTile({ item, lead, onPress }: TileProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        lead ? styles.tileLead : styles.tileSmall,
        { opacity: pressed ? 0.94 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <RemoteImage path={item.coverPath} variant="medium" style={styles.cover} />
      <LinearGradient
        colors={['transparent', 'rgba(5, 10, 20, 0.78)']}
        locations={[0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tileFooter}>
        <Text
          style={[lead ? styles.titleLead : styles.titleSmall, { color: colors.white }]}
          numberOfLines={lead ? 2 : 1}
        >
          {item.title}
        </Text>
        {item.photoCount > 0 ? (
          <View style={styles.countChip}>
            <Ionicons name="images-outline" size={12} color={colors.white} />
            <Text style={[styles.countText, { color: colors.white }]}>
              {t('homePhotoCount', { count: item.photoCount })}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function HomeGalleryPreview({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  const openAlbum = (slug: string) => router.push(`/gallery/${slug}`);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('gallery')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homeGallerySubtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.seeAllBtn,
            { backgroundColor: colors.surface, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={() => router.push('/gallery')}
          accessibilityRole="button"
          accessibilityLabel={t('homeSeeAll')}
        >
          <Text style={[styles.seeAll, { color: colors.link }]}>{t('homeSeeAll')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      </View>

      <View style={styles.collage}>
        <GalleryTile item={lead} lead onPress={() => openAlbum(lead.slug)} />
        {rest.length > 0 ? (
          <View style={styles.smallRow}>
            {rest.map((item) => (
              <GalleryTile key={item.id} item={item} onPress={() => openAlbum(item.slug)} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerCopy: { flex: 1 },
  title: { ...typography.heading, fontSize: 22, fontWeight: '800' },
  subtitle: { ...typography.caption, marginTop: spacing.xs },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  seeAll: { ...typography.caption, fontWeight: '700' },
  collage: { gap: spacing.sm },
  smallRow: { flexDirection: 'row', gap: spacing.sm },
  tile: { borderRadius: 18, overflow: 'hidden' },
  tileLead: { width: '100%', aspectRatio: 16 / 10 },
  tileSmall: { flex: 1, aspectRatio: 1 },
  cover: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  tileFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  titleLead: { ...typography.heading, fontWeight: '800' },
  titleSmall: { ...typography.caption, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  countChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  countText: { ...typography.caption, fontSize: 11, fontWeight: '700' },
});
