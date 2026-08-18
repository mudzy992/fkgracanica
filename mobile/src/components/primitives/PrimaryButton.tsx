import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  const { colors } = useTheme();
  const isDisabled = Boolean(loading || disabled);

  return (
    <Pressable
      style={[styles.button, { backgroundColor: colors.primary }, isDisabled && styles.disabled]}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityState={{ disabled: isDisabled }}
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
