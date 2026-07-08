import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../lib/theme';

type Props = {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  /** Inline (e.g. home section) — no flex fill */
  compact?: boolean;
};

export function ScreenEmpty({
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
  compact,
}: Props) {
  return (
    <View style={[styles.center, compact ? styles.compact : styles.fill]}>
      <Ionicons name={icon} size={compact ? 28 : 40} color={colors.textMuted} />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.cta} onPress={onAction}>
          <Text style={styles.ctaText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  fill: { flex: 1 },
  compact: { paddingVertical: spacing.md },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },
  ctaText: { color: colors.white, fontWeight: '600' },
});
