import { StyleSheet, View } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { spacing } from '../lib/theme';

type Props = { rows?: number };

export function ListSkeleton({ rows = 4 }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} accessibilityLabel="loading">
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={i}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.line, styles.wide, { backgroundColor: colors.border }]} />
          <View style={[styles.line, styles.mid, { backgroundColor: colors.border }]} />
          <View style={[styles.line, styles.narrow, { backgroundColor: colors.border }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, gap: spacing.sm },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: { height: 12, borderRadius: 6 },
  wide: { width: '90%' },
  mid: { width: '70%' },
  narrow: { width: '40%' },
});
