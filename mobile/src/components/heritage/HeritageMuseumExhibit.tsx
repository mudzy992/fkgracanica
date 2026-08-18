import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';
import { RemoteImage } from '../RemoteImage';
import { museumCategoryKey } from './heritage-utils';
import type { HeritageItem } from './load-heritage';

const BRASS = '#C4A574';

type Props = {
  item: HeritageItem;
  featured?: boolean;
  onPress?: () => void;
};

export function HeritageMuseumExhibit({ item, featured, onPress }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const meta = [item.year, item.category ? t(museumCategoryKey(item.category)) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={item.title}
      style={[styles.case, featured && styles.featured, { backgroundColor: colors.background, borderColor: BRASS }]}
    >
      {item.imagePath ? (
        <RemoteImage
          path={item.imagePath}
          variant={featured ? 'original' : 'medium'}
          style={featured ? styles.heroImg : styles.img}
        />
      ) : (
        <View style={[featured ? styles.heroImg : styles.img, styles.fallback, { backgroundColor: colors.surface }]}>
          <Text style={styles.yearFallback}>{item.year ?? '·'}</Text>
        </View>
      )}
      <View style={styles.copy}>
        {featured ? <Text style={styles.kicker}>{t('museumExhibit')}</Text> : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={featured ? 3 : 2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={featured ? 5 : 3}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  case: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  featured: { borderWidth: 1.5 },
  img: { height: 128, borderRadius: 0 },
  heroImg: { height: 220, borderRadius: 0 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  yearFallback: { ...typography.display, color: BRASS, fontSize: 28 },
  copy: { padding: spacing.md, gap: 4 },
  kicker: {
    ...typography.caption,
    color: BRASS,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  meta: { ...typography.caption, color: BRASS, fontWeight: '700' },
  title: { ...typography.heading, fontWeight: '800' },
  body: { ...typography.caption, lineHeight: 18, marginTop: 2 },
});
