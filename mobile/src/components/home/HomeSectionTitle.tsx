import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

type Props = { title: string; compact?: boolean };

export function HomeSectionTitle({ title, compact }: Props) {
  const { colors } = useTheme();
  return (
    <Text
      style={[styles.title, { color: colors.text }, compact && styles.compact]}
      accessibilityRole="header"
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, marginTop: spacing.md, marginBottom: spacing.xs },
  compact: { marginTop: 0, marginBottom: 0 },
});
