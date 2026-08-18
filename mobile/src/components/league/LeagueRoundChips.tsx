import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { LeagueRoundOption } from './load-league-screen';

type Props = {
  rounds: LeagueRoundOption[];
  upToRound: number | null;
  onChange: (round: number | null) => void;
};

export function LeagueRoundChips({ rounds, upToRound, onChange }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (rounds.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip
        label={t('leagueTableAll')}
        active={upToRound == null}
        onPress={() => onChange(null)}
      />
      {rounds.map((round) => (
        <Chip
          key={round.id}
          label={t('leagueTableUpTo', { round: round.number })}
          active={upToRound === round.number}
          onPress={() => onChange(round.number)}
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
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.background,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, { color: active ? colors.white : colors.textMuted }]}>{label}</Text>
    </Pressable>
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
