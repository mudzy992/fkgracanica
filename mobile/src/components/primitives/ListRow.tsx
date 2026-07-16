import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightText?: string;
};

export function ListRow({ title, subtitle, icon, onPress, rightText }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
    >
      <View style={styles.left}>
        {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightText ? <Text style={[styles.right, { color: colors.textMuted }]}>{rightText}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  texts: { flex: 1 },
  title: { ...typography.body, fontWeight: '600' },
  subtitle: { ...typography.caption, marginTop: spacing.xs },
  right: { ...typography.caption },
});
