import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeTrophyItem } from './load-home-extras';
import { homeSurface } from './home-surface';

const GOLD = '#C9A227';

type Props = { items: HomeTrophyItem[] };

export function HomeTrophiesStrip({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('trophies')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homeTrophiesSubtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.seeAllBtn,
            { backgroundColor: colors.background, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={() => router.push('/heritage')}
          accessibilityRole="button"
          accessibilityLabel={t('homeSeeAll')}
        >
          <Text style={[styles.seeAll, { color: colors.link }]}>{t('homeSeeAll')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        snapToInterval={156}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              homeSurface(colors),
              styles.card,
              item.featured && styles.cardFeatured,
              { opacity: pressed ? 0.94 : 1 },
            ]}
            onPress={() => router.push('/heritage')}
            accessibilityRole="button"
            accessibilityLabel={`${item.year} ${item.name}`}
          >
            <View style={[styles.accent, { backgroundColor: item.featured ? GOLD : colors.primary }]} />
            <View style={[styles.media, { backgroundColor: colors.surface }]}>
              {item.imagePath ? (
                <RemoteImage path={item.imagePath} variant="medium" style={styles.image} />
              ) : (
                <Ionicons name="trophy" size={36} color={item.featured ? GOLD : colors.primary} />
              )}
            </View>
            <Text style={[styles.year, { color: item.featured ? GOLD : colors.primary }]}>{item.year}</Text>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            {item.competition ? (
              <Text style={[styles.comp, { color: colors.textMuted }]} numberOfLines={1}>
                {item.competition}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  row: { gap: spacing.sm, paddingRight: spacing.md },
  card: {
    width: 148,
    paddingTop: spacing.md + 2,
    overflow: 'hidden',
    position: 'relative',
  },
  cardFeatured: {
    shadowOpacity: 0.12,
    elevation: 3,
  },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  media: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  image: { width: '100%', height: '100%' },
  year: { ...typography.title, fontSize: 22, fontWeight: '800' },
  name: { ...typography.caption, fontWeight: '700', marginTop: spacing.xs, minHeight: 32 },
  comp: { ...typography.caption, marginTop: 2, fontSize: 11 },
});
