import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { museumCategoryKey } from './heritage-utils';

type Props = { items: HeritageItem[] };

export function HeritageMuseumTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [year, setYear] = useState<number | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const years = useMemo(() => {
    const set = new Set<number>();
    items.forEach((item) => item.year != null && set.add(item.year));
    return [...set].sort((a, b) => b - a);
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.category && set.add(item.category));
    return [...set].sort();
  }, [items]);

  const filtered = items.filter((item) => {
    if (year != null && item.year !== year) return false;
    if (category && item.category !== category) return false;
    return true;
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        <Chip label={t('filterAll')} active={year == null && !category} onPress={() => { setYear(undefined); setCategory(undefined); }} />
        {years.map((value) => (
          <Chip key={value} label={String(value)} active={year === value} onPress={() => setYear(year === value ? undefined : value)} />
        ))}
        {categories.map((value) => (
          <Chip
            key={value}
            label={t(museumCategoryKey(value))}
            active={category === value}
            onPress={() => setCategory(category === value ? undefined : value)}
          />
        ))}
      </View>
      <Text style={[styles.heading, { color: colors.text }]}>{t('museumCollection')}</Text>
      {filtered.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {item.imagePath ? <RemoteImage path={item.imagePath} variant="medium" style={styles.image} /> : null}
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.meta, { color: colors.primaryLight }]}>
            {[item.year, item.category ? t(museumCategoryKey(item.category)) : ''].filter(Boolean).join(' · ')}
          </Text>
          {item.description ? (
            <Text style={[styles.body, { color: colors.textMuted }]}>{item.description}</Text>
          ) : null}
        </View>
      ))}
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
        { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
      ]}
    >
      <Text style={[styles.chipLabel, { color: active ? colors.white : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipLabel: { ...typography.caption, fontWeight: '700' },
  heading: { ...typography.heading, fontWeight: '800' },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', paddingBottom: spacing.md },
  image: { height: 180, marginBottom: spacing.sm },
  title: { ...typography.heading, paddingHorizontal: spacing.md },
  meta: { ...typography.caption, fontWeight: '700', paddingHorizontal: spacing.md, marginTop: spacing.xs },
  body: { ...typography.body, paddingHorizontal: spacing.md, marginTop: spacing.sm },
});
