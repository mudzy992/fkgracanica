import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { splitFeaturedTrophy } from './heritage-utils';
import { HeritageTrophyFeatured } from './HeritageTrophyFeatured';

const GOLD = '#C9A227';

type Props = { items: HeritageItem[] };

export function HeritageTrophiesTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { featured, rest } = splitFeaturedTrophy(items);
  if (!featured) return null;

  return (
    <View style={styles.wrap}>
      <HeritageTrophyFeatured item={featured} />
      {rest.length > 0 ? (
        <View style={styles.shelf}>
          <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('otherTrophies')}</Text>
          {rest.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={[styles.pedestal, { backgroundColor: colors.background }]}>
                {item.imagePath ? (
                  <RemoteImage path={item.imagePath} variant="medium" contentFit="contain" style={styles.thumb} />
                ) : (
                  <Text style={styles.year}>{item.year}</Text>
                )}
              </View>
              <View style={styles.copy}>
                <Text style={styles.year}>{item.year}</Text>
                <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
                {item.competition ? (
                  <Text style={[styles.comp, { color: colors.textMuted }]}>{item.competition}</Text>
                ) : null}
                {item.description ? (
                  <Text style={[styles.body, { color: colors.textMuted }]}>{item.description}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  shelf: { gap: spacing.lg },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  pedestal: {
    width: 84,
    height: 84,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: { width: 64, height: 64 },
  copy: { flex: 1, gap: 2 },
  year: { ...typography.title, color: GOLD, fontWeight: '800' },
  name: { ...typography.body, fontWeight: '700' },
  comp: { ...typography.caption, fontWeight: '600' },
  body: { ...typography.caption, lineHeight: 18, marginTop: 4 },
});
