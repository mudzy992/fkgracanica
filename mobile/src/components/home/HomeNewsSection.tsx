import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenEmpty } from '../ScreenEmpty';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { NewsItem } from '../../types/api';
import { HomeNewsCompactCard, HomeNewsFeaturedCard } from './home-news-cards';

type Props = { items: NewsItem[] };

export function HomeNewsSection({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const openArticle = (slug: string) => router.push(`/(tabs)/news/${slug}`);
  const [featured, ...rest] = items;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('latestNews')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homeLatestNewsSubtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.seeAllBtn,
            { backgroundColor: colors.background, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={() => router.push('/(tabs)/news')}
          accessibilityRole="button"
          accessibilityLabel={t('seeAllNews')}
        >
          <Text style={[styles.seeAll, { color: colors.link }]}>{t('seeAllNews')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <ScreenEmpty message={t('noNews')} icon="newspaper-outline" compact />
      ) : (
        <View style={styles.list}>
          {featured ? (
            <HomeNewsFeaturedCard item={featured} onPress={() => openArticle(featured.slug)} />
          ) : null}
          {rest.map((item) => (
            <HomeNewsCompactCard key={item.id} item={item} onPress={() => openArticle(item.slug)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
  list: { gap: spacing.md, marginTop: spacing.md },
});
