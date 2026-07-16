import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';

type Props = {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function ScreenEmpty({
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
  compact,
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, compact ? styles.compact : styles.fill]}>
      <Ionicons name={icon} size={compact ? 28 : 40} color={colors.textMuted} />
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.ctaText, { color: colors.white }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  fill: { flex: 1 },
  compact: { paddingVertical: spacing.md },
  message: { ...typography.body, textAlign: 'center', marginTop: spacing.md },
  cta: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },
  ctaText: { fontWeight: '600' },
});
