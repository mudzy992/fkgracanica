import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type NewsCategoryChip = { id: string; name: string };

type Props = {
  categories: NewsCategoryChip[];
  activeId?: string;
  onChange: (id: string | undefined) => void;
};

export function NewsCategoryChips({ categories, activeId, onChange }: Props) {
  const { t } = useTranslation();
  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip label={t('filterAll')} active={!activeId} onPress={() => onChange(undefined)} />
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          label={cat.name}
          active={activeId === cat.id}
          onPress={() => onChange(cat.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: active ? colors.white : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.sm },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  label: { ...typography.caption, fontWeight: '700' },
});
