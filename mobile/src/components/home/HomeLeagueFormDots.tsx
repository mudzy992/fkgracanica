import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

const FORM_COLORS = {
  W: '#16A34A',
  D: '#94A3B8',
  L: '#DC2626',
} as const;

type Props = { form: string; max?: number };

export function HomeLeagueFormDots({ form, max = 5 }: Props) {
  const { colors } = useTheme();
  const chars = form.replace(/[^WDL]/g, '').slice(-max).split('');

  if (chars.length === 0) {
    return (
      <View style={styles.row}>
        {Array.from({ length: max }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: colors.border }]} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {chars.map((char, i) => (
        <View
          key={`${char}-${i}`}
          style={[styles.dot, { backgroundColor: FORM_COLORS[char as keyof typeof FORM_COLORS] ?? colors.border }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
