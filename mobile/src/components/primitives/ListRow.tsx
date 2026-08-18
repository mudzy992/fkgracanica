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
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.left}>
        {icon ? (
          <View style={[styles.iconWell, { backgroundColor: colors.surface }]}>
            <Ionicons name={icon} size={18} color={colors.primaryLight} />
          </View>
        ) : null}
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightText ? <Text style={[styles.right, { color: colors.textMuted }]}>{rightText}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  title: { ...typography.body, fontWeight: '600' },
  subtitle: { ...typography.caption, marginTop: spacing.xs },
  right: { ...typography.caption },
});
