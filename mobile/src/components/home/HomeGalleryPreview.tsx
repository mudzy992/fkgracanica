import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeGalleryItem } from './load-home-extras';
import { HomeSectionTitle } from './HomeSectionTitle';

type Props = { items: HomeGalleryItem[] };

export function HomeGalleryPreview({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <HomeSectionTitle title={t('gallery')} compact />
        <Pressable onPress={() => router.push('/gallery')} accessibilityRole="button">
          <Text style={[styles.seeAll, { color: colors.accent }]}>{t('homeSeeAll')}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.background, opacity: pressed ? 0.92 : 1 },
            ]}
            onPress={() => router.push(`/gallery/${item.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <RemoteImage path={item.coverPath} variant="medium" style={styles.cover} />
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontWeight: '600' },
  row: { gap: spacing.md, paddingTop: spacing.sm },
  tile: {
    width: 200,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cover: { width: '100%', height: 160, borderRadius: 0 },
  title: { ...typography.caption, fontWeight: '700', padding: spacing.sm },
});
