import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';
import { museumCategoryKey } from './heritage-utils';

const BRASS = '#C4A574';

type Props = {
  years: number[];
  categories: string[];
  year?: number;
  category?: string;
  onYear: (value?: number) => void;
  onCategory: (value?: string) => void;
};

export function HeritageMuseumFilters({ years, categories, year, category, onYear, onCategory }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      {categories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Chip label={t('museumAllCategories')} active={!category} onPress={() => onCategory(undefined)} />
          {categories.map((value) => (
            <Chip
              key={value}
              label={t(museumCategoryKey(value))}
              active={category === value}
              onPress={() => onCategory(category === value ? undefined : value)}
            />
          ))}
        </ScrollView>
      ) : null}
      {years.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Chip label={t('museumAllYears')} active={year == null} onPress={() => onYear(undefined)} />
          {years.map((value) => (
            <Chip
              key={value}
              label={String(value)}
              active={year === value}
              onPress={() => onYear(year === value ? undefined : value)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? BRASS : colors.background,
          borderColor: active ? BRASS : colors.border,
        },
      ]}
    >
      <Text style={[styles.chipLabel, { color: active ? colors.background : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { gap: spacing.sm, paddingRight: spacing.md },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipLabel: { ...typography.caption, fontWeight: '700' },
});
