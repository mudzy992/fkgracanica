import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type StatCell = { label: string; value: number; highlight?: boolean };

type Props = {
  title: string;
  cells: StatCell[];
};

export function PlayerStatGrid({ title, cells }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.grid}>
        {cells.map((cell) => (
          <View
            key={cell.label}
            style={[
              styles.cell,
              {
                backgroundColor: colors.background,
                borderColor: cell.highlight ? colors.link : colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>{cell.label}</Text>
            <Text style={[styles.value, { color: colors.white }]}>{cell.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: { ...typography.heading, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: '31%',
    flexGrow: 1,
    minWidth: 96,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: { ...typography.title, marginTop: spacing.xs, fontWeight: '800' },
});
