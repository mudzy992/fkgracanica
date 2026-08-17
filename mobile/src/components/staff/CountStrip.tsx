import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type CountChip = { label: string; value: number };

export function CountStrip({ items }: { items: CountChip[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <Text style={[styles.value, { color: colors.primary }]}>{item.value}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: { flex: 1, borderRadius: 12, borderWidth: 1, padding: spacing.sm, alignItems: 'center' },
  value: { ...typography.heading, fontSize: 20 },
  label: { ...typography.caption, marginTop: 2, textAlign: 'center' },
});
