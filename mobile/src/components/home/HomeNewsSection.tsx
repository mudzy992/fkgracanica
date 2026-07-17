import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { ScreenEmpty } from '../ScreenEmpty';
import { formatDateBs } from '../../lib/format-date';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { NewsItem } from '../../types/api';
import { homeSurface } from './home-surface';
import { HomeSectionTitle } from './HomeSectionTitle';

type Props = { items: NewsItem[] };

export function HomeNewsSection({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View>
      <View style={styles.header}>
        <HomeSectionTitle title={t('latestNews')} compact />
        <Pressable
          onPress={() => router.push('/(tabs)/news')}
          accessibilityRole="button"
          accessibilityLabel={t('seeAllNews')}
        >
          <Text style={[styles.seeAll, { color: colors.accent }]}>{t('seeAllNews')}</Text>
        </Pressable>
      </View>
      {items.length === 0 ? (
        <ScreenEmpty message={t('noNews')} icon="newspaper-outline" compact />
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              homeSurface(colors),
              styles.card,
              { opacity: pressed ? 0.92 : 1, overflow: 'hidden', padding: 0 },
            ]}
            onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <RemoteImage path={item.coverPath} variant="medium" style={styles.thumb} />
            <View style={styles.body}>
              <Text style={[styles.date, { color: colors.primaryLight }]}>
                {formatDateBs(item.publishedAt ?? item.createdAt)}
              </Text>
              <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
              {item.excerpt ? (
                <Text style={[styles.excerpt, { color: colors.textMuted }]} numberOfLines={2}>
                  {item.excerpt}
                </Text>
              ) : null}
              <Text style={[styles.link, { color: colors.accent }]}>{t('readMore')}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontWeight: '600', marginTop: spacing.md },
  card: { marginTop: spacing.md },
  thumb: { height: 156, borderRadius: 0 },
  body: { padding: spacing.md },
  newsTitle: { ...typography.heading },
  date: { ...typography.caption, marginBottom: spacing.xs, fontWeight: '800', textTransform: 'uppercase' },
  excerpt: { ...typography.body, marginTop: spacing.sm },
  link: { marginTop: spacing.sm, fontWeight: '600' },
});
