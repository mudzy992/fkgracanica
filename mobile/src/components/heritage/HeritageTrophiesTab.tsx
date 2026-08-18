import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { splitFeaturedTrophy } from './heritage-utils';

const GOLD = '#C9A227';

type Props = { items: HeritageItem[] };

export function HeritageTrophiesTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { featured, rest } = splitFeaturedTrophy(items);
  if (!featured) return null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.featured, { backgroundColor: colors.background, borderColor: GOLD }]}>
        {featured.imagePath ? (
          <RemoteImage path={featured.imagePath} variant="medium" contentFit="contain" style={styles.featImg} />
        ) : (
          <Text style={[styles.featYear, { color: GOLD }]}>{featured.year}</Text>
        )}
        <Text style={[styles.featYear, { color: GOLD }]}>{featured.year}</Text>
        <Text style={[styles.featTitle, { color: colors.text }]}>{featured.title}</Text>
        {featured.competition ? (
          <Text style={[styles.sub, { color: colors.textMuted }]}>{featured.competition}</Text>
        ) : null}
        {featured.description ? (
          <Text style={[styles.body, { color: colors.textMuted }]}>{featured.description}</Text>
        ) : null}
      </View>
      {rest.length > 0 ? <Text style={[styles.heading, { color: colors.text }]}>{t('otherTrophies')}</Text> : null}
      <View style={styles.grid}>
        {rest.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {item.imagePath ? (
              <RemoteImage path={item.imagePath} variant="thumb" contentFit="contain" style={styles.thumb} />
            ) : (
              <Text style={[styles.year, { color: colors.primaryLight }]}>{item.year}</Text>
            )}
            <View style={styles.copy}>
              <Text style={[styles.year, { color: colors.primaryLight }]}>{item.year}</Text>
              <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
              {item.competition ? (
                <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.competition}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  featured: { borderRadius: 22, borderWidth: 1, padding: spacing.lg, alignItems: 'center' },
  featImg: { height: 140, width: '70%', marginBottom: spacing.md },
  featYear: { ...typography.title, fontWeight: '800' },
  featTitle: { ...typography.heading, textAlign: 'center', marginTop: spacing.xs },
  body: { ...typography.body, textAlign: 'center', marginTop: spacing.sm },
  heading: { ...typography.heading, fontWeight: '800', marginTop: spacing.sm },
  grid: { gap: spacing.sm },
  card: { flexDirection: 'row', gap: spacing.md, borderRadius: 16, borderWidth: 1, padding: spacing.md, alignItems: 'center' },
  thumb: { width: 56, height: 56 },
  copy: { flex: 1 },
  year: { ...typography.caption, fontWeight: '800' },
  name: { ...typography.body, fontWeight: '700' },
  sub: { ...typography.caption, marginTop: 2 },
});
