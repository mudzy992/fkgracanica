import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, loading }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.button, { backgroundColor: colors.primary }, loading && styles.disabled]}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.label, { color: colors.white }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  disabled: { opacity: 0.7 },
  label: { fontSize: 16, fontWeight: '600' },
});
