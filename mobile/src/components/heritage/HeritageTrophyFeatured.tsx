import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';

const GOLD = '#C9A227';

type Props = { item: HeritageItem };

export function HeritageTrophyFeatured({ item }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.case, { backgroundColor: colors.background }]}>
      <View style={styles.glow} />
      <Text style={styles.kicker}>{t('trophyShowcase')}</Text>
      {item.imagePath ? (
        <RemoteImage path={item.imagePath} variant="original" contentFit="contain" style={styles.cup} />
      ) : (
        <Text style={styles.yearOnly}>{item.year}</Text>
      )}
      <Text style={styles.year}>{item.year}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {item.competition ? <Text style={styles.comp}>{item.competition}</Text> : null}
      {item.description ? (
        <Text style={[styles.body, { color: colors.textMuted }]}>{item.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  case: {
    alignItems: 'center',
    borderRadius: 28,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -30,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(201,162,39,0.16)',
  },
  kicker: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  cup: { width: '70%', height: 168, marginBottom: spacing.md },
  yearOnly: { ...typography.display, color: GOLD, marginBottom: spacing.md },
  year: { ...typography.display, fontSize: 42, color: GOLD, fontWeight: '800' },
  title: { ...typography.title, fontWeight: '800', textAlign: 'center', marginTop: spacing.xs },
  comp: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  body: { ...typography.body, lineHeight: 22, textAlign: 'center', marginTop: spacing.md },
});
