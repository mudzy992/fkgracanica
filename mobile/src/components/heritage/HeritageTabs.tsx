import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageTab } from './load-heritage';

type Props = {
  active: HeritageTab;
  onChange: (tab: HeritageTab) => void;
};

const TABS: { id: HeritageTab; key: string }[] = [
  { id: 'sponsors', key: 'sponsors' },
  { id: 'trophies', key: 'trophies' },
  { id: 'timeline', key: 'timeline' },
  { id: 'hall', key: 'hallOfFame' },
  { id: 'museum', key: 'museum' },
];

export function HeritageTabs({ active, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}
    >
      {TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.white : colors.text }]}>
              {t(tab.key)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: { flexGrow: 0, flexShrink: 0 },
  row: { gap: spacing.sm, paddingBottom: spacing.sm, alignItems: 'center', flexGrow: 0 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexShrink: 0,
    alignSelf: 'center',
  },
  label: { ...typography.caption, fontWeight: '700' },
});
