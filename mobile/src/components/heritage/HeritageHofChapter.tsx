import { StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';

const GOLD = '#C9A227';

type Props = { item: HeritageItem };

export function HeritageHofChapter({ item }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.stage}>
      <View style={styles.glow} />
      <View style={[styles.ring, { backgroundColor: colors.background }]}>
        {item.imagePath ? (
          <RemoteImage path={item.imagePath} variant="original" contentFit="cover" style={styles.photo} />
        ) : (
          <View style={[styles.fallback, { backgroundColor: colors.surface }]}>
            <Text style={styles.initial}>{item.title[0]}</Text>
          </View>
        )}
      </View>
      {item.years ? <Text style={styles.years}>{item.years}</Text> : null}
      <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
      <View style={styles.rule} />
      {item.role ? <Text style={styles.role}>{item.role}</Text> : null}
      {item.description ? (
        <Text style={[styles.bio, { color: colors.textMuted }]}>{item.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  glow: {
    position: 'absolute',
    top: 28,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(201,162,39,0.14)',
  },
  ring: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 3,
    borderColor: GOLD,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  photo: { width: '100%', height: '100%', borderRadius: 0 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initial: { ...typography.display, color: GOLD },
  years: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  name: { ...typography.display, fontSize: 28, textAlign: 'center' },
  rule: { width: 40, height: 2, backgroundColor: GOLD, marginVertical: spacing.sm, borderRadius: 1 },
  role: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  bio: {
    ...typography.body,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
});
