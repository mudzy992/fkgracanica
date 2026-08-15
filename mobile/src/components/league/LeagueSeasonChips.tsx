import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { LeagueSeasonOption } from './load-league-screen';

type Props = {
  seasons: LeagueSeasonOption[];
  seasonId: string;
  onChange: (id: string) => void;
};

export function LeagueSeasonChips({ seasons, seasonId, onChange }: Props) {
  const { colors } = useTheme();
  if (seasons.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {seasons.map((season) => {
        const active = season.id === seasonId;
        return (
          <Pressable
            key={season.id}
            onPress={() => onChange(season.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.background,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={season.name}
          >
            <Text style={[styles.label, { color: active ? colors.white : colors.textMuted }]}>
              {season.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.md },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: { ...typography.caption, fontWeight: '700' },
});
