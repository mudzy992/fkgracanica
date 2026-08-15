import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { formatDateBs } from '../../lib/format-date';
import { stripHtml } from '../../lib/html-text';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { NewsItem } from '../../types/api';
import { homeSurface } from './home-surface';

type CardProps = {
  item: NewsItem;
  onPress: () => void;
};

export function HomeNewsFeaturedCard({ item, onPress }: CardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const date = formatDateBs(item.publishedAt ?? item.createdAt);
  const excerpt = stripHtml(item.excerpt ?? '');

  return (
    <Pressable
      style={({ pressed }) => [styles.featured, { opacity: pressed ? 0.94 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <RemoteImage path={item.coverPath} variant="medium" style={styles.featuredImage} />
      <LinearGradient
        colors={['transparent', 'rgba(5,10,20,0.55)', 'rgba(5,10,20,0.92)']}
        locations={[0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featuredBody}>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={13} color={colors.primaryLight} />
          <Text style={[styles.date, { color: colors.primaryLight }]}>{date}</Text>
        </View>
        <Text style={[styles.featuredTitle, { color: colors.white }]} numberOfLines={3}>
          {item.title}
        </Text>
        {excerpt ? (
          <Text style={[styles.featuredExcerpt, { color: colors.white }]} numberOfLines={2}>
            {excerpt}
          </Text>
        ) : null}
        <View style={styles.readRow}>
          <Text style={[styles.readMore, { color: colors.primaryLight }]}>{t('readMore')}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primaryLight} />
        </View>
      </View>
    </Pressable>
  );
}

export function HomeNewsCompactCard({ item, onPress }: CardProps) {
  const { colors } = useTheme();
  const date = formatDateBs(item.publishedAt ?? item.createdAt);
  const excerpt = stripHtml(item.excerpt ?? '');

  return (
    <Pressable
      style={({ pressed }) => [
        homeSurface(colors),
        styles.compact,
        { opacity: pressed ? 0.92 : 1, flexDirection: 'row', padding: spacing.sm, gap: spacing.sm },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <RemoteImage path={item.coverPath} variant="medium" style={styles.compactThumb} />
      <View style={styles.compactBody}>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.compactDate, { color: colors.textMuted }]}>{date}</Text>
        </View>
        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {excerpt ? (
          <Text style={[styles.compactExcerpt, { color: colors.textMuted }]} numberOfLines={2}>
            {excerpt}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: {
    minHeight: 300,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  featuredImage: { ...StyleSheet.absoluteFill, height: undefined, borderRadius: 0 },
  featuredBody: { flex: 1, justifyContent: 'flex-end', padding: spacing.lg, minHeight: 300 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  date: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  featuredTitle: {
    ...typography.heading,
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'uppercase',
    lineHeight: 28,
  },
  featuredExcerpt: { ...typography.body, marginTop: spacing.sm, opacity: 0.82 },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  readMore: { fontWeight: '700' },
  compact: { overflow: 'hidden' },
  compactThumb: { width: 104, height: 104, borderRadius: 14 },
  compactBody: { flex: 1, justifyContent: 'center' },
  compactDate: { ...typography.caption, fontWeight: '600' },
  compactTitle: { ...typography.body, fontWeight: '700', marginTop: spacing.xs },
  compactExcerpt: { ...typography.caption, marginTop: spacing.xs },
});
